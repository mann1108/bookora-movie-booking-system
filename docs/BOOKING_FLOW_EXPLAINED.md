# 📚 BOOKORA BOOKING FLOW - COMPLETE EXPLANATION

## 🎯 PURPOSE OF THIS DOCUMENT
This document explains the **COMPLETE BOOKING FLOW** from clicking "Book Now" to seat selection, including:
- What happens when you click "Book Now"
- Why we need to seed shows in the database
- Exact calculations and data structure
- Step-by-step flow with diagrams
- What the Python seeding code does

---

## 🔴 CURRENT PROBLEM: WHY DATABASE IS EMPTY

### What You're Seeing:
When you click **"Book Now"** → You see **NO SHOWS AVAILABLE**

### Why This Happens:
Your database currently has:
- ✅ **Movies Table**: 12 movies (Baaghi 4, Border 2, Chhaava, etc.)
- ✅ **Theatres Table**: 4 theatres in Ahmedabad
- ❌ **Shows Table**: **EMPTY** (0 shows)
- ❌ **Seats Table**: **EMPTY** (0 seats)

**Without shows and seats data, users cannot book tickets!**

---

## 📊 COMPLETE BOOKING FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 1: HOMEPAGE OR MOVIE DETAILS                │
├─────────────────────────────────────────────────────────────────────┤
│  User sees movie: "Baaghi 4"                                        │
│  Clicks: [Book Now] button                                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 2: SHOWS PAGE LOADS                         │
├─────────────────────────────────────────────────────────────────────┤
│  URL: /shows/baaghi-4                                               │
│  JavaScript extracts slug: "baaghi-4"                               │
│  Displays 7 date buttons (Today + Next 6 days)                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 3: USER SELECTS DATE                        │
├─────────────────────────────────────────────────────────────────────┤
│  User clicks: "FEB 08" (Today)                                      │
│  selectedDate = "2026-02-08"                                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 4: API CALL TO BACKEND                      │
├─────────────────────────────────────────────────────────────────────┤
│  Frontend JavaScript calls:                                          │
│  GET /api/shows?slug=baaghi-4&date=2026-02-08                       │
│                                                                      │
│  Backend (Flask) receives request:                                   │
│    1. Resolves slug "baaghi-4" → movie_id = 1                       │
│    2. Queries database for shows                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 5: DATABASE QUERY                           │
├─────────────────────────────────────────────────────────────────────┤
│  SQL Query:                                                          │
│    SELECT shows.*, theatres.*, COUNT(seats)                         │
│    FROM shows                                                        │
│    JOIN theatres ON shows.theatre_id = theatres.id                  │
│    LEFT JOIN seats ON seats.show_id = shows.id                      │
│    WHERE shows.movie_id = 1                                         │
│      AND shows.show_date = '2026-02-08'                             │
│    GROUP BY shows.id                                                 │
│    ORDER BY theatres.name, shows.show_time                          │
│                                                                      │
│  🔴 RESULT: 0 rows (because shows table is EMPTY!)                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 6: EMPTY RESPONSE                           │
├─────────────────────────────────────────────────────────────────────┤
│  Backend returns:                                                    │
│  {                                                                   │
│    "success": true,                                                  │
│    "theatres": []  ← EMPTY ARRAY                                    │
│  }                                                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 7: UI DISPLAYS ERROR                        │
├─────────────────────────────────────────────────────────────────────┤
│  Frontend shows:                                                     │
│  "No shows available for this date"                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✅ WHAT SHOULD HAPPEN (WITH SHOWS DATA)

```
┌─────────────────────────────────────────────────────────────────────┐
│              STEP 5: DATABASE QUERY (WITH DATA)                     │
├─────────────────────────────────────────────────────────────────────┤
│  Query finds:                                                        │
│    - 3 theatres showing "Baaghi 4" on 2026-02-08                    │
│    - 9 total shows (3 theatres × 3 showtimes each)                  │
│    - Each show has 120 seats (10 rows × 12 seats)                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              STEP 6: BACKEND RETURNS THEATRE DATA                   │
├─────────────────────────────────────────────────────────────────────┤
│  {                                                                   │
│    "success": true,                                                  │
│    "theatres": [                                                     │
│      {                                                               │
│        "id": 1,                                                      │
│        "name": "City Gold Cinema",                                  │
│        "address": "CG Road, Ahmedabad",                             │
│        "shows": [                                                    │
│          {                                                           │
│            "show_id": 15,                                           │
│            "time": "10:00",                                         │
│            "available_seats": 96,  ← (120 total - 24 booked)       │
│            "total_seats": 120                                       │
│          },                                                          │
│          { "show_id": 16, "time": "16:00", ... },                  │
│          { "show_id": 17, "time": "22:00", ... }                   │
│        ]                                                             │
│      },                                                              │
│      { /* PVR Acropolis */ },                                       │
│      { /* Rajhans Cinemas */ }                                      │
│    ]                                                                 │
│  }                                                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              STEP 7: UI DISPLAYS THEATRES & SHOWTIMES               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐             │
│  │ 🎭 City Gold Cinema                                │             │
│  │ 📍 CG Road, Ahmedabad                              │             │
│  │                                                     │             │
│  │ [10:00]  [16:00]  [22:00]  ← Clickable buttons    │             │
│  │  96 seats  85 seats  110 seats                    │             │
│  └────────────────────────────────────────────────────┘             │
│                                                                      │
│  ┌────────────────────────────────────────────────────┐             │
│  │ 🎭 PVR Acropolis                                   │             │
│  │ 📍 Thaltej, Ahmedabad                              │             │
│  │ [10:00]  [13:00]  [19:00]                         │             │
│  └────────────────────────────────────────────────────┘             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              STEP 8: USER CLICKS SHOWTIME                           │
├─────────────────────────────────────────────────────────────────────┤
│  User clicks: [10:00] at City Gold Cinema                          │
│  JavaScript navigates to: /seats/15                                 │
│  (where 15 is the show_id)                                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              STEP 9: SEAT SELECTION PAGE                            │
├─────────────────────────────────────────────────────────────────────┤
│  Loads 120 seats for show_id = 15                                   │
│  Shows seat layout (A1-A12, B1-B12, ... J1-J12)                     │
│  Displays which seats are booked vs available                       │
│  User selects seats → Proceeds to payment                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE STRUCTURE EXPLAINED

### Current Database State:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MOVIES TABLE                                │
├──────┬─────────────────┬──────────┬──────────┬─────────────────────┤
│  id  │      title      │   slug   │ duration │  status             │
├──────┼─────────────────┼──────────┼──────────┼─────────────────────┤
│  1   │  Baaghi 4       │ baaghi-4 │  150 min │  now_showing        │
│  2   │  Border 2       │ border-2 │  165 min │  now_showing        │
│  3   │  Chhaava        │ chhaava  │  180 min │  now_showing        │
│  ... │  ... (9 more movies)                                         │
└──────┴─────────────────┴──────────┴──────────┴─────────────────────┘
Total: 12 movies ✅

┌─────────────────────────────────────────────────────────────────────┐
│                        THEATRES TABLE                               │
├──────┬───────────────────────┬────────────┬─────────────────────────┤
│  id  │        name           │    city    │       address           │
├──────┼───────────────────────┼────────────┼─────────────────────────┤
│  1   │  City Gold Cinema     │ Ahmedabad  │  CG Road, Ahmedabad     │
│  2   │  Rajhans Cinemas      │ Ahmedabad  │  Vastrapur, Ahmedabad   │
│  3   │  PVR Acropolis        │ Ahmedabad  │  Thaltej, Ahmedabad     │
│  4   │  INOX Ahmedabad       │ Ahmedabad  │  SG Highway, Ahmedabad  │
└──────┴───────────────────────┴────────────┴─────────────────────────┘
Total: 4 theatres ✅

┌─────────────────────────────────────────────────────────────────────┐
│                         SHOWS TABLE                                 │
├──────┬──────────┬────────────┬────────────┬──────────────────────────┤
│  id  │ movie_id │ theatre_id │ show_date  │      show_time          │
├──────┼──────────┼────────────┼────────────┼──────────────────────────┤
│  (EMPTY - NO RECORDS)                                                │
└─────────────────────────────────────────────────────────────────────┘
Total: 0 shows ❌

┌─────────────────────────────────────────────────────────────────────┐
│                         SEATS TABLE                                 │
├──────┬─────────┬─────────────┬────────┬───────────┬─────────────────┤
│  id  │ show_id │ seat_label  │  price │ is_booked │   booked_by     │
├──────┼─────────┼─────────────┼────────┼───────────┼─────────────────┤
│  (EMPTY - NO RECORDS)                                                │
└─────────────────────────────────────────────────────────────────────┘
Total: 0 seats ❌
```

### Required Database State (After Seeding):

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SHOWS TABLE (AFTER SEEDING)                      │
├──────┬──────────┬────────────┬────────────┬──────────────────────────┤
│  id  │ movie_id │ theatre_id │ show_date  │      show_time          │
├──────┼──────────┼────────────┼────────────┼──────────────────────────┤
│  1   │    1     │     1      │ 2026-02-08 │      10:00:00           │
│  2   │    1     │     1      │ 2026-02-08 │      13:00:00           │
│  3   │    1     │     1      │ 2026-02-08 │      16:00:00           │
│  4   │    1     │     2      │ 2026-02-08 │      10:00:00           │
│  5   │    1     │     2      │ 2026-02-08 │      19:00:00           │
│  ... │   ...    │    ...     │    ...     │         ...             │
└─────────────────────────────────────────────────────────────────────┘
Each show has: movie + theatre + date + time combination

┌─────────────────────────────────────────────────────────────────────┐
│                    SEATS TABLE (AFTER SEEDING)                      │
├──────┬─────────┬─────────────┬────────┬───────────┬─────────────────┤
│  id  │ show_id │ seat_label  │  price │ is_booked │   booked_by     │
├──────┼─────────┼─────────────┼────────┼───────────┼─────────────────┤
│  1   │    1    │     A1      │  150   │     0     │      NULL       │
│  2   │    1    │     A2      │  150   │     0     │      NULL       │
│  3   │    1    │     A3      │  150   │     1     │      NULL       │ ← Pre-booked
│  4   │    1    │     A4      │  150   │     0     │      NULL       │
│  ... │   ...   │    ...      │  ...   │    ...    │      ...        │
│  120 │    1    │     J12     │  300   │     0     │      NULL       │
│  121 │    2    │     A1      │  150   │     0     │      NULL       │ ← Next show
│  ... │   ...   │    ...      │  ...   │    ...    │      ...        │
└─────────────────────────────────────────────────────────────────────┘
Each show has 120 seats (10 rows × 12 columns)
```

---

## 🧮 EXACT CALCULATIONS - WHAT seed_shows.py DOES

### Input Data:
- **Movies**: 12 movies (already in database)
- **Theatres**: 4 theatres in Ahmedabad (already in database)
- **Date Range**: Next 7 days (Today + 6 days)
- **Showtimes**: 5 time slots available: `['10:00', '13:00', '16:00', '19:00', '22:00']`
- **Per Movie**: Exactly 3 theatres selected (random WHICH, fixed COUNT)
- **Per Theatre**: Exactly 3 showtimes selected (random WHICH, fixed COUNT)

### Calculation Breakdown:

#### STEP 1: Shows Generation Logic

```
For each day (7 days):
  For each movie (12 movies):
    Select exactly 3 theatres (randomly chosen from 4 available)
    For each selected theatre (3 theatres):
      Select exactly 3 showtimes (randomly chosen from 5 available)
      Create 1 show with 120 seats
      
Total Shows Calculation:
  7 days × 12 movies × 3 theatres × 3 showtimes = 756 shows (EXACT)
  
Note: WHICH 3 theatres and WHICH 3 times are random, but COUNT is always 3.
```

**Example for "Baaghi 4" on Feb 08, 2026:**
```
┌──────────────────────────────────────────────────────────────────────┐
│  Movie: Baaghi 4 (movie_id = 1)                                      │
│  Date: 2026-02-08                                                    │
├──────────────────────────────────────────────────────────────────────┤
│  Theatre 1: City Gold Cinema (randomly selected)                     │
│    → Show 1: 10:00 (show_id = 1)                                    │
│    → Show 2: 16:00 (show_id = 2)                                    │
│    → Show 3: 22:00 (show_id = 3)                                    │
├──────────────────────────────────────────────────────────────────────┤
│  Theatre 2: PVR Acropolis (randomly selected)                        │
│    → Show 1: 10:00 (show_id = 4)                                    │
│    → Show 2: 13:00 (show_id = 5)                                    │
│    → Show 3: 19:00 (show_id = 6)                                    │
├──────────────────────────────────────────────────────────────────────┤
│  Theatre 3: Rajhans Cinemas (randomly selected)                      │
│    → Show 1: 13:00 (show_id = 7)                                    │
│    → Show 2: 19:00 (show_id = 8)                                    │
│    → Show 3: 22:00 (show_id = 9)                                    │
└──────────────────────────────────────────────────────────────────────┘

