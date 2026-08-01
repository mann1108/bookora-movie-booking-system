# 🧮 SEED_SHOWS.PY - EXACT MATHEMATICS EXPLANATION

## 📝 SIMPLE EXPLANATION FOR EXAMINER

This document explains the **EXACT mathematics** behind the `seed_shows.py` script that generates movie shows and seats in our database.

---

## 🎯 WHAT DOES seed_shows.py DO?

The script creates a **realistic movie theatre schedule** for the next 7 days by:
1. Assigning movies to theatres
2. Creating show timings for each movie
3. Generating seat layouts for each show

---

## 🔢 EXACT CALCULATIONS (NO APPROXIMATIONS)

### **Input Data:**

| Item | Count | Details |
|------|-------|---------|
| Movies | 12 | All movies in our database |
| Theatres | 4 | All theatres in Ahmedabad |
| Days | 7 | Today + next 6 days |
| Available Showtimes | 5 | 10:00, 13:00, 16:00, 19:00, 22:00 |

### **Selection Logic:**

```python
# For EACH movie on EACH day:
selected_theatres = random.sample(theatres, min(3, len(theatres)))
# Result: ALWAYS selects 3 theatres (because we have 4 available)

# For EACH selected theatre:
selected_times = random.sample(SHOW_TIMES, min(3, len(SHOW_TIMES)))
# Result: ALWAYS selects 3 showtimes (because we have 5 available)
```

**Key Point:** The **COUNT is FIXED at 3**, only **WHICH ones are selected is RANDOM**.

---

## 📊 EXACT CALCULATION BREAKDOWN

### **Step 1: Calculate Total Shows**

```
Shows per movie per day = Theatres × Showtimes
                        = 3 × 3
                        = 9 shows

Shows per day = Movies × Shows per movie
              = 12 × 9
              = 108 shows

Total shows (7 days) = Days × Shows per day
                     = 7 × 108
                     = 756 shows
```

**Alternative calculation:**
```
Total Shows = Days × Movies × Theatres × Showtimes
            = 7 × 12 × 3 × 3
            = 756 shows (EXACT)
```

### **Step 2: Calculate Total Seats**

Each show has a **standard cinema layout:**
- 10 rows (A to J)
- 12 seats per row
- Total: 10 × 12 = 120 seats per show

```
Total Seats = Total Shows × Seats per show
            = 756 × 120
            = 90,720 seats (EXACT)
```

### **Step 3: Total Database Records**

```
Total INSERT statements = Shows + Seats
                        = 756 + 90,720
                        = 91,476 records (EXACT)
```

---

## 🎲 UNDERSTANDING THE "RANDOMNESS"

### **What is Random?**
- **WHICH 3 theatres** are selected for each movie (could be any 3 out of 4)
- **WHICH 3 showtimes** are used (could be any 3 out of 5 available times)

### **What is Fixed?**
- **COUNT of theatres**: Always exactly 3
- **COUNT of showtimes**: Always exactly 3
- **COUNT of seats**: Always exactly 120 per show

### **Example:**

**Day 1, Baaghi 4:**
- Random selection: City Gold, PVR, INOX (3 theatres)
- Random showtimes: 10:00, 13:00, 22:00 (3 times)
- Result: 3 × 3 = **9 shows** ✅

**Day 1, Border 2:**
- Random selection: Rajhans, PVR, City Gold (3 theatres) ← Different theatres
- Random showtimes: 13:00, 16:00, 19:00 (3 times) ← Different times
- Result: 3 × 3 = **9 shows** ✅

**Conclusion:** Different movies get different theatres/times, but **ALWAYS 9 shows each**.

---

## 📈 COMPLETE BREAKDOWN BY TIME PERIOD

### **Per Day:**
```
Movies: 12
Theatres per movie: 3
Showtimes per theatre: 3
Shows per day: 12 × 3 × 3 = 108 shows
Seats per day: 108 × 120 = 12,960 seats
```

### **Per Week (7 Days):**
```
Shows per week: 108 × 7 = 756 shows
Seats per week: 12,960 × 7 = 90,720 seats
```

### **Per Movie (7 Days):**
```
Shows per movie: 9 × 7 = 63 shows
Seats per movie: 63 × 120 = 7,560 seats
```

---

