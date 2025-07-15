'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, BarChart3, Calendar, CheckCircle, XCircle } from 'lucide-react'

export default function CheckAttendancePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch('/api/attendance/records')
        if (response.ok) {
          const data = await response.json()
          setData(data)
        } else {
          setError('Failed to load attendance data')
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error)
        setError('Failed to load attendance data')
      } finally {
        setLoading(false)
      }
    }

    fetchAttendanceData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/homepage')}
          className="mb-6 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Homepage
        </Button>

        <Card className="shadow-xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Attendance
            </CardTitle>
            <CardDescription className="text-gray-600">
              Overview of your attendance statistics
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {data?.stats?.attendedClasses || 0}
                  </div>
                  <div className="text-sm text-blue-800 font-medium">
                    Total Classes Attended
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {data?.stats?.totalClasses || 0}
                  </div>
                  <div className="text-sm text-green-800 font-medium">
                    Total Classes Conducted
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {data?.stats?.overallPercentage || 0}%
                  </div>
                  <div className="text-sm text-purple-800 font-medium">
                    Overall Attendance Percentage
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subjects List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Subjects
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.subjects?.map((subject) => {
                  const subjectStats = data?.stats?.subjectStats?.[subject] || { attended: 0, total: 0, percentage: 0 }
                  
                  return (
                    <Card 
                      key={subject} 
                      className="cursor-pointer hover:shadow-lg transition-shadow border-gray-200"
                      onClick={() => router.push(`/subject/${encodeURIComponent(subject)}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{subject}</h4>
                            <div className="text-sm text-gray-500">
                              {subjectStats.attended}/{subjectStats.total} classes
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {subjectStats.percentage}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Click for details
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Missed Dates */}
            {data?.missedDates?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Missed Attendance Dates
                </h3>
                <Alert className="border-orange-200 bg-orange-50">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    You have missed logging attendance for {data.missedDates.length} day(s). 
                    Click on any date below to add retroactive attendance.
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {data.missedDates.map(date => (
                    <Button
                      key={date}
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                      onClick={() => router.push(`/attendance/missed/${date}`)}
                    >
                      {date}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}