Total shows for Baaghi 4 on Feb 08: 9 shows (EXACT - always 3×3)
Each of the 12 movies gets exactly 9 shows per day (3 theatres × 3 times)
```

#### STEP 2: Seats Generation Logic

For **EACH SHOW**, the script generates 120 seats:

```
Seat Layout:
┌─────────────────────────────────────────────────────────────────┐
│                        CINEMA SCREEN                            │
└─────────────────────────────────────────────────────────────────┘

Row A: [A1]  [A2]  [A3]  [A4]  [A5]  [A6]  [A7]  [A8]  [A9]  [A10] [A11] [A12]
       ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150

Row B: [B1]  [B2]  [B3]  [B4]  [B5]  [B6]  [B7]  [B8]  [B9]  [B10] [B11] [B12]
       ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150

Row C: [C1]  [C2]  [C3]  [C4]  [C5]  [C6]  [C7]  [C8]  [C9]  [C10] [C11] [C12]
       ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150  ₹150

Row D: [D1]  [D2]  [D3]  [D4]  [D5]  [D6]  [D7]  [D8]  [D9]  [D10] [D11] [D12]
       ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200

Row E: [E1]  [E2]  [E3]  [E4]  [E5]  [E6]  [E7]  [E8]  [E9]  [E10] [E11] [E12]
       ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200

Row F: [F1]  [F2]  [F3]  [F4]  [F5]  [F6]  [F7]  [F8]  [F9]  [F10] [F11] [F12]
       ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200  ₹200

Row G: [G1]  [G2]  [G3]  [G4]  [G5]  [G6]  [G7]  [G8]  [G9]  [G10] [G11] [G12]
       ₹250  ₹250  ₹250  ₹250  ₹250  ₹250  ₹250  ₹250  ₹250  ₹250  ₹250  ₹250

Row H: [H1]  [H2]  [H3]  [H4]  [H5]  [H6]  [H7]  [H8]  [H9]  [H10] [H11] [H12]
       ₹250  ₹250  ₹250  ₹250  ₹250  ₹250  ₹250  ₹250  ₹250  ₹250  ₹250  ₹250

Row I: [I1]  [I2]  [I3]  [I4]  [I5]  [I6]  [I7]  [I8]  [I9]  [I10] [I11] [I12]
       ₹300  ₹300  ₹300  ₹300  ₹300  ₹300  ₹300  ₹300  ₹300  ₹300  ₹300  ₹300

Row J: [J1]  [J2]  [J3]  [J4]  [J5]  [J6]  [J7]  [J8]  [J9]  [J10] [J11] [J12]
       ₹300  ₹300  ₹300  ₹300  ₹300  ₹300  ₹300  ₹300  ₹300  ₹300  ₹300  ₹300

Total Seats per Show: 120
```

**Seat Pricing Logic:**
```python
seat_prices = {
    'A': 150,  # Row A - Front section (cheaper)
    'B': 150,  # Row B - Front section
    'C': 150,  # Row C - Front section
    'D': 200,  # Row D - Middle section (regular price)
    'E': 200,  # Row E - Middle section
    'F': 200,  # Row F - Middle section
    'G': 250,  # Row G - Back section (premium)
    'H': 250,  # Row H - Back section
    'I': 300,  # Row I - VIP section (most expensive)
    'J': 300   # Row J - VIP section
}

Per show seat count:
  - Rows A, B, C (Front): 3 rows × 12 seats = 36 seats @ ₹150 each
  - Rows D, E, F (Middle): 3 rows × 12 seats = 36 seats @ ₹200 each
  - Rows G, H (Premium): 2 rows × 12 seats = 24 seats @ ₹250 each
  - Rows I, J (VIP): 2 rows × 12 seats = 24 seats @ ₹300 each
  
Total: 120 seats per show
```

**Pre-booking Logic (20% Occupancy):**
```python
# Randomly mark 20% of seats as already booked
is_booked = random.random() < 0.2  # 20% chance

Per show:
  - Total seats: 120
  - Pre-booked: ~24 seats (20%)
  - Available: ~96 seats (80%)
```

#### STEP 3: Total Database Records Calculation

```
SHOWS TABLE:
  7 days × 12 movies × 3 theatres × 3 showtimes = 756 shows (EXACT)

