import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Helper function to verify JWT token
async function verifyToken(request) {
  try {
    const token = cookies().get('token')?.value
    if (!token) {
      return null
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

// Helper function to get user from token
async function getUserFromToken(request) {
  const decoded = await verifyToken(request)
  if (!decoded) return null
  
  const db = await connectToMongo()
  const user = await db.collection('users').findOne({ userId: decoded.userId })
  return user
}

// Helper function to calculate attendance statistics
function calculateAttendanceStats(attendanceRecords, subjects) {
  let totalClasses = 0
  let attendedClasses = 0
  const subjectStats = {}
  
  // Initialize subject stats
  subjects.forEach(subject => {
    subjectStats[subject] = {
      total: 0,
      attended: 0,
      percentage: 0
    }
  })
  
  // Calculate stats from attendance records
  attendanceRecords.forEach(record => {
    if (!record.isHoliday) {
      record.subjectAttendance.forEach(sa => {
        if (subjectStats[sa.subject]) {
          subjectStats[sa.subject].total += 1
          if (sa.status === 'attended') {
            subjectStats[sa.subject].attended += 1
          }
        }
      })
    }
  })
  
  // Calculate percentages and totals
  Object.keys(subjectStats).forEach(subject => {
    const stats = subjectStats[subject]
    stats.percentage = stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0
    totalClasses += stats.total
    attendedClasses += stats.attended
  })
  
  const overallPercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0
  
  return {
    totalClasses,
    attendedClasses,
    overallPercentage,
    subjectStats
  }
}

// Helper function to get missed dates
function getMissedDates(startDate, endDate, attendanceRecords) {
  const start = new Date(startDate)
  const end = new Date()
  const recordedDates = new Set(attendanceRecords.map(r => r.date))
  const missedDates = []
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    
    // Skip Sundays (0 = Sunday)
    if (dayOfWeek === 0) continue
    
    if (!recordedDates.has(dateStr)) {
      missedDates.push(dateStr)
    }
  }
  
  return missedDates
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Root endpoint
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Attendance Tracker API" }))
    }

    // AUTH ROUTES
    
    // Create session - POST /api/auth/session
    if (route === '/auth/session' && method === 'POST') {
      const { token } = await request.json()
      
      try {
        // For now, we'll create a simple session without Firebase verification
        // In a real app, you'd verify the Firebase token here
        const decoded = jwt.decode(token, { complete: true })
        const userInfo = decoded?.payload || {}
        
        // Create or find user
        let user = await db.collection('users').findOne({ 
          email: userInfo.email || 'test@example.com' 
        })
        
        let isNewUser = false
        if (!user) {
          user = {
            userId: uuidv4(),
            email: userInfo.email || 'test@example.com',
            name: userInfo.name || 'Test User',
            createdAt: new Date(),
            isSetupComplete: false
          }
          await db.collection('users').insertOne(user)
          isNewUser = true
        }
        
        // Generate JWT
        const jwtToken = jwt.sign(
          { 
            userId: user.userId,
            email: user.email
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        )
        
        // Set JWT in HTTP-only cookie
        const response = NextResponse.json({ 
          success: true, 
          isNewUser: isNewUser || !user.isSetupComplete 
        })
        response.cookies.set({
          name: 'token',
          value: jwtToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        })
        
        return handleCORS(response)
      } catch (error) {
        console.error('Session creation error:', error)
        return handleCORS(NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        ))
      }
    }

    // Get current user - GET /api/auth/user
    if (route === '/auth/user' && method === 'GET') {
      const decoded = await verifyToken(request)
      if (!decoded) {
        return handleCORS(NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        ))
      }
      
      const user = await db.collection('users').findOne({ userId: decoded.userId })
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        ))
      }
      
      return handleCORS(NextResponse.json({
        user: {
          id: user.userId,
          email: user.email,
          name: user.name,
          isSetupComplete: user.isSetupComplete
        }
      }))
    }

    // Logout - POST /api/auth/logout
    if (route === '/auth/logout' && method === 'POST') {
      const response = NextResponse.json({ success: true })
      response.cookies.set({
        name: 'token',
        value: '',
        expires: new Date(0),
        path: '/',
      })
      return handleCORS(response)
    }

    // USER ROUTES
    
    // Complete setup - POST /api/user/setup
    if (route === '/user/setup' && method === 'POST') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        ))
      }
      
      const { semester, subjects, startDate, endDate, timetable } = await request.json()
      
      // Validate input
      if (!semester || !subjects || !startDate || !endDate || !timetable) {
        return handleCORS(NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        ))
      }
      
      // Update user with setup data
      await db.collection('users').updateOne(
        { userId: user.userId },
        {
          $set: {
            semester,
            subjects,
            startDate,
            endDate,
            timetable,
            isSetupComplete: true,
            updatedAt: new Date()
          }
        }
      )
      
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ATTENDANCE ROUTES
    
    // Get attendance status - GET /api/attendance/status
    if (route === '/attendance/status' && method === 'GET') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        ))
      }
      
      const today = new Date().toISOString().split('T')[0]
      const attendanceRecords = await db.collection('attendance')
        .find({ userId: user.userId })
        .toArray()
      
      const todayRecord = attendanceRecords.find(r => r.date === today)
      const stats = calculateAttendanceStats(attendanceRecords, user.subjects || [])
      
      return handleCORS(NextResponse.json({
        todayAttendanceEntered: !!todayRecord,
        ...stats
      }))
    }

    // Enter attendance - POST /api/attendance/enter
    if (route === '/attendance/enter' && method === 'POST') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        ))
      }
      
      const { date, isHoliday, subjectAttendance } = await request.json()
      
      // Check if attendance already exists for this date
      const existingRecord = await db.collection('attendance')
        .findOne({ userId: user.userId, date })
      
      if (existingRecord) {
        return handleCORS(NextResponse.json(
          { error: 'Attendance already entered for this date' },
          { status: 400 }
        ))
      }
      
      // Create attendance record
      const attendanceRecord = {
        attendanceId: uuidv4(),
        userId: user.userId,
        date,
        isHoliday: isHoliday || false,
        subjectAttendance: subjectAttendance || [],
        createdAt: new Date()
      }
      
      await db.collection('attendance').insertOne(attendanceRecord)
      
      return handleCORS(NextResponse.json({ success: true }))
    }

    // Get today's schedule - GET /api/attendance/today-schedule
    if (route === '/attendance/today-schedule' && method === 'GET') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        ))
      }
      
      const today = new Date()
      const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
      const todaySchedule = user.timetable?.[dayName] || []
      
      return handleCORS(NextResponse.json({
        date: today.toISOString().split('T')[0],
        day: dayName,
        schedule: todaySchedule,
        subjects: user.subjects || []
      }))
    }

    // Get attendance records - GET /api/attendance/records
    if (route === '/attendance/records' && method === 'GET') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        ))
      }
      
      const attendanceRecords = await db.collection('attendance')
        .find({ userId: user.userId })
        .sort({ date: -1 })
        .toArray()
      
      const stats = calculateAttendanceStats(attendanceRecords, user.subjects || [])
      const missedDates = getMissedDates(user.startDate, user.endDate, attendanceRecords)
      
      return handleCORS(NextResponse.json({
        records: attendanceRecords,
        stats,
        missedDates,
        subjects: user.subjects || []
      }))
    }

    // Get subject attendance - GET /api/attendance/subject/:subjectName
    if (route.startsWith('/attendance/subject/') && method === 'GET') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        ))
      }
      
      const subjectName = decodeURIComponent(route.split('/').pop())
      const attendanceRecords = await db.collection('attendance')
        .find({ userId: user.userId })
        .sort({ date: -1 })
        .toArray()
      
      const subjectRecords = attendanceRecords
        .filter(record => !record.isHoliday)
        .map(record => ({
          date: record.date,
          attendance: record.subjectAttendance.find(sa => sa.subject === subjectName)
        }))
        .filter(record => record.attendance)
      
      const stats = calculateAttendanceStats(attendanceRecords, user.subjects || [])
      const subjectStats = stats.subjectStats[subjectName] || { total: 0, attended: 0, percentage: 0 }
      
      return handleCORS(NextResponse.json({
        subject: subjectName,
        records: subjectRecords,
        stats: subjectStats
      }))
    }

    // LEADERBOARD ROUTES
    
    // Get leaderboard - GET /api/leaderboard
    if (route === '/leaderboard' && method === 'GET') {
      const users = await db.collection('users')
        .find({ isSetupComplete: true })
        .toArray()
      
      const leaderboard = []
      
      for (const user of users) {
        const attendanceRecords = await db.collection('attendance')
          .find({ userId: user.userId })
          .toArray()
        
        const stats = calculateAttendanceStats(attendanceRecords, user.subjects || [])
        
        leaderboard.push({
          userId: user.userId,
          name: user.name,
          email: user.email,
          percentage: stats.overallPercentage,
          totalClasses: stats.totalClasses,
          attendedClasses: stats.attendedClasses
        })
      }
      
      // Sort by percentage (descending)
      leaderboard.sort((a, b) => b.percentage - a.percentage)
      
      return handleCORS(NextResponse.json({ leaderboard }))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute