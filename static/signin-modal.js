// ==========================================
// SIGN-IN MODAL FUNCTIONALITY
// ==========================================

console.log('🔵 signin-modal.js loading...');

// ==========================================
// AUTH STATE MANAGEMENT
// ==========================================

// Check if user is logged in
function isUserLoggedIn() {
    return localStorage.getItem('bookoraUser') !== null;
}

// Get current user data
function getCurrentUser() {
    const userData = localStorage.getItem('bookoraUser');
    return userData ? JSON.parse(userData) : null;
}

// Save user data and mark as logged in
function loginUser(userData) {
    localStorage.setItem('bookoraUser', JSON.stringify(userData));
    updateAuthUI();
    
    // Check for pending booking (seats page)
    const pendingBooking = sessionStorage.getItem('bookora_pending_booking');
    if (pendingBooking) {
        // Clear the pending booking flag
        sessionStorage.removeItem('bookora_pending_booking');
        
        // Trigger proceed to payment automatically after modal closes
        // The seat-selection page will continue the flow
        setTimeout(() => {
            if (typeof proceedToPayment === 'function') {
                proceedToPayment();
            }
        }, 100);
    }
}

// Logout user
function logoutUser() {
    localStorage.removeItem('bookoraUser');
    updateAuthUI();
}

// Update UI based on auth state
function updateAuthUI() {
    const loggedOutState = document.getElementById('loggedOutState');
    const loggedInState = document.getElementById('loggedInState');
    const user = getCurrentUser();
    
    if (user) {
        // User is logged in - show profile avatar
        loggedOutState.style.display = 'none';
        loggedInState.style.display = 'flex';
        
        // Update profile info in dropdown
        document.getElementById('profileDisplayName').textContent = user.name || 'User';
        document.getElementById('profileDisplayContact').textContent = user.email || user.mobile || '';
    } else {
        // User is logged out - show login button
        loggedOutState.style.display = 'flex';
        loggedInState.style.display = 'none';
    }
}

// Toggle profile dropdown
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const profileContainer = document.querySelector('.profile-container');
    const dropdown = document.getElementById('profileDropdown');
    
    if (dropdown && profileContainer && !profileContainer.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// Navigate to profile page
function navigateToProfile(e) {
    e.preventDefault();
    window.location.href = '/profile';
}

// Navigate to bookings page
function navigateToBookings(e) {
    e.preventDefault();
    window.location.href = '/my-bookings';
}

// Navigate to saved movies page
function navigateToSavedMovies(e) {
    e.preventDefault();
    window.location.href = '/saved-movies';
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    // Get user name before clearing
    const user = getCurrentUser();
    const userName = user ? user.name : 'User';
    
    // Clear user data from localStorage
    logoutUser();
    
    // Clear any temporary session data
    sessionStorage.removeItem('tempMobile');
    sessionStorage.removeItem('tempEmail');
    
    // Clear OTP timer if running
    if (otpTimer) {
        clearInterval(otpTimer);
        otpTimer = null;
    }
    
    // Close dropdown
    toggleProfileDropdown();
    
    // Show logout confirmation toast
    showLogoutConfirmation(userName);
    
    console.log('User logged out successfully - all state cleared');
}

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', () => {
    // Update auth UI based on localStorage
    updateAuthUI();
    
    // Ensure modal is closed and reset on page load
    const modal = document.getElementById('signinModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
        
        // Clear any leftover temporary state
        sessionStorage.removeItem('tempMobile');
        sessionStorage.removeItem('tempEmail');
        
        // Reset modal to default state
        showAuthChoiceScreen();
        
        // Add click-outside prevention for profile completion
        modal.addEventListener('click', (e) => {
            // If clicking on the overlay itself (not the modal content)
            if (e.target === modal) {
                // Check if profile completion is active
                const profileCompletionForm = document.querySelector('.profile-completion-form');
                if (profileCompletionForm) {
                    // Profile completion is mandatory - prevent closing
                    showInlineError('Please enter your details to continue');
                    return;
                }
                // Otherwise, allow normal close behavior
                closeSignInModal();
            }
        });
        
        // Prevent ESC key from closing modal during profile completion
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const profileCompletionForm = document.querySelector('.profile-completion-form');
                if (profileCompletionForm) {
                    // Profile completion is mandatory - prevent closing
                    showInlineError('Please enter your details to continue');
                    e.preventDefault();
                    return;
                }
            }
        });
    }
    
    // Clear any leftover OTP timer
    if (otpTimer) {
        clearInterval(otpTimer);
        otpTimer = null;
    }
});

// ==========================================
// MODAL CONTROLS
// ==========================================

