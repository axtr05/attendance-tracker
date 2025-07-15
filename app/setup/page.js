'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, Calendar, BookOpen, Clock, GraduationCap } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function SetupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Setup data
  const [semester, setSemester] = useState('')
  const [subjects, setSubjects] = useState([''])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [timetable, setTimetable] = useState({
    Monday: ['', '', '', '', '', ''],
    Tuesday: ['', '', '', '', '', ''],
    Wednesday: ['', '', '', '', '', ''],
    Thursday: ['', '', '', '', '', ''],
    Friday: ['', '', '', '', '', ''],
    Saturday: ['', '', '', '', '', '']
  })

  const addSubject = () => {
    setSubjects([...subjects, ''])
  }

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index))
    }
  }

  const updateSubject = (index, value) => {
    const newSubjects = [...subjects]
    newSubjects[index] = value
    setSubjects(newSubjects)
  }

  const updateTimetable = (day, periodIndex, subject) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].map((s, i) => i === periodIndex ? subject : s)
    }))
  }

  const validateStep = () => {
    if (step === 1) {
      if (!semester || semester < 1 || semester > 8) {
        setError('Please select a valid semester (1-8)')
        return false
      }
      const validSubjects = subjects.filter(s => s.trim() !== '')
      if (validSubjects.length < 2) {
        setError('Please add at least 2 subjects')
        return false
      }
    }
    
    if (step === 2) {
      // Validate timetable - each day should have 6 classes
      for (const day of DAYS) {
        const daySchedule = timetable[day]
        const filledSlots = daySchedule.filter(s => s.trim() !== '').length
        if (filledSlots !== 6) {
          setError(`${day} must have exactly 6 classes scheduled`)
          return false
        }
      }
    }
    
    if (step === 3) {
      if (!startDate || !endDate) {
        setError('Please select both start and end dates')
        return false
      }
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start >= end) {
        setError('End date must be after start date')
        return false
      }
    }
    
    setError('')
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
    setError('')
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setLoading(true)
    setError('')

    try {
      const validSubjects = subjects.filter(s => s.trim() !== '')
      
      const response = await fetch('/api/user/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          semester: parseInt(semester),
          subjects: validSubjects,
          startDate,
          endDate,
          timetable
        }),
      })

      if (response.ok) {
        router.push('/homepage')
      } else {
        const data = await response.json()
        setError(data.error || 'Setup failed')
      }
    } catch (error) {
      console.error('Setup error:', error)
      setError('Setup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStepIcon = (stepNumber) => {
    switch (stepNumber) {
      case 1: return <GraduationCap className="w-5 h-5" />
      case 2: return <Clock className="w-5 h-5" />
      case 3: return <Calendar className="w-5 h-5" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Initial Setup
          </CardTitle>
          <CardDescription className="text-gray-600">
            Let's set up your semester details
          </CardDescription>
          
          {/* Progress indicator */}
          <div className="flex justify-center items-center mt-6 space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step >= stepNumber 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-300'
                }`}>
                  {getStepIcon(stepNumber)}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Semester and Subjects */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="semester" className="text-base font-medium">Current Semester</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Subjects</Label>
                  <Button 
                    type="button" 
                    onClick={addSubject}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>
                </div>
                
                {subjects.map((subject, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={subject}
                      onChange={(e) => updateSubject(index, e.target.value)}
                      placeholder={`Subject ${index + 1}`}
                      className="flex-1"
                    />
                    {subjects.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeSubject(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Timetable */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Set Your Weekly Timetable</h3>
                <p className="text-sm text-gray-600">Choose exactly 6 classes for each day (Monday to Saturday)</p>
              </div>

              <div className="space-y-4">
                {DAYS.map(day => (
                  <div key={day} className="space-y-2">
                    <Label className="text-base font-medium">{day}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {timetable[day].map((subject, periodIndex) => (
                        <Select
                          key={periodIndex}
                          value={subject}
                          onValueChange={(value) => updateTimetable(day, periodIndex, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Period ${periodIndex + 1}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.filter(s => s.trim() !== '').map(subj => (
                              <SelectItem key={subj} value={subj}>
                                {subj}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Semester Dates */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Semester Duration</h3>
                <p className="text-sm text-gray-600">Set your semester start and end dates</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-base font-medium">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-base font-medium">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6">
            <Button
              onClick={handlePrevious}
              disabled={step === 1}
              variant="outline"
            >
              Previous
            </Button>
            
            {step < 3 ? (
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}