## 🎬 REAL-WORLD EXAMPLE

Let's trace one complete movie through the system:

### **Movie: "Baaghi 4" (7-day schedule)**

```
Day 1 (Feb 08):
  Theatre 1 (randomly: City Gold):     10:00, 13:00, 19:00  → 3 shows
  Theatre 2 (randomly: PVR):           10:00, 16:00, 22:00  → 3 shows
  Theatre 3 (randomly: Rajhans):       13:00, 19:00, 22:00  → 3 shows
  Total Day 1: 9 shows

Day 2 (Feb 09):
  Theatre 1 (randomly: INOX):          10:00, 13:00, 16:00  → 3 shows
  Theatre 2 (randomly: PVR):           13:00, 19:00, 22:00  → 3 shows
  Theatre 3 (randomly: City Gold):     10:00, 16:00, 19:00  → 3 shows
  Total Day 2: 9 shows

... (Days 3-7, same pattern, 9 shows each day)

Total for Baaghi 4: 9 × 7 = 63 shows (EXACT)
```

**Each show has 120 seats:**
- Rows A-C (Front): 36 seats @ ₹150 each
- Rows D-F (Middle): 36 seats @ ₹200 each
- Rows G-H (Premium): 24 seats @ ₹250 each
- Rows I-J (VIP): 24 seats @ ₹300 each

---

## ✅ VERIFICATION (What You Should See)

When you run `python seed_shows.py`, you should see:

```
📽️  Movies: 12
🏛️  Theatres: 4
🗑️  Cleared existing shows and seats

✅ Generated 756 shows
✅ Generated 90720 seats

📊 Shows per movie (sample):
   - Baaghi 4: 63 shows
   - Border 2: 63 shows
   - Chhaava: 63 shows
   - Every movie: 63 shows (EXACT)
```

---

## 🔍 SQL VERIFICATION QUERIES

After running the script, verify with these commands:

```sql
-- Total shows (should be 756)
SELECT COUNT(*) FROM shows;

-- Total seats (should be 90,720)
SELECT COUNT(*) FROM seats;

-- Shows per movie (should all be 63)
SELECT 
    m.title,
    COUNT(s.id) as show_count
FROM movies m
LEFT JOIN shows s ON m.id = s.movie_id
GROUP BY m.id;

-- Shows per day (should all be 108)
SELECT 
    show_date,
    COUNT(*) as shows_per_day
FROM shows
GROUP BY show_date;
```

---

## 💡 WHY THIS DESIGN?

### **Why 3 theatres per movie?**
- Realistic: Not every theatre shows every movie
- Each movie is available, but with variety
- Prevents database overcrowding

### **Why 3 showtimes per theatre?**
- Realistic: Theatres don't run all 5 slots for one movie
- Allows multiple movies to share the same theatre
- Creates natural spacing between shows

### **Why 120 seats per show?**
- Industry standard: Most multiplex screens have 100-150 seats
- Easy layout: 10 rows × 12 seats = round number
- Good for demonstration purposes

---

## 📝 SUMMARY FOR EXAMINER

**Question:** "How many shows and seats does the script generate?"

**Answer:**
```
Shows: 756 (EXACT)
  Calculation: 7 days × 12 movies × 3 theatres × 3 showtimes = 756

Seats: 90,720 (EXACT)
  Calculation: 756 shows × 120 seats per show = 90,720

Total database records: 91,476 (EXACT)
```

**Question:** "Why random selection?"

**Answer:**
```
The script uses random.sample() to:
1. Select WHICH 3 theatres (from 4 available) - adds variety
2. Select WHICH 3 showtimes (from 5 available) - realistic scheduling

But the COUNT is always fixed:
- Always 3 theatres per movie
- Always 3 showtimes per theatre
- Always 120 seats per show

This creates realistic variety while maintaining exact mathematical predictability.
```

---

## 🎓 KEY TAKEAWAY

**The math is DETERMINISTIC (exact), the SELECTION is RANDOM.**

- **Fixed:** 7 × 12 × 3 × 3 = 756 shows (always)
- **Random:** Which theatres and which times (varies each run)
- **Result:** Same total count, different distributions

This design mimics real cinema scheduling where:
- Total capacity is known
- Specific assignments vary
- Distribution is balanced

---

**End of Document** ✅
