# 02 - AUTHENTICATION: Login and Signup System in Bookora

## Table of Contents

1. [What is Authentication?](#1-what-is-authentication)
2. [Why OTP-Based Authentication?](#2-why-otp-based-authentication)
3. [Login vs Signup: The Merged Approach](#3-login-vs-signup-the-merged-approach)
4. [High-Level Authentication Flow](#4-high-level-authentication-flow)
5. [Section 1: Email (Gmail) OTP Authentication - USED IN BOOKORA](#section-1-email-gmail-otp-authentication)
6. [Section 2: Phone Number OTP Authentication - NOT USED](#section-2-phone-number-otp-authentication)
7. [Authentication Flow Diagrams](#7-authentication-flow-diagrams)
8. [Interview Preparation](#8-interview-preparation)
9. [Comparison Table](#9-comparison-table)

---

## 1. What is Authentication?

### Definition

**Authentication** is the process of verifying the identity of a user before granting access to protected resources.

**In simple terms**: Proving "You are who you claim to be."

### Why Web Applications Need Authentication

Without authentication, anyone could:

- Access any user's bookings
- Cancel other people's tickets
- View private user information
- Book tickets under someone else's name

### Authentication vs Authorization

These are different concepts:

**Authentication** (Who are you?):

- Verifying identity
- Login process
- Proving you are a valid user

**Authorization** (What can you do?):

- Permission checking
- Role-based access control
- Example: Admin vs regular user

**Bookora focuses on Authentication**: Verifying user identity before booking.

### How Authentication Works in Web Applications

```
User provides credentials (email, phone, password, OTP)
    → System verifies credentials
        → If valid: Create session, allow access
        → If invalid: Deny access, show error
```

### Common Authentication Methods

1. **Username and Password**: Traditional approach (not used in Bookora)
2. **OTP (One-Time Password)**: Temporary code sent to email/phone (USED in Bookora)
3. **Social Login**: Google, Facebook login (not used in Bookora)
4. **Biometric**: Fingerprint, face recognition (not applicable for web)

---

## 2. Why OTP-Based Authentication?

### What is OTP?

**OTP** stands for One-Time Password.

**Characteristics**:

- Valid only once
- Expires after a short time (typically 5-10 minutes)
- Cannot be reused
- Random and unpredictable

**Example**: `586432` (6-digit code)

### Traditional Password Problems

**Password-based authentication has issues**:

1. **Users forget passwords**: Leads to password reset requests
2. **Weak passwords**: Users choose easy-to-guess passwords
3. **Password reuse**: Same password across multiple sites
4. **Storage security**: Passwords must be hashed and stored securely
5. **Phishing risk**: Users can be tricked into revealing passwords
6. **Maintenance overhead**: Password reset flows, complexity requirements

### OTP Benefits

**Why Bookora uses OTP instead of passwords**:

1. **No password to remember**: Users only need email/phone
2. **Time-limited security**: OTP expires quickly
3. **One-time use**: Cannot be intercepted and reused
4. **Simple user experience**: No signup forms, password requirements
5. **Fast authentication**: Quick login without account creation
6. **Reduced security burden**: No need to store and protect passwords

### OTP Security Model

**How OTP provides security**:

```
User requests OTP
    → System generates random 6-digit code
    → Sends code to user's verified email/phone
    → Stores code with expiration timestamp
    → User enters code within time limit
    → System verifies code matches and is not expired
    → Deletes code after verification (prevents reuse)
    → Creates user session
```

**Security assumptions**:

- User has exclusive access to their email/phone
- Email/phone provider is trustworthy
- Communication channel (email/SMS) is reasonably secure
- OTP expiration prevents brute-force attacks

---

## 3. Login vs Signup: The Merged Approach

### Traditional Separate Flows

**Most applications have distinct flows**:

**Signup (New User)**:

```
1. User clicks "Sign Up"
2. Fill registration form (name, email, password, etc.)
3. Submit form
4. Account created
5. User can now log in
```

**Login (Existing User)**:

```
1. User clicks "Log In"
2. Enter credentials (email, password)
3. Submit form
4. System verifies credentials
5. User logged in
```

**Problems with separate flows**:

- User confusion: "Do I have an account? Should I sign up or log in?"
- Multiple forms and screens
- More complex code
- Friction in user experience

### Bookora's Merged Approach

**Bookora combines login and signup into one seamless flow**:

```
User enters email/phone
    → Requests OTP
    → Enters OTP
    → System checks: Does user exist?
        → YES: Log user in (existing user)
        → NO: Ask for name, complete profile (new user)
```

**Benefits**:

1. **No decision required**: User doesn't need to know if they have an account
2. **Single entry point**: One "Sign In" button for everyone
3. **Fewer screens**: Streamlined experience
4. **Automatic handling**: System detects new vs returning users
5. **Less friction**: New users don't feel burdened by "Sign Up" forms

### How Bookora Determines New vs Existing User

**After OTP verification**:

```python
# Backend logic in /api/verify-otp
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
user = cursor.fetchone()

if user:
    # Existing user - return user data
    return {'userExists': True, 'user': user_data}
else:
    # New user - request profile completion
    return {'userExists': False, 'identifier': email}
```

**Frontend response handling**:

```javascript
if (data.userExists) {
    // Existing user - log in directly
    loginUser(data.user);
    closeModal();
} else {
    // New user - show profile completion form
    showProfileCompletionForm(data.identifier);
}
```

---

## 4. High-Level Authentication Flow

### Universal Flow (Applies to Both Email and Phone)

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: USER INITIATES AUTHENTICATION                          │
│  User clicks "Sign In" button                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: IDENTIFIER INPUT                                       │
│  User enters email address or phone number                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: OTP GENERATION AND DELIVERY                            │
│  System generates 6-digit random OTP                            │
│  Stores OTP in database with expiration (10 minutes)            │
│  Sends OTP to user via email or SMS                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: OTP INPUT                                              │
│  User receives OTP                                              │
│  User enters OTP in verification screen                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: OTP VERIFICATION                                       │
│  System checks: Does OTP match? Is it expired?                  │
│  If valid: Delete OTP from database                             │
│  Check: Does user exist in users table?                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ EXISTING USER    │  │ NEW USER         │
    │ Log in directly  │  │ Profile form     │
    └──────────────────┘  └──────────────────┘
                │                 │
                │                 ▼
                │     ┌──────────────────────┐
                │     │ User enters name     │
                │     │ Optional: phone/email│
                │     │ System creates user  │
                │     └──────────────────────┘
                │                 │
                └────────┬────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: SESSION CREATION                                       │
│  User data stored in localStorage                               │
│  User is now authenticated                                      │
│  Modal closes, user can proceed with booking                    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components in All OTP Flows

1. **Identifier**: Email or phone number
2. **OTP Generation**: Random 6-digit code
3. **OTP Storage**: Database table with expiration
4. **OTP Delivery**: Email (SMTP) or SMS (provider)
5. **OTP Verification**: Match code and check expiration
6. **User Detection**: Check if user exists
7. **Session Management**: Store user info for subsequent requests

---

## SECTION 1: EMAIL (GMAIL) OTP AUTHENTICATION

**IMPORTANT**: This is the authentication method CURRENTLY USED in Bookora.

---

## 5. Step-by-Step Gmail OTP Flow

### Overview

Bookora uses **Gmail SMTP** to send OTP codes to user email addresses. This is a free, reliable method for email delivery.

### Complete Flow Breakdown

#### Step 1: User Opens Website

**User action**: Visits Bookora homepage or any page requiring authentication.

**System state**:

- No user session exists
- `localStorage.getItem('bookoraUser')` returns `null`
- UI shows "Sign In" button

#### Step 2: User Clicks "Sign In"

**Frontend action**:

```javascript
function openSignInModal() {
    const modal = document.getElementById('signinModal');
    modal.classList.add('active');
    showAuthChoiceScreen();
}
```

**What happens**:

- Sign-in modal appears as overlay
- Modal shows authentication options
- User chooses "Email Login"

#### Step 3: User Enters Email Address

**Frontend HTML** (simplified):

```html
<input type="email" id="emailInput" placeholder="Enter your email">
<button onclick="sendEmailOTP()">Send OTP</button>
```

**User action**: Types email address (example: `user@gmail.com`)

**Frontend validation**:

```javascript
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
```

#### Step 4: Frontend Sends OTP Request to Backend

**JavaScript function**:

```javascript
async function sendEmailOTP() {
    const email = document.getElementById('emailInput').value;
    
    // Validate email format
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Store email temporarily
    sessionStorage.setItem('tempEmail', email);
    
    // Call backend API
    const response = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: email })
    });
    
    const data = await response.json();
    
    if (data.success) {
        showOTPInputScreen(email);
        startOTPTimer(300); // 5 minutes
    } else {
        showError(data.message);
    }
}
```

**HTTP Request sent to Flask**:

```
POST http://localhost:5000/api/send-otp
Content-Type: application/json

{
    "email": "user@gmail.com"
}
```

#### Step 5: Backend Generates OTP

**Flask route handler**:

```python
@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    email = data.get('email')
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Calculate expiry (10 minutes from now)
    expires_at = datetime.now() + timedelta(minutes=10)
    
    # Store in database
    conn = get_db()
    cursor = conn.cursor()
    
    # Delete any existing OTPs for this email
    cursor.execute("DELETE FROM otp_verification WHERE identifier = %s", (email,))
    
    # Insert new OTP
    cursor.execute("""
        INSERT INTO otp_verification (identifier, otp, expires_at)
        VALUES (%s, %s, %s)
    """, (email, otp, expires_at))
    
    conn.commit()
    cursor.close()
    conn.close()
```

**Database state after insertion**:

```
otp_verification table:
+----+------------------+--------+---------------------+---------------------+
| id | identifier       | otp    | expires_at          | created_at          |
+----+------------------+--------+---------------------+---------------------+
| 1  | user@gmail.com   | 586432 | 2026-02-09 14:45:00 | 2026-02-09 14:35:00 |
+----+------------------+--------+---------------------+---------------------+
```

#### Step 6: Backend Sends OTP via Gmail SMTP

**Email sending function**:

```python
def send_email_otp(email, otp):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Your Bookora Verification Code'
    msg['From'] = EMAIL_FROM
    msg['To'] = email
    
    # HTML email body with OTP
    html = f"""
    <html>
        <body>
            <h1>Your OTP is: {otp}</h1>
            <p>Valid for 10 minutes</p>
        </body>
    </html>
    """
    
    msg.attach(MIMEText(html, 'html'))
    
    # Connect to Gmail SMTP server
    with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=5) as server:
        server.starttls()  # Encrypt connection
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)
    
    return True
```

**SMTP Configuration** (from .env file):

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=bhavyajain2910@gmail.com
EMAIL_PASSWORD=lkoiocsldbvtfmke  # Gmail App Password
```

**How Gmail App Password Works**:

1. Enable 2-factor authentication on Gmail account
2. Generate "App Password" from Google Account settings
3. Use app password (not regular password) for SMTP authentication
4. This allows applications to send emails on your behalf

**Email delivery flow**:

```
Flask Backend
    → Connects to smtp.gmail.com:587
    → Authenticates with app password
    → Sends email with OTP
    → Gmail delivers to user's inbox
```

#### Step 7: User Receives Email and Enters OTP

**User action**:

1. Opens email inbox
2. Sees email from Bookora
3. Reads OTP: `586432`
4. Returns to Bookora website
5. Enters OTP in input field

**Frontend OTP input**:

```html
<input type="text" id="otpInput" maxlength="6" placeholder="Enter 6-digit OTP">
<button onclick="verifyOTP()">Verify OTP</button>
<p id="timerDisplay">Time remaining: 4:32</p>
```

**Timer countdown**:

```javascript
let otpTimer = null;
let remainingSeconds = 300; // 5 minutes

function startOTPTimer(seconds) {
    remainingSeconds = seconds;
    updateTimerDisplay();
    
    otpTimer = setInterval(() => {
        remainingSeconds--;
        updateTimerDisplay();
        
        if (remainingSeconds <= 0) {
            clearInterval(otpTimer);
            showError('OTP expired. Please request a new one.');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    document.getElementById('timerDisplay').textContent = 
        `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}
```

#### Step 8: Frontend Sends OTP Verification Request

**JavaScript verification function**:

```javascript
async function verifyOTP() {
    const otp = document.getElementById('otpInput').value;
    const email = sessionStorage.getItem('tempEmail');
    
    if (otp.length !== 6) {
        showError('Please enter a 6-digit OTP');
        return;
    }
    
    const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            email: email,
            otp: otp,
            type: 'email'
        })
    });
    
    const data = await response.json();
    
    if (data.success) {
        if (data.userExists) {
            // Existing user - log in
            loginUser(data.user);
            closeSignInModal();
        } else {
            // New user - show profile form
            showProfileCompletionForm(email);
        }
    } else {
        showError(data.message);
    }
}
```

**HTTP Request**:

```
POST http://localhost:5000/api/verify-otp
Content-Type: application/json

{
    "email": "user@gmail.com",
    "otp": "586432",
    "type": "email"
}
```

#### Step 9: Backend Verifies OTP

**Flask verification logic**:

```python
@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Check OTP in database
    cursor.execute("""
        SELECT * FROM otp_verification 
        WHERE identifier = %s AND otp = %s AND expires_at > NOW()
    """, (email, otp))
    
    otp_record = cursor.fetchone()
    
    if not otp_record:
        return jsonify({
            'success': False, 
            'message': 'Invalid or expired OTP'
        }), 400
    
    # OTP is valid - delete it (prevent reuse)
    cursor.execute("DELETE FROM otp_verification WHERE id = %s", 
                   (otp_record['id'],))
    conn.commit()
    
    # Check if user exists
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if user:
        # Existing user
        return jsonify({
            'success': True,
            'userExists': True,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'phone': user['phone']
            }
        })
    else:
        # New user
        return jsonify({
            'success': True,
            'userExists': False,
            'identifier': email,
            'type': 'email'
        })
```

**Database operations**:

1. **Query OTP table**: Match email, OTP, check expiration
2. **Delete OTP**: Prevent reuse
3. **Query users table**: Check if user exists

#### Step 10a: Existing User Login

**If user exists in database**:

**Backend response**:

```json
{
    "success": true,
    "userExists": true,
    "user": {
        "id": 123,
        "name": "Rahul Sharma",
        "email": "user@gmail.com",
        "phone": "9876543210"
    }
}
```

**Frontend handling**:

```javascript
function loginUser(userData) {
    // Store user data in localStorage
    localStorage.setItem('bookoraUser', JSON.stringify(userData));
    
    // Update UI to show profile
    updateAuthUI();
    
    // Close modal
    closeSignInModal();
    
    // Show success message
    showSuccessToast(`Welcome back, ${userData.name}!`);
}
```

**Result**: User is logged in, can proceed with booking.

#### Step 10b: New User Profile Completion

**If user does NOT exist**:

**Backend response**:

```json
{
    "success": true,
    "userExists": false,
    "identifier": "user@gmail.com",
    "type": "email"
}
```

**Frontend shows profile form**:

```javascript
function showProfileCompletionForm(email) {
    const formHTML = `
        <h3>Complete Your Profile</h3>
        <input type="text" id="nameInput" placeholder="Enter your name" required>
        <input type="tel" id="phoneInput" placeholder="Mobile number (optional)">
        <button onclick="submitProfileCompletion('${email}')">Continue</button>
    `;
    
    document.getElementById('modalContent').innerHTML = formHTML;
}
```

**User enters name** (phone optional):

```
Name: Rahul Sharma
Phone: 9876543210 (optional)
```

**Frontend submits profile**:

```javascript
async function submitProfileCompletion(email) {
    const name = document.getElementById('nameInput').value;
    const phone = document.getElementById('phoneInput').value;
    
    const response = await fetch('http://localhost:5000/api/complete-profile', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            name: name,
            email: email,
            phone: phone,
            primaryContact: 'email'
        })
    });
    
    const data = await response.json();
    
    if (data.success) {
        loginUser(data.user);
        closeSignInModal();
    }
}
```

**Backend creates user**:

```python
@app.route('/api/complete-profile', methods=['POST'])
def complete_profile():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    
    if not name:
        return jsonify({'success': False, 'message': 'Name is required'}), 400
    
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Insert new user
    cursor.execute("""
        INSERT INTO users (name, email, phone, primary_contact_type)
        VALUES (%s, %s, %s, 'email')
    """, (name, email, phone))
    
    user_id = cursor.lastrowid
    conn.commit()
    
    # Fetch created user
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return jsonify({
        'success': True,
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'phone': user['phone']
        }
    })
```

**Database after user creation**:

```
users table:
+-----+---------------+------------------+-------------+---------------------+
| id  | name          | email            | phone       | primary_contact_type|
+-----+---------------+------------------+-------------+---------------------+
| 123 | Rahul Sharma  | user@gmail.com   | 9876543210  | email               |
+-----+---------------+------------------+-------------+---------------------+
```

**Result**: New user created and logged in.

---

## 6. Role of Frontend in Gmail OTP

### HTML Components

**Sign-in modal structure**:

```html
<div class="modal-overlay" id="signinModal">
    <div class="signin-modal">
        <div id="authChoiceScreen">
            <button onclick="showEmailAuthScreen()">Continue with Email</button>
        </div>
        
        <div id="emailAuthScreen" style="display: none;">
            <input type="email" id="emailInput" placeholder="Enter your email">
            <button onclick="sendEmailOTP()">Send OTP</button>
        </div>
        
        <div id="otpVerificationScreen" style="display: none;">
            <input type="text" id="otpInput" maxlength="6" placeholder="Enter OTP">
            <button onclick="verifyOTP()">Verify</button>
            <p id="timerDisplay"></p>
        </div>
        
        <div id="profileCompletionScreen" style="display: none;">
            <input type="text" id="nameInput" placeholder="Your name">
            <input type="tel" id="phoneInput" placeholder="Mobile (optional)">
            <button onclick="submitProfileCompletion()">Complete Profile</button>
        </div>
    </div>
</div>
```

### CSS Styling

**Modal visibility and transitions**:

```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: none;
    align-items: center;
    justify-content: center;
}

.modal-overlay.active {
    display: flex;
}

.signin-modal {
    background: white;
    padding: 40px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
}
```

### JavaScript Functions

**Screen navigation**:

```javascript
function showEmailAuthScreen() {
    document.getElementById('authChoiceScreen').style.display = 'none';
    document.getElementById('emailAuthScreen').style.display = 'block';
}

function showOTPInputScreen(email) {
    document.getElementById('emailAuthScreen').style.display = 'none';
    document.getElementById('otpVerificationScreen').style.display = 'block';
    document.getElementById('emailDisplay').textContent = email;
}

function showProfileCompletionForm(email) {
    document.getElementById('otpVerificationScreen').style.display = 'none';
    document.getElementById('profileCompletionScreen').style.display = 'block';
}
```

**API communication**:

```javascript
// All API calls use fetch with async/await
async function sendEmailOTP() {
    try {
        const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: emailValue})
        });
        
        const data = await response.json();
        // Handle response
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please try again.');
    }
}
```

**Error handling and user feedback**:

```javascript
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccessToast(message) {
    // Show success notification
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
```

---

## 7. Role of Flask Backend in Gmail OTP

### Flask Routes

**Three main authentication endpoints**:

1. `/api/send-otp` - Generate and send OTP
2. `/api/verify-otp` - Verify OTP and check user
3. `/api/complete-profile` - Create new user account

### Database Operations

**OTP storage and retrieval**:

```python
# Insert OTP
cursor.execute("""
    INSERT INTO otp_verification (identifier, otp, expires_at)
    VALUES (%s, %s, %s)
""", (email, otp, expires_at))

# Verify OTP
cursor.execute("""
    SELECT * FROM otp_verification 
    WHERE identifier = %s AND otp = %s AND expires_at > NOW()
""", (email, otp))

# Delete after verification
cursor.execute("DELETE FROM otp_verification WHERE id = %s", (otp_id,))
```

### SMTP Email Sending

**Gmail SMTP configuration**:

```python
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USER = os.getenv('EMAIL_USER')  # From .env file
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')  # App password

def send_email_otp(email, otp):
    with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=5) as server:
        server.starttls()  # Enable TLS encryption
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)
```

**Email message construction**:

```python
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

msg = MIMEMultipart('alternative')
msg['Subject'] = 'Your Bookora Verification Code'
msg['From'] = EMAIL_FROM
msg['To'] = recipient_email

html_content = f"""
<html>
    <body>
        <h1>Your OTP: {otp}</h1>
        <p>Valid for 10 minutes</p>
    </body>
</html>
"""

msg.attach(MIMEText(html_content, 'html'))
```

### Business Logic

**OTP expiration handling**:

```python
from datetime import datetime, timedelta

# When generating OTP
expires_at = datetime.now() + timedelta(minutes=10)

# When verifying
# SQL query includes: AND expires_at > NOW()
# This automatically filters expired OTPs
```

**User existence check**:

```python
# After OTP verification
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
user = cursor.fetchone()

if user:
    # Return existing user data
    return {'userExists': True, 'user': user_data}
else:
    # Request profile completion
    return {'userExists': False}
```

---

## 8. How OTP is Generated, Stored, Expired, and Verified

### OTP Generation

**Random number generation**:

```python
import random

otp = str(random.randint(100000, 999999))
# Generates: '586432', '923847', etc.
```

**Why 6 digits?**

- Balance between security and usability
- 1,000,000 possible combinations
- Easy to read and type
- Industry standard

**Alternative methods** (not used in Bookora):

```python
import secrets
otp = str(secrets.randbelow(1000000)).zfill(6)
# More cryptographically secure
```

### OTP Storage

**Database table structure**:

```sql
CREATE TABLE otp_verification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(100) NOT NULL,  -- email or phone
    otp VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier (identifier),
    INDEX idx_expires_at (expires_at)
);
```

**Why store in database instead of memory?**

1. Persistence across server restarts
2. Multiple server instances can access same data
3. Enables logging and auditing
4. Allows expiration queries

**Sample data**:

```
+----+------------------+--------+---------------------+---------------------+
| id | identifier       | otp    | expires_at          | created_at          |
+----+------------------+--------+---------------------+---------------------+
| 1  | user@gmail.com   | 586432 | 2026-02-09 14:45:00 | 2026-02-09 14:35:00 |
| 2  | test@yahoo.com   | 923847 | 2026-02-09 14:50:00 | 2026-02-09 14:40:00 |
+----+------------------+--------+---------------------+---------------------+
```

### OTP Expiration

**Time-based expiration**:

```python
# When creating OTP
from datetime import datetime, timedelta

expires_at = datetime.now() + timedelta(minutes=10)
# Current time: 2026-02-09 14:35:00
# Expires at:   2026-02-09 14:45:00
```

**Verification query automatically checks expiration**:

```sql
SELECT * FROM otp_verification 
WHERE identifier = 'user@gmail.com' 
  AND otp = '586432' 
  AND expires_at > NOW();
  
-- If current time is 14:46:00, this returns no results
-- If current time is 14:40:00, this returns the OTP record
```

**Frontend timer**:

```javascript
let remainingSeconds = 300; // 5 minutes

setInterval(() => {
    remainingSeconds--;
    if (remainingSeconds <= 0) {
        showError('OTP expired');
        disableVerifyButton();
    }
}, 1000);
```

**Why 10-minute expiration?**

- Long enough for user to receive and enter
- Short enough to prevent abuse
- Reduces database storage
- Industry standard

### OTP Verification Process

**Step 1: Receive verification request**

```python
email = request.json.get('email')
otp = request.json.get('otp')
```

**Step 2: Query database**

```python
cursor.execute("""
    SELECT * FROM otp_verification 
    WHERE identifier = %s AND otp = %s AND expires_at > NOW()
""", (email, otp))

otp_record = cursor.fetchone()
```

**Step 3: Check result**

```python
if not otp_record:
    # OTP not found, wrong code, or expired
    return {'success': False, 'message': 'Invalid or expired OTP'}
```

**Step 4: Delete OTP (prevent reuse)**

```python
cursor.execute("DELETE FROM otp_verification WHERE id = %s", (otp_record['id'],))
conn.commit()
```

**Why delete immediately?**

- Prevents OTP reuse (one-time password)
- Reduces database clutter
- Security best practice

**Step 5: Proceed with authentication**

```python
# OTP verified successfully
# Now check if user exists
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
user = cursor.fetchone()
```

### Security Considerations

**Rate limiting** (not implemented but recommended):

```python
# Limit OTP requests per email
# Example: Max 3 OTP requests in 1 hour

cursor.execute("""
    SELECT COUNT(*) FROM otp_verification 
    WHERE identifier = %s AND created_at > NOW() - INTERVAL 1 HOUR
""", (email,))

count = cursor.fetchone()[0]
if count >= 3:
    return {'success': False, 'message': 'Too many requests. Try again later.'}
```

**Brute-force protection** (not implemented but recommended):

```python
# Limit verification attempts
# Example: Max 5 wrong attempts, then block for 30 minutes
```

---

## 9. Database Tables Involved

### Table 1: otp_verification

**Purpose**: Store OTPs temporarily for verification.

**Schema**:

```sql
CREATE TABLE otp_verification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(100) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier (identifier),
    INDEX idx_expires_at (expires_at)
);
```

**Fields explained**:

- `id`: Auto-incrementing primary key
- `identifier`: Email or phone number
- `otp`: The 6-digit code
- `expires_at`: When OTP becomes invalid
- `created_at`: When OTP was generated

**Indexes**:

- `idx_identifier`: Fast lookup by email/phone
- `idx_expires_at`: Efficient expiration checks

**Lifecycle**:

1. Row inserted when OTP generated
2. Row queried when verifying OTP
3. Row deleted after successful verification or expiration

**Cleanup** (manual or scheduled):

```sql
-- Delete expired OTPs
DELETE FROM otp_verification WHERE expires_at < NOW();
```

### Table 2: users

**Purpose**: Store user account information.

**Schema**:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    primary_contact_type ENUM('email', 'phone') NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
```

**Fields explained**:

- `id`: Unique user identifier
- `name`: User's full name
- `email`: Email address (unique, nullable)
- `phone`: Phone number (unique, nullable)
- `primary_contact_type`: Which contact method was used for signup
- `role`: User role (default 'user', could be 'admin')
- `created_at`: Account creation timestamp

**Constraints**:

- `UNIQUE` on email and phone: No duplicate accounts
- `CHECK` constraint: At least one contact method required
- `ENUM` for contact type: Only 'email' or 'phone' allowed

**Sample data**:

```
+-----+---------------+------------------+-------------+---------------------+------+
| id  | name          | email            | phone       | primary_contact_type| role |
+-----+---------------+------------------+-------------+---------------------+------+
| 1   | Rahul Sharma  | rahul@gmail.com  | 9876543210  | email               | user |
| 2   | Priya Patel   | priya@yahoo.com  | NULL        | email               | user |
| 3   | Amit Kumar    | NULL             | 9123456789  | phone               | user |
+-----+---------------+------------------+-------------+---------------------+------+
```

**Relationship with other tables**:

- `bookings.user_id` → `users.id`
- `saved_movies.user_id` → `users.id`

---

## 10. How User Session / Identity is Maintained After Login

### Session Management in Bookora

**Bookora uses client-side session management with localStorage**.

### localStorage Basics

**What is localStorage?**

- Browser storage API
- Stores key-value pairs as strings
- Persists across browser sessions (until cleared)
- Accessible only to same origin (domain)
- Maximum 5-10 MB storage

**Why localStorage instead of server sessions?**

1. **Simplicity**: No server-side session management needed
2. **Stateless backend**: Flask doesn't need to track sessions
3. **Fast**: No database queries to verify session
4. **Offline-friendly**: User data available without server

**Trade-offs**:

- Less secure than server-side sessions
- User can manually clear data
- Not suitable for sensitive applications (banking, healthcare)
- Good enough for Bookora's use case

### Login Process

**When user logs in successfully**:

```javascript
function loginUser(userData) {
    // Store entire user object as JSON string
    localStorage.setItem('bookoraUser', JSON.stringify(userData));
    
    // Update UI
    updateAuthUI();
}
```

**Data stored**:

```javascript
{
    "id": 123,
    "name": "Rahul Sharma",
    "email": "rahul@gmail.com",
    "phone": "9876543210"
}
```

**localStorage after login**:

```
Key: bookoraUser
Value: {"id":123,"name":"Rahul Sharma","email":"rahul@gmail.com","phone":"9876543210"}
```

### Checking Authentication Status

**On every page load**:

```javascript
function isUserLoggedIn() {
    return localStorage.getItem('bookoraUser') !== null;
}

function getCurrentUser() {
    const userData = localStorage.getItem('bookoraUser');
    return userData ? JSON.parse(userData) : null;
}
```

**Usage in pages**:

```javascript
// Check if user is logged in before allowing booking
function proceedToPayment() {
    if (!isUserLoggedIn()) {
        openSignInModal();
        return;
    }
    
    const user = getCurrentUser();
    createBooking(user.id, selectedSeats);
}
```

### UI Updates Based on Auth State

**Show different UI for logged in vs logged out**:

```javascript
function updateAuthUI() {
    const loggedOutState = document.getElementById('loggedOutState');
    const loggedInState = document.getElementById('loggedInState');
    const user = getCurrentUser();
    
    if (user) {
        // Show profile avatar
        loggedOutState.style.display = 'none';
        loggedInState.style.display = 'flex';
        
        // Update profile info
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;
    } else {
        // Show login button
        loggedOutState.style.display = 'flex';
        loggedInState.style.display = 'none';
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', updateAuthUI);
```

**HTML structure**:

```html
<div id="loggedOutState" style="display: flex;">
    <button onclick="openSignInModal()">Sign In</button>
</div>

<div id="loggedInState" style="display: none;">
    <div class="profile-avatar" onclick="toggleProfileDropdown()">
        <i class="fas fa-user"></i>
    </div>
    <div class="profile-dropdown" id="profileDropdown">
        <div class="profile-info">
            <p id="profileName">Rahul Sharma</p>
            <p id="profileEmail">rahul@gmail.com</p>
        </div>
        <a href="/profile">My Profile</a>
        <a href="/my-bookings">My Bookings</a>
        <a href="#" onclick="handleLogout()">Logout</a>
    </div>
</div>
```

### Logout Process

**Clear user data**:

```javascript
function handleLogout() {
    // Remove user data from localStorage
    localStorage.removeItem('bookoraUser');
    
    // Update UI
    updateAuthUI();
    
    // Redirect to homepage or show message
    window.location.href = '/';
}
```

**After logout**:

- `localStorage.getItem('bookoraUser')` returns `null`
- `isUserLoggedIn()` returns `false`
- UI shows "Sign In" button again

### Using User Data in API Calls

**Include user ID in booking requests**:

```javascript
async function createBooking(selectedSeats) {
    const user = getCurrentUser();
    
    const response = await fetch('/api/create-booking', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            user_id: user.id,
            show_id: currentShowId,
            seats: selectedSeats
        })
    });
}
```

**Backend validates user exists**:

```python
@app.route('/api/create-booking', methods=['POST'])
def create_booking():
    user_id = request.json.get('user_id')
    
    # Verify user exists
    cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
    if not cursor.fetchone():
        return jsonify({'success': False, 'message': 'Invalid user'}), 401
    
    # Proceed with booking
```

### Security Considerations

**localStorage limitations**:

1. **No encryption**: Data stored as plain text
2. **XSS vulnerability**: JavaScript can access localStorage
3. **User can modify**: Not suitable for sensitive data

**Better alternatives** (not implemented in Bookora):

1. **Server-side sessions**: Store session ID in cookie, data on server
2. **JWT tokens**: Signed tokens with expiration
3. **HTTP-only cookies**: Browser-managed, not accessible to JavaScript

**Current approach is acceptable because**:

- Not storing sensitive data (no passwords, payment info)
- User can only perform actions on their own account
- Backend validates all requests
- Suitable for learning project

---

## 11. Security Considerations for Email OTP

### Current Security Measures

**1. OTP Expiration**

- OTPs expire after 10 minutes
- Reduces window for interception or brute-force

**2. One-Time Use**

- OTP deleted after verification
- Cannot be reused even within expiration window

**3. Random Generation**

- Using `random.randint()` for 6-digit codes
- 1,000,000 possible combinations

**4. HTTPS Recommended**

- Email delivery uses TLS encryption (port 587)
- Website should use HTTPS in production

**5. Database Indexing**

- Fast lookups reduce timing attack surface
- Expired OTPs filtered at database level

### Security Gaps (Not Implemented)

**1. Rate Limiting**

**Problem**: Unlimited OTP requests allow abuse.

**Solution** (recommended):

```python
# Limit OTP requests per email
MAX_OTP_PER_HOUR = 3

cursor.execute("""
    SELECT COUNT(*) FROM otp_verification 
    WHERE identifier = %s AND created_at > NOW() - INTERVAL 1 HOUR
""", (email,))

if cursor.fetchone()[0] >= MAX_OTP_PER_HOUR:
    return {'success': False, 'message': 'Too many requests'}
```

**2. Brute-Force Protection**

**Problem**: Attacker can try all 1,000,000 OTP combinations.

**Solution** (recommended):

```python
# Track failed verification attempts
# Block after 5 failed attempts for 30 minutes

cursor.execute("""
    CREATE TABLE failed_otp_attempts (
        identifier VARCHAR(100),
        attempt_count INT,
        blocked_until DATETIME
    )
""")
```

**3. Email Verification**

**Problem**: Anyone can request OTP for any email.

**Mitigation**: Requiring OTP proves email ownership.

**4. Account Enumeration**

**Problem**: Attacker can determine if email exists in system.

**Current behavior**:

- OTP sent regardless of user existence
- Response same for existing and new users

**Good**: Prevents enumeration.

**5. Timing Attacks**

**Problem**: Response time differences reveal information.

**Current**: Database queries may have variable timing.

**Solution** (advanced):

```python
import time

start = time.time()
# ... verification logic ...
elapsed = time.time() - start

# Always take at least 200ms
if elapsed < 0.2:
    time.sleep(0.2 - elapsed)
```

### Best Practices Being Followed

1. **TLS encryption** for email delivery
2. **Database parameterization** prevents SQL injection
3. **OTP deletion** after use
4. **Time-based expiration**
5. **No password storage** (OTP-only authentication)

### Production Recommendations

**For real-world deployment, add**:

1. Rate limiting on OTP requests
2. CAPTCHA before OTP generation
3. Brute-force protection on verification
4. Audit logging of authentication events
5. HTTPS enforcement
6. Content Security Policy headers
7. Session timeout and auto-logout

---

## SECTION 2: PHONE NUMBER OTP AUTHENTICATION

**IMPORTANT**: This is NOT currently used in Bookora. Included for educational understanding.

---

## 12. Conceptual Phone OTP Flow

### How Phone OTP Works Generally

**Phone OTP follows similar pattern to email OTP, but uses SMS**:

```
User enters phone number
    → Backend generates 6-digit OTP
    → Backend calls SMS provider API
    → SMS provider sends text message to phone
    → User receives SMS
    → User enters OTP
    → Backend verifies OTP
    → User authenticated
```

### Key Difference: SMS Delivery

**Email OTP**: Direct SMTP connection (free, self-hosted)

**Phone OTP**: Requires third-party SMS provider (usually paid)

### Common SMS Providers

**1. Twilio**

- Popular SMS API service
- Pay-per-message pricing (approximately $0.0075 per SMS)
- Global coverage
- Requires account and API keys

**2. Firebase Authentication**

- Google's authentication service
- Includes phone auth with free tier
- Handles OTP generation and verification
- Client-side SDK integration

**3. AWS SNS (Simple Notification Service)**

- Amazon's messaging service
- Pay-per-SMS pricing
- Requires AWS account

**4. MSG91 (India)**

- Indian SMS provider
- Lower cost for Indian numbers
- Popular for Indian startups

### Why Phone OTP Costs Money

**SMS delivery is not free**:

1. **Infrastructure**: SMS providers maintain telecom connections
2. **Carrier fees**: Mobile carriers charge for message delivery
3. **Global reach**: International SMS costs more
4. **Reliability**: Guaranteed delivery, status tracking

**Typical costs**:

- India: ₹0.15 - ₹0.50 per SMS
- USA: $0.0075 - $0.01 per SMS
- International: $0.05 - $0.10 per SMS

**For 1000 users**:

- Email OTP: Free (only SMTP server)
- Phone OTP: ₹150 - ₹500 (Indian users)

---

## 13. How Phone OTP Usually Works

### Using Twilio (Example)

**1. Sign up and get credentials**:

```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: your_auth_token
Twilio Phone Number: +1234567890
```

**2. Install Twilio SDK**:

```bash
pip install twilio
```

**3. Backend sends SMS**:

```python
from twilio.rest import Client

TWILIO_SID = os.getenv('TWILIO_SID')
TWILIO_TOKEN = os.getenv('TWILIO_TOKEN')
TWILIO_PHONE = os.getenv('TWILIO_PHONE')

def send_phone_otp(phone, otp):
    client = Client(TWILIO_SID, TWILIO_TOKEN)
    
    message = client.messages.create(
        body=f'Your Bookora OTP is: {otp}. Valid for 10 minutes.',
        from_=TWILIO_PHONE,
        to=phone
    )
    
    return message.sid
```

**4. User receives SMS**:

```
Your Bookora OTP is: 586432. Valid for 10 minutes.
```

### Using Firebase Phone Auth (Example)

**Firebase handles OTP generation and verification automatically**.

**1. Add Firebase SDK to HTML**:

```html
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js"></script>
```

**2. Initialize Firebase**:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-project-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
```

**3. Setup reCAPTCHA** (required by Firebase):

```javascript
window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible'
}, auth);
```

**4. Send OTP**:

```javascript
const appVerifier = window.recaptchaVerifier;
const phoneNumber = "+919876543210";

signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    .then((confirmationResult) => {
        // SMS sent
        window.confirmationResult = confirmationResult;
        showOTPInput();
    })
    .catch((error) => {
        console.error("Error sending OTP:", error);
    });
```

**5. Verify OTP**:

```javascript
const code = "586432"; // User input

confirmationResult.confirm(code)
    .then((result) => {
        // User signed in successfully
        const user = result.user;
        console.log("User authenticated:", user);
    })
    .catch((error) => {
        console.error("Invalid OTP:", error);
    });
```

**Firebase advantages**:

- Free tier (10 verifications per day)
- No backend SMS code needed
- Automatic OTP generation and verification
- Built-in reCAPTCHA protection

---

## 14. Frontend and Backend Interaction for Phone OTP

### Frontend Flow (Similar to Email)

**1. User enters phone number**:

```html
<input type="tel" id="phoneInput" placeholder="+91 9876543210">
<button onclick="sendPhoneOTP()">Send OTP</button>
```

**2. Validation**:

```javascript
function validatePhone(phone) {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');
    
    // Check if valid format (with +91 or without)
    const regex = /^(\+91)?[6-9]\d{9}$/;
    return regex.test(cleaned);
}
```

**3. Send OTP request**:

```javascript
async function sendPhoneOTP() {
    const phone = document.getElementById('phoneInput').value;
    
    if (!validatePhone(phone)) {
        showError('Invalid phone number');
        return;
    }
    
    // Normalize phone (add +91 if missing)
    const normalized = phone.startsWith('+91') ? phone : '+91' + phone;
    
    const response = await fetch('/api/send-phone-otp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ phone: normalized })
    });
    
    const data = await response.json();
    
    if (data.success) {
        showOTPInputScreen(normalized);
    }
}
```

### Backend Flow (Using Twilio)

**1. Receive phone number**:

```python
@app.route('/api/send-phone-otp', methods=['POST'])
def send_phone_otp():
    phone = request.json.get('phone')
    
    # Normalize phone
    normalized_phone = normalize_phone(phone)
    
    if not normalized_phone:
        return jsonify({'success': False, 'message': 'Invalid phone'}), 400
```

**2. Generate and store OTP** (same as email):

```python
    otp = str(random.randint(100000, 999999))
    expires_at = datetime.now() + timedelta(minutes=10)
    
    cursor.execute("""
        INSERT INTO otp_verification (identifier, otp, expires_at)
        VALUES (%s, %s, %s)
    """, (normalized_phone, otp, expires_at))
    conn.commit()
```

**3. Send via Twilio**:

```python
    from twilio.rest import Client
    
    client = Client(TWILIO_SID, TWILIO_TOKEN)
    
    message = client.messages.create(
        body=f'Your Bookora OTP: {otp}',
        from_=TWILIO_PHONE,
        to=normalized_phone
    )
    
    return jsonify({'success': True, 'message': 'OTP sent'})
```

**4. Verification** (same as email):

```python
@app.route('/api/verify-phone-otp', methods=['POST'])
def verify_phone_otp():
    phone = request.json.get('phone')
    otp = request.json.get('otp')
    
    # Same verification logic as email
    cursor.execute("""
        SELECT * FROM otp_verification 
        WHERE identifier = %s AND otp = %s AND expires_at > NOW()
    """, (phone, otp))
    
    # Rest is identical to email verification
```

### Phone Number Normalization

**Why needed**: Users enter phone numbers in various formats.

**Examples**:

```
9876543210
+919876543210
+91 9876543210
+91-9876-543210
```

**Normalization function**:

```python
def normalize_phone(phone):
    if not phone:
        return None
    
    # Remove whitespace and dashes
    phone = str(phone).strip().replace(' ', '').replace('-', '')
    
    # Remove +91 prefix
    if phone.startswith('+91'):
        phone = phone[3:]
    elif phone.startswith('91') and len(phone) == 12:
        phone = phone[2:]
    
    # Validate 10 digits
    if len(phone) == 10 and phone.isdigit():
        return phone
    
    return None
```

**Usage**:

```python
normalize_phone('+91 9876543210')  # Returns '9876543210'
normalize_phone('9876543210')       # Returns '9876543210'
normalize_phone('+919876543210')    # Returns '9876543210'
```

---

## 15. Key Differences Between Email OTP and Phone OTP

### Delivery Method

**Email OTP**:

- Uses SMTP protocol
- Direct connection to email server
- Free (only email account needed)
- Delivery time: Seconds to minutes
- May go to spam folder

**Phone OTP**:

- Uses SMS/telecom network
- Requires third-party provider (Twilio, Firebase)
- Paid service (per-message cost)
- Delivery time: Usually seconds
- More reliable delivery

### Cost

**Email OTP**:

- Free for unlimited emails
- Only infrastructure cost (server, bandwidth)

**Phone OTP**:

- Pay per SMS sent
- Costs add up with user growth
- Need budget planning

### Implementation Complexity

**Email OTP**:

- Simple SMTP integration
- No third-party SDK needed
- Fewer dependencies

**Phone OTP**:

- Requires SMS provider account
- Need to integrate third-party SDK
- More configuration (API keys, credentials)

### User Experience

**Email OTP**:

- Users must check email inbox
- May not receive instantly
- Requires internet access for email
- Can be accessed on different device

**Phone OTP**:

- SMS arrives directly on phone
- Usually faster delivery
- Works without internet (cellular network)
- More convenient for mobile users

### Security

**Email OTP**:

- Email can be forwarded
- Email accounts can be compromised
- Less secure in some contexts

**Phone OTP**:

- Tied to physical device (SIM card)
- SIM swapping attack possible
- Generally considered more secure

### Accessibility

**Email OTP**:

- Requires email account
- Most users have email
- Accessible from any device

**Phone OTP**:

- Requires mobile phone
- Not all users have mobile in some regions
- Requires cellular coverage

---

## 16. Why Bookora Currently Does NOT Use Phone OTP

### Reasons for Using Email OTP Only

**1. Cost Considerations**

- Email OTP is completely free
- Phone OTP requires paid SMS service
- For learning project, free option is preferred

**2. Simplicity**

- Email OTP requires only SMTP setup
- No third-party API integrations needed
- Easier to understand and implement

**3. Learning Focus**

- Demonstrates core OTP concepts
- Shows email sending with Python
- Avoids dependency on paid services

**4. Development Environment**

- No credit card or account setup needed
- Can test unlimited times without cost
- Local development is straightforward

**5. User Convenience**

- Email is universally accessible
- Works on desktop and mobile
- No SMS delivery issues in testing

### When to Consider Phone OTP

**Use phone OTP when**:

1. **Higher security required**: Banking, healthcare apps
2. **Budget available**: Can afford SMS costs
3. **Mobile-first app**: Users primarily on mobile
4. **Faster delivery needed**: SMS usually faster than email
5. **Regional preference**: Some markets prefer SMS

### Bookora's Future Plans

**Phone OTP could be added as alternative authentication method**:

```
Sign In Options:
[ ] Continue with Email
[ ] Continue with Phone Number
```

**Benefits of offering both**:

- User choice improves experience
- Fallback if email/phone unavailable
- Broader user base coverage

**Implementation approach**:

1. Keep existing email OTP
2. Add phone OTP as optional feature
3. Let user choose preferred method
4. Store primary contact type in user profile

---

## 7. Authentication Flow Diagrams

### Email OTP Complete Flow

```
┌────────────────────────────────────────────────────────────────────┐
│  USER BROWSER                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  1. User clicks "Sign In"                                     │ │
│  │  2. Enters email: user@gmail.com                              │ │
│  │  3. Clicks "Send OTP"                                         │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              │ POST /api/send-otp
                              │ {email: "user@gmail.com"}
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  FLASK BACKEND                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  4. Generate OTP: 586432                                      │ │
│  │  5. Calculate expiry: now + 10 minutes                        │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              │ INSERT INTO otp_verification
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  MYSQL DATABASE                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  otp_verification table:                                      │ │
│  │  +----+----------------+--------+-------------+-----------+   │ │
│  │  | id | identifier     | otp    | expires_at  | created   |   │ │
│  │  +----+----------------+--------+-------------+-----------+   │ │
│  │  | 1  | user@gmail.com | 586432 | 14:45:00    | 14:35:00  |   │ │
│  │  +----+----------------+--------+-------------+-----------+   │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                              │ OTP stored
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  FLASK BACKEND                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  6. Connect to Gmail SMTP (smtp.gmail.com:587)                │ │
│  │  7. Send email with OTP                                       │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              │ SMTP send
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  GMAIL SERVER                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  8. Receives email                                            │ │
│  │  9. Delivers to user@gmail.com inbox                          │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              │ Email delivered
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  USER EMAIL CLIENT                                                 │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  10. User opens email                                         │ │
│  │  11. Reads OTP: 586432                                        │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              │ User action
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  USER BROWSER                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  12. Returns to Bookora                                       │ │
│  │  13. Enters OTP: 586432                                       │ │
│  │  14. Clicks "Verify"                                          │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              │ POST /api/verify-otp
                              │ {email: "user@gmail.com", otp: "586432"}
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  FLASK BACKEND                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  15. Query database for matching OTP                          │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              │ SELECT * WHERE identifier AND otp
                              │ AND expires_at > NOW()
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  MYSQL DATABASE                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  16. Returns OTP record if valid and not expired              │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              │ OTP record found
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  FLASK BACKEND                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  17. OTP verified successfully                                │ │
│  │  18. Delete OTP from database                                 │ │
│  │  19. Check if user exists in users table                      │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
      ┌─────────────────────┐   ┌─────────────────────┐
      │ USER EXISTS         │   │ USER DOES NOT EXIST │
      │ Return user data    │   │ Return userExists:  │
      │                     │   │ false               │
      └──────────┬──────────┘   └──────────┬──────────┘
                 │                         │
                 │                         │
                 ▼                         ▼
      ┌─────────────────────┐   ┌─────────────────────┐
      │ Browser receives    │   │ Browser receives    │
      │ user data           │   │ newUser flag        │
      └──────────┬──────────┘   └──────────┬──────────┘
                 │                         │
                 │                         ▼
                 │              ┌─────────────────────┐
                 │              │ Show profile form   │
                 │              │ User enters name    │
                 │              │ POST /complete-     │
                 │              │ profile             │
                 │              │ Create user in DB   │
                 │              └──────────┬──────────┘
                 │                         │
                 └────────────┬────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  USER BROWSER                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  20. Store user data in localStorage                          │ │
│  │  21. Update UI (show profile avatar)                          │ │
│  │  22. Close modal                                              │ │
│  │  23. User is now authenticated                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### Frontend-Backend Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  FRONTEND (Browser)                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                               ││
│  │  HTML Components:                                             ││
│  │  - Email input field                                          ││
│  │  - OTP input field                                            ││
│  │  - Profile completion form                                    ││
│  │                                                               ││
│  │  JavaScript Functions:                                        ││
│  │  - sendEmailOTP()                                             ││
│  │  - verifyOTP()                                                ││
│  │  - submitProfileCompletion()                                  ││
│  │  - loginUser()                                                ││
│  │                                                               ││
│  │  State Management:                                            ││
│  │  - sessionStorage (temporary email/phone)                     ││
│  │  - localStorage (user data after login)                       ││
│  │                                                               ││
│  └────────────────────────┬──────────────────────────────────────┘│
└────────────────────────────┼───────────────────────────────────────┘
                             │
                             │ HTTP Requests (JSON)
                             │ - POST /api/send-otp
                             │ - POST /api/verify-otp
                             │ - POST /api/complete-profile
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  BACKEND (Flask)                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                               ││
│  │  Route Handlers:                                              ││
│  │  - @app.route('/api/send-otp')                                ││
│  │  - @app.route('/api/verify-otp')                              ││
│  │  - @app.route('/api/complete-profile')                        ││
│  │                                                               ││
│  │  Business Logic:                                              ││
│  │  - OTP generation (random 6-digit)                            ││
│  │  - Expiration calculation (now + 10 min)                      ││
│  │  - Email sending via SMTP                                     ││
│  │  - OTP validation                                             ││
│  │  - User existence check                                       ││
│  │  - User creation                                              ││
│  │                                                               ││
│  │  Helper Functions:                                            ││
│  │  - get_db() - Database connection                             ││
│  │  - send_email_otp() - Email delivery                          ││
│  │  - normalize_phone() - Phone formatting                       ││
│  │                                                               ││
│  └────────────────────────┬──────────────────────────────────────┘│
└────────────────────────────┼───────────────────────────────────────┘
                             │
                             │ SQL Queries
                             │ - INSERT OTP
                             │ - SELECT OTP
                             │ - DELETE OTP
                             │ - SELECT user
                             │ - INSERT user
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  DATABASE (MySQL)                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                               ││
│  │  Tables:                                                      ││
│  │                                                               ││
│  │  otp_verification                                             ││
│  │  - Stores OTPs temporarily                                    ││
│  │  - Auto-expires via query filter                              ││
│  │  - Deleted after verification                                 ││
│  │                                                               ││
│  │  users                                                        ││
│  │  - Stores user accounts                                       ││
│  │  - Unique constraints on email/phone                          ││
│  │  - Used for login validation                                  ││
│  │                                                               ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘


PARALLEL INTERACTION: EMAIL SENDING

┌─────────────────────────────────────────────────────────────────┐
│  BACKEND (Flask)                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  send_email_otp() function                                    ││
│  │  - Constructs HTML email                                      ││
│  │  - Connects to smtp.gmail.com:587                             ││
│  │  - Authenticates with app password                            ││
│  │  - Sends email                                                ││
│  └────────────────────────┬──────────────────────────────────────┘│
└────────────────────────────┼───────────────────────────────────────┘
                             │
                             │ SMTP Protocol
                             │ TLS Encrypted
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  GMAIL SMTP SERVER (smtp.gmail.com)                               │
│  - Receives email                                                 │
│  - Validates sender credentials                                   │
│  - Routes to recipient inbox                                      │
│  - Delivers within seconds                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Interview Preparation

### How to Explain Bookora Authentication

#### Opening Statement (30 seconds)

"Bookora uses OTP-based authentication via email. When users want to sign in, they enter their email address, receive a 6-digit OTP via Gmail SMTP, and enter it to verify their identity. The system automatically detects if they're a new or existing user, creating accounts seamlessly without traditional passwords."

#### Technical Deep Dive (2-3 minutes)

"The authentication flow has several components:

**Frontend**: A modal-based interface where users enter their email and OTP. JavaScript handles API calls to the backend using fetch, manages temporary state in sessionStorage during authentication, and stores user data in localStorage after successful login.

**Backend**: Flask handles three main endpoints. The `/api/send-otp` endpoint generates a random 6-digit code, stores it in MySQL with a 10-minute expiration, and sends it via Gmail SMTP. The `/api/verify-otp` endpoint validates the OTP against the database, checks expiration, and determines if the user exists. For new users, `/api/complete-profile` creates their account.

**Database**: Two tables support this. The `otp_verification` table stores OTPs temporarily with identifier, code, and expiration timestamp. OTPs are deleted immediately after verification to prevent reuse. The `users` table stores account information with unique constraints on email and phone.

**Security**: OTPs expire after 10 minutes, are single-use only, and verification is time-limited. We use Gmail's SMTP with app passwords for secure email delivery.

The merged login/signup approach means users don't need to decide if they have an account - the system figures it out after OTP verification and either logs them in or requests their name for account creation."

#### Common Interview Questions

**Q: Why OTP instead of passwords?**

"OTP eliminates password management overhead for both users and the system. Users don't need to remember passwords or go through password reset flows. From a security standpoint, OTPs are time-limited and single-use, reducing risk. For a ticket booking application, this provides adequate security without the complexity of password hashing, storage, and validation."

**Q: How do you prevent OTP brute-force attacks?**

"Currently, the system relies on OTP expiration and single-use deletion. In production, I would add rate limiting to restrict OTP requests per email per hour, implement attempt tracking to block after multiple failed verifications, and add CAPTCHA before OTP generation to prevent automated abuse. The 10-minute expiration also limits the attack window compared to longer-lived credentials."

**Q: What if email delivery fails?**

"The `send_email_otp` function returns a boolean indicating success or failure. If sending fails, the user receives an error message and can retry. The backend has a 5-second timeout on SMTP connections to prevent hanging. For production, I would implement a retry mechanism with exponential backoff and potentially offer alternative authentication like phone OTP as a fallback."

**Q: How is the session maintained?**

"After successful authentication, user data is stored in browser localStorage as a JSON object containing user ID, name, email, and phone. Each subsequent request that requires authentication includes the user ID from localStorage. The backend validates the user ID exists in the database before processing the request. This is a client-side session approach suitable for this application's security requirements."

**Q: Why localStorage instead of cookies or server-side sessions?**

"localStorage provides simplicity for this project - no server-side session management needed, making the backend stateless. It's fast since there's no database lookup per request. For a production system with higher security requirements, I would migrate to HTTP-only cookies with server-side sessions or JWT tokens to prevent client-side tampering and XSS attacks."

**Q: How would you add phone OTP?**

"I would integrate an SMS provider like Twilio or Firebase Phone Auth. The flow remains similar: user enters phone number, backend generates OTP, but instead of SMTP, it calls the SMS provider's API. The same OTP verification logic works - the `identifier` field in `otp_verification` already supports both email and phone. Users could choose their preferred authentication method at sign-in, with the `users` table tracking their primary contact type."

**Q: What about email verification?**

"Currently, requesting an OTP proves email ownership since the user must access their inbox to retrieve the code. This inherently verifies email access. For stricter verification, I could add a `email_verified` flag in the `users` table, set to true only after first successful OTP login, and require re-verification if the user changes their email."

**Q: How do you handle concurrent OTP requests?**

"The backend deletes any existing OTPs for an email before inserting a new one: `DELETE FROM otp_verification WHERE identifier = email`. This ensures only the latest OTP is valid. If a user requests multiple OTPs rapidly, only the most recent one will work. The older codes are invalidated, preventing confusion and potential security issues."

**Q: What's the attack surface of this authentication system?**

"Main vulnerabilities include:
1. Email account compromise - if attacker accesses user's email, they can authenticate
2. No rate limiting - unlimited OTP requests possible
3. Account enumeration - technically preventable since we send OTP regardless of user existence
4. Client-side session - localStorage can be manipulated, though backend validates user ID
5. No multi-factor authentication - single factor (email access) is the only security layer

For production, I'd implement rate limiting, add CAPTCHA, use HTTP-only cookies, and consider adding device fingerprinting for suspicious activity detection."

#### Comparison with Other Authentication Methods

**vs. Traditional Password Authentication**:

- Pros: No password management, simpler UX, no password reset flows needed
- Cons: Requires email delivery, slightly slower (wait for email), dependent on email provider

**vs. Social Login (Google, Facebook)**:

- Pros: We control the entire flow, no third-party dependencies, works for users without Google/Facebook
- Cons: Less convenient (must check email), no pre-filled profile data

**vs. Phone OTP**:

- Pros: Free, no SMS provider needed, accessible from any device
- Cons: Slower delivery than SMS, may go to spam, requires internet for email

---

## 9. Comparison Table

### Gmail OTP vs Phone OTP Summary

| Feature | Email (Gmail) OTP | Phone Number OTP |
|---------|-------------------|------------------|
| **Current Status** | ✅ Used in Bookora | ❌ Not Used (Educational Only) |
| **Cost** | Free | Paid (per SMS) |
| **Delivery Method** | SMTP / Email | SMS / Cellular Network |
| **Delivery Speed** | Seconds to minutes | Seconds (usually faster) |
| **Implementation** | Direct SMTP connection | Requires SMS provider (Twilio, Firebase) |
| **Dependencies** | Email account, SMTP server | SMS provider account, API keys |
| **User Requirement** | Email address | Mobile phone number |
| **Accessibility** | Any device with internet | Requires cellular coverage |
| **Security** | Email can be forwarded | Tied to physical SIM card |
| **Attack Vector** | Email compromise | SIM swapping |
| **Reliability** | May go to spam | Usually reliable |
| **Cost at Scale** | Free (unlimited) | Scales with usage (₹0.15-0.50/SMS in India) |
| **Development Setup** | Gmail account + app password | SMS provider signup, credit card |
| **Code Complexity** | Simple (Python SMTP library) | Moderate (Third-party SDK) |
| **Testing** | Unlimited free testing | Costs money per test |
| **User Experience** | Must check email inbox | Direct SMS notification |
| **Typical Use Case** | General web apps, learning projects | Banking, mobile-first apps |
| **Bookora Choice** | ✅ Primary method | Future enhancement |

---

## Summary

This chapter covered authentication in Bookora comprehensively:

1. **Authentication Basics**: What it is and why it's needed
2. **OTP Rationale**: Why OTP is better than passwords for ticket booking
3. **Merged Flow**: How Bookora combines login and signup seamlessly
4. **Email OTP (USED)**: Complete implementation with Gmail SMTP
   - Step-by-step user flow
   - Frontend components and JavaScript
   - Backend Flask routes and logic
   - Database schema and operations
   - OTP generation, storage, expiration, verification
   - Session management with localStorage
   - Security considerations
5. **Phone OTP (EDUCATIONAL)**: How phone authentication works
   - Conceptual flow
   - SMS providers (Twilio, Firebase)
   - Implementation approach
   - Cost and complexity
6. **Comparisons**: Key differences between email and phone OTP
7. **Diagrams**: Visual representation of complete flows
8. **Interview Prep**: How to articulate authentication architecture professionally

With this foundation, you can explain Bookora's authentication system confidently and understand how to extend it with phone OTP if needed.

Next chapter will cover the booking flow from seat selection to confirmation.