SEATS TABLE:
  756 shows × 120 seats per show = 90,720 seat records (EXACT)

TOTAL DATABASE INSERTS:
  756 show records
  90,720 seat records
  = 91,476 total INSERT statements (EXACT)
```
  = ~63,525 total INSERT statements
```

---

## 🔧 WHAT seed_shows.py DOES - LINE BY LINE

### Python Code Explained:

```python
# STEP 1: Connect to MySQL database
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='bookora'
)
```
**Purpose:** Establishes connection to your local MySQL database named 'bookora'

---

```python
# STEP 2: Define show times available each day
SHOW_TIMES = ['10:00:00', '13:00:00', '16:00:00', '19:00:00', '22:00:00']
```
**Purpose:** Defines 5 time slots for shows throughout the day
- Morning: 10:00 AM
- Afternoon: 1:00 PM
- Evening: 4:00 PM
- Night: 7:00 PM
- Late night: 10:00 PM

---

```python
# STEP 3: Fetch all movies and theatres from database
cursor.execute("SELECT id, title FROM movies")
movies = cursor.fetchall()  # Gets 12 movies

cursor.execute("SELECT id, name FROM theatres WHERE city = 'Ahmedabad'")
theatres = cursor.fetchall()  # Gets 4 theatres
```
**Purpose:** Retrieves existing movies and theatres to create shows for them

---

```python
# STEP 4: Clear old data (if re-running)
cursor.execute("DELETE FROM seats")
cursor.execute("DELETE FROM shows")
```
**Purpose:** Removes any existing shows/seats to start fresh
**Why:** Prevents duplicate data if you run the script multiple times

---

```python
# STEP 5: Generate shows for next 7 days
today = datetime.now().date()  # Feb 08, 2026

for day_offset in range(7):  # Loop 7 times (7 days)
    show_date = today + timedelta(days=day_offset)
    # Day 0: Feb 08, 2026
    # Day 1: Feb 09, 2026
    # ...
    # Day 6: Feb 14, 2026
```
**Purpose:** Creates shows for the current week (7 days starting today)

---

```python
    for movie in movies:  # Loop through each movie (12 movies)
        # Each movie shows in 2-3 random theatres per day
        selected_theatres = random.sample(theatres, min(3, len(theatres)))
```
**Purpose:** For each movie, randomly select 2-3 theatres
**Why Random:** Not every theatre shows every movie (realistic)

**Example:**
- Baaghi 4 → Shows at: City Gold, PVR, Rajhans (3 theatres)
- Border 2 → Shows at: PVR, INOX (2 theatres)
- Chhaava → Shows at: City Gold, INOX, Rajhans (3 theatres)

---

```python
        for theatre in selected_theatres:
            # Each theatre shows 2-3 showtimes per movie per day
            selected_times = random.sample(SHOW_TIMES, min(3, len(SHOW_TIMES)))
```
**Purpose:** For each theatre, randomly pick 2-3 showtimes
**Why Random:** Theatres don't run all 5 showtimes for every movie

**Example:**
- City Gold showing Baaghi 4 → 10:00, 16:00, 22:00 (3 shows)
- PVR showing Baaghi 4 → 13:00, 19:00 (2 shows)

---

```python
            for show_time in selected_times:
                # Insert show record
                cursor.execute("""
                    INSERT INTO shows (movie_id, theatre_id, show_date, show_time)
                    VALUES (%s, %s, %s, %s)
                """, (movie['id'], theatre['id'], show_date, show_time))
                
                show_id = cursor.lastrowid  # Get the auto-generated show ID
```
**Purpose:** Creates a show record in database
**Result:** New row in SHOWS table with unique show_id

**Example Record:**
```
show_id: 15
movie_id: 1 (Baaghi 4)
theatre_id: 1 (City Gold Cinema)
show_date: 2026-02-08
show_time: 10:00:00
```

---

```python
                # Define seat prices by row
                seat_prices = {
                    'A': 150, 'B': 150, 'C': 150,  # Front rows - cheapest
                    'D': 200, 'E': 200, 'F': 200,  # Middle rows - regular
                    'G': 250, 'H': 250,             # Back rows - premium
                    'I': 300, 'J': 300              # VIP rows - most expensive
                }
```
**Purpose:** Defines pricing tiers based on seat location
**Logic:** Better seats (back rows) cost more (like real cinemas)

---

