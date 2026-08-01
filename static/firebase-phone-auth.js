// ==========================================
// FIREBASE PHONE OTP AUTHENTICATION
// Modular SDK (v9+) Implementation
// ==========================================
// Zero-cost Phone Authentication using Firebase
// Integrates with Bookora backend after Firebase verification
// ==========================================

import { 
    auth, 
    RecaptchaVerifier, 
    signInWithPhoneNumber 
} from './firebase-config.js';

// ==========================================
// GLOBAL STATE
// ==========================================
let recaptchaVerifier = null;
let confirmationResult = null;

// ==========================================
// RECAPTCHA SETUP
// ==========================================

/**
 * Initialize invisible reCAPTCHA
 * @param {string} buttonId - ID of the button that triggers OTP sending
 * @returns {RecaptchaVerifier} Configured reCAPTCHA verifier
 */
export function initializeRecaptcha(buttonId) {
    // Clear any existing verifier
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
    }

    // Create invisible reCAPTCHA
    recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        'size': 'invisible',
        'callback': (response) => {
            // reCAPTCHA solved automatically
            console.log('✅ reCAPTCHA verified');
        },
        'expired-callback': () => {
            // reCAPTCHA expired - user needs to retry
            console.warn('⚠️ reCAPTCHA expired');
            throw new Error('reCAPTCHA expired. Please try again.');
        }
    });

    console.log('✅ reCAPTCHA initialized');
    return recaptchaVerifier;
}

/**
 * Render visible reCAPTCHA (for testing or explicit verification)
 * @param {string} containerId - ID of div to render reCAPTCHA
 */
export function initializeVisibleRecaptcha(containerId) {
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'normal',
        'callback': (response) => {
            console.log('✅ reCAPTCHA verified');
        }
    });

    recaptchaVerifier.render();
    return recaptchaVerifier;
}

// ==========================================
// SEND OTP
// ==========================================

/**
 * Send OTP to phone number via Firebase
 * @param {string} phoneNumber - Phone number in E.164 format (+91XXXXXXXXXX)
 * @param {string} buttonId - ID of button to attach invisible reCAPTCHA
 * @returns {Promise<object>} Success/error response
 */
export async function sendPhoneOTP(phoneNumber, buttonId) {
    try {
        // Validate phone number format
        if (!phoneNumber.startsWith('+')) {
            throw new Error('Phone number must be in E.164 format (e.g., +911234567890)');
        }

        // Initialize reCAPTCHA if not already done
        if (!recaptchaVerifier) {
            initializeRecaptcha(buttonId);
        }

        console.log('📱 Sending OTP to:', phoneNumber);

        // Send OTP via Firebase
        confirmationResult = await signInWithPhoneNumber(
            auth, 
            phoneNumber, 
            recaptchaVerifier
        );

        console.log('✅ OTP sent successfully');

        return {
            success: true,
            message: 'OTP sent successfully',
            verificationId: confirmationResult.verificationId
        };

    } catch (error) {
        console.error('❌ Error sending OTP:', error);
        
        // Clear reCAPTCHA on error
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
            recaptchaVerifier = null;
        }

        return {
            success: false,
            error: error.code || 'unknown-error',
            message: getErrorMessage(error)
        };
    }
}

// ==========================================
// VERIFY OTP
// ==========================================

/**
 * Verify OTP entered by user
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<object>} Firebase user credential or error
 */
export async function verifyPhoneOTP(otpCode) {
    try {
        if (!confirmationResult) {
            throw new Error('No OTP request found. Please request OTP first.');
        }

        console.log('🔐 Verifying OTP...');

        // Verify OTP with Firebase
        const userCredential = await confirmationResult.confirm(otpCode);
        const firebaseUser = userCredential.user;

        console.log('✅ OTP verified successfully');
        console.log('📱 Phone number:', firebaseUser.phoneNumber);

        // Get Firebase ID token for backend verification
        const idToken = await firebaseUser.getIdToken();

        return {
            success: true,
            firebaseUser: {
                uid: firebaseUser.uid,
                phoneNumber: firebaseUser.phoneNumber,
                idToken: idToken
            }
        };

    } catch (error) {
        console.error('❌ Error verifying OTP:', error);

        return {
            success: false,
            error: error.code || 'invalid-otp',
            message: getErrorMessage(error)
        };
    }
}

