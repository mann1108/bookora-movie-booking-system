# Technologies & Libraries Used in Bookora

## 🐍 Backend (Python/Flask)

### Core Framework
- **Flask 3.0.0** - Web framework for building RESTful APIs and serving templates
- **Flask-CORS 4.0.0** - Cross-Origin Resource Sharing support for API endpoints

### Database
- **MySQL Connector Python 8.2.0** - MySQL database driver for Python
- **MySQL Database** - Relational database for storing movies, shows, bookings, users, etc.

### Authentication & Security
- **Firebase Admin 6.3.0** - Server-side Firebase integration for authentication management
- **Python SMTP** - Email service for sending OTP verification emails via Gmail

### Configuration & Environment
- **Python-dotenv 1.0.0** - Environment variable management from .env files

---

## 🎨 Frontend (HTML/CSS/JavaScript)

### CSS Frameworks & Libraries
- **Bootstrap 5.3.0** - Responsive UI framework for layout and components
  - Used across all pages: homepage, movie details, shows, seat selection, profile, bookings, saved movies
- **Font Awesome 6.4.0** - Icon library for UI elements

### JavaScript Libraries
- **Vanilla JavaScript** - Core functionality and DOM manipulation
- **ES6 Modules** - Modern JavaScript module system

### Fonts
- **Google Fonts**
  - **Inter** (weights: 300, 400, 500, 600, 700) - Primary UI font
  - **Playfair Display** (weights: 400, 500, 600, 700) - Editorial/heading font
  - **DM Serif Display** - Decorative serif font

---

## 🔥 Firebase Services

### Authentication
- **Firebase Authentication 10.8.0** (Modular SDK)
  - Phone OTP Authentication
  - Google Sign-In (configured)
  - RecaptchaVerifier for bot prevention

### Firebase Modules Used
- `firebase-app` - Core Firebase initialization
- `firebase-auth` - Authentication services
  - `RecaptchaVerifier` - Captcha verification
  - `signInWithPhoneNumber` - Phone authentication
  - `GoogleAuthProvider` - Google OAuth
  - `signInWithPopup` - Popup-based sign-in

### Firebase Plan
- **Spark Plan** (Free tier) - Zero-cost implementation

---

## 📦 External CDN Services

### Styling
- Bootstrap CSS - `cdn.jsdelivr.net/npm/bootstrap@5.3.0`
- Font Awesome - `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0`
- Google Fonts - `fonts.googleapis.com`

### JavaScript
- Bootstrap Bundle JS - `cdn.jsdelivr.net/npm/bootstrap@5.3.0`
- Firebase SDK - `www.gstatic.com/firebasejs/10.8.0`

---

## 🗄️ Database Schema

### MySQL Database: `bookora`
- **Tables:**
  - `movies` - Movie information and metadata
  - `theaters` - Theater/cinema locations
  - `shows` - Show timings and schedules
  - `users` - User accounts and profiles
  - `bookings` - Booking records
  - `seats` - Seat management and availability
  - `saved_movies` - User's saved/watchlist movies
  - `otp_verifications` - OTP storage for email verification

---

## 🛠️ Development Tools & Environment

### Environment Configuration
- **.env file** - Environment variables for:
  - Email credentials (Gmail SMTP)
  - Firebase configuration
  - Database credentials

### File Structure
- **Templates** - Jinja2 HTML templates
- **Static** - CSS, JavaScript, images (banners, posters)
- **Data** - JSON data files for seeding

### Seeding Scripts
- `seed_movies.py` - Populate movies table
- `seed_shows.py` - Populate shows table

---

## 📧 Email Service

### SMTP Configuration
- **Provider:** Gmail SMTP
- **Host:** smtp.gmail.com
- **Port:** 587 (TLS)
- **Purpose:** OTP verification emails

---

## 🌐 Web Technologies

### Core Web Stack
- **HTML5** - Markup language
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Client-side logic

### Communication
- **AJAX/Fetch API** - Asynchronous HTTP requests
- **RESTful API** - Backend API architecture
- **JSON** - Data interchange format

---

## 📱 Features Implemented

### User Features
- ✅ Phone & Email OTP Authentication
- ✅ Google Sign-In (configured)
- ✅ Movie browsing and search
- ✅ Show timings selection
- ✅ Interactive seat selection
- ✅ Booking management
- ✅ Saved movies/watchlist
- ✅ User profile management

### Technical Features
- ✅ Responsive design (Bootstrap grid)
- ✅ Real-time seat availability
- ✅ Email notifications
- ✅ Session management
- ✅ Database-driven content
- ✅ RESTful API endpoints
- ✅ Cross-browser compatibility

---

## 📝 Summary

**Bookora** is a full-stack movie booking application built with:
- **Backend:** Python Flask + MySQL
- **Frontend:** Bootstrap 5 + Vanilla JavaScript
- **Authentication:** Firebase Phone Auth + Email OTP
- **Database:** MySQL
- **Hosting Ready:** Environment-based configuration

All libraries and frameworks are industry-standard, well-documented, and actively maintained.