```python
                # Generate 120 seats for this show
                for row in seat_prices.keys():  # A, B, C, D, E, F, G, H, I, J
                    for seat_num in range(1, 13):  # 1 to 12
                        seat_label = f"{row}{seat_num}"  # A1, A2, ..., J12
                        price = seat_prices[row]
                        
                        # Randomly pre-book 20% of seats
                        is_booked = random.random() < 0.2
                        
                        cursor.execute("""
                            INSERT INTO seats (show_id, seat_label, price, is_booked)
                            VALUES (%s, %s, %s, %s)
                        """, (show_id, seat_label, price, is_booked))
```
**Purpose:** Creates 120 seat records for this specific show
**Logic:**
- 10 rows (A to J)
- 12 seats per row (1 to 12)
- Total: 10 × 12 = 120 seats
- Each seat has: seat label, price, booking status

**Example Seat Records for show_id=15:**
```
Seat 1:  show_id=15, seat_label='A1',  price=150, is_booked=0 (available)
Seat 2:  show_id=15, seat_label='A2',  price=150, is_booked=0 (available)
Seat 3:  show_id=15, seat_label='A3',  price=150, is_booked=1 (pre-booked)
...
Seat 120: show_id=15, seat_label='J12', price=300, is_booked=0 (available)
```

---

```python
conn.commit()  # Save all changes to database
```
**Purpose:** Commits all INSERT statements to database
**Important:** Without this, no data is actually saved!

---

## 📅 DATE RANGE BREAKDOWN

### Today's Date: **February 08, 2026**

The script generates shows for **7 consecutive days**:

```
┌────────────────────────────────────────────────────────────────┐
│  DAY 0: February 08, 2026 (TODAY) - Saturday                  │
│  DAY 1: February 09, 2026 - Sunday                            │
│  DAY 2: February 10, 2026 - Monday                            │
│  DAY 3: February 11, 2026 - Tuesday                           │
│  DAY 4: February 12, 2026 - Wednesday                         │
│  DAY 5: February 13, 2026 - Thursday                          │
│  DAY 6: February 14, 2026 - Friday (Valentine's Day)          │
└────────────────────────────────────────────────────────────────┘

Why 7 days?
  → Industry standard: Movie booking sites typically show 1 week advance
  → Users can book tickets for shows happening in the next week
  → After each day passes, you'd need to run the script again to add more dates
```

---

## 🎯 WHY WE NEED TO SEED SHOWS

### Problem Without Shows:
```
User Journey:
  1. User clicks "Book Now" on Baaghi 4
  2. Opens /shows/baaghi-4 page
  3. Backend queries: SELECT * FROM shows WHERE movie_id = 1
  4. Result: 0 rows
  5. Frontend displays: "No shows available"
  6. User CANNOT book tickets ❌
```

### Solution With Shows:
```
User Journey:
  1. User clicks "Book Now" on Baaghi 4
  2. Opens /shows/baaghi-4 page
  3. Backend queries: SELECT * FROM shows WHERE movie_id = 1
  4. Result: 42 shows found (7 days × 6 shows per day)
  5. Frontend displays:
     - 4 theatres
     - Multiple showtimes per theatre
     - Available seat counts
  6. User clicks a showtime
  7. Opens /seats/15 page
  8. Shows 120 seats with prices
  9. User selects seats → Proceeds to payment ✅
```

---

## 📊 FINAL STATISTICS

After running `seed_shows.py`, you will have:

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE STATISTICS                        │
├─────────────────────────────────────────────────────────────────┤
│  📽️  MOVIES:     12 movies                                      │
│  🏛️  THEATRES:   4 theatres (all in Ahmedabad)                 │
│  🎬 SHOWS:      756 shows (EXACT)                               │
│      → 7 days                                                   │
│      → 108 shows per day (12 movies × 3 theatres × 3 times)    │
│      → 9 shows per movie per day (3 theatres × 3 times)        │
│      → 63 shows per movie total (7 days × 9 shows/day)         │
│  💺 SEATS:      90,720 seats (EXACT)                            │
│      → 120 seats per show                                       │
│      → ~96 available per show (80%)                             │
│      → ~24 pre-booked per show (20%)                            │
└─────────────────────────────────────────────────────────────────┘

PRICE DISTRIBUTION PER SHOW:
  ₹150 seats: 36 seats (30%)
  ₹200 seats: 36 seats (30%)
  ₹250 seats: 24 seats (20%)
  ₹300 seats: 24 seats (20%)