// ==========================================
// BACKEND INTEGRATION
// ==========================================

/**
 * Send Firebase token to backend for user creation/login
 * @param {string} idToken - Firebase ID token
 * @param {string} phoneNumber - User's phone number
 * @returns {Promise<object>} Backend response
 */
export async function loginWithBackend(idToken, phoneNumber) {
    try {
        const response = await fetch('/api/auth/phone-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firebase_token: idToken,
                phone: phoneNumber
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Backend authentication failed');
        }

        return {
            success: true,
            user: data.user,
            message: data.message
        };

    } catch (error) {
        console.error('❌ Backend login error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// ==========================================
// COMPLETE PHONE LOGIN FLOW
// ==========================================

/**
 * Complete phone login flow: Firebase OTP → Backend authentication
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} otpCode - 6-digit OTP
 * @param {string} buttonId - Button ID for reCAPTCHA
 * @returns {Promise<object>} Complete login result
 */
export async function completePhoneLogin(phoneNumber, otpCode, buttonId) {
    // Step 1: Send OTP (if not already sent)
    if (!confirmationResult) {
        const otpResult = await sendPhoneOTP(phoneNumber, buttonId);
        if (!otpResult.success) {
            return otpResult;
        }
    }

    // Step 2: Verify OTP with Firebase
    const verifyResult = await verifyPhoneOTP(otpCode);
    if (!verifyResult.success) {
        return verifyResult;
    }

    // Step 3: Authenticate with backend
    const backendResult = await loginWithBackend(
        verifyResult.firebaseUser.idToken,
        verifyResult.firebaseUser.phoneNumber
    );

    return backendResult;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Format phone number to E.164 format
 * @param {string} phone - Raw phone number (e.g., "9876543210")
 * @param {string} countryCode - Country code (default: "+91" for India)
 * @returns {string} E.164 formatted number
 */
export function formatPhoneNumber(phone, countryCode = '+91') {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (!phone.startsWith('+')) {
        return `${countryCode}${cleaned}`;
    }
    
    return `+${cleaned}`;
}

/**
 * Get user-friendly error messages
 * @param {Error} error - Firebase error object
 * @returns {string} User-friendly message
 */
function getErrorMessage(error) {
    const errorMessages = {
        'auth/invalid-phone-number': 'Invalid phone number format. Please use +91XXXXXXXXXX',
        'auth/missing-phone-number': 'Phone number is required',
        'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
        'auth/user-disabled': 'This account has been disabled',
        'auth/invalid-verification-code': 'Invalid OTP. Please check and try again.',
        'auth/code-expired': 'OTP has expired. Please request a new one.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please try again.'
    };

    return errorMessages[error.code] || error.message || 'An error occurred. Please try again.';
}

/**
 * Reset authentication state (for retry scenarios)
 */
export function resetPhoneAuth() {
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier = null;
    }
    confirmationResult = null;
    console.log('🔄 Phone authentication state reset');
}

// ==========================================
// TESTING HELPERS (Development Only)
// ==========================================

/**
 * Test reCAPTCHA setup
 * Useful for debugging reCAPTCHA issues
 */
export async function testRecaptcha(buttonId) {
    try {
        const verifier = initializeRecaptcha(buttonId);
        console.log('✅ reCAPTCHA test successful');
        return true;
    } catch (error) {
        console.error('❌ reCAPTCHA test failed:', error);
        return false;
    }
}

console.log('📱 Firebase Phone Auth module loaded');