// Open modal
function openSignInModal(context = 'default') {
    console.log('🟢 openSignInModal() called with context:', context);
    
    // Clear any leftover state from previous sessions
    sessionStorage.removeItem('tempMobile');
    sessionStorage.removeItem('tempEmail');
    
    const modal = document.getElementById('signinModal');
    console.log('Modal element:', modal);
    
    if (!modal) {
        console.error('❌ Modal element #signinModal not found!');
        return;
    }
    
    // Update modal message based on context
    const titleElement = document.getElementById('signinModalTitle');
    const subtitleElement = document.getElementById('signinModalSubtitle');
    
    if (context === 'booking') {
        if (titleElement) titleElement.textContent = 'Login to Book Tickets';
        if (subtitleElement) subtitleElement.textContent = 'Please login or sign up to book tickets';
    } else if (context === 'save') {
        if (titleElement) titleElement.textContent = 'Save Movies for Later';
        if (subtitleElement) subtitleElement.textContent = 'Please sign in to save movies to your watchlist';
    } else {
        if (titleElement) titleElement.textContent = 'Welcome to Bookora';
        if (subtitleElement) subtitleElement.textContent = 'Choose your preferred sign-in method';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    
    console.log('✅ Modal should be visible now');
    
    // Always reset to auth choice screen on open
    showAuthChoiceScreen();
}

// Close modal
function closeSignInModal() {
    // Prevent closing if profile completion is in progress
    const profileCompletionForm = document.querySelector('.profile-completion-form');
    if (profileCompletionForm) {
        // Show inline validation message
        showInlineError('Please enter your details to continue');
        return; // Block modal close
    }
    
    const modal = document.getElementById('signinModal');
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
    
    // Clear timer if running
    if (otpTimer) {
        clearInterval(otpTimer);
        otpTimer = null;
    }
    
    // Clean up ALL session storage - critical for clean state
    sessionStorage.removeItem('tempMobile');
    sessionStorage.removeItem('tempEmail');
    
    // Reset modal to default auth choice screen for next open
    showAuthChoiceScreen();
}

// Handle authentication option selection
function selectAuthMethod(method) {
    console.log(`User selected: ${method}`);
    
    if (method === 'Mobile Number') {
        showMobileNumberScreen();
    } else if (method === 'Email') {
        showEmailScreen();
    }
}

// Show mobile number input screen (Firebase Phone OTP)
function showMobileNumberScreen() {
    const modal = document.querySelector('.signin-modal');
    modal.innerHTML = `
        <button class="modal-close" onclick="closeSignInModal()">
            <i class="fas fa-times"></i>
        </button>
        
        <button class="modal-back" onclick="showAuthChoiceScreen()">
            <i class="fas fa-arrow-left"></i>
        </button>
        
        <div class="modal-header">
            <h2>Enter Mobile Number</h2>
            <p>We'll send you an OTP to verify</p>
        </div>
        
        <div class="mobile-input-container">
            <div class="country-code-wrapper">
                <span class="country-code">+91</span>
                <input 
                    type="tel" 
                    id="mobileInput" 
                    class="mobile-input" 
                    placeholder="Enter 10-digit mobile number"
                    maxlength="10"
                    pattern="[0-9]{10}"
                >
            </div>
            <button class="btn-continue" id="send-otp-btn" onclick="sendPhoneOTP()">
                Send OTP
            </button>
            
            <!-- Invisible reCAPTCHA container -->
            <div id="recaptcha-container"></div>
        </div>
        
        <div class="modal-footer">
            By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </div>
    `;
    
    // Focus on input and add Enter key support
    setTimeout(() => {
        const mobileInput = document.getElementById('mobileInput');
        if (mobileInput) {
            mobileInput.focus();
            
            // Add Enter key support (same as email flow)
            mobileInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendPhoneOTP();
                }
            });
        }
        
        // Initialize invisible reCAPTCHA using Modular SDK
        // CRITICAL: RecaptchaVerifier(auth, containerIdOrElement, options)
        if (!window.recaptchaVerifier && window.PhoneAuth) {
            try {
                const { auth, RecaptchaVerifier } = window.PhoneAuth;
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': (response) => {
                        console.log('✓ reCAPTCHA verified automatically');
                    },
                    'expired-callback': () => {
                        console.warn('⚠️ reCAPTCHA expired, please try again');
                        window.recaptchaVerifier = null;
                    }
                });
                console.log('✓ RecaptchaVerifier initialized');
            } catch (error) {
                console.error('✗ RecaptchaVerifier initialization error:', error);
            }
        }
    }, 100);
}

// Show email input screen
function showEmailScreen() {
    const modal = document.querySelector('.signin-modal');
    modal.innerHTML = `
        <button class="modal-close" onclick="closeSignInModal()">
            <i class="fas fa-times"></i>
        </button>
        
        <button class="modal-back" onclick="showAuthChoiceScreen()">
            <i class="fas fa-arrow-left"></i>
        </button>
        
        <div class="modal-header">
            <h2>Enter Email Address</h2>
            <p>We'll send you an OTP to verify</p>
        </div>
        
        <div class="mobile-input-container">
            <div class="email-input-wrapper">
                <i class="fas fa-envelope email-icon"></i>
                <input 
                    type="email" 
                    id="emailInput" 
                    class="email-input" 
                    placeholder="Enter your email address"
                >
            </div>
            <button class="btn-continue" onclick="sendEmailOTP()">
                Send OTP
            </button>
        </div>
        
        <div class="modal-footer">
            By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </div>
    `;
    
    // Focus on input and add Enter key support
    setTimeout(() => {
        const emailInput = document.getElementById('emailInput');
        if (emailInput) {
            emailInput.focus();
            emailInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendEmailOTP();
                }
            });
        }
    }, 100);
}