AVERAGE REVENUE PER FULLY BOOKED SHOW:
  = (36 × ₹150) + (36 × ₹200) + (24 × ₹250) + (24 × ₹300)
  = ₹5,400 + ₹7,200 + ₹6,000 + ₹7,200
  = ₹25,800 per show
```

---

## 🚀 HOW TO RUN seed_shows.py

### Prerequisites:
1. ✅ MySQL running on localhost
2. ✅ Database 'bookora' exists
3. ✅ All tables created (using database_schema.sql)
4. ✅ Movies table populated (12 movies)
5. ✅ Theatres table populated (4 theatres)
6. ✅ Python installed with mysql-connector-python

### Command:
```bash
python seed_shows.py
```

### Expected Output:
```
📽️  Movies: 12
🏛️  Theatres: 4
🗑️  Cleared existing shows and seats

✅ Generated 756 shows
✅ Generated 90720 seats

📊 Shows per movie (sample):
   - Baaghi 4: 63 shows (EXACT - every movie gets same count)
   - Border 2: 63 shows
   - Chhaava: 63 shows
   - Dhurandar: 63 shows
   - Dil Dosti Aur Dogs: 63 shows

✅ Show generation completed!
```

### Time to Execute:
- **~15-30 seconds** (depends on your computer speed)
- Inserts 91,476 database records (756 shows + 90,720 seats)

---

## 🔄 COMPLETE BOOKING FLOW (AFTER SEEDING)

```
┌─────────────────────────────────────────────────────────────────┐
│                  COMPLETE USER JOURNEY                          │
└─────────────────────────────────────────────────────────────────┘

STEP 1: BROWSE MOVIES
  → User visits homepage: bookora.com
  → Sees 12 movies in "Now Showing"
  → Clicks on "Baaghi 4" movie card
  
STEP 2: VIEW MOVIE DETAILS
  → Opens: /movie-details/baaghi-4
  → Sees: Poster, trailer, description, cast
  → Clicks: [Book Now] button
  
STEP 3: SELECT DATE & SHOWTIME
  → Opens: /shows/baaghi-4
  → Frontend loads:
      - Movie title, duration, rating
      - 7 date buttons (Feb 08 - Feb 14)
  → User clicks: "FEB 08" (today)
  → JavaScript calls: GET /api/shows?slug=baaghi-4&date=2026-02-08
  → Backend returns:
      {
        "theatres": [
          {
            "name": "City Gold Cinema",
            "shows": [
              {"show_id": 15, "time": "10:00", "available_seats": 96},
              {"show_id": 16, "time": "16:00", "available_seats": 89},
              {"show_id": 17, "time": "22:00", "available_seats": 105}
            ]
          },
          { /* PVR Acropolis */ },
          { /* Rajhans Cinemas */ }
        ]
      }
  → Frontend displays theatres with showtimes
  → User clicks: [10:00] at City Gold Cinema
  
STEP 4: SELECT SEATS
  → Opens: /seats/15
  → Frontend calls: GET /api/seats?show_id=15
  → Backend returns:
      {
        "seats": [
          {"id": 1, "label": "A1", "price": 150, "is_booked": false},
          {"id": 2, "label": "A2", "price": 150, "is_booked": false},
          {"id": 3, "label": "A3", "price": 150, "is_booked": true},  ← Booked
          ...
          {"id": 120, "label": "J12", "price": 300, "is_booked": false}
        ]
      }
  → Frontend displays seat layout:
      - Green seats = Available
      - Red seats = Booked
      - Blue seats = User selected
  → User selects: D5, D6, D7 (3 seats @ ₹200 each)
  → Total: ₹600
  → User clicks: [Proceed to Pay]
  
STEP 5: AUTHENTICATION (if not logged in)
  → Sign-in modal appears
  → User logs in with phone/email
  
STEP 6: PAYMENT & CONFIRMATION
  → Payment gateway integration (future)
  → Backend creates booking:
      INSERT INTO bookings (user_id, show_id, seat_ids, total_price)
      VALUES (123, 15, '[45, 46, 47]', 600.00)
  → Backend updates seats:
      UPDATE seats SET is_booked = 1, booked_by = 123
      WHERE id IN (45, 46, 47)
  → Success! Booking confirmed
  → User receives:
      - Booking ID
      - Ticket details
      - QR code (future)
