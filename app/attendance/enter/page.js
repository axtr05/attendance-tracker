'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calendar, CheckCircle, XCircle } from 'lucide-react'

export default function EnterAttendancePage() {
  const [schedule, setSchedule] = useState(null)
  const [isHoliday, setIsHoliday] = useState(false)
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/api/attendance/today-schedule')
        if (response.ok) {
          const data = await response.json()
          setSchedule(data)
          
          // Initialize attendance state
          const initialAttendance = {}
          data.schedule.forEach((subject, index) => {
            if (subject) {
              initialAttendance[`${subject}-${index}`] = ''
            }
          })
          setAttendance(initialAttendance)
        } else {
          setError('Failed to load today\'s schedule')
        }
      } catch (error) {
        console.error('Error fetching schedule:', error)
        setError('Failed to load schedule')
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  const handleAttendanceChange = (subjectKey, status) => {
    setAttendance(prev => ({
      ...prev,
      [subjectKey]: status
    }))
  }

  const handleSubmit = async () => {
    if (isHoliday) {
      // Submit holiday
      setSubmitting(true)
      try {
        const response = await fetch('/api/attendance/enter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: schedule.date,
            isHoliday: true,
            subjectAttendance: []
          }),
        })

        if (response.ok) {
          setSuccess(true)
          setTimeout(() => {
            router.push('/homepage')
          }, 2000)
        } else {
          const data = await response.json()
          setError(data.error || 'Failed to submit attendance')
        }
      } catch (error) {
        console.error('Error submitting attendance:', error)
        setError('Failed to submit attendance')
      } finally {
        setSubmitting(false)
      }
    } else {
      // Validate attendance
      const subjectAttendance = []
      const uniqueSubjects = new Set()
      
      schedule.schedule.forEach((subject, index) => {
        if (subject) {
          const key = `${subject}-${index}`
          const status = attendance[key]
          
          if (!status) {
            setError(`Please mark attendance for ${subject} (Period ${index + 1})`)
            return
          }
          
          subjectAttendance.push({
            subject,
            period: index + 1,
            status
          })
          uniqueSubjects.add(subject)
        }
      })

      if (subjectAttendance.length === 0) {
        setError('No subjects to mark attendance for')
        return
      }

      setSubmitting(true)
      try {
        const response = await fetch('/api/attendance/enter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: schedule.date,
            isHoliday: false,
            subjectAttendance
          }),
        })

        if (response.ok) {
          setSuccess(true)
          setTimeout(() => {
            router.push('/homepage')
          }, 2000)
        } else {
          const data = await response.json()
          setError(data.error || 'Failed to submit attendance')
        }
      } catch (error) {
        console.error('Error submitting attendance:', error)
        setError('Failed to submit attendance')
      } finally {
        setSubmitting(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-4">
              {isHoliday ? 'Holiday marked successfully' : 'Attendance submitted successfully'}
            </p>
            <p className="text-sm text-gray-500">Redirecting to homepage...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/homepage')}
          className="mb-6 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Homepage
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Enter Attendance for the Day
            </CardTitle>
            <CardDescription className="text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Date: {schedule?.date}</span>
              </div>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Holiday Button */}
            <div className="text-center">
              <Button
                onClick={() => setIsHoliday(true)}
                variant={isHoliday ? "default" : "outline"}
                className={`px-6 py-3 text-lg font-semibold ${
                  isHoliday 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                    : 'border-orange-300 text-orange-600 hover:bg-orange-50'
                }`}
              >
                Today is a Holiday
              </Button>
            </div>

            {isHoliday ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Today is a holiday, hooray!
                </h3>
                <p className="text-gray-600 mb-6">
                  Enjoy your day off from classes
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
                >
                  {submitting ? 'Submitting...' : 'Mark as Holiday'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Today's Classes
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mark your attendance for each subject
                  </p>
                </div>

                {schedule?.schedule?.map((subject, index) => {
                  if (!subject) return null
                  
                  const key = `${subject}-${index}`
                  return (
                    <div key={key} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{subject}</div>
                        <div className="text-sm text-gray-500">Period {index + 1}</div>
                      </div>
                      
                      <Select
                        value={attendance[key] || ''}
                        onValueChange={(value) => handleAttendanceChange(key, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select attendance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="attended">
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              Attended
                            </div>
                          </SelectItem>
                          <SelectItem value="not_attended">
                            <div className="flex items-center">
                              <XCircle className="w-4 h-4 text-red-600 mr-2" />
                              Not Attended
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}

                <div className="text-center pt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    {submitting ? 'Submitting...' : 'Submit Attendance'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}