// Show auth choice screen (back button)
function showAuthChoiceScreen() {
    const modal = document.querySelector('.signin-modal');
    modal.innerHTML = `
        <button class="modal-close" onclick="closeSignInModal()">
            <i class="fas fa-times"></i>
        </button>
        
        <div class="modal-header">
            <h2>Welcome to Bookora</h2>
            <p>Choose your preferred sign-in method</p>
        </div>
        
        <div class="auth-options">
            <button class="auth-option-btn" onclick="selectAuthMethod('Mobile Number')">
                <i class="fas fa-mobile-alt"></i>
                <span>Continue with Mobile Number</span>
            </button>
            
            <button class="auth-option-btn" onclick="selectAuthMethod('Email')">
                <i class="fas fa-envelope"></i>
                <span>Continue with Email</span>
            </button>
        </div>
        
        <div class="modal-footer">
            By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </div>
    `;
}

// OTP Timer variables
let otpTimer = null;
let otpSeconds = 30;

// Send OTP (UI only)
function sendOTP() {
    const mobileInput = document.getElementById('mobileInput');
    const mobileNumber = mobileInput.value;
    
    // Simple validation
    if (mobileNumber.length !== 10 || !/^\d{10}$/.test(mobileNumber)) {
        showInlineError('Please enter a valid 10-digit mobile number');
        mobileInput.focus();
        return;
    }
    
    // Store mobile number for display
    sessionStorage.setItem('tempMobile', mobileNumber);
    
    // Show OTP screen
    showOTPScreen(mobileNumber);
}

// Send Email OTP via backend API
async function sendEmailOTP() {
    const emailInput = document.getElementById('emailInput');
    const email = emailInput.value.trim();
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showInlineError('Please enter a valid email address');
        emailInput.focus();
        return;
    }
    
    // Store email temporarily
    sessionStorage.setItem('tempEmail', email);
    sessionStorage.setItem('authType', 'email');
    
    // INSTANT loading state - don't wait for fetch
    const sendBtn = document.querySelector('.btn-continue');
    const originalText = sendBtn.textContent;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    sendBtn.style.opacity = '0.6';
    
    // Start timer to show OTP screen after 2 seconds max
    const quickTransitionTimer = setTimeout(() => {
        showEmailOTPScreen(email);
    }, 2000);
    
    try {
        // Call backend API
        const response = await fetch('http://localhost:5000/api/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();
        
        // Clear the timer since we got response
        clearTimeout(quickTransitionTimer);
        
        if (data.success) {
            // Show OTP screen immediately
            showEmailOTPScreen(email);
        } else {
            showInlineError(data.message || 'Failed to send OTP');
            sendBtn.disabled = false;
            sendBtn.textContent = originalText;
            sendBtn.style.opacity = '1';
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        // Clear timer on error
        clearTimeout(quickTransitionTimer);
        showInlineError('Network error. Please check if backend is running.');
        sendBtn.disabled = false;
        sendBtn.textContent = originalText;
        sendBtn.style.opacity = '1';
    }
}

// Show OTP verification screen (Mobile)
function showOTPScreen(mobileNumber) {
    const modal = document.querySelector('.signin-modal');
    modal.innerHTML = `
        <button class="modal-close" onclick="closeSignInModal()">
            <i class="fas fa-times"></i>
        </button>
        
        <button class="modal-back" onclick="showMobileNumberScreen()">
            <i class="fas fa-arrow-left"></i>
        </button>
        
        <div class="modal-header">
            <h2>Verify OTP</h2>
            <p>Enter the 6-digit code sent to<br><strong>+91 ${mobileNumber}</strong></p>
        </div>
        
        <div class="otp-input-container">
            <div class="otp-boxes">
                <input type="text" maxlength="1" class="otp-box" data-index="0">
                <input type="text" maxlength="1" class="otp-box" data-index="1">
                <input type="text" maxlength="1" class="otp-box" data-index="2">
                <input type="text" maxlength="1" class="otp-box" data-index="3">
                <input type="text" maxlength="1" class="otp-box" data-index="4">
                <input type="text" maxlength="1" class="otp-box" data-index="5">
            </div>
            
            <div class="otp-timer">
                <span id="timerText">Resend OTP in <strong id="timerCount">30</strong>s</span>
                <button class="btn-resend" id="resendBtn" onclick="resendOTP()" disabled>
                    Resend OTP
                </button>
            </div>
            
            <button class="btn-continue" onclick="verifyOTP()">
                Verify & Continue
            </button>
        </div>
        
        <div class="modal-footer">
            Didn't receive the code? Check your SMS or try <a href="#" onclick="showMobileNumberScreen()">different number</a>
        </div>
    `;
    
    // Initialize OTP input behavior
    initializeOTPInputs();
    
    // Start timer
    startOTPTimer();
}

// Show Email OTP verification screen
function showEmailOTPScreen(email) {
    const modal = document.querySelector('.signin-modal');
    const maskedEmail = maskEmail(email);
    
    modal.innerHTML = `
        <button class="modal-close" onclick="closeSignInModal()">
            <i class="fas fa-times"></i>
        </button>
        
        <button class="modal-back" onclick="showEmailScreen()">
            <i class="fas fa-arrow-left"></i>
        </button>
        
        <div class="modal-header">
            <h2>Verify OTP</h2>
            <p>Enter the 6-digit code sent to <strong>${maskedEmail}</strong></p>
        </div>
        
        <div class="otp-input-container">
            <div class="otp-boxes">
                <input type="text" maxlength="1" class="otp-box" data-index="0">
                <input type="text" maxlength="1" class="otp-box" data-index="1">
                <input type="text" maxlength="1" class="otp-box" data-index="2">
                <input type="text" maxlength="1" class="otp-box" data-index="3">
                <input type="text" maxlength="1" class="otp-box" data-index="4">
                <input type="text" maxlength="1" class="otp-box" data-index="5">
            </div>
            
            <div class="otp-timer">
                <span id="timerText">Resend OTP in <strong id="timerCount">30</strong>s</span>
                <button class="btn-resend" id="resendBtn" onclick="resendEmailOTP()" disabled>
                    Resend OTP
                </button>
            </div>
            
            <button class="btn-continue" onclick="verifyEmailOTP()">
                Verify & Continue
            </button>
        </div>
        
        <div class="modal-footer">
            Didn't receive the code? Check your inbox/spam folder or try a <a href="#" onclick="showEmailScreen()">different email</a>
        </div>
    `;
    
    // Initialize OTP input behavior
    initializeOTPInputs();
    
    // Start timer
    startOTPTimer();
}

// Mask email for privacy
function maskEmail(email) {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) {
        return `${localPart[0]}***@${domain}`;
    }
    const visibleStart = localPart.substring(0, 2);
    const visibleEnd = localPart.substring(localPart.length - 1);
    return `${visibleStart}***${visibleEnd}@${domain}`;
}

