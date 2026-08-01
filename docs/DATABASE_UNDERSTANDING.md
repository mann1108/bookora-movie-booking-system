# 📊 BOOKORA DATABASE - COMPLETE UNDERSTANDING

## 🎯 Table of Contents
1. [Database Overview](#database-overview)
2. [Table Structures & Relationships](#table-structures--relationships)
3. [How Booking System Works (No Separate Booked Seats Table)](#how-booking-system-works)
4. [User Journey & Database Changes](#user-journey--database-changes)
5. [Important SQL Queries Used](#important-sql-queries-used)

---

## 📚 Database Overview

**Database Name:** `bookora`  
**Database Type:** MySQL  
**Total Tables:** 8

### Tables List:
1. **`movies`** - Stores all movie information
2. **`theatres`** - Stores theatre/cinema hall details
3. **`shows`** - Stores show timings (movie + theatre + date/time)
4. **`seats`** - Stores ALL seats for ALL shows (🔑 **This handles bookings!**)
5. **`users`** - Stores registered users
6. **`otp_verification`** - Temporary OTP storage for authentication
7. **`saved_movies`** - Junction table (users ↔ movies wishlist)
8. **`bookings`** - Stores booking records with seat references

---

## 🗂️ Table Structures & Relationships

### 1️⃣ **MOVIES TABLE**

```sql
CREATE TABLE movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(100) UNIQUE NOT NULL,        -- URL-friendly name (e.g., "sikandar")
    title VARCHAR(200) NOT NULL,              -- Movie name (e.g., "Sikandar")
    language VARCHAR(100),                    -- "Hindi", "English", etc.
    duration INT,                             -- Minutes (e.g., 150)
    certification VARCHAR(10),                -- "U/A", "A", "U"
    genre VARCHAR(200),                       -- "Action, Drama"
    release_date DATE,                        
    poster_url VARCHAR(500),                  -- Path to poster image
    banner_url VARCHAR(500),                  -- Path to banner image
    description TEXT,                         -- Movie synopsis
    director VARCHAR(200),
    cast TEXT,                                -- JSON array of actors
    trailer_url VARCHAR(500),                 -- YouTube link
    status VARCHAR(20) DEFAULT 'now_showing', -- "now_showing" or "coming_soon"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Primary Key:** `id`  
**Unique Keys:** `slug`  
**Indexes:** `slug`, `status`  

**Relationships:**
- 🔗 Referenced by `shows.movie_id` (One movie → Many shows)
- 🔗 Referenced by `saved_movies.movie_id` (Many-to-Many with users)

**Example Data:**
| id | slug | title | language | duration | certification |
|----|------|-------|----------|----------|---------------|
| 1 | sikandar | Sikandar | Hindi | 155 | U/A |
| 2 | housefull-5 | Housefull 5 | Hindi | 135 | U/A |

---

### 2️⃣ **THEATRES TABLE**

```sql
CREATE TABLE theatres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,               -- "City Gold Cinema"
    city VARCHAR(100) NOT NULL,               -- "Ahmedabad"
    address VARCHAR(500),                     -- "CG Road, Ahmedabad"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Primary Key:** `id`  
**Indexes:** `city`  

**Relationships:**
- 🔗 Referenced by `shows.theatre_id` (One theatre → Many shows)

**Pre-Seeded Data (4 theatres in Ahmedabad):**
| id | name | city | address |
|----|------|------|---------|
| 1 | City Gold Cinema | Ahmedabad | CG Road, Ahmedabad |
| 2 | Rajhans Cinemas | Ahmedabad | Vastrapur, Ahmedabad |
| 3 | PVR Acropolis | Ahmedabad | Thaltej, Ahmedabad |
| 4 | INOX Ahmedabad | Ahmedabad | SG Highway, Ahmedabad |

---

### 3️⃣ **SHOWS TABLE**

```sql
CREATE TABLE shows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,                    -- FK → movies.id
    theatre_id INT NOT NULL,                  -- FK → theatres.id
    show_date DATE NOT NULL,                  -- "2026-02-15"
    show_time TIME NOT NULL,                  -- "09:30:00", "13:30:00", etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (theatre_id) REFERENCES theatres(id) ON DELETE CASCADE
);
```

**Primary Key:** `id`  
**Foreign Keys:** 
- `movie_id` → `movies.id`
- `theatre_id` → `theatres.id`

**Indexes:** `(movie_id, show_date)`, `(theatre_id, show_date)`

**Relationships:**
- 🔗 Belongs to ONE movie
- 🔗 Belongs to ONE theatre
- 🔗 Referenced by `seats.show_id` (One show → Many seats)
- 🔗 Referenced by `bookings.show_id` (One show → Many bookings)

**Example Data:**
| id | movie_id | theatre_id | show_date | show_time |
|----|----------|------------|-----------|-----------|
| 1 | 1 | 1 | 2026-02-15 | 09:30:00 |
| 2 | 1 | 1 | 2026-02-15 | 13:30:00 |
| 3 | 1 | 2 | 2026-02-15 | 10:00:00 |

**How Many Shows Exist?**
- 12 movies × 4 theatres × 7 days × ~1.5 shows/day = **~525 shows**

---

### 4️⃣ **SEATS TABLE** ⭐ (MOST IMPORTANT!)

```sql
CREATE TABLE seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    show_id INT NOT NULL,                     -- FK → shows.id
    seat_label VARCHAR(10) NOT NULL,          -- "A1", "A2", "B5", etc.
    price DECIMAL(10,2) NOT NULL,             -- 150.00, 200.00, 250.00
    is_booked BOOLEAN DEFAULT FALSE,          -- ✅ THIS IS THE KEY FIELD!
    booked_by INT NULL,                       -- FK → users.id (NULL if not booked)
    booked_at TIMESTAMP NULL,                 -- Booking timestamp
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE,
    UNIQUE KEY (show_id, seat_label)          -- Prevents duplicate seats per show
);
```

**Primary Key:** `id`  
**Foreign Keys:** `show_id` → `shows.id`  
**Unique Constraint:** `(show_id, seat_label)` - Each show has unique seat labels

**Indexes:** `show_id`, `is_booked`

**🔑 KEY CONCEPT - NO SEPARATE BOOKED SEATS TABLE!**

Instead of having a separate `booked_seats` table, this single table handles:
- ✅ All available seats (when `is_booked = FALSE`)
- ✅ All booked seats (when `is_booked = TRUE`)
- ✅ Who booked them (`booked_by` field)
- ✅ When they were booked (`booked_at` field)

**Seat Pricing Tiers:**
- **Premium Seats (A, B rows):** ₹250
- **Normal Seats (C, D, E, F rows):** ₹200  
- **Economy Seats (G, H rows):** ₹150

**Seat Layout Per Show:**
- 8 rows (A to H)
- 15 seats per row
- **Total: 120 seats per show**

**Example Data:**
| id | show_id | seat_label | price | is_booked | booked_by | booked_at |
|----|---------|------------|-------|-----------|-----------|-----------|
| 1 | 1 | A1 | 250.00 | **FALSE** | NULL | NULL |
| 2 | 1 | A2 | 250.00 | **TRUE** | 5 | 2026-02-10 14:30:00 |
| 3 | 1 | B5 | 250.00 | **FALSE** | NULL | NULL |
| 4 | 1 | C10 | 200.00 | **TRUE** | 7 | 2026-02-10 15:45:00 |

**Total Seats in Database:**
- 525 shows × 120 seats = **~63,000 seat records!**

---

### 5️⃣ **USERS TABLE**

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),                        -- User's full name
    email VARCHAR(100) UNIQUE,                -- Email (can be NULL if phone login)
    phone VARCHAR(20) UNIQUE,                 -- 10-digit phone (can be NULL if email login)
    primary_contact_type ENUM('email', 'phone') NOT NULL,  -- Which was used for OTP
    role VARCHAR(20) DEFAULT 'user',          -- Future: 'admin', 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
```

**Primary Key:** `id`  
**Unique Keys:** `email`, `phone`  
**Constraints:** At least one of `email` OR `phone` must exist

**Relationships:**
- 🔗 Referenced by `saved_movies.user_id`
- 🔗 Referenced by `bookings.user_id`
- 🔗 Referenced by `seats.booked_by`

**Example Data:**
| id | name | email | phone | primary_contact_type |
|----|------|-------|-------|---------------------|
| 1 | Ravish Kumar | ravish@gmail.com | 9876543210 | email |
| 2 | Priya Sharma | NULL | 9123456789 | phone |
| 3 | Amit Patel | amit@gmail.com | 8765432109 | email |

**Phone Number Format:**
- Stored as **10-digit** format (no `+91` prefix)
- Example: `9876543210` (not `+919876543210`)
- Normalized automatically by backend

---

### 6️⃣ **OTP_VERIFICATION TABLE** (Temporary Storage)

```sql
CREATE TABLE otp_verification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(100) NOT NULL,         -- Email or 10-digit phone
    otp VARCHAR(6) NOT NULL,                  -- 6-digit OTP (e.g., "582374")
    expires_at DATETIME NOT NULL,             -- Valid for 10 minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Primary Key:** `id`  
**Indexes:** `identifier`, `expires_at`

**Lifecycle:**
1. ✅ OTP created → Inserted into table
2. ✅ User enters OTP → Validated (must not be expired)
3. ✅ OTP verified → **Deleted immediately** from table
4. ⏰ Expired OTPs remain until cleanup

**Example Data:**
| id | identifier | otp | expires_at | created_at |
|----|------------|-----|------------|------------|
| 1 | ravish@gmail.com | 582374 | 2026-02-10 15:25:00 | 2026-02-10 15:15:00 |
| 2 | 9876543210 | 193847 | 2026-02-10 15:30:00 | 2026-02-10 15:20:00 |

**Important:**
- OTPs are **automatically deleted** after verification
- Expired OTPs (>10 minutes old) are ignored by verification logic

---

### 7️⃣ **SAVED_MOVIES TABLE** (Junction Table)

```sql
CREATE TABLE saved_movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,                     -- FK → users.id
    movie_id INT NOT NULL,                    -- FK → movies.id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, movie_id)            -- Prevents duplicate saves
);
```

**Primary Key:** `id`  
**Foreign Keys:** 
- `user_id` → `users.id`
- `movie_id` → `movies.id`

**Unique Constraint:** `(user_id, movie_id)` - User can't save same movie twice

**Purpose:** Wishlist / Favorite movies feature

**Example Data:**
| id | user_id | movie_id | created_at |
|----|---------|----------|------------|
| 1 | 5 | 1 | 2026-02-10 10:30:00 |
| 2 | 5 | 3 | 2026-02-10 11:45:00 |
| 3 | 7 | 1 | 2026-02-10 12:00:00 |

**Meaning:** User 5 saved movies 1 and 3, User 7 saved movie 1

---

### 8️⃣ **BOOKINGS TABLE**

```sql
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,                     -- FK → users.id
    show_id INT NOT NULL,                     -- FK → shows.id
    seat_ids JSON NOT NULL,                   -- Array of seat IDs (e.g., [23, 24, 25])
    total_price DECIMAL(10,2) NOT NULL,       -- Total amount (e.g., 750.00)
    status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
);
```

**Primary Key:** `id`  
**Foreign Keys:** 
- `user_id` → `users.id`
- `show_id` → `shows.id`

**Indexes:** `user_id`, `show_id`, `status`

**JSON Field Explanation:**
- `seat_ids` stores array of seat IDs: `[23, 24, 25]`
- To get seat details, backend queries: `SELECT * FROM seats WHERE id IN (23, 24, 25)`

**Example Data:**
| id | user_id | show_id | seat_ids | total_price | status | booking_date |
|----|---------|---------|----------|-------------|--------|--------------|
| 1 | 5 | 1 | `[23, 24, 25]` | 750.00 | CONFIRMED | 2026-02-10 14:30:00 |
| 2 | 7 | 3 | `[45, 46]` | 400.00 | CANCELLED | 2026-02-10 15:45:00 |

**Relationship with SEATS table:**
- Booking ID 1 references seats with IDs: 23, 24, 25
- Those same seats in `seats` table will have:
  - `is_booked = TRUE`
  - `booked_by = 5` (user_id)

---

## 🎬 How Booking System Works

### ❓ Why No Separate `booked_seats` Table?

**Traditional Approach (2 tables):**
```
seats: [id, show_id, seat_label, price]  ← All seats
booked_seats: [id, seat_id, user_id, booking_id]  ← Only booked seats
```

**Bookora Approach (1 table):**
```
seats: [id, show_id, seat_label, price, is_booked, booked_by, booked_at]
```

**✅ Benefits:**
1. **Simpler queries** - No JOINs needed to check availability
2. **Faster lookups** - Single table with indexed `is_booked` field
3. **Atomic updates** - Booking = single UPDATE query
4. **Less storage** - No duplicate seat references

---

### 🔄 Booking Flow Step-by-Step

#### **Step 1: User Selects Show**
```sql
-- Get available seats for show_id = 1
SELECT id, seat_label, price, is_booked 
FROM seats 
WHERE show_id = 1 AND is_booked = FALSE
ORDER BY seat_label;
```

**Result:**
| id | seat_label | price | is_booked |
|----|------------|-------|-----------|
| 1 | A1 | 250.00 | FALSE |
| 3 | A3 | 250.00 | FALSE |
| 5 | B1 | 250.00 | FALSE |

---

#### **Step 2: User Selects Seats (e.g., A1, A3, B1)**
Frontend sends to backend:
```json
{
  "user_id": 5,
  "show_id": 1,
  "seat_ids": [1, 3, 5],
  "total_price": 750.00
}
```

---

#### **Step 3: Backend Verifies Seats Are Available**
```sql
SELECT id, is_booked 
FROM seats 
WHERE id IN (1, 3, 5) AND show_id = 1;
```

**Check:**
- ✅ All seats exist?
- ✅ All `is_booked = FALSE`?
- ✅ If yes → Proceed
- ❌ If no → Return error "Seats already booked"

---

#### **Step 4: Mark Seats as Booked**
```sql
UPDATE seats 
SET is_booked = TRUE, 
    booked_by = 5,
    booked_at = '2026-02-10 14:30:00'
WHERE id IN (1, 3, 5);
```

**After Update:**
| id | seat_label | price | is_booked | booked_by | booked_at |
|----|------------|-------|-----------|-----------|-----------|
| 1 | A1 | 250.00 | **TRUE** | **5** | 2026-02-10 14:30:00 |
| 3 | A3 | 250.00 | **TRUE** | **5** | 2026-02-10 14:30:00 |
| 5 | B1 | 250.00 | **TRUE** | **5** | 2026-02-10 14:30:00 |

---

#### **Step 5: Create Booking Record**
```sql
INSERT INTO bookings (user_id, show_id, seat_ids, total_price, status)
VALUES (5, 1, '[1,3,5]', 750.00, 'CONFIRMED');
```

**Booking Created:**
| id | user_id | show_id | seat_ids | total_price | status |
|----|---------|---------|----------|-------------|--------|
| 1 | 5 | 1 | `[1,3,5]` | 750.00 | CONFIRMED |

---

#### **Step 6: What Happens on Cancellation?**

**User cancels booking:**
```sql
-- 1. Update booking status
UPDATE bookings 
SET status = 'CANCELLED' 
WHERE id = 1;

-- 2. Release seats (set back to available)
UPDATE seats 
SET is_booked = FALSE, 
    booked_by = NULL,
    booked_at = NULL
WHERE id IN (1, 3, 5);
```

**After Cancellation:**
| id | seat_label | is_booked | booked_by |
|----|------------|-----------|-----------|
| 1 | A1 | **FALSE** | **NULL** |
| 3 | A3 | **FALSE** | **NULL** |
| 5 | B1 | **FALSE** | **NULL** |

**Booking Record:**
| id | status |
|----|--------|
| 1 | **CANCELLED** |

**⚠️ Important:** Cancelled bookings remain in `bookings` table for history (status = 'CANCELLED')

---

## 👤 User Journey & Database Changes

### 🔐 **Journey 1: User Registration (Email OTP)**

#### **Step 1: User Enters Email**
User types: `ravish@gmail.com` and clicks "Send OTP"

**Backend Action:**
```sql
-- Generate OTP: 582374
-- Calculate expiry: 10 minutes from now

INSERT INTO otp_verification (identifier, otp, expires_at)
VALUES ('ravish@gmail.com', '582374', '2026-02-10 15:25:00');
```

**Database State:**
| Table | Action | Data |
|-------|--------|------|
| `otp_verification` | ➕ INSERT | identifier='ravish@gmail.com', otp='582374' |

**Email Sent:**
```
Subject: Your Bookora Verification Code
Body: Your OTP is: 582374 (Valid for 10 minutes)
```

---

#### **Step 2: User Enters OTP**
User types: `582374` and clicks "Verify"

**Backend Action:**
```sql
-- Verify OTP
SELECT * FROM otp_verification 
WHERE identifier = 'ravish@gmail.com' 
  AND otp = '582374' 
  AND expires_at > NOW();
```

**If OTP valid:**
```sql
-- Delete used OTP
DELETE FROM otp_verification WHERE identifier = 'ravish@gmail.com';

-- Check if user exists
SELECT * FROM users WHERE email = 'ravish@gmail.com';
```

**Database State:**
| Table | Action | Data |
|-------|--------|------|
| `otp_verification` | ❌ DELETE | OTP removed (used successfully) |
| `users` | 🔍 CHECK | User NOT found → Redirect to profile completion |

---

#### **Step 3: User Completes Profile**
User enters:
- Name: "Ravish Kumar"
- Mobile: "+91 9876543210" (optional)

**Backend Action:**
```sql
-- Normalize phone: +919876543210 → 9876543210

INSERT INTO users (name, email, phone, primary_contact_type)
VALUES ('Ravish Kumar', 'ravish@gmail.com', '9876543210', 'email');
```

**Database State:**
| Table | Action | Data |
|-------|--------|------|
| `users` | ➕ INSERT | id=5, name='Ravish Kumar', email='ravish@gmail.com', phone='9876543210' |

**User is now registered! ✅**

---

### 📱 **Journey 2: User Registration (Phone OTP)**

#### **Step 1: User Enters Phone**
User types: `+91 9123456789` and clicks "Send OTP"

**Backend Action:**
```sql
-- Normalize phone: +919123456789 → 9123456789

INSERT INTO otp_verification (identifier, otp, expires_at)
VALUES ('9123456789', '193847', '2026-02-10 15:30:00');
```

**SMS Sent** (if configured) or **Console Output:**
```
OTP for 9123456789: 193847
```

---

#### **Step 2-3: Verification & Profile**
Same as email flow, except:
```sql
INSERT INTO users (name, email, phone, primary_contact_type)
VALUES ('Priya Sharma', NULL, '9123456789', 'phone');
```

**Database State:**
| id | name | email | phone | primary_contact_type |
|----|------|-------|-------|---------------------|
| 6 | Priya Sharma | **NULL** | 9123456789 | phone |

**✅ Phone-only user created!**

---

### 💾 **Journey 3: User Saves a Movie**

User clicks "❤️ Save" on "Sikandar" movie page

**Backend Action:**
```sql
-- User ID: 5, Movie ID: 1

INSERT INTO saved_movies (user_id, movie_id)
VALUES (5, 1);
```

**Database State:**
| Table | Action | Data |
|-------|--------|------|
| `saved_movies` | ➕ INSERT | user_id=5, movie_id=1, created_at='2026-02-10 10:30:00' |

**What if user clicks "Save" again on same movie?**
```sql
-- UNIQUE constraint (user_id, movie_id) prevents duplicate
-- MySQL error → Backend ignores silently
-- Result: Nothing happens (already saved)
```

---

### 🎫 **Journey 4: User Books Movie Tickets**

#### **Step 1: User Selects Movie**
User clicks "Book Now" on "Sikandar" (movie_id = 1)

**Backend Action:**
```sql
SELECT * FROM movies WHERE slug = 'sikandar';
```

**Result:** Movie details displayed

---

#### **Step 2: User Selects Date**
User clicks "Feb 15, 2026"

**Backend Action:**
```sql
SELECT 
  s.id as show_id,
  s.show_time,
  t.name as theatre_name,
  COUNT(CASE WHEN seats.is_booked = 0 THEN 1 END) as available_seats
FROM shows s
JOIN theatres t ON s.theatre_id = t.id
LEFT JOIN seats ON seats.show_id = s.id
WHERE s.movie_id = 1 AND s.show_date = '2026-02-15'
GROUP BY s.id
ORDER BY t.name, s.show_time;
```

**Result:** List of shows with availability

| Theatre | Time | Available Seats |
|---------|------|----------------|
| City Gold Cinema | 09:30 | 118/120 |
| City Gold Cinema | 13:30 | 95/120 |
| Rajhans Cinemas | 10:00 | 120/120 |

---

#### **Step 3: User Selects Show**
User clicks "09:30 AM" show at City Gold Cinema (show_id = 1)

**Backend Action:**
```sql
SELECT id, seat_label, price, is_booked
FROM seats
WHERE show_id = 1
ORDER BY seat_label;
```

**Result:** Seat layout displayed (120 seats)

| Seat | Price | Status |
|------|-------|--------|
| A1 | ₹250 | Available (is_booked=FALSE) |
| A2 | ₹250 | Booked (is_booked=TRUE) |
| A3 | ₹250 | Available |
| B1 | ₹250 | Available |

---

#### **Step 4: User Selects Seats**
User selects: **A1, A3, B1** (3 seats)

Frontend calculates:
- Total: ₹250 × 3 = **₹750**
- Seat IDs: `[1, 3, 5]`

---

#### **Step 5: User Clicks "Pay & Confirm"**

**Backend Action (Transaction):**

```sql
-- 1. Verify seats are still available
SELECT id, is_booked 
FROM seats 
WHERE id IN (1, 3, 5) AND show_id = 1;
-- Result: All is_booked = FALSE ✅

-- 2. Mark seats as booked
UPDATE seats 
SET is_booked = TRUE, 
    booked_by = 5,
    booked_at = NOW()
WHERE id IN (1, 3, 5);

-- 3. Create booking record
INSERT INTO bookings (user_id, show_id, seat_ids, total_price, status)
VALUES (5, 1, '[1,3,5]', 750.00, 'CONFIRMED');
```

**Database Changes:**

| Table | Action | Details |
|-------|--------|---------|
| `seats` (id=1) | 🔄 UPDATE | is_booked=TRUE, booked_by=5 |
| `seats` (id=3) | 🔄 UPDATE | is_booked=TRUE, booked_by=5 |
| `seats` (id=5) | 🔄 UPDATE | is_booked=TRUE, booked_by=5 |
| `bookings` | ➕ INSERT | id=1, user_id=5, show_id=1, seat_ids=[1,3,5], total_price=750 |

**✅ Booking Confirmed!**

---

#### **Step 6: What Database Looks Like Now**

**`seats` table (partial):**
| id | show_id | seat_label | price | is_booked | booked_by | booked_at |
|----|---------|------------|-------|-----------|-----------|-----------|
| 1 | 1 | A1 | 250.00 | **TRUE** | **5** | 2026-02-10 14:30:00 |
| 2 | 1 | A2 | 250.00 | TRUE | 3 | 2026-02-10 12:00:00 |
| 3 | 1 | A3 | 250.00 | **TRUE** | **5** | 2026-02-10 14:30:00 |
| 4 | 1 | A4 | 250.00 | FALSE | NULL | NULL |
| 5 | 1 | B1 | 250.00 | **TRUE** | **5** | 2026-02-10 14:30:00 |

**`bookings` table:**
| id | user_id | show_id | seat_ids | total_price | status | booking_date |
|----|---------|---------|----------|-------------|--------|--------------|
| 1 | 5 | 1 | `[1,3,5]` | 750.00 | CONFIRMED | 2026-02-10 14:30:00 |

---

### 🔄 **Journey 5: User Views "My Bookings"**

User clicks "My Bookings" menu

**Backend Action:**
```sql
SELECT 
  b.id as booking_id,
  b.seat_ids,
  b.total_price,
  b.status,
  b.booking_date,
  s.show_date,
  s.show_time,
  m.title as movie_title,
  m.poster_url,
  t.name as theatre_name
FROM bookings b
JOIN shows s ON b.show_id = s.id
JOIN movies m ON s.movie_id = m.id
JOIN theatres t ON s.theatre_id = t.id
WHERE b.user_id = 5
ORDER BY b.booking_date DESC;
```

**Result:**
| Movie | Theatre | Date | Time | Seats | Price | Status |
|-------|---------|------|------|-------|-------|--------|
| Sikandar | City Gold Cinema | Feb 15 | 09:30 | A1, A3, B1 | ₹750 | CONFIRMED |

**How are seat labels retrieved?**
```sql
-- Backend extracts seat_ids: [1, 3, 5]
SELECT seat_label FROM seats WHERE id IN (1, 3, 5);
-- Result: A1, A3, B1
```

---

### ❌ **Journey 6: User Cancels Booking**

User clicks "Cancel" on booking ID = 1

**Backend Action:**
```sql
-- 1. Verify booking belongs to user and is confirmed
SELECT * FROM bookings WHERE id = 1 AND user_id = 5 AND status = 'CONFIRMED';

-- 2. Update booking status
UPDATE bookings SET status = 'CANCELLED' WHERE id = 1;

-- 3. Extract seat_ids from booking: [1, 3, 5]
-- 4. Release seats
UPDATE seats 
SET is_booked = FALSE, 
    booked_by = NULL,
    booked_at = NULL
WHERE id IN (1, 3, 5);
```

**Database Changes:**

| Table | Before | After |
|-------|--------|-------|
| `bookings` (id=1) | status=CONFIRMED | status=**CANCELLED** |
| `seats` (id=1) | is_booked=TRUE, booked_by=5 | is_booked=**FALSE**, booked_by=**NULL** |
| `seats` (id=3) | is_booked=TRUE, booked_by=5 | is_booked=**FALSE**, booked_by=**NULL** |
| `seats` (id=5) | is_booked=TRUE, booked_by=5 | is_booked=**FALSE**, booked_by=**NULL** |

**Result:**
- ✅ Booking status changed to CANCELLED (kept for history)
- ✅ Seats A1, A3, B1 are now available for other users

---

## 📊 Important SQL Queries Used

### 1. Get All Available Seats for a Show
```sql
SELECT id, seat_label, price
FROM seats
WHERE show_id = 1 AND is_booked = FALSE
ORDER BY seat_label;
```

---

### 2. Get Shows for a Movie on Specific Date
```sql
SELECT 
  s.id as show_id,
  s.show_time,
  t.name as theatre_name,
  (SELECT COUNT(*) FROM seats WHERE show_id = s.id AND is_booked = 0) as available_seats
FROM shows s
JOIN theatres t ON s.theatre_id = t.id
WHERE s.movie_id = 1 AND s.show_date = '2026-02-15'
ORDER BY t.name, s.show_time;
```

---

### 3. Get All Bookings for a User
```sql
SELECT 
  b.*,
  s.show_date,
  s.show_time,
  m.title,
  t.name as theatre_name
FROM bookings b
JOIN shows s ON b.show_id = s.id
JOIN movies m ON s.movie_id = m.id
JOIN theatres t ON s.theatre_id = t.id
WHERE b.user_id = 5
ORDER BY b.booking_date DESC;
```

---

### 4. Check How Many Seats Are Booked vs Available
```sql
SELECT 
  show_id,
  COUNT(*) as total_seats,
  SUM(CASE WHEN is_booked = TRUE THEN 1 ELSE 0 END) as booked_seats,
  SUM(CASE WHEN is_booked = FALSE THEN 1 ELSE 0 END) as available_seats
FROM seats
WHERE show_id = 1
GROUP BY show_id;
```

**Result:**
| show_id | total_seats | booked_seats | available_seats |
|---------|-------------|--------------|-----------------|
| 1 | 120 | 22 | 98 |

---

### 5. Find All Seats Booked by a Specific User
```sql
SELECT 
  s.id,
  s.seat_label,
  s.price,
  sh.show_date,
  sh.show_time,
  m.title as movie_title,
  t.name as theatre_name
FROM seats s
JOIN shows sh ON s.show_id = sh.id
JOIN movies m ON sh.movie_id = m.id
JOIN theatres t ON sh.theatre_id = t.id
WHERE s.booked_by = 5 AND s.is_booked = TRUE
ORDER BY sh.show_date, sh.show_time;
```

---

### 6. Get Saved Movies for a User
```sql
SELECT m.*
FROM movies m
INNER JOIN saved_movies sm ON m.id = sm.movie_id
WHERE sm.user_id = 5
ORDER BY sm.created_at DESC;
```

---

### 7. Verify OTP and Check Expiry
```sql
SELECT * FROM otp_verification
WHERE identifier = 'ravish@gmail.com'
  AND otp = '582374'
  AND expires_at > NOW();
```

---

### 8. Get Total Revenue from All Bookings
```sql
SELECT SUM(total_price) as total_revenue
FROM bookings
WHERE status = 'CONFIRMED';
```

---

## 🔑 Key Database Concepts Summary

### 1. **No Separate Booked Seats Table**
- All seat information (available + booked) in ONE table: `seats`
- Field `is_booked` (BOOLEAN) determines availability
- Field `booked_by` links to user who booked

### 2. **JSON in Bookings**
- `seat_ids` field stores array: `[1, 3, 5]`
- Backend parses JSON to get seat details

### 3. **Cascade Deletes**
- If a movie is deleted → All its shows are deleted → All seats for those shows are deleted
- If a user is deleted → All their bookings and saved movies are deleted

### 4. **Phone Number Normalization**
- Always stored as 10-digit: `9876543210`
- `+91` prefix removed automatically

### 5. **OTP Auto-Deletion**
- OTPs deleted immediately after successful verification
- Prevents reuse attacks

### 6. **Booking History Preserved**
- Cancelled bookings NOT deleted (status changed to 'CANCELLED')
- Allows viewing booking history

### 7. **Unique Constraints**
- `(show_id, seat_label)` → Each show has unique seat labels
- `(user_id, movie_id)` in saved_movies → Can't save same movie twice

---

## 📈 Database Statistics

| Metric | Value |
|--------|-------|
| Total Tables | 8 |
| Movies | 12 |
| Theatres | 4 |
| Shows | ~525 (12 movies × 4 theatres × ~11 shows/week) |
| Seats | ~63,000 (525 shows × 120 seats) |
| Users | Dynamic (grows with registrations) |
| Bookings | Dynamic (grows with bookings) |

---

## 🎯 Conclusion

**The Bookora database is designed for efficiency:**

✅ **Single `seats` table** handles both availability and bookings  
✅ **Indexed queries** for fast seat lookups  
✅ **JSON storage** for flexible seat references  
✅ **Cascade deletes** maintain referential integrity  
✅ **OTP cleanup** prevents security issues  
✅ **Booking history** preserved even after cancellation  

This structure eliminates the need for complex JOINs while maintaining complete booking information and user history.

---

**🎬 End of Database Understanding Document**

*Created for Bookora Movie Booking System*  
*Last Updated: February 10, 2026*
