#!/usr/bin/env python3

import requests
import json
import sys
import time
from datetime import datetime, timedelta
import jwt

# Configuration
BASE_URL = "https://cace7ab5-a823-44bb-9947-d02e56a081c4.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class AttendanceTrackerAPITest:
    def __init__(self):
        self.session = requests.Session()
        self.user_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message="", details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details
        })
        print()
    
    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/")
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == "Attendance Tracker API":
                    self.log_test("Root Endpoint", True, "API is accessible")
                    return True
                else:
                    self.log_test("Root Endpoint", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Root Endpoint", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_auth_session_creation(self):
        """Test session creation with authentication"""
        try:
            # Create a mock JWT token for testing
            test_payload = {
                'email': 'john.doe@university.edu',
                'name': 'John Doe',
                'iat': int(time.time()),
                'exp': int(time.time()) + 3600
            }
            
            # Create a simple token (the backend doesn't verify signature in test mode)
            mock_token = jwt.encode(test_payload, 'test_secret', algorithm='HS256')
            
            response = self.session.post(
                f"{API_BASE}/auth/session",
                json={'token': mock_token},
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    # Check if session cookie is set
                    cookies = response.cookies
                    if 'token' in cookies:
                        self.user_token = cookies['token']
                        self.log_test("Auth Session Creation", True, f"Session created, isNewUser: {data.get('isNewUser')}")
                        return True
                    else:
                        self.log_test("Auth Session Creation", False, "No session cookie set")
                        return False
                else:
                    self.log_test("Auth Session Creation", False, f"Session creation failed: {data}")
                    return False
            else:
                self.log_test("Auth Session Creation", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Auth Session Creation", False, f"Exception: {str(e)}")
            return False
    
    def test_auth_user_retrieval(self):
        """Test user retrieval with valid session"""
        try:
            response = self.session.get(f"{API_BASE}/auth/user")
            
            if response.status_code == 200:
                data = response.json()
                user = data.get('user')
                if user and 'id' in user and 'email' in user:
                    self.user_id = user['id']
                    self.log_test("Auth User Retrieval", True, f"User retrieved: {user['name']} ({user['email']})")
                    return True
                else:
                    self.log_test("Auth User Retrieval", False, f"Invalid user data: {data}")
                    return False
            elif response.status_code == 401:
                self.log_test("Auth User Retrieval", False, "Authentication required - session may have expired")
                return False
            else:
                self.log_test("Auth User Retrieval", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Auth User Retrieval", False, f"Exception: {str(e)}")
            return False
    
    def test_user_setup(self):
        """Test user setup workflow"""
        try:
            setup_data = {
                'semester': 'Fall 2024',
                'subjects': ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'],
                'startDate': '2024-01-15',
                'endDate': '2024-05-15',
                'timetable': {
                    'Monday': ['Mathematics', 'Physics', 'Chemistry'],
                    'Tuesday': ['Computer Science', 'English', 'Mathematics'],
                    'Wednesday': ['Physics', 'Chemistry', 'Computer Science'],
                    'Thursday': ['English', 'Mathematics', 'Physics'],
                    'Friday': ['Chemistry', 'Computer Science', 'English'],
                    'Saturday': ['Mathematics', 'Physics'],
                    'Sunday': []
                }
            }
            
            response = self.session.post(
                f"{API_BASE}/user/setup",
                json=setup_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("User Setup", True, "Setup completed successfully")
                    return True
                else:
                    self.log_test("User Setup", False, f"Setup failed: {data}")
                    return False
            elif response.status_code == 401:
                self.log_test("User Setup", False, "Authentication required")
                return False
            elif response.status_code == 400:
                self.log_test("User Setup", False, f"Bad request: {response.text}")
                return False
            else:
                self.log_test("User Setup", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("User Setup", False, f"Exception: {str(e)}")
            return False
    
    def test_attendance_status(self):
        """Test attendance status retrieval"""
        try:
            response = self.session.get(f"{API_BASE}/attendance/status")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['todayAttendanceEntered', 'totalClasses', 'attendedClasses', 'overallPercentage', 'subjectStats']
                
                if all(field in data for field in required_fields):
                    self.log_test("Attendance Status", True, f"Status retrieved - Overall: {data['overallPercentage']}%")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Attendance Status", False, f"Missing fields: {missing}")
                    return False
            elif response.status_code == 401:
                self.log_test("Attendance Status", False, "Authentication required")
                return False
            else:
                self.log_test("Attendance Status", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Attendance Status", False, f"Exception: {str(e)}")
            return False
    
    def test_today_schedule(self):
        """Test today's schedule retrieval"""
        try:
            response = self.session.get(f"{API_BASE}/attendance/today-schedule")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['date', 'day', 'schedule', 'subjects']
                
                if all(field in data for field in required_fields):
                    self.log_test("Today's Schedule", True, f"Schedule for {data['day']}: {len(data['schedule'])} classes")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Today's Schedule", False, f"Missing fields: {missing}")
                    return False
            elif response.status_code == 401:
                self.log_test("Today's Schedule", False, "Authentication required")
                return False
            else:
                self.log_test("Today's Schedule", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Today's Schedule", False, f"Exception: {str(e)}")
            return False
    
    def test_attendance_entry(self):
        """Test attendance entry functionality"""
        try:
            # Test regular attendance entry
            today = datetime.now().strftime('%Y-%m-%d')
            attendance_data = {
                'date': today,
                'isHoliday': False,
                'subjectAttendance': [
                    {'subject': 'Mathematics', 'status': 'attended'},
                    {'subject': 'Physics', 'status': 'attended'},
                    {'subject': 'Chemistry', 'status': 'missed'}
                ]
            }
            
            response = self.session.post(
                f"{API_BASE}/attendance/enter",
                json=attendance_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Attendance Entry", True, "Attendance recorded successfully")
                    
                    # Test duplicate entry (should fail)
                    response2 = self.session.post(
                        f"{API_BASE}/attendance/enter",
                        json=attendance_data,
                        headers={'Content-Type': 'application/json'}
                    )
                    
                    if response2.status_code == 400:
                        self.log_test("Duplicate Attendance Prevention", True, "Duplicate entry correctly prevented")
                    else:
                        self.log_test("Duplicate Attendance Prevention", False, "Duplicate entry not prevented")
                    
                    return True
                else:
                    self.log_test("Attendance Entry", False, f"Entry failed: {data}")
                    return False
            elif response.status_code == 401:
                self.log_test("Attendance Entry", False, "Authentication required")
                return False
            else:
                self.log_test("Attendance Entry", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Attendance Entry", False, f"Exception: {str(e)}")
            return False
    
    def test_holiday_entry(self):
        """Test holiday marking functionality"""
        try:
            yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            holiday_data = {
                'date': yesterday,
                'isHoliday': True,
                'subjectAttendance': []
            }
            
            response = self.session.post(
                f"{API_BASE}/attendance/enter",
                json=holiday_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Holiday Entry", True, "Holiday marked successfully")
                    return True
                else:
                    self.log_test("Holiday Entry", False, f"Holiday marking failed: {data}")
                    return False
            elif response.status_code == 401:
                self.log_test("Holiday Entry", False, "Authentication required")
                return False
            else:
                self.log_test("Holiday Entry", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Holiday Entry", False, f"Exception: {str(e)}")
            return False
    
    def test_attendance_records(self):
        """Test attendance records retrieval"""
        try:
            response = self.session.get(f"{API_BASE}/attendance/records")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['records', 'stats', 'missedDates', 'subjects']
                
                if all(field in data for field in required_fields):
                    records_count = len(data['records'])
                    missed_count = len(data['missedDates'])
                    self.log_test("Attendance Records", True, f"Retrieved {records_count} records, {missed_count} missed dates")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Attendance Records", False, f"Missing fields: {missing}")
                    return False
            elif response.status_code == 401:
                self.log_test("Attendance Records", False, "Authentication required")
                return False
            else:
                self.log_test("Attendance Records", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Attendance Records", False, f"Exception: {str(e)}")
            return False
    
    def test_subject_attendance(self):
        """Test subject-specific attendance details"""
        try:
            subject_name = "Mathematics"
            response = self.session.get(f"{API_BASE}/attendance/subject/{subject_name}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['subject', 'records', 'stats']
                
                if all(field in data for field in required_fields):
                    if data['subject'] == subject_name:
                        records_count = len(data['records'])
                        percentage = data['stats'].get('percentage', 0)
                        self.log_test("Subject Attendance", True, f"{subject_name}: {records_count} records, {percentage}% attendance")
                        return True
                    else:
                        self.log_test("Subject Attendance", False, f"Wrong subject returned: {data['subject']}")
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Subject Attendance", False, f"Missing fields: {missing}")
                    return False
            elif response.status_code == 401:
                self.log_test("Subject Attendance", False, "Authentication required")
                return False
            else:
                self.log_test("Subject Attendance", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Subject Attendance", False, f"Exception: {str(e)}")
            return False
    
    def test_leaderboard(self):
        """Test leaderboard functionality"""
        try:
            response = self.session.get(f"{API_BASE}/leaderboard")
            
            if response.status_code == 200:
                data = response.json()
                if 'leaderboard' in data:
                    leaderboard = data['leaderboard']
                    if isinstance(leaderboard, list):
                        # Check if leaderboard entries have required fields
                        if leaderboard:
                            required_fields = ['userId', 'name', 'email', 'percentage', 'totalClasses', 'attendedClasses']
                            first_entry = leaderboard[0]
                            if all(field in first_entry for field in required_fields):
                                # Check if sorted by percentage (descending)
                                is_sorted = all(leaderboard[i]['percentage'] >= leaderboard[i+1]['percentage'] 
                                              for i in range(len(leaderboard)-1))
                                if is_sorted:
                                    self.log_test("Leaderboard", True, f"Retrieved {len(leaderboard)} users, properly sorted")
                                else:
                                    self.log_test("Leaderboard", False, "Leaderboard not sorted by percentage")
                                return is_sorted
                            else:
                                missing = [f for f in required_fields if f not in first_entry]
                                self.log_test("Leaderboard", False, f"Missing fields in entries: {missing}")
                                return False
                        else:
                            self.log_test("Leaderboard", True, "Empty leaderboard (no users with completed setup)")
                            return True
                    else:
                        self.log_test("Leaderboard", False, "Leaderboard is not a list")
                        return False
                else:
                    self.log_test("Leaderboard", False, "Missing leaderboard field")
                    return False
            else:
                self.log_test("Leaderboard", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Leaderboard", False, f"Exception: {str(e)}")
            return False
    
    def test_auth_logout(self):
        """Test logout functionality"""
        try:
            response = self.session.post(f"{API_BASE}/auth/logout")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    # Test that subsequent authenticated requests fail
                    auth_test = self.session.get(f"{API_BASE}/auth/user")
                    if auth_test.status_code == 401:
                        self.log_test("Auth Logout", True, "Logout successful, session invalidated")
                        return True
                    else:
                        self.log_test("Auth Logout", False, "Session not properly invalidated after logout")
                        return False
                else:
                    self.log_test("Auth Logout", False, f"Logout failed: {data}")
                    return False
            else:
                self.log_test("Auth Logout", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Auth Logout", False, f"Exception: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test API error handling and validation"""
        try:
            # Test invalid route
            response = self.session.get(f"{API_BASE}/invalid/route")
            if response.status_code == 404:
                self.log_test("Error Handling - Invalid Route", True, "404 returned for invalid route")
            else:
                self.log_test("Error Handling - Invalid Route", False, f"Expected 404, got {response.status_code}")
            
            # Test unauthenticated access to protected route
            new_session = requests.Session()
            response = new_session.get(f"{API_BASE}/attendance/status")
            if response.status_code == 401:
                self.log_test("Error Handling - Unauthenticated Access", True, "401 returned for unauthenticated access")
            else:
                self.log_test("Error Handling - Unauthenticated Access", False, f"Expected 401, got {response.status_code}")
            
            return True
        except Exception as e:
            self.log_test("Error Handling", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 60)
        print("ATTENDANCE TRACKER BACKEND API TESTS")
        print("=" * 60)
        print()
        
        # Test sequence
        tests = [
            self.test_root_endpoint,
            self.test_auth_session_creation,
            self.test_auth_user_retrieval,
            self.test_user_setup,
            self.test_attendance_status,
            self.test_today_schedule,
            self.test_attendance_entry,
            self.test_holiday_entry,
            self.test_attendance_records,
            self.test_subject_attendance,
            self.test_leaderboard,
            self.test_auth_logout,
            self.test_error_handling
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Unexpected error: {str(e)}")
        
        print("=" * 60)
        print(f"TEST SUMMARY: {passed}/{total} tests passed")
        print("=" * 60)
        
        # Print detailed results
        print("\nDETAILED RESULTS:")
        for result in self.test_results:
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            print(f"{status}: {result['test']}")
            if result['message']:
                print(f"   {result['message']}")
        
        return passed, total, self.test_results

if __name__ == "__main__":
    tester = AttendanceTrackerAPITest()
    passed, total, results = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if passed == total else 1)