// Initialize OTP input boxes behavior
function initializeOTPInputs() {
    const otpBoxes = document.querySelectorAll('.otp-box');
    
    otpBoxes.forEach((box, index) => {
        // Auto-focus next box on input
        box.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Only allow digits
            if (!/^\d$/.test(value) && value !== '') {
                e.target.value = '';
                return;
            }
            
            // Move to next box
            if (value && index < otpBoxes.length - 1) {
                otpBoxes[index + 1].focus();
            }
            
            // Auto-submit when all 6 digits are entered
            if (index === otpBoxes.length - 1 && value) {
                const otp = Array.from(otpBoxes).map(b => b.value).join('');
                if (otp.length === 6) {
                    // Small delay for better UX
                    setTimeout(() => {
                        const verifyBtn = document.querySelector('.btn-continue');
                        if (verifyBtn) verifyBtn.click();
                    }, 200);
                }
            }
        });
        
        // Handle backspace
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpBoxes[index - 1].focus();
            }
            
            // Handle Enter key - submit OTP
            if (e.key === 'Enter') {
                e.preventDefault();
                const verifyBtn = document.querySelector('.btn-continue');
                if (verifyBtn) verifyBtn.click();
            }
        });
        
        // Prevent non-numeric input
        box.addEventListener('keypress', (e) => {
            if (!/^\d$/.test(e.key) && e.key !== 'Enter') {
                e.preventDefault();
            }
        });
        
        // Handle paste
        box.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
            
            if (pastedData.length === 6) {
                otpBoxes.forEach((b, i) => {
                    b.value = pastedData[i] || '';
                });
                otpBoxes[5].focus();
                // Auto-submit after paste
                setTimeout(() => {
                    const verifyBtn = document.querySelector('.btn-continue');
                    if (verifyBtn) verifyBtn.click();
                }, 200);
            }
        });
    });
    
    // Focus first box
    otpBoxes[0].focus();
}

// Start OTP timer
function startOTPTimer() {
    otpSeconds = 30;
    const timerCount = document.getElementById('timerCount');
    const timerText = document.getElementById('timerText');
    const resendBtn = document.getElementById('resendBtn');
    
    resendBtn.disabled = true;
    timerText.style.display = 'block';
    
    otpTimer = setInterval(() => {
        otpSeconds--;
        timerCount.textContent = otpSeconds;
        
        if (otpSeconds <= 0) {
            clearInterval(otpTimer);
            timerText.style.display = 'none';
            resendBtn.disabled = false;
        }
    }, 1000);
}

// Resend OTP (Mobile)
function resendOTP() {
    const mobileNumber = sessionStorage.getItem('tempMobile');
    console.log('Resending OTP to:', mobileNumber);
    
    // Clear all OTP boxes
    document.querySelectorAll('.otp-box').forEach(box => box.value = '');
    document.querySelectorAll('.otp-box')[0].focus();
    
    // Restart timer
    startOTPTimer();
    
    // UI feedback
    const resendBtn = document.getElementById('resendBtn');
    resendBtn.textContent = 'OTP Sent!';
    setTimeout(() => {
        resendBtn.textContent = 'Resend OTP';
    }, 2000);
}

