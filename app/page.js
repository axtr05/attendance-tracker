'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { CheckCircle, Users, TrendingUp, Calendar, ArrowRight, Star } from 'lucide-react'

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [animateStats, setAnimateStats] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          setIsLoggedIn(true)
          router.push('/homepage')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    // Trigger stats animation after component mounts
    const timer = setTimeout(() => setAnimateStats(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-ping"></div>
        </div>
      </div>
    )
  }

  if (isLoggedIn) {
    return null // Will redirect to homepage
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">AttendanceTracker</span>
        </div>
        <Button 
          onClick={() => router.push('/login')}
          variant="outline"
          className="border-purple-200 hover:bg-purple-50"
        >
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-200">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ Students</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="block">Track Your</span>
                <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Attendance
                </span>
                <span className="block">with Precision</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                The most comprehensive attendance tracking solution for college students. 
                Monitor your daily attendance, compete with classmates, and never miss a class again.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                size="lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline"
                className="border-2 border-purple-200 hover:bg-purple-50 py-4 px-8 rounded-xl font-semibold transition-all duration-300"
                size="lg"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className={`text-3xl font-bold text-purple-600 transition-all duration-1000 ${animateStats ? 'animate-pulse' : ''}`}>
                  99.9%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold text-blue-600 transition-all duration-1000 ${animateStats ? 'animate-pulse' : ''}`}>
                  10K+
                </div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold text-indigo-600 transition-all duration-1000 ${animateStats ? 'animate-pulse' : ''}`}>
                  500+
                </div>
                <div className="text-sm text-gray-600">Colleges</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-700">
              <img 
                src="https://images.unsplash.com/photo-1741637335289-c99652d3155f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxzdHVkZW50cyUyMGNvbGxlZ2V8ZW58MHx8fHwxNzUyNTk5OTk4fDA&ixlib=rb-4.1.0&q=85" 
                alt="Students on campus" 
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-float">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-sm font-medium">98% Attendance</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-float-delayed">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Trending Up</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose AttendanceTracker?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to track, monitor, and improve your attendance record
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Smart Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-base">
                Automatically track your daily attendance with intelligent scheduling and missed class alerts.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-base">
                Compete with your classmates and climb the attendance leaderboard. Stay motivated to attend classes.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-base">
                Detailed insights into your attendance patterns with subject-wise breakdowns and trends.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students who are already tracking their attendance with precision
            </p>
            <Button 
              onClick={() => router.push('/login')}
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              Start Tracking Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}