'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckCircle, BarChart3, Trophy, User, Settings, LogOut, AlertCircle } from 'lucide-react'

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [attendanceStatus, setAttendanceStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user data
        const userResponse = await fetch('/api/auth/user')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.user)
        }

        // Get attendance status
        const statusResponse = await fetch('/api/attendance/status')
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          setAttendanceStatus(statusData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.name}!</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.photoURL} alt={user?.name} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Edit Timetable</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-blue-200">
            <CardContent className="p-6">
              <Button 
                onClick={() => router.push('/attendance/enter')}
                className="w-full h-24 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <CheckCircle className="w-6 h-6 mr-3" />
                Enter Your Attendance for the Day
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-green-200">
            <CardContent className="p-6">
              <Button 
                onClick={() => router.push('/attendance/check')}
                className="w-full h-24 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                <BarChart3 className="w-6 h-6 mr-3" />
                Check Your Attendance
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-purple-200">
            <CardContent className="p-6">
              <Button 
                onClick={() => router.push('/leaderboard')}
                className="w-full h-24 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                <Trophy className="w-6 h-6 mr-3" />
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Status Message */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {attendanceStatus?.todayAttendanceEntered ? (
              <div className="flex items-center space-x-3 text-green-700">
                <CheckCircle className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Great job!</p>
                  <p className="text-sm">
                    Your current attendance is <span className="font-bold">{attendanceStatus.overallPercentage}%</span>, keep going Chad!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-orange-700">
                <AlertCircle className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Attendance pending</p>
                  <p className="text-sm">Your day's attendance is not updated, do it ASAP!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {attendanceStatus?.totalClasses || 0}
              </div>
              <p className="text-xs text-gray-500">Conducted so far</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Classes Attended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {attendanceStatus?.attendedClasses || 0}
              </div>
              <p className="text-xs text-gray-500">Present classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {attendanceStatus?.overallPercentage || 0}%
              </div>
              <p className="text-xs text-gray-500">Overall percentage</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}