// Resend Email OTP via backend API
async function resendEmailOTP() {
    const email = sessionStorage.getItem('tempEmail');
    
    const resendBtn = document.getElementById('resendBtn');
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch('http://localhost:5000/api/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear all OTP boxes
            document.querySelectorAll('.otp-box').forEach(box => box.value = '');
            document.querySelectorAll('.otp-box')[0].focus();
            
            // Restart timer
            startOTPTimer();
            
            resendBtn.textContent = 'OTP Sent!';
            setTimeout(() => {
                resendBtn.textContent = 'Resend OTP';
            }, 2000);
        } else {
            showInlineError(data.message || 'Failed to resend OTP');
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
        }
    } catch (error) {
        console.error('Error resending OTP:', error);
        showInlineError('Network error. Please try again.');
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend OTP';
    }
}

// Simulate existing user check (for UI demo purposes)
// Returns true if user is "existing" - uses last digit of mobile/email to simulate
function isExistingUser(identifier) {
    // For demo: if mobile ends with even number OR email contains 'test', treat as existing user
    if (/[02468]$/.test(identifier) || identifier.includes('test')) {
        return true;
    }
    return false;
}

// Verify OTP (Mobile)
function verifyOTP() {
    const otpBoxes = document.querySelectorAll('.otp-box');
    const otp = Array.from(otpBoxes).map(box => box.value).join('');
    
    if (otp.length !== 6) {
        showInlineError('Please enter complete 6-digit OTP');
        return;
    }
    
    // UI-only verification (any 6-digit code is accepted)
    console.log('OTP entered:', otp);
    
    // Clear timer
    if (otpTimer) {
        clearInterval(otpTimer);
    }
    
    const mobileNumber = sessionStorage.getItem('tempMobile');
    console.log('OTP Verified for mobile:', mobileNumber);
    
    // Show verifying animation
    showVerifyingState();
    
    // Simulate backend verification delay
    setTimeout(() => {
        // Check if user exists (for UI demo)
        if (isExistingUser(mobileNumber)) {
            // Existing user - show personalized welcome
            const userData = {
                name: 'Ravish', // Demo name
                mobile: mobileNumber,
                loginMethod: 'mobile'
            };
            
            showSuccessState(
                `Welcome back, ${userData.name}!`,
                'Great to see you again. Loading your experience...'
            );
            
            setTimeout(() => {
                loginUser(userData);
                sessionStorage.removeItem('tempMobile');
                closeSignInModal();
                console.log('Existing user logged in:', userData);
            }, 2500);
        } else {
            // New user - show profile completion screen
            showSuccessState('OTP Verified!', 'Setting up your profile...');
            setTimeout(() => {
                showProfileCompletionScreen('mobile');
            }, 2500);
        }
    }, 1500);
}

// ==========================================
// FIREBASE PHONE OTP FUNCTIONS
// ==========================================

// Send Phone OTP via Firebase
async function sendPhoneOTP() {
    const mobileInput = document.getElementById('mobileInput');
    const mobileNumber = mobileInput.value;
    
    // Validation
    if (mobileNumber.length !== 10 || !/^\d{10}$/.test(mobileNumber)) {
        showInlineError('Please enter a valid 10-digit mobile number');
        mobileInput.focus();
        return;
    }
    
    // Format with country code
    const phoneNumber = `+91${mobileNumber}`;
    
    // Show loading state
    const sendBtn = document.getElementById('send-otp-btn');
    const originalText = sendBtn.textContent;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    
    try {
        // Verify PhoneAuth is loaded
        if (!window.PhoneAuth) {
            throw new Error('Firebase Phone Auth not loaded. Check firebase-config.js');
        }
        
        // Verify reCAPTCHA is initialized
        if (!window.recaptchaVerifier) {
            throw new Error('reCAPTCHA not initialized. Please refresh and try again.');
        }
        
        console.log('📞 Sending OTP to:', phoneNumber);
        
        // Send OTP via Firebase (Modular SDK)
        const { auth, signInWithPhoneNumber } = window.PhoneAuth;
        const appVerifier = window.recaptchaVerifier;
        window.confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        
        console.log('✓ Firebase OTP sent successfully to', phoneNumber);
        
        // Store phone for later use
        sessionStorage.setItem('tempPhone', phoneNumber);
        sessionStorage.setItem('tempMobile', mobileNumber);
        sessionStorage.setItem('authType', 'phone');
        
        // Show OTP verification screen
        showPhoneOTPScreen(mobileNumber);
        
    } catch (error) {
        // ENHANCED ERROR LOGGING
        console.error('✗ Firebase OTP Error Details:');
        console.error('  Code:', error.code);
        console.error('  Message:', error.message);
        console.error('  Full Error:', error);
        
        // User-friendly error messages
        let errorMessage = 'Failed to send OTP. Please try again.';
        
        if (error.code === 'auth/invalid-phone-number') {
            errorMessage = 'Invalid phone number format';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many attempts. Please try again later.';
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = 'Domain not authorized. Please contact support.';
            console.error('⚠️ FIREBASE CONFIG ERROR: Add localhost and 127.0.0.1 to authorized domains in Firebase Console → Authentication → Settings');
        } else if (error.code === 'auth/invalid-app-credential') {
            errorMessage = 'Firebase configuration error. Please contact support.';
            console.error('⚠️ FIREBASE CONFIG ERROR: Check firebase-config.js credentials');
        } else if (error.message && error.message.includes('reCAPTCHA')) {
            errorMessage = 'reCAPTCHA error. Please refresh the page.';
        }
        
        showInlineError(errorMessage);
        sendBtn.disabled = false;
        sendBtn.textContent = originalText;
        
        // Reset reCAPTCHA for retry
        window.recaptchaVerifier = null;
    }
}

