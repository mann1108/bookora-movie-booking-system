# Bookora - Movie Ticket Booking System

Bookora is a full-stack Flask web application for browsing movies, selecting shows, choosing seats, and creating bookings. It combines a Python/Flask backend, MySQL database, and responsive HTML/CSS/JavaScript frontend.

## 1) Project Overview

Bookora provides a movie ticket booking experience with:
- Movie discovery and movie details
- Date-based show listings by theatre
- Interactive seat selection with live availability checks
- OTP-based authentication flow
- Booking management and cancellation
- Saved movies (watchlist-style) support

The app is built as a server-rendered Flask project with REST-style APIs consumed by frontend JavaScript.

## 2) Key Features

- Browse now-showing movies
- View movie details by slug
- View available shows by movie and date
- See available seats and occupancy by show
- Create bookings and cancel future bookings
- Save/unsave movies per user
- OTP-based login/signup flow (merged experience)
- Profile completion and profile update

## 3) Technologies Used

### Backend
- Python 3
- Flask
- Flask-CORS
- mysql-connector-python
- python-dotenv
- SMTP (Gmail-compatible) for email OTP

### Frontend
- HTML templates (Jinja rendering)
- Vanilla JavaScript (modular where needed)
- CSS
- Bootstrap 5 (CDN)
- Font Awesome (CDN)
- Google Fonts

### Database
- MySQL

### Optional/Integrated Libraries
- firebase-admin listed in requirements
- Firebase Web SDK modules used in frontend files for phone-auth related implementation

## 4) How the Application Works

High-level flow:
1. User opens the home page and browses movies.
2. User opens a movie page and navigates to show listings.
3. App requests shows by movie + date from backend.
4. User selects a show and opens seat selection.
5. App validates seat availability and show timing on backend.
6. Authenticated user completes booking.
7. User can view bookings, cancel eligible bookings, and manage saved movies.

## 5) Authentication and Authorization

Bookora uses OTP-based authentication with a merged login/signup approach:
- Existing user: OTP verification logs in directly.
- New user: OTP verification is followed by profile completion.

Implemented backend endpoints:
- POST /api/send-otp
- POST /api/verify-otp
- POST /api/complete-profile
- PUT /api/profile/update

Session behavior in frontend is handled using browser storage.

## 6) Movie Browsing and Search

- Movies are fetched from GET /api/movies.
- Individual movie details are fetched from GET /api/movies/slug/<slug>.
- Home UI includes movie discovery and navigation into details/show pages.

## 7) Theatre and Show Selection

- Shows are fetched from GET /api/shows with query params slug or movie_id plus date.
- Backend groups results by theatre and returns showtime entries with seat availability/occupancy.

## 8) Seat Selection and Booking Flow

- Seat map is loaded from GET /api/seats/<show_id>.
- Backend blocks booking for already-started shows.
- Booking creation uses POST /api/create-booking.
- Booking history uses GET /api/bookings?user_id=<id>.
- Cancellation uses POST /api/cancel-booking and releases seats.

## 9) OTP and Email Verification

Email OTP is implemented with SMTP:
- OTP is generated server-side.
- OTP is stored in otp_verification with expiry.
- OTP is sent by email and invalidated after successful verification.

## 10) Firebase Integration

Current state of Firebase-related code:
- Frontend Firebase modules/config exist in static/firebase-config.js and static/firebase-phone-auth.js.
- requirements.txt includes firebase-admin.
- A backend endpoint referenced in frontend (POST /api/auth/phone-login) is not currently implemented in app.py.

This means email OTP flow is the active end-to-end authentication path in the current backend.

## 11) Database Details

Main database: bookora

Core tables in database_schema.sql:
- movies
- theatres
- shows
- seats
- users
- otp_verification
- saved_movies
- bookings

Key relationships:
- movies -> shows
- theatres -> shows
- shows -> seats
- users -> bookings
- users <-> movies via saved_movies

## 12) Project Structure

```text
BOOKORA_FINAL/
  app.py
  database_schema.sql
  firebase-credentials.json
  movies-data.json
  requirements.txt
  seed_movies.py
  seed_shows.py
  docs/
    01_PROJECT_FOUNDATION.md
    02_AUTH_LOGIN_SIGNUP.md
    BOOKING_FLOW_EXPLAINED.md
    DATABASE_UNDERSTANDING.md
    FILESYSTEM_GRAPH.md
    gmail_otp_understanding.md
    otp_understanding.md
    SEED_SHOWS_MATH_EXPLANATION.md
    TECHNOLOGIES_USED.md
  static/
    ...CSS/JS/assets...
  templates/
    index.html
    movie-details.html
    shows.html
    seat-selection.html
    profile.html
    my-bookings.html
    saved-movies.html
    navbar.html
```

## 13) Installation and Setup Instructions

### Prerequisites
- Python 3.10+ (or compatible 3.x)
- MySQL Server
- pip

### Clone and Enter Project
```bash
git clone <your-repo-url>
cd BOOKORA_FINAL
```

### Create Virtual Environment

PowerShell:
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

## 14) Requirements and Dependencies

From requirements.txt:
- Flask==3.0.0
- flask-cors==4.0.0
- mysql-connector-python==8.2.0
- python-dotenv==1.0.0
- firebase-admin==6.3.0

## 15) Environment Variables

Create a .env file in project root and define placeholders:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=your_email@example.com
```

Notes:
- app.py loads .env via python-dotenv.
- Database connection values are currently hardcoded in get_db() (host/user/password/database).

## 16) Configure Firebase Credentials Safely

Important security guidance:
- Never commit private service-account credentials.
- Treat firebase-credentials.json as sensitive if it contains private key material.
- Keep secrets outside source control and load from secure environment in production.

For frontend Firebase config:
- Use your own Firebase project values in static/firebase-config.js.
- Do not copy production secrets into public repositories.

## 17) Database Setup

1. Create database/tables by running database_schema.sql in MySQL.
2. Seed movie records.
3. Seed shows and seats.

Example:
```sql
SOURCE database_schema.sql;
```

Then run seed scripts:
```bash
python seed_movies.py
python seed_shows.py
```

## 18) Run the Project Locally

```bash
python app.py
```

Default Flask app port in this project:
- http://127.0.0.1:5000

## 19) Example Commands

```bash
# install deps
pip install -r requirements.txt

# create schema (from MySQL client)
mysql -u root -p < database_schema.sql

# seed data
python seed_movies.py
python seed_shows.py

# run app
python app.py
```

## 20) Screenshots

Add screenshots here when available:

- Home page
  - ![Home Page](screenshots/home-page.png)
- Movie details page
  - ![Movie Details](screenshots/movie-details.png)
- Shows page
  - ![Shows](screenshots/shows.png)
- Seat selection page
  - ![Seat Selection](screenshots/seat-selection.png)
- Bookings page
  - ![My Bookings](screenshots/my-bookings.png)

## 21) Future Improvements

- Implement backend Firebase token verification endpoint for phone-auth flow.
- Move DB credentials from hardcoded values to environment variables.
- Add automated tests for API routes and booking edge cases.
- Add role-based admin tools for content/show management.
- Improve transaction handling for concurrent seat booking race conditions.

## 22) Author

- Name: Your Name
- Project: Bookora - Movie Ticket Booking System
- GitHub: https://github.com/your-username

---

If you fork this project, update environment values and Firebase setup before running in your own environment.
