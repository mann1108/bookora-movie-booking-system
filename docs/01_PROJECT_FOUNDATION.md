# 01 - PROJECT FOUNDATION: Understanding Bookora from Zero to Hero

## Table of Contents

1. [What is Bookora?](#1-what-is-bookora)
2. [Why a Web Application?](#2-why-a-web-application)
3. [Technologies Used and Why](#3-technologies-used-and-why)
4. [Project Structure Explained](#4-project-structure-explained)
5. [How Flask Works Internally](#5-how-flask-works-internally)
6. [Request-Response Flow](#6-request-response-flow)
7. [JSON Seeding and Data Flow](#7-json-seeding-and-data-flow)
8. [Configuration Files](#8-configuration-files)
9. [System Architecture](#9-system-architecture)
10. [Interview Preparation](#10-interview-preparation)

---

## 1. What is Bookora?

### High-Level Overview

Bookora is a movie ticket booking web application that allows users to:

- Browse movies currently showing in theaters
- View detailed information about each movie
- Select show times at different theaters
- Choose seats visually on an interactive seat map
- Book tickets and receive confirmation
- Manage their bookings and profile

### Core Functionality

Think of Bookora as a simplified version of BookMyShow or Fandango. It handles the complete booking workflow:

```
User Journey:
Browse Movies → Select Movie → Choose Show → Pick Seats → Confirm Booking
```

### Key Components

1. **User Interface**: What users see and interact with (HTML pages)
2. **Backend Server**: Handles business logic and database operations (Flask)
3. **Database**: Stores all data (movies, shows, bookings, users)
4. **Authentication**: Verifies user identity using email/phone OTP

---

## 2. Why a Web Application?

### What is a Static Website?

A static website is a collection of fixed HTML files:

- Content never changes without manually editing files
- Same content shown to all users
- No user interaction or personalization
- Example: A simple portfolio website

### What is a Web Application?

A web application is dynamic and interactive:

- Content changes based on user actions and database
- Different users see different content (their bookings, saved movies)
- Handles complex logic (checking seat availability, processing payments)
- Responds to user input in real-time

### Why Bookora Must Be a Web Application

Bookora requires dynamic features that static websites cannot provide:

1. **Real-time seat availability**: When one user books a seat, others cannot book it
2. **User authentication**: Different users have different accounts and bookings
3. **Database operations**: Store and retrieve movies, shows, bookings, users
4. **Form processing**: Handle booking requests, profile updates
5. **Business logic**: Calculate prices, validate inputs, send confirmations

Example scenario demonstrating the need for dynamic behavior:

```
User A books seats A1, A2 at 2:00 PM
  → Database updates: seats A1, A2 marked as booked
  → User B now sees seats A1, A2 as unavailable
  → This requires server-side processing and database updates
```

---

## 3. Technologies Used and Why

### Backend Technology: Flask (Python)

**What it is**: Flask is a web framework written in Python that helps build web applications.

**Why we use it**:

- Simple and beginner-friendly syntax
- Handles HTTP requests and responses
- Routes URLs to Python functions
- Integrates easily with databases
- Large ecosystem of extensions

**What it does in Bookora**:

- Serves HTML pages to browsers
- Processes API requests (get movies, book tickets)
- Communicates with MySQL database
- Sends email OTP for authentication
- Validates user inputs and enforces business rules

### Database: MySQL

**What it is**: A relational database management system that stores structured data in tables.

**Why we use it**:

- Organizes data in related tables (movies, shows, bookings, users)
- Ensures data integrity and consistency
- Supports complex queries and relationships
- ACID compliant (Atomicity, Consistency, Isolation, Durability)
- Free and widely used

**What it stores in Bookora**:

```
Database Tables:
- movies: Movie information (title, genre, duration, etc.)
- theatres: Theater locations and details
- shows: Specific show timings for movies at theaters
- seats: Individual seats for each show
- bookings: User booking records
- users: User account information
```

### Frontend Technologies

#### HTML (HyperText Markup Language)

**What it is**: Markup language that defines the structure of web pages.

**Why we use it**:

- Creates the skeleton of web pages
- Defines elements like headers, buttons, forms, images
- Browser understands and renders it

**Example in Bookora**:

```html
<button class="book-btn">Book Now</button>
<div class="movie-card">Movie Title</div>
```

#### CSS (Cascading Style Sheets)

**What it is**: Styling language that controls how HTML elements look.

**Why we use it**:

- Makes pages visually appealing
- Controls colors, fonts, layouts, spacing
- Creates responsive designs for different screen sizes

**Example in Bookora**:

```css
.book-btn {
    background-color: #ff4444;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
}
```

#### JavaScript

**What it is**: Programming language that runs in the browser.

**Why we use it**:

- Makes pages interactive
- Handles user events (clicks, form submissions)
- Makes API calls to Flask backend
- Updates page content without reloading
- Validates forms before submission

**Example in Bookora**:

```javascript
// When user clicks a seat
function selectSeat(seatId) {
    // Add to selected seats array
    // Update visual appearance
    // Recalculate total price
}
```

### Supporting Technologies

#### Flask-CORS

**What it is**: Extension that enables Cross-Origin Resource Sharing.

**Why we need it**: Allows frontend JavaScript to make requests to Flask backend running on same/different domain.

#### MySQL Connector Python

**What it is**: Python library to connect and communicate with MySQL database.

**Why we need it**: Flask needs this to execute SQL queries and fetch/update data.

#### Python-dotenv

**What it is**: Library to load environment variables from .env file.

**Why we need it**: Keeps sensitive credentials (database password, email password) out of code.

---

## 4. Project Structure Explained

### Complete Folder Structure

```
FINAL BOOKORA/
│
├── app.py                          # Main Flask application
├── requirements.txt                # Python dependencies
├── .env                            # Environment variables (credentials)
├── .gitignore                      # Files to ignore in git
│
├── movies-data.json                # Movie data for seeding database
├── seed_movies.py                  # Script to import movies to database
├── seed_shows.py                   # Script to generate shows and seats
├── database_schema.sql             # Database table definitions
│
├── firebase-credentials.json       # Firebase authentication config
├── firebase-config.js              # Firebase client-side config
│
├── static/                         # Static files (CSS, JS, images)
│   ├── styles.css                  # Main stylesheet
│   ├── script.js                   # Homepage JavaScript
│   ├── movie-details-script.js     # Movie details page logic
│   ├── shows-script.js             # Show selection logic
│   ├── seat-selection-script.js    # Seat selection logic
│   ├── signin-modal.js             # Authentication logic
│   ├── profile-script.js           # User profile logic
│   ├── my-bookings-script.js       # Bookings management
│   ├── (other CSS and JS files)
│   │
│   ├── posters/                    # Movie poster images
│   └── banners/                    # Movie banner images
│
└── templates/                      # HTML templates
    ├── index.html                  # Homepage
    ├── movie-details.html          # Movie details page
    ├── shows.html                  # Show selection page
    ├── seat-selection.html         # Seat selection page
    ├── profile.html                # User profile page
    ├── my-bookings.html            # User bookings page
    ├── saved-movies.html           # Saved movies page
    └── navbar.html                 # Reusable navigation bar
```

### Root Level Files

#### app.py

**Purpose**: The main Flask application file. This is the heart of the backend.

**What it contains**:

- Flask app initialization
- Database connection function
- API route definitions (endpoints)
- Business logic for booking, authentication, etc.
- Template rendering functions

**Example route**:

```python
@app.route('/api/movies')
def get_all_movies():
    # Connect to database
    # Fetch all movies
    # Return as JSON
```

#### requirements.txt

**Purpose**: Lists all Python packages needed to run the application.

**Contents**:

```
Flask==3.0.0
flask-cors==4.0.0
mysql-connector-python==8.2.0
python-dotenv==1.0.0
firebase-admin==6.3.0
```

**Why it exists**: When someone else downloads the project, they can install all dependencies with one command:

```bash
pip install -r requirements.txt
```

#### .env

**Purpose**: Stores sensitive configuration and credentials.

**Contents**:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bookora
```

**Why separate file**: 

- Keeps secrets out of code
- Different values for development vs production
- Never committed to git (listed in .gitignore)

#### movies-data.json

**Purpose**: Contains structured movie data to populate the database.

**Structure**:

```json
{
  "movies": [
    {
      "id": "baaghi_4",
      "title": "Baaghi 4",
      "description": "Action thriller...",
      "duration": 157,
      "genre": ["Action", "Thriller"],
      "cast": ["Tiger Shroff", "Sanjay Dutt"],
      ...
    }
  ]
}
```

**Why JSON**: Easy to read, edit, and parse programmatically.

#### seed_movies.py

**Purpose**: Python script that reads movies-data.json and inserts data into MySQL database.

**What it does**:

1. Opens movies-data.json
2. Reads all movie objects
3. Connects to MySQL
4. Inserts each movie into movies table

**When to run**: Once at project setup, or when movie data changes.

#### seed_shows.py

**Purpose**: Generates show schedules and seat layouts for all movies.

**What it does**:

1. Fetches all movies from database
2. Fetches all theaters
3. Creates shows for next 7 days at different times
4. For each show, generates 60 seats (A1-A10, B1-B10, etc.)
5. Inserts into shows and seats tables

**Why needed**: Without shows and seats, users cannot book tickets.

#### database_schema.sql

**Purpose**: SQL script defining all database tables and their structure.

**Contents**: CREATE TABLE statements for:

- movies
- theatres
- shows
- seats
- bookings
- users
- saved_movies
- otp_verifications

**When to run**: Once to create the database structure.

### templates/ Folder

**Purpose**: Contains HTML template files that Flask renders and sends to browsers.

**Key concept**: Flask uses Jinja2 template engine to dynamically insert data into HTML before sending to client.

**Important files**:

- `index.html`: Homepage displaying all movies
- `movie-details.html`: Detailed view of a single movie
- `shows.html`: Show times for selected movie
- `seat-selection.html`: Interactive seat map
- `profile.html`: User account settings
- `my-bookings.html`: User's booking history
- `navbar.html`: Reusable navigation component

**Why templates**: Allows dynamic content injection. Example:

```html
<h1>{{ movie.title }}</h1>
<p>Duration: {{ movie.duration }} minutes</p>
```

Flask replaces `{{ movie.title }}` with actual data from database.

### static/ Folder

**Purpose**: Contains static files served directly to browsers without processing.

**Contents**:

#### CSS Files

- `styles.css`: Global styles for all pages
- `movie-details-styles.css`: Styles specific to movie details page
- `shows-styles.css`: Show selection page styles
- `seat-selection-styles.css`: Seat map styling
- Others for specific pages

#### JavaScript Files

Each page has corresponding JavaScript for interactivity:

- `script.js`: Homepage movie carousel and interactions
- `movie-details-script.js`: Fetch and display movie details
- `shows-script.js`: Load shows, handle date selection
- `seat-selection-script.js`: Seat selection logic and booking
- `signin-modal.js`: Authentication flow (OTP)
- `profile-script.js`: Profile editing
- `my-bookings-script.js`: Display and cancel bookings

#### Image Folders

- `posters/`: Movie poster images
- `banners/`: Movie banner images for hero sections

**How Flask serves static files**: When browser requests `/static/styles.css`, Flask sends the file directly without processing.

---

## 5. How Flask Works Internally

### The Concept of Routes

A **route** is a URL pattern mapped to a Python function.

**Example**:

```python
@app.route('/movies')
def show_movies():
    return "List of movies"
```

When user visits `http://localhost:5000/movies`, Flask executes `show_movies()` function.

### Route Types

#### 1. Template Routes (Return HTML)

**Purpose**: Serve complete HTML pages.

```python
@app.route('/')
def homepage():
    return render_template('index.html')
```

**Flow**:

1. User requests `/`
2. Flask finds the route
3. Calls `render_template('index.html')`
4. Flask looks in `templates/` folder
5. Reads `index.html`
6. Sends HTML to browser

#### 2. API Routes (Return JSON)

**Purpose**: Provide data to JavaScript for dynamic updates.

```python
@app.route('/api/movies')
def get_movies():
    movies = fetch_from_database()
    return jsonify({'movies': movies})
```

**Flow**:

1. JavaScript makes request to `/api/movies`
2. Flask executes `get_movies()`
3. Function queries database
4. Returns JSON response
5. JavaScript receives data and updates page

### Dynamic Routes

Routes can accept parameters from URL:

```python
@app.route('/movie/<slug>')
def movie_details(slug):
    movie = get_movie_by_slug(slug)
    return render_template('movie-details.html', movie=movie)
```

**Example**:

- URL: `/movie/baaghi_4`
- `slug` variable gets value `baaghi_4`
- Function fetches movie with that slug from database

### HTTP Methods

Routes can handle different HTTP methods:

```python
@app.route('/api/booking', methods=['POST'])
def create_booking():
    data = request.get_json()
    # Process booking
    return jsonify({'success': True})
```

**Common methods**:

- `GET`: Retrieve data (default)
- `POST`: Send data to server
- `PUT`: Update existing data
- `DELETE`: Remove data

### Template Rendering

Flask uses Jinja2 to inject data into HTML templates:

**Python**:

```python
@app.route('/movie/<slug>')
def movie_details(slug):
    movie = {'title': 'Baaghi 4', 'duration': 157}
    return render_template('movie-details.html', movie=movie)
```

**HTML (movie-details.html)**:

```html
<h1>{{ movie.title }}</h1>
<p>Duration: {{ movie.duration }} min</p>
```

**Rendered Output**:

```html
<h1>Baaghi 4</h1>
<p>Duration: 157 min</p>
```

### Database Connection

Flask connects to MySQL on-demand:

```python
def get_db():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='bookora'
    )

@app.route('/api/movies')
def get_movies():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM movies")
    movies = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(movies)
```

**Flow**:

1. Route called
2. Create database connection
3. Execute SQL query
4. Fetch results
5. Close connection
6. Return data

---

## 6. Request-Response Flow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  USER'S BROWSER                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  1. User clicks "Book Now" on Baaghi 4                        │   │
│  │     Browser sends: GET /shows/baaghi_4                        │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │ HTTP Request
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  FLASK BACKEND (app.py)                                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  2. Flask receives request                                    │   │
│  │  3. Matches route: @app.route('/shows/<slug>')                │   │
│  │  4. Calls function: def show_page(slug)                       │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                        │
│                              │ Query                                  │
│                              ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  5. Connect to MySQL database                                 │   │
│  │  6. Execute: SELECT * FROM movies WHERE slug='baaghi_4'       │   │
│  │  7. Fetch movie data                                          │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │ Result Data
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  MYSQL DATABASE                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  movies table:                                                │   │
│  │  id | slug      | title     | duration | genre | ...         │   │
│  │  3  | baaghi_4  | Baaghi 4  | 157      | Action| ...         │   │
│  │                                                                │   │
│  │  Returns row data to Flask                                    │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │ Data flows back
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  FLASK BACKEND                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  8. Receives movie data from database                         │   │
│  │  9. Calls: render_template('shows.html', movie=movie_data)    │   │
│  │  10. Flask injects data into HTML template                    │   │
│  │  11. Generates complete HTML page                             │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │ HTTP Response (HTML)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  USER'S BROWSER                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  12. Browser receives HTML                                    │   │
│  │  13. Parses and renders the page                              │   │
│  │  14. Requests CSS files (/static/shows-styles.css)            │   │
│  │  15. Requests JS files (/static/shows-script.js)              │   │
│  │  16. Executes JavaScript                                      │   │
│  │  17. JavaScript makes API call: GET /api/shows?movie=baaghi_4 │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │ API Request
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  FLASK BACKEND                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  18. Receives API request                                     │   │
│  │  19. Queries shows table for baaghi_4                         │   │
│  │  20. Returns JSON: {'shows': [...]}                           │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │ JSON Response
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  USER'S BROWSER                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  21. JavaScript receives JSON                                 │   │
│  │  22. Updates DOM to display shows                             │   │
│  │  23. User sees show times on page                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Breakdown

#### Initial Page Load

**Step 1**: User action

- User clicks "Book Now" button on Baaghi 4 movie card
- Browser navigates to `/shows/baaghi_4`

**Step 2-4**: Flask routing

- Flask receives HTTP GET request for `/shows/baaghi_4`
- Matches route pattern `/shows/<slug>`
- Extracts `slug = baaghi_4`
- Calls corresponding Python function

**Step 5-7**: Database query

- Function creates database connection
- Executes SQL: `SELECT * FROM movies WHERE slug='baaghi_4'`
- Fetches movie data as dictionary

**Step 8-11**: Template rendering

- Flask receives movie data
- Calls `render_template('shows.html', movie=movie_data)`
- Template engine replaces placeholders with actual data
- Generates complete HTML document

**Step 12-16**: Browser rendering

- Browser receives HTML response
- Parses HTML structure
- Finds `<link>` tags for CSS files
- Makes separate requests for each CSS file
- Finds `<script>` tags for JavaScript files
- Makes separate requests and executes JavaScript

#### Dynamic Data Loading

**Step 17**: JavaScript API call

- JavaScript code on page makes AJAX request
- Calls: `fetch('/api/shows?movie=baaghi_4')`
- Sends asynchronous HTTP request to Flask

**Step 18-20**: Flask API response

- Flask receives API request
- Queries shows table with movie filter
- Formats data as JSON
- Returns: `{'shows': [show1, show2, ...]}`

**Step 21-23**: DOM update

- JavaScript receives JSON response
- Parses JSON data
- Updates HTML without reloading page
- User sees show times appear dynamically

### Request Types Comparison

#### Full Page Request

```
User clicks link
    → Flask returns complete HTML
        → Browser replaces entire page
            → New page loads
```

**Use case**: Navigation between different pages

#### API Request (AJAX)

```
JavaScript makes request
    → Flask returns only data (JSON)
        → JavaScript updates part of page
            → Page does not reload
```

**Use case**: Dynamic updates (seat selection, filtering, search)

---

## 7. JSON Seeding and Data Flow

### Why JSON Seeding?

**Problem**: Fresh database is empty. How do we populate it with movies?

**Solution**: Store movie data in JSON file, write script to import into database.

**Advantages**:

1. **Easy editing**: Update JSON file to add/modify movies
2. **Version control**: Track changes in git
3. **Portability**: Share data easily
4. **Backup**: JSON serves as data backup
5. **Testing**: Quickly reset database to known state

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  STEP 1: MANUAL DATA ENTRY                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Developer edits movies-data.json                             │   │
│  │  Adds new movie with all details:                             │   │
│  │  - title, description, genre, cast, duration, etc.            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  STEP 2: SEED SCRIPT EXECUTION                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Run command: python seed_movies.py                           │   │
│  │                                                                │   │
│  │  Script does:                                                 │   │
│  │  1. Open and parse movies-data.json                           │   │
│  │  2. Connect to MySQL database                                 │   │
│  │  3. For each movie in JSON:                                   │   │
│  │     - Format data                                             │   │
│  │     - Execute INSERT query                                    │   │
│  │  4. Commit changes                                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  STEP 3: DATABASE POPULATION                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  MySQL movies table now contains:                             │   │
│  │  ┌────┬────────────┬────────────┬──────────┬────────────┐    │   │
│  │  │ id │ slug       │ title      │ duration │ genre      │    │   │
│  │  ├────┼────────────┼────────────┼──────────┼────────────┤    │   │
│  │  │ 1  │ baaghi_4   │ Baaghi 4   │ 157      │ Action     │    │   │
│  │  │ 2  │ border_2   │ Border 2   │ 199      │ War        │    │   │
│  │  │ 3  │ chhaava    │ Chhaava    │ 161      │ Historical │    │   │
│  │  └────┴────────────┴────────────┴──────────┴────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  STEP 4: RUNTIME DATA ACCESS                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Flask application queries database:                          │   │
│  │  SELECT * FROM movies WHERE status='now_showing'              │   │
│  │                                                                │   │
│  │  Returns movie data to render homepage                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  STEP 5: USER SEES MOVIES                                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Browser receives HTML with movie data                        │   │
│  │  User sees movie cards on homepage                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Seed Script Internals

**seed_movies.py** performs these operations:

```python
# 1. Import required libraries
import mysql.connector
import json

# 2. Load JSON data
with open('movies-data.json', 'r') as f:
    data = json.load(f)
    movies = data.get('movies', [])

# 3. Connect to database
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='bookora'
)
cursor = conn.cursor()

# 4. Clear existing movies (optional, for fresh start)
cursor.execute("DELETE FROM movies")

# 5. Insert each movie
for movie in movies:
    sql = """
    INSERT INTO movies (slug, title, description, duration, ...)
    VALUES (%s, %s, %s, %s, ...)
    """
    values = (
        movie.get('id'),
        movie.get('title'),
        movie.get('description'),
        movie.get('duration'),
        ...
    )
    cursor.execute(sql, values)

# 6. Save changes
conn.commit()

# 7. Close connection
cursor.close()
conn.close()
```

### Why Not Hardcode in Python?

**Bad approach**:

```python
# DON'T DO THIS
movies = [
    {'title': 'Baaghi 4', 'duration': 157, ...},
    {'title': 'Border 2', 'duration': 199, ...},
]
```

**Problems**:

- Hard to edit (need to understand Python)
- Mixed with code logic
- Difficult to review changes
- Cannot be used by non-programmers

**Good approach** (current):

- Data in JSON (human-readable format)
- Separate from code
- Easy to version control
- Can be edited in any text editor

---

## 8. Configuration Files

### requirements.txt

**Purpose**: Specifies exact versions of Python packages needed.

**Format**:

```
PackageName==Version
```

**Example**:

```
Flask==3.0.0
flask-cors==4.0.0
mysql-connector-python==8.2.0
python-dotenv==1.0.0
firebase-admin==6.3.0
```

**Why version pinning?**

- Ensures consistent behavior across environments
- Prevents breaking changes from updates
- Others can replicate exact setup

**How to use**:

```bash
# Install all dependencies
pip install -r requirements.txt

# Generate from current environment
pip freeze > requirements.txt
```

### .env File

**Purpose**: Store sensitive configuration outside codebase.

**Structure**:

```
KEY=value
ANOTHER_KEY=another_value
```

**Example**:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bookora

SECRET_KEY=bookora-secret-key-2026
DEBUG=True
```

**How Flask reads it**:

```python
from dotenv import load_dotenv
import os

load_dotenv()  # Reads .env file

EMAIL_USER = os.getenv('EMAIL_USER')
DB_NAME = os.getenv('DB_NAME')
```

**Security benefits**:

- Credentials not in source code
- Different values for dev/production
- .env listed in .gitignore (never committed)
- Each developer has own .env

**Best practice**:

- Commit `.env.example` with placeholder values
- Each developer creates own `.env` with real credentials
- Never commit actual `.env` to git

### .gitignore

**Purpose**: Tell git which files to never track.

**Contents**:

```
.env
__pycache__/
*.pyc
.vscode/
.idea/
```

**Why needed**:

- Prevents committing secrets
- Excludes generated files
- Reduces repository size
- Keeps repo clean

---

## 9. System Architecture

### Overall Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                         CLIENT LAYER                                  │
│                         (User's Browser)                              │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                  │ │
│  │  HTML Pages          CSS Styles          JavaScript Logic      │ │
│  │  - index.html        - styles.css        - script.js           │ │
│  │  - shows.html        - shows-styles.css  - shows-script.js     │ │
│  │  - seat-selection    - seat-styles.css   - seat-script.js      │ │
│  │                                                                  │ │
│  │  User Interactions:                                             │ │
│  │  - Click buttons                                                │ │
│  │  - Fill forms                                                   │ │
│  │  - Select seats                                                 │ │
│  │                                                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└───────────────────────────┬───────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS Requests
                            │ (GET /shows, POST /api/booking, etc.)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                         SERVER LAYER                                  │
│                         (Flask Application)                           │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                  │ │
│  │  app.py - Main Application                                      │ │
│  │                                                                  │ │
│  │  Route Handlers:                                                │ │
│  │  ┌────────────────────────────────────────────────────────────┐│ │
│  │  │ @app.route('/')                                             ││ │
│  │  │ def homepage():                                             ││ │
│  │  │     return render_template('index.html')                    ││ │
│  │  │                                                             ││ │
│  │  │ @app.route('/api/movies')                                   ││ │
│  │  │ def get_movies():                                           ││ │
│  │  │     movies = query_database()                               ││ │
│  │  │     return jsonify(movies)                                  ││ │
│  │  │                                                             ││ │
│  │  │ @app.route('/api/booking', methods=['POST'])                ││ │
│  │  │ def create_booking():                                       ││ │
│  │  │     data = request.json                                     ││ │
│  │  │     save_to_database(data)                                  ││ │
│  │  │     return jsonify({'success': True})                       ││ │
│  │  └────────────────────────────────────────────────────────────┘│ │
│  │                                                                  │ │
│  │  Business Logic:                                                │ │
│  │  - Validate inputs                                              │ │
│  │  - Check seat availability                                      │ │
│  │  - Calculate prices                                             │ │
│  │  - Send OTP emails                                              │ │
│  │  - Process bookings                                             │ │
│  │                                                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└───────────────────────────┬───────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            │ (SELECT, INSERT, UPDATE, DELETE)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                         DATA LAYER                                    │
│                         (MySQL Database)                              │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                  │ │
│  │  Tables:                                                        │ │
│  │                                                                  │ │
│  │  movies                    shows                                │ │
│  │  ┌──┬───────┬──────┐      ┌──┬────────┬────────┬──────┐        │ │
│  │  │id│title  │genre │      │id│movie_id│theatre │time  │        │ │
│  │  ├──┼───────┼──────┤      ├──┼────────┼────────┼──────┤        │ │
│  │  │1 │Baaghi │Action│      │1 │   1    │   1    │10:00 │        │ │
│  │  │2 │Border │War   │      │2 │   1    │   2    │13:00 │        │ │
│  │  └──┴───────┴──────┘      └──┴────────┴────────┴──────┘        │ │
│  │                                                                  │ │
│  │  bookings                  users                                │ │
│  │  ┌──┬───────┬──────┐      ┌──┬──────┬──────┬────────┐          │ │
│  │  │id│user_id│show  │      │id│name  │email │phone   │          │ │
│  │  ├──┼───────┼──────┤      ├──┼──────┼──────┼────────┤          │ │
│  │  │1 │  101  │  1   │      │1 │Rahul │r@g.c │9123... │          │ │
│  │  │2 │  102  │  2   │      │2 │Priya │p@g.c │9345... │          │ │
│  │  └──┴───────┴──────┘      └──┴──────┴──────┴────────┘          │ │
│  │                                                                  │ │
│  │  seats                     theatres                             │ │
│  │  saved_movies              otp_verifications                    │ │
│  │                                                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Action Flow:

1. USER OPENS HOMEPAGE
   Browser → Flask: GET /
   Flask → Browser: index.html
   Browser → Flask: GET /static/styles.css
   Browser → Flask: GET /static/script.js
   JavaScript → Flask: GET /api/movies
   Flask → MySQL: SELECT * FROM movies
   MySQL → Flask: [movie data]
   Flask → JavaScript: JSON response
   JavaScript → DOM: Update page with movies

2. USER CLICKS "BOOK NOW"
   Browser → Flask: GET /shows/baaghi_4
   Flask → MySQL: SELECT * FROM movies WHERE slug='baaghi_4'
   MySQL → Flask: movie data
   Flask → Browser: shows.html (with movie data)
   JavaScript → Flask: GET /api/shows?movie=baaghi_4&date=2026-02-09
   Flask → MySQL: SELECT * FROM shows WHERE ...
   MySQL → Flask: shows data
   Flask → JavaScript: JSON response
   JavaScript → DOM: Display show times

3. USER SELECTS SHOW
   Browser → Flask: GET /seat-selection/123
   Flask → MySQL: SELECT * FROM seats WHERE show_id=123
   MySQL → Flask: seat data
   Flask → Browser: seat-selection.html
   JavaScript → DOM: Render seat map

4. USER BOOKS SEATS
   JavaScript → Flask: POST /api/booking
                        {show_id: 123, seats: ['A1', 'A2'], user_id: 101}
   Flask: Validate data
   Flask → MySQL: BEGIN TRANSACTION
   Flask → MySQL: UPDATE seats SET status='booked' WHERE ...
   Flask → MySQL: INSERT INTO bookings ...
   Flask → MySQL: COMMIT
   MySQL → Flask: Success
   Flask → JavaScript: {success: true, booking_id: 456}
   JavaScript → User: Show confirmation
```

### Three-Tier Architecture

**Bookora follows three-tier architecture**:

1. **Presentation Tier** (Client)
   - HTML/CSS/JavaScript
   - User interface
   - Runs in browser

2. **Application Tier** (Server)
   - Flask application
   - Business logic
   - API endpoints
   - Runs on server

3. **Data Tier** (Database)
   - MySQL database
   - Data storage
   - Data integrity
   - Runs on database server

**Benefits**:

- Separation of concerns
- Independent scaling
- Easier maintenance
- Security (database not directly accessible to clients)

---

## 10. Interview Preparation

### How to Explain This Project Foundation

#### Opening Statement (30 seconds)

"I built Bookora, a full-stack movie ticket booking web application using Flask, MySQL, HTML, CSS, and JavaScript. It allows users to browse movies, select show times, choose seats on an interactive map, and complete bookings. The application features user authentication via OTP, real-time seat availability, and booking management."

#### Architecture Explanation (1-2 minutes)

"The application follows a three-tier architecture:

**Frontend**: HTML templates styled with CSS and made interactive with JavaScript. The UI includes a homepage with movie listings, detailed movie pages, show selection, and an interactive seat map.

**Backend**: Flask serves as the application server, handling HTTP requests through defined routes. It processes business logic like validating bookings, checking seat availability, and managing user sessions.

**Database**: MySQL stores all persistent data across eight tables including movies, shows, seats, bookings, and users. The database enforces referential integrity and handles concurrent booking scenarios.

The request flow works like this: User interacts with the browser, which sends HTTP requests to Flask. Flask queries MySQL, processes the data, and returns either rendered HTML templates or JSON responses. JavaScript then updates the UI dynamically without page reloads for a smooth user experience."

#### Technical Details (Deep Dive)

**When asked about Flask**:

"Flask is a micro web framework that maps URLs to Python functions using decorators. For example, when a user visits `/shows/baaghi_4`, Flask matches this to a route, extracts the movie slug, queries the database for that movie, and renders the appropriate template with the data. I chose Flask because it is lightweight, has excellent documentation, and provides flexibility in structuring the application."

**When asked about database design**:

"The database has eight main tables with proper relationships. Movies have one-to-many relationships with shows, shows belong to specific theatres and have multiple seats, and bookings link users to specific seats in specific shows. I used foreign keys to maintain referential integrity and created indexes on frequently queried columns like show_date and theatre_id for performance."

**When asked about real-time features**:

"For seat availability, when a user selects seats, JavaScript makes a POST request to the booking endpoint. Flask uses a database transaction to atomically check seat availability and create the booking. If another user tries to book the same seat simultaneously, the database transaction isolation ensures only one succeeds. The failed request receives an error response and can refresh to see updated availability."

**When asked about authentication**:

"I implemented OTP-based authentication using email. When users sign in, the backend generates a 6-digit OTP, stores it with an expiration timestamp in the database, and sends it via SMTP. Users enter the OTP, and the backend validates it against the stored value and checks expiration. Upon successful validation, a session is created and user data is stored in localStorage for maintaining login state across pages."

#### Common Follow-Up Questions

**Q: Why Flask instead of Django?**

"Flask gives more control and is better for learning fundamentals. Django includes many built-in features, but for this project, I wanted to understand how routing, template rendering, and database connections work at a lower level. Flask's minimalism helped me learn these concepts better."

**Q: How do you handle concurrent bookings?**

"MySQL transactions with proper isolation levels ensure atomicity. When booking seats, I start a transaction, check availability, update seat status, create booking record, and commit. If two users try to book the same seat simultaneously, the database lock mechanism ensures only one transaction succeeds."

**Q: Why separate seed scripts?**

"Seeding separates data management from application logic. I can quickly reset the database to a known state during development, add new movies by editing JSON without touching code, and run different seed scripts for development versus production data. It also serves as documentation of the initial data structure."

**Q: How would you scale this?**

"For scaling, I would:
1. Add Redis for session management and caching frequently accessed data like movie listings
2. Implement connection pooling for database connections
3. Use CDN for static assets like images
4. Add load balancer for multiple Flask instances
5. Separate read and write database operations
6. Implement database replication for read-heavy operations
7. Add message queue for email sending to avoid blocking requests"

**Q: What are the limitations of your current implementation?**

"Current limitations include:
1. No payment gateway integration
2. No admin panel for managing movies and shows
3. Session management using localStorage (should use server-side sessions)
4. No WebSocket for real-time seat updates
5. Limited error handling and logging
6. No rate limiting on API endpoints
7. No automated testing suite

These would be priorities for production deployment."

### Key Strengths to Highlight

1. **Full-stack implementation**: You built both frontend and backend
2. **Database design**: Proper relationships and normalization
3. **User experience**: Smooth flow from browsing to booking
4. **Authentication**: Implemented secure OTP-based login
5. **Real-world problem**: Solved actual user need (ticket booking)
6. **Clean architecture**: Separation of concerns, modular code
7. **Documentation**: Well-documented code and project structure

### Preparation Checklist

Before the interview, ensure you can:

- [ ] Explain every file's purpose
- [ ] Draw the architecture diagram from memory
- [ ] Describe the complete request-response flow
- [ ] Explain database schema and relationships
- [ ] Walk through a booking transaction step-by-step
- [ ] Discuss technology choices and alternatives
- [ ] Identify current limitations and improvement areas
- [ ] Explain how you would deploy this to production
- [ ] Demonstrate understanding of web fundamentals
- [ ] Show code examples from your project

---

## Summary

This document covered the foundation of Bookora:

1. **Project Overview**: Movie ticket booking web application
2. **Web Application Necessity**: Dynamic features require server-side processing
3. **Technology Stack**: Flask for backend, MySQL for database, HTML/CSS/JS for frontend
4. **Project Structure**: Organized folders for templates, static files, and configuration
5. **Flask Internals**: Routes, templates, and database integration
6. **Request Flow**: Complete journey from browser to database and back
7. **Data Management**: JSON seeding for initial database population
8. **Configuration**: Environment variables and dependency management
9. **Architecture**: Three-tier client-server-database architecture
10. **Interview Readiness**: How to articulate your understanding professionally

With this foundation, you are ready to dive deeper into specific components in subsequent documentation parts.