// Show Phone OTP verification screen
function showPhoneOTPScreen(mobileNumber) {
    const modal = document.querySelector('.signin-modal');
    
    modal.innerHTML = `
        <button class="modal-close" onclick="closeSignInModal()">
            <i class="fas fa-times"></i>
        </button>
        
        <button class="modal-back" onclick="showMobileNumberScreen()">
            <i class="fas fa-arrow-left"></i>
        </button>
        
        <div class="modal-header">
            <h2>Verify OTP</h2>
            <p>Enter the 6-digit code sent to <strong>+91 ${mobileNumber}</strong></p>
        </div>
        
        <div class="otp-input-container">
            <div class="otp-boxes">
                <input type="text" maxlength="1" class="otp-box" data-index="0">
                <input type="text" maxlength="1" class="otp-box" data-index="1">
                <input type="text" maxlength="1" class="otp-box" data-index="2">
                <input type="text" maxlength="1" class="otp-box" data-index="3">
                <input type="text" maxlength="1" class="otp-box" data-index="4">
                <input type="text" maxlength="1" class="otp-box" data-index="5">
            </div>
            
            <div class="otp-timer">
                <span id="timerText">Resend OTP in <strong id="timerCount">30</strong>s</span>
                <button class="btn-resend" id="resendBtn" onclick="resendPhoneOTP()" disabled>
                    Resend OTP
                </button>
            </div>
            
            <button class="btn-continue" onclick="verifyPhoneOTP()">
                Verify & Continue
            </button>
        </div>
        
        <div class="modal-footer">
            Didn't receive the code? Check your messages or try a <a href="#" onclick="showMobileNumberScreen()">different number</a>
        </div>
    `;
    
    // Initialize OTP inputs
    initializeOTPInputs();
    
    // Start timer
    startOTPTimer();
}

// Verify Phone OTP with Firebase
async function verifyPhoneOTP() {
    const otpBoxes = document.querySelectorAll('.otp-box');
    const otp = Array.from(otpBoxes).map(box => box.value).join('');
    
    if (otp.length !== 6) {
        showInlineError('Please enter complete 6-digit OTP');
        return;
    }
    
    // Clear timer
    if (otpTimer) {
        clearInterval(otpTimer);
    }
    
    // Show verifying animation
    showVerifyingState();
    
    try {
        // Verify OTP with Firebase
        const result = await window.confirmationResult.confirm(otp);
        
        console.log('✓ Firebase OTP verified');
        
        // Get Firebase ID token
        const idToken = await result.user.getIdToken();
        
        // Send token to backend for user creation/login
        const response = await fetch('http://localhost:5000/api/verify-firebase-phone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idToken: idToken })
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (data.isNewUser) {
                // New user - show profile completion
                showSuccessState('Phone Verified!', 'Setting up your profile...');
                setTimeout(() => {
                    showProfileCompletionScreen('phone');
                }, 2500);
            } else {
                // Existing user - login
                const userData = {
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone,
                    primary_contact_type: data.user.primary_contact_type,
                    role: data.user.role,
                    loginMethod: 'phone'
                };
                
                showSuccessState(
                    `Welcome back, ${userData.name}!`,
                    'Great to see you again. Loading your experience...'
                );
                
                setTimeout(() => {
                    loginUser(userData);
                    sessionStorage.removeItem('tempPhone');
                    sessionStorage.removeItem('tempMobile');
                    sessionStorage.removeItem('authType');
                    closeSignInModal();
                    console.log('✓ Existing user logged in via phone:', userData);
                }, 2500);
            }
        } else {
            showPhoneOTPScreen(sessionStorage.getItem('tempMobile'));
            setTimeout(() => {
                showInlineError(data.message || 'Verification failed');
            }, 100);
        }
        
    } catch (error) {
        console.error('✗ Firebase OTP verification error:', error);
        
        let errorMessage = 'Invalid OTP. Please try again.';
        
        if (error.code === 'auth/invalid-verification-code') {
            errorMessage = 'Invalid OTP. Please check and try again.';
        } else if (error.code === 'auth/code-expired') {
            errorMessage = 'OTP expired. Please request a new one.';
        }
        
        showPhoneOTPScreen(sessionStorage.getItem('tempMobile'));
        setTimeout(() => {
            showInlineError(errorMessage);
        }, 100);
    }
}

