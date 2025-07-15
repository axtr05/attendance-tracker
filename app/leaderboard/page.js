'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Trophy, Medal, Award, Crown } from 'lucide-react'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        if (response.ok) {
          const data = await response.json()
          setLeaderboard(data.leaderboard || [])
        } else {
          setError('Failed to load leaderboard')
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setError('Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />
      default:
        return <Trophy className="w-6 h-6 text-gray-400" />
    }
  }

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
      default:
        return 'bg-white border-gray-200'
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

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              <Trophy className="w-6 h-6 inline mr-2 text-yellow-500" />
              Leaderboard
            </CardTitle>
            <CardDescription className="text-gray-600">
              Top performers ranked by attendance percentage
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((user, index) => {
                  const rank = index + 1
                  return (
                    <Card key={user.userId} className={`${getRankStyle(rank)} shadow-sm`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {getRankIcon(rank)}
                              <span className="text-2xl font-bold text-gray-700">
                                #{rank}
                              </span>
                            </div>
                            
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.photoURL} alt={user.name} />
                              <AvatarFallback className="bg-blue-600 text-white">
                                {user.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <div className="font-semibold text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.attendedClasses}/{user.totalClasses} classes
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">
                              {user.percentage}%
                            </div>
                            <div className="text-sm text-gray-500">
                              Attendance
                            </div>
                          </div>
                        </div>
                        
                        {/* Special badges for top 3 */}
                        {rank <= 3 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-center">
                              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                                rank === 1 ? 'bg-yellow-500 text-white' :
                                rank === 2 ? 'bg-gray-400 text-white' :
                                'bg-orange-500 text-white'
                              }`}>
                                {rank === 1 ? '🥇 Champion' :
                                 rank === 2 ? '🥈 Runner-up' :
                                 '🥉 Third Place'}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No leaderboard data yet
                </h3>
                <p className="text-gray-500">
                  Start tracking your attendance to see the rankings!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}