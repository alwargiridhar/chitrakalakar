#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class ChitraKalakarAPITester:
    def __init__(self, base_url="https://artisan-hub-52.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.user_data = {}
        self.artist_data = {}

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=default_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                if response.text:
                    try:
                        error_data = response.json()
                        details += f", Error: {error_data.get('detail', 'Unknown error')}"
                    except:
                        details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.text else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_user_registration(self):
        """Test user registration for different roles"""
        timestamp = int(time.time())
        
        # Test regular user registration
        user_data = {
            "email": f"testuser_{timestamp}@example.com",
            "password": "TestPass123!",
            "name": "Test User",
            "role": "user"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success:
            self.user_data = response
            
        # Test artist registration
        artist_data = {
            "email": f"testartist_{timestamp}@example.com",
            "password": "TestPass123!",
            "name": "Test Artist",
            "role": "artist"
        }
        
        artist_success, artist_response = self.run_test(
            "Artist Registration",
            "POST",
            "auth/register",
            200,
            data=artist_data
        )
        
        if artist_success:
            self.artist_data = artist_response
            
        return success and artist_success

    def test_user_login(self):
        """Test user login"""
        if not self.user_data:
            self.log_test("User Login", False, "No user data available")
            return False
            
        login_data = {
            "email": self.user_data["email"],
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        return success

    def test_artist_profile_creation(self):
        """Test artist profile creation"""
        if not self.artist_data:
            self.log_test("Artist Profile Creation", False, "No artist data available")
            return False
            
        profile_data = {
            "user_id": self.artist_data["id"],
            "bio": "Test artist bio",
            "skills": ["Acrylic Colors", "Watercolors"],
            "city": "Mumbai",
            "pincode": "400001",
            "portfolio_images": [],
            "annual_fee_paid": False
        }
        
        success, response = self.run_test(
            "Artist Profile Creation",
            "POST",
            "artists/profile",
            200,
            data=profile_data
        )
        
        if success:
            self.artist_data["profile_id"] = response["id"]
            
        return success

    def test_get_artist_profile(self):
        """Test getting artist profile"""
        if not self.artist_data:
            self.log_test("Get Artist Profile", False, "No artist data available")
            return False
            
        success, response = self.run_test(
            "Get Artist Profile",
            "GET",
            f"artists/profile/{self.artist_data['id']}",
            200
        )
        return success

    def test_artwork_creation(self):
        """Test artwork creation"""
        if not self.artist_data.get("profile_id"):
            self.log_test("Artwork Creation", False, "No artist profile available")
            return False
            
        artwork_data = {
            "artist_id": self.artist_data["profile_id"],
            "title": "Test Artwork",
            "description": "A beautiful test artwork",
            "category": "Acrylic Colors",
            "price": 5000.0,
            "currency": "INR",
            "image_url": "https://images.unsplash.com/photo-1562785072-c65ab858fcbc?crop=entropy&cs=srgb&fm=jpg&q=85",
            "dimensions": "24x36 inches"
        }
        
        success, response = self.run_test(
            "Artwork Creation",
            "POST",
            "artworks",
            200,
            data=artwork_data
        )
        
        if success:
            self.artist_data["artwork_id"] = response["id"]
            
        return success

    def test_get_artworks(self):
        """Test getting artworks"""
        success, response = self.run_test(
            "Get Featured Artworks",
            "GET",
            "featured/artworks",
            200
        )
        return success

    def test_custom_order_creation(self):
        """Test custom order creation"""
        if not self.user_data:
            self.log_test("Custom Order Creation", False, "No user data available")
            return False
            
        order_data = {
            "user_id": self.user_data["id"],
            "title": "Custom Portrait",
            "description": "Need a custom portrait painting",
            "category": "Acrylic Colors",
            "budget": 10000.0,
            "currency": "INR",
            "preferred_city": "Mumbai",
            "preferred_pincode": "400001"
        }
        
        success, response = self.run_test(
            "Custom Order Creation",
            "POST",
            "orders/custom",
            200,
            data=order_data
        )
        
        if success:
            self.user_data["order_id"] = response["id"]
            
        return success

    def test_get_user_orders(self):
        """Test getting user orders"""
        if not self.user_data:
            self.log_test("Get User Orders", False, "No user data available")
            return False
            
        success, response = self.run_test(
            "Get User Orders",
            "GET",
            f"orders/custom/user/{self.user_data['id']}",
            200
        )
        return success

    def test_exhibition_creation(self):
        """Test exhibition creation"""
        if not self.artist_data.get("profile_id") or not self.artist_data.get("artwork_id"):
            self.log_test("Exhibition Creation", False, "No artist profile or artwork available")
            return False
            
        exhibition_data = {
            "artist_id": self.artist_data["profile_id"],
            "title": "Test Exhibition",
            "description": "A test virtual exhibition",
            "artwork_ids": [self.artist_data["artwork_id"]],
            "duration_days": 3
        }
        
        success, response = self.run_test(
            "Exhibition Creation",
            "POST",
            "exhibitions",
            200,
            data=exhibition_data
        )
        
        if success:
            self.artist_data["exhibition_id"] = response["id"]
            
        return success

    def test_get_exhibitions(self):
        """Test getting exhibitions"""
        success, response = self.run_test(
            "Get Active Exhibitions",
            "GET",
            "exhibitions?status=active",
            200
        )
        return success

    def test_payment_checkout_creation(self):
        """Test payment checkout creation"""
        if not self.user_data:
            self.log_test("Payment Checkout Creation", False, "No user data available")
            return False
            
        checkout_data = {
            "user_id": self.user_data["id"],
            "order_type": "membership",
            "amount": 1000.0,
            "currency": "INR",
            "metadata": {"membership_type": "annual"}
        }
        
        headers = {"origin": "https://artisan-hub-52.preview.emergentagent.com"}
        
        success, response = self.run_test(
            "Payment Checkout Creation",
            "POST",
            "payments/checkout",
            200,
            data=checkout_data,
            headers=headers
        )
        
        if success and "session_id" in response:
            self.user_data["session_id"] = response["session_id"]
            
        return success

    def test_get_artists(self):
        """Test getting artists list"""
        success, response = self.run_test(
            "Get Artists List",
            "GET",
            "artists",
            200
        )
        return success

    def test_featured_artists(self):
        """Test getting featured artists"""
        success, response = self.run_test(
            "Get Featured Artists",
            "GET",
            "featured/artists",
            200
        )
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting ChitraKalakar API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Basic connectivity
        self.test_root_endpoint()
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        
        # Artist profile tests
        self.test_artist_profile_creation()
        self.test_get_artist_profile()
        
        # Artwork tests
        self.test_artwork_creation()
        self.test_get_artworks()
        
        # Order tests
        self.test_custom_order_creation()
        self.test_get_user_orders()
        
        # Exhibition tests
        self.test_exhibition_creation()
        self.test_get_exhibitions()
        
        # Payment tests
        self.test_payment_checkout_creation()
        
        # List endpoints
        self.test_get_artists()
        self.test_featured_artists()
        
        # Print summary
        print("=" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ChitraKalakarAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
                "timestamp": datetime.now().isoformat()
            },
            "test_results": tester.test_results,
            "test_data": {
                "user_data": tester.user_data,
                "artist_data": tester.artist_data
            }
        }, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())