// Resend Phone OTP
async function resendPhoneOTP() {
    const resendBtn = document.getElementById('resendBtn');
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    
    const phoneNumber = sessionStorage.getItem('tempPhone');
    
    try {
        // Reinitialize reCAPTCHA (Modular SDK)
        const { auth, RecaptchaVerifier, signInWithPhoneNumber } = window.PhoneAuth;
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible'
        });
        console.log('✓ RecaptchaVerifier reinitialized for resend');
        
        const appVerifier = window.recaptchaVerifier;
        
        // Resend OTP
        window.confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        console.log('✓ OTP resent successfully');
        
        // Clear OTP boxes and restart timer
        document.querySelectorAll('.otp-box').forEach(box => box.value = '');
        document.querySelectorAll('.otp-box')[0].focus();
        startOTPTimer();
        
        resendBtn.textContent = 'OTP Sent!';
        setTimeout(() => {
            resendBtn.textContent = 'Resend OTP';
        }, 2000);
        
    } catch (error) {
        console.error('✗ Resend OTP error:', error);
        showInlineError('Failed to resend OTP. Please try again.');
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend OTP';
    }
}

// ==========================================
// EMAIL OTP FUNCTIONS
// ==========================================

// Verify Email OTP via backend API
async function verifyEmailOTP() {
    const otpBoxes = document.querySelectorAll('.otp-box');
    const otp = Array.from(otpBoxes).map(box => box.value).join('');
    
    if (otp.length !== 6) {
        showInlineError('Please enter complete 6-digit OTP');
        return;
    }
    
    // Clear timer
    if (otpTimer) {
        clearInterval(otpTimer);
    }
    
    const email = sessionStorage.getItem('tempEmail');
    
    // Show verifying animation
    showVerifyingState();
    
    try {
        const response = await fetch('http://localhost:5000/api/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, otp: otp, type: 'email' })
        });
        
        const data = await response.json();
        
        console.log('OTP Verification Response:', data);
        
        if (data.success) {
            if (!data.userExists) {
                // New user - show success animation first, then profile completion
                showSuccessState('OTP Verified!', 'Setting up your profile...');
                setTimeout(() => {
                    showProfileCompletionScreen('email');
                }, 2500);
            } else {
                // Existing user - show personalized welcome message
                const userData = {
                    id: data.user.id,
                    name: data.user.name || 'User',
                    email: data.user.email,
                    phone: data.user.phone,
                    role: data.user.role || 'user',
                    loginMethod: 'email'
                };
                
                // Show personalized welcome with 2.5 second success state
                showSuccessState(
                    `Welcome back, ${userData.name}!`,
                    'Great to see you again. Loading your experience...'
                );
                
                setTimeout(() => {
                    loginUser(userData);
                    sessionStorage.removeItem('tempEmail');
                    closeSignInModal();
                    console.log('Existing user logged in:', userData);
                }, 2500); // 2.5 second personalized welcome
            }
        } else {
            // Show error and go back to OTP screen
            showEmailOTPScreen(email);
            setTimeout(() => {
                showInlineError(data.message || 'Invalid or expired OTP');
            }, 100);
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        showEmailOTPScreen(email);
        setTimeout(() => {
            showInlineError('Network error. Please try again.');
        }, 100);
    }
}

// Show profile completion screen
function showProfileCompletionScreen(loginMethod) {
    const modal = document.querySelector('.signin-modal');
    const verifiedContact = sessionStorage.getItem('tempEmail') || sessionStorage.getItem('tempMobile');
    
    modal.innerHTML = `
        <div class="modal-header">
            <h2>Welcome to BOOKORA!</h2>
            <p>Just one more step to get started</p>
        </div>
        
        <form class="profile-completion-form" onsubmit="event.preventDefault(); submitProfileCompletion('${loginMethod}');">
            <div class="form-group">
                <label class="form-label">Full Name <span class="required">*</span></label>
                <input 
                    type="text" 
                    id="profileName" 
                    class="form-input" 
                    placeholder="Enter your full name"
                    required
                    autocomplete="name"
                >
            </div>
            
            ${loginMethod === 'email' ? `
            <div class="form-group">
                <label class="form-label">Mobile Number <span class="optional">(Optional)</span></label>
                <div class="phone-input-wrapper">
                    <span class="country-prefix">+91</span>
                    <input 
                        type="tel" 
                        id="profileMobile" 
                        class="form-input" 
                        placeholder="Enter 10-digit mobile number"
                        maxlength="10"
                        autocomplete="tel"
                    >
                </div>
            </div>
            ` : ''}
            
            ${loginMethod === 'phone' ? `
            <div class="form-group">
                <label class="form-label">Email Address <span class="optional">(Optional)</span></label>
                <input 
                    type="email" 
                    id="profileEmail" 
                    class="form-input" 
                    placeholder="Enter your email address"
                    autocomplete="email"
                >
            </div>
            ` : ''}
            
            <button type="submit" class="btn-primary-bookora">
                Complete Profile
            </button>
        </form>
        
        <div class="modal-footer">
            We'll use these details for booking confirmations
        </div>
    `;
    
    setTimeout(() => {
        const nameInput = document.getElementById('profileName');
        if (nameInput) nameInput.focus();
    }, 100);
}