```

---

## 🎓 KEY CONCEPTS EXPLAINED

### 1. Why Separate Tables for Shows and Seats?

**Bad Design (Single Table):**
```
bookings table with:
  - movie_id
  - theatre_id
  - date
  - time
  - seat_label
  - user_id

Problem: Difficult to query "How many seats available for a show?"
```

**Good Design (Normalized):**
```
shows table:
  - Links movie + theatre + date + time
  - One show = one unique screening

seats table:
  - Links to show_id
  - 120 seats per show
  - Each seat has price and booking status
  
Benefit: Easy to query seat availability per show
```

### 2. Why Pre-book 20% of Seats?

**Purpose:** Makes the booking experience realistic
**Logic:** In real life, some seats are already booked when you browse

**User Experience:**
- User sees: "96 seats available" (not all 120)
- Creates urgency: "Book before seats fill up!"
- Realistic occupancy patterns

### 3. Why Randomize Theatres and Showtimes?

**Realistic Distribution:**
- Not every movie shows in every theatre
- Not every theatre runs all 5 showtimes
- Mimics real-world scheduling

**Example:**
- Blockbuster (Baaghi 4): 3 theatres × 3 showtimes = 9 shows/day
- Art film (Dil Dosti): 2 theatres × 2 showtimes = 4 shows/day

### 4. Why 7 Days Only?

**Industry Standard:**
- Most booking platforms: 1 week advance booking
- Balance between user convenience and theatre scheduling

**Technical Reason:**
- Database size management
- Prevents over-population of future dates

**Future Enhancement:**
- Auto-cleanup: Delete past shows
- Auto-generation: Add new shows daily

---

## 🔍 DEBUGGING - HOW TO VERIFY DATA

After running seed_shows.py, verify with these SQL queries:

```sql
-- Check total shows
SELECT COUNT(*) FROM shows;
-- Expected: ~525

-- Check total seats
SELECT COUNT(*) FROM seats;
-- Expected: ~63,000

-- Check shows for specific movie on specific date
SELECT 
  s.id, 
  s.show_time, 
  t.name AS theatre,
  COUNT(st.id) AS total_seats,
  SUM(CASE WHEN st.is_booked = 0 THEN 1 ELSE 0 END) AS available_seats
FROM shows s
JOIN theatres t ON s.theatre_id = t.id
LEFT JOIN seats st ON st.show_id = s.id
WHERE s.movie_id = 1 
  AND s.show_date = '2026-02-08'
GROUP BY s.id
ORDER BY t.name, s.show_time;
-- Expected: 6-9 shows for Baaghi 4 on Feb 08

-- Check seat distribution for a specific show
SELECT 
  price,
  COUNT(*) AS seat_count,
  SUM(CASE WHEN is_booked = 0 THEN 1 ELSE 0 END) AS available,
  SUM(CASE WHEN is_booked = 1 THEN 1 ELSE 0 END) AS booked
FROM seats
WHERE show_id = 1
GROUP BY price
ORDER BY price;
-- Expected: 4 price tiers with ~20% occupancy each
```

---

## ✅ SUMMARY

1. **Current Problem:** Database has movies and theatres, but NO SHOWS or SEATS
2. **Why It Matters:** Users can't book tickets without show schedules
3. **Solution:** Run `seed_shows.py` to populate shows and seats
4. **What It Does:**
   - Generates ~525 shows across 7 days
   - Creates 120 seats per show (~63,000 total seats)
   - Pre-books 20% for realistic availability
   - Uses 4 price tiers (₹150, ₹200, ₹250, ₹300)
5. **Result:** Complete booking flow from movie selection to seat reservation

---

## 🎬 NEXT STEPS (AFTER READING)

Once you understand this flow:
1. ✅ Review this document thoroughly
2. ✅ Understand each calculation
3. ✅ Ready to run seed_shows.py
4. ✅ Verify data with SQL queries
5. ✅ Test the complete booking flow

**DO NOT RUN THE SCRIPT YET** - First understand everything, then we'll proceed!

---

**Questions to ask yourself before proceeding:**
- ✓ Do I understand why we need shows and seats tables?
- ✓ Do I understand the 7-day date range calculation?
- ✓ Do I understand the 120 seats per show logic?
- ✓ Do I understand the price tier structure?
- ✓ Do I understand the complete user booking flow?

If YES to all → You're ready to proceed with seeding! 🎉
