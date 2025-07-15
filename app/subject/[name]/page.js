'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, BookOpen, CheckCircle, XCircle } from 'lucide-react'

export default function SubjectAttendancePage({ params }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const subjectName = decodeURIComponent(params.name)

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        const response = await fetch(`/api/attendance/subject/${encodeURIComponent(subjectName)}`)
        if (response.ok) {
          const data = await response.json()
          setData(data)
        } else {
          setError('Failed to load subject attendance data')
        }
      } catch (error) {
        console.error('Error fetching subject data:', error)
        setError('Failed to load subject attendance data')
      } finally {
        setLoading(false)
      }
    }

    fetchSubjectData()
  }, [subjectName])

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
          onClick={() => router.push('/attendance/check')}
          className="mb-6 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Attendance
        </Button>

        <Card className="shadow-xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              <BookOpen className="w-6 h-6 inline mr-2" />
              {subjectName}
            </CardTitle>
            <CardDescription className="text-gray-600">
              Subject attendance details
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Subject Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {data?.stats?.attended || 0}
                  </div>
                  <div className="text-sm text-blue-800 font-medium">
                    Classes Attended
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {data?.stats?.total || 0}
                  </div>
                  <div className="text-sm text-green-800 font-medium">
                    Total Classes
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {data?.stats?.percentage || 0}%
                  </div>
                  <div className="text-sm text-purple-800 font-medium">
                    Attendance Percentage
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Log */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Attendance Log
              </h3>
              
              {data?.records?.length > 0 ? (
                <div className="space-y-3">
                  {data.records.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium text-gray-900">
                          {record.date}
                        </div>
                        <div className="text-xs text-gray-500">
                          Period {record.attendance.period}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {record.attendance.status === 'attended' ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Attended</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <XCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Missed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No attendance records found for this subject</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}