// Submit profile completion via backend API
async function submitProfileCompletion(loginMethod) {
    const name = document.getElementById('profileName').value.trim();
    
    if (!name) {
        showInlineError('Please enter your full name');
        document.getElementById('profileName').focus();
        return;
    }
    
    // Validate name format (letters and spaces only, 2-50 characters)
    const nameRegex = /^[A-Za-z][A-Za-z ]{1,49}$/;
    if (!nameRegex.test(name)) {
        showInlineError('Please enter a valid full name (letters only)');
        document.getElementById('profileName').focus();
        return;
    }
    
    const authType = sessionStorage.getItem('authType');
    let email = null;
    let phone = null;
    let primary_contact_type = authType; // 'email' or 'phone'
    
    // Get primary contact based on auth type
    if (authType === 'email') {
        email = sessionStorage.getItem('tempEmail');
    } else if (authType === 'phone') {
        phone = sessionStorage.getItem('tempPhone');
    }
    
    // Optionally collect secondary contact
    if (authType === 'email') {
        // User logged in via email, optionally add phone
        const mobileInput = document.getElementById('profileMobile');
        if (mobileInput && mobileInput.value) {
            const mobile = mobileInput.value.trim();
            // Only validate if user entered something
            if (mobile.length > 0) {
                if (mobile.length === 10 && /^\d{10}$/.test(mobile)) {
                    phone = `+91${mobile}`;
                } else {
                    // Invalid mobile format - show error
                    showInlineError('Mobile number must be exactly 10 digits');
                    mobileInput.focus();
                    return;
                }
            }
        }
    } else if (authType === 'phone') {
        // User logged in via phone, optionally add email
        const emailInput = document.getElementById('profileEmail');
        if (emailInput && emailInput.value) {
            email = emailInput.value.trim();
        }
    }
    
    // Save to backend
    saveUserProfile(name, email, phone, primary_contact_type);
}

async function saveUserProfile(name, email, phone, primary_contact_type) {
    const submitBtn = document.querySelector('.btn-primary-bookora');
    if (!submitBtn) {
        console.error('Submit button not found');
        return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        const response = await fetch('http://localhost:5000/api/complete-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                primaryContact: primary_contact_type
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✓ Profile saved successfully');
            
            showSuccessState('Welcome to BOOKORA!', `Hi ${name}! Let's find you a movie...`);
            
            setTimeout(() => {
                loginUser(data.user);
                sessionStorage.clear(); // Clear all temp data
                closeSignInModal();
            }, 2500);
        } else {
            showInlineError(data.message || 'Failed to save profile');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Complete Profile';
        }
    } catch (error) {
        console.error('✗ Profile save error:', error);
        showInlineError('Cannot connect to server');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Profile';
    }
}

// Show inline error message (replaces alert for better UX)
function showInlineError(message) {
    // Remove existing error if any
    const existingError = document.querySelector('.inline-error');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'inline-error';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    const modalHeader = document.querySelector('.modal-header');
    if (modalHeader) {
        modalHeader.insertAdjacentElement('afterend', errorDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            errorDiv.classList.add('fade-out');
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }
}

// Show verifying state with animation
function showVerifyingState() {
    const modal = document.querySelector('.signin-modal');
    modal.classList.add('screen-transition');
    
    modal.innerHTML = `
        <div class="verifying-container">
            <div class="verifying-spinner">
                <div class="spinner-ring"></div>
                <i class="fas fa-shield-alt spinner-icon"></i>
            </div>
            <h3>Verifying...</h3>
            <p>Please wait a moment</p>
        </div>
    `;
    
    setTimeout(() => modal.classList.remove('screen-transition'), 50);
}

// Show success state with custom message (smooth transition)
function showSuccessState(title, subtitle) {
    const modal = document.querySelector('.signin-modal');
    modal.classList.add('screen-transition');
    
    modal.innerHTML = `
        <div class="success-container">
            <div class="success-icon-wrapper">
                <div class="success-circle">
                    <i class="fas fa-check success-checkmark"></i>
                </div>
                <div class="success-ripple"></div>
                <div class="success-ripple delay-1"></div>
                <div class="success-ripple delay-2"></div>
            </div>
            <h2>${title}</h2>
            <p class="success-subtitle">${subtitle}</p>
        </div>
    `;
    
    setTimeout(() => modal.classList.remove('screen-transition'), 50);
}

// Show logout confirmation toast (non-blocking feedback)
function showLogoutConfirmation(userName) {
    // Remove any existing toast
    const existingToast = document.querySelector('.logout-toast');
    if (existingToast) existingToast.remove();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'logout-toast';
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">You've been logged out</div>
            <div class="toast-message">See you soon, ${userName}!</div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Trigger animation after DOM insertion
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after 3.5 seconds (visible for 3 seconds)
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500); // Wait for fade-out animation
    }, 3500);
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('signinModal');
    if (modal && e.target === modal) {
        closeSignInModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSignInModal();
    }
});

console.log('✅ signin-modal.js loaded completely');
console.log('✅ openSignInModal is:', typeof openSignInModal);
