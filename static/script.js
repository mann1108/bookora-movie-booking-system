/**
 * ==========================================
 * BOOKORA - MAIN JAVASCRIPT
 * ==========================================
 */

/**
 * ==========================================
 * CONTINUOUS CURSOR-DRIVEN INTERPOLATION
 * ==========================================
 * 
 * THIS IS NOT HOVER-BASED ANIMATION.
 * This is continuous position-based interpolation.
 * 
 * HOW IT WORKS:
 * 1. Track mouse X position continuously via mousemove
 * 2. Normalize position to 0 → 1 range
 * 3. Map normalized value to a "focus index" (float, not int)
 * 4. Each banner calculates its distance from focus
 * 5. Distance determines: scale, translateY, translateZ, opacity, z-index
 * 6. ALL banners update on EVERY mouse movement
 * 7. Use requestAnimationFrame for smooth 60fps updates
 * 
 * VISUAL RESULT:
 * - Banners feel layered in depth
 * - Banner nearest cursor rises forward
 * - Neighboring banners react proportionally
 * - Distant banners react minimally
 * - Motion is smooth, slow, restrained
 */

// ===========================================
// CONFIGURATION - Tweak these for feel
// ===========================================
const CONFIG = {
    // Transform values
    maxScale: 1.0,          // Scale of focused banner
    minScale: 0.92,         // Scale of distant banners
    maxLift: -24,           // Y translation of focused (negative = up)
    minLift: 18,            // Y translation of distant (positive = down)
    maxZ: 90,               // Z translation of focused
    minZ: -40,              // Z translation of distant
    
    // Visual effects
    maxBlur: 0,             // Blur of focused (sharp)
    minBlur: 1.5,           // Blur of distant (subtle soft-focus)
    
    // Easing (lower = smoother/slower)
    lerpFactor: 0.24,       // Interpolation speed (SageKit-snappy)
    
    // Shadow
    baseShadow: 'rgba(212, 165, 154, 0.15)',
    focusShadow: 'rgba(212, 165, 154, 0.35)'
};

// ===========================================
// STATE
// ===========================================
const bannersWrapper = document.getElementById('bannersWrapper');
const banners = document.querySelectorAll('.movie-banner');
const numBanners = banners.length;

// Current interpolated values for each banner
let bannerStates = Array.from(banners).map(() => ({
    scale: CONFIG.minScale,
    translateY: CONFIG.minLift,
    translateZ: CONFIG.minZ,
    blur: CONFIG.minBlur
}));

// Target focus index (float) - where the cursor is pointing
let targetFocusIndex = 2; // Start at center
let currentFocusIndex = 2;

// Animation state
let isAnimating = false;
let mouseInside = false;

// ===========================================
// MATH UTILITIES
// ===========================================

/**
 * Linear interpolation
 * @param {number} start - Starting value
 * @param {number} end - Target value
 * @param {number} t - Interpolation factor (0-1)
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Map a value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

// ===========================================
// CORE: Calculate banner transforms based on distance
// ===========================================

/**
 * Calculate all visual properties for a banner based on its distance from focus
 * 
 * @param {number} bannerIndex - Index of the banner (0-4)
 * @param {number} focusIndex - Current focus position (float, e.g., 2.3)
 * @returns {Object} - Object with scale, translateY, translateZ, opacity, etc.
 * 
 * HOW DISTANCE IS CALCULATED:
 * - distance = |bannerIndex - focusIndex|
 * - distance = 0 means banner is perfectly focused
 * - distance = 1 means banner is one position away
 * - We use this to interpolate between min/max values
 */
function calculateBannerState(bannerIndex, focusIndex) {
    // Calculate absolute distance from focus point
    const distance = Math.abs(bannerIndex - focusIndex);
    
    // Normalize distance (0 = focused, 1+ = far)
    // We use a max distance of 2 for normalization
    const normalizedDistance = clamp(distance / 2, 0, 1);
    
    // Calculate each property based on distance
    // Closer = higher scale, lower Y, higher Z, full opacity
    // Farther = lower scale, higher Y, lower Z, reduced opacity
    
    return {
        // Scale: 1.0 when focused, 0.92 when far
        scale: lerp(CONFIG.maxScale, CONFIG.minScale, normalizedDistance),
        
        // Y translation: -24 (up) when focused, +18 (down) when far
        translateY: lerp(CONFIG.maxLift, CONFIG.minLift, normalizedDistance),
        
        // Z translation: +90 (forward) when focused, -40 (back) when far
        translateZ: lerp(CONFIG.maxZ, CONFIG.minZ, normalizedDistance),
        
        // Blur: 0px when focused (sharp), 1.5px when far (subtle soft-focus)
        blur: lerp(CONFIG.maxBlur, CONFIG.minBlur, normalizedDistance),
        
        // Z-index: higher when closer to focus
        zIndex: Math.round(100 - distance * 20)
    };
}

// ===========================================
// APPLY TRANSFORMS TO DOM
// ===========================================

/**
 * Apply calculated states to banner elements
 * Called every animation frame
 */
function applyBannerTransforms() {
    banners.forEach((banner, index) => {
        const state = bannerStates[index];
        
        // Build transform string
        const transform = `
            scale(${state.scale.toFixed(4)})
            translateY(${state.translateY.toFixed(2)}px)
            translateZ(${state.translateZ.toFixed(2)}px)
        `;
        
        // Build filter - focused banner = sharp, others = blurred
        const filter = `blur(${state.blur.toFixed(2)}px)`;
        
        // Calculate shadow based on scale (depth cue)
        const shadowIntensity = mapRange(state.scale, CONFIG.minScale, CONFIG.maxScale, 0.08, 0.35);
        const shadowBlur = mapRange(state.scale, CONFIG.minScale, CONFIG.maxScale, 20, 48);
        const boxShadow = `0 ${8 + state.translateZ * 0.1}px ${shadowBlur}px rgba(0, 0, 0, ${shadowIntensity})`;
        
        // Apply to element
        banner.style.transform = transform;
        banner.style.opacity = '1';
        banner.style.filter = filter;
        banner.style.zIndex = state.zIndex;
        banner.style.boxShadow = boxShadow;
    });
}

// ===========================================
// ANIMATION LOOP
// ===========================================

/**
 * Main animation loop using requestAnimationFrame
 * Smoothly interpolates current values toward target values
 */
function animate() {
    // Smoothly interpolate focus index toward target
    currentFocusIndex = lerp(currentFocusIndex, targetFocusIndex, CONFIG.lerpFactor);
    
    // Calculate and interpolate each banner's state
    banners.forEach((banner, index) => {
        // Calculate target state based on current focus
        const targetState = calculateBannerState(index, currentFocusIndex);
        
        // Smoothly interpolate current state toward target
        bannerStates[index].scale = lerp(bannerStates[index].scale, targetState.scale, CONFIG.lerpFactor);
        bannerStates[index].translateY = lerp(bannerStates[index].translateY, targetState.translateY, CONFIG.lerpFactor);
        bannerStates[index].translateZ = lerp(bannerStates[index].translateZ, targetState.translateZ, CONFIG.lerpFactor);
        bannerStates[index].blur = lerp(bannerStates[index].blur, targetState.blur, CONFIG.lerpFactor);
        bannerStates[index].zIndex = targetState.zIndex;
    });
    
    // Apply transforms to DOM
    applyBannerTransforms();
    
    // Continue animation loop
    if (isAnimating) {
        requestAnimationFrame(animate);
    }
}

/**
 * Start animation loop if not already running
 */
function startAnimation() {
    if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animate);
    }
}

// ===========================================
// MOUSE EVENT HANDLERS
// ===========================================

/**
 * Handle mouse movement - THIS IS THE CORE INTERACTION
 * 
 * Maps cursor X position to focus index:
 * - Left edge (0%) → focus on banner 0
 * - Right edge (100%) → focus on banner 4
 * - Anywhere in between → proportional float value
 */
function handleMouseMove(e) {
    // Only on desktop
    if (window.innerWidth < 768) return;
    
    mouseInside = true;
    
    const rect = bannersWrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const wrapperWidth = rect.width;
    
    // Normalize mouse X to 0-1 range
    const normalizedX = clamp(mouseX / wrapperWidth, 0, 1);
    
    /**
     * Map normalized position to banner index
     * 
     * normalizedX = 0.0 → focusIndex = 0 (leftmost banner)
     * normalizedX = 0.5 → focusIndex = 2 (center banner)
     * normalizedX = 1.0 → focusIndex = 4 (rightmost banner)
     * 
     * This is a FLOAT value, allowing smooth interpolation
     * between banners (e.g., 1.3, 2.7, etc.)
     */
    targetFocusIndex = normalizedX * (numBanners - 1);
    
    // Ensure animation is running
    startAnimation();
}

/**
 * Handle mouse leaving the hero area
 * Smoothly return to center focus
 */
function handleMouseLeave() {
    mouseInside = false;
    // Return focus to center
    targetFocusIndex = 2;
    // Keep animating to complete the transition
    startAnimation();
    
    // Stop animation after transition completes
    setTimeout(() => {
        if (!mouseInside) {
            // Allow one more second of animation to settle
            setTimeout(() => {
                if (!mouseInside) {
                    isAnimating = false;
                }
            }, 1000);
        }
    }, 500);
}

// ===========================================
// INITIALIZATION
// ===========================================

/**
 * Initialize the hero interaction system
 */
function initHeroInteraction() {
    // Set initial state (focus on center)
    targetFocusIndex = 2;
    currentFocusIndex = 2;
    
    // Calculate initial states
    banners.forEach((banner, index) => {
        bannerStates[index] = calculateBannerState(index, currentFocusIndex);
    });
    
    // Apply initial transforms
    applyBannerTransforms();
    
    // Attach event listeners
    bannersWrapper.addEventListener('mousemove', handleMouseMove);
    bannersWrapper.addEventListener('mouseleave', handleMouseLeave);
    
    console.log('✅ Continuous interpolation hero initialized');
    console.log('📐 Move cursor left ↔ right to explore films');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initHeroInteraction);

/**
 * ==========================================
 * MOVIE DATA & RENDERING
 * ==========================================
 */

let movieData = [];

// Fetch movies from database API
async function loadMovies() {
    try {
        const response = await fetch('/api/movies');
        const data = await response.json();
        console.log('API Response:', data);
        if (data.success) {
            movieData = data.movies;
            console.log('Movie Data loaded:', movieData.length, 'movies');
            console.log('First movie:', movieData[0]);
            populateMovies();
        }
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

function createMovieCard(movie) {
    console.log('Creating card for movie:', movie.title, 'slug:', movie.slug);
    const posterUrl = movie.poster_url ? `/static/posters/${movie.poster_url}` : 'https://via.placeholder.com/300x450';
    return `
        <div class="movie-card" onclick="movieDetails('${movie.slug}')">
            <div class="movie-poster" style="background: url('${posterUrl}') center/cover;">
                <div class="rating-badge">
                    <i class="fas fa-star"></i> ${movie.certification || 'U/A'}
                </div>
            </div>
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-language">${movie.language}</div>
            </div>
        </div>
    `;
}

function populateMovies() {
    if (movieData.length === 0) return;
    document.getElementById('recommended-container').innerHTML = movieData.slice(0, 5).map(createMovieCard).join('');
    document.getElementById('new-releases-container').innerHTML = movieData.slice(2, 7).map(createMovieCard).join('');
    document.getElementById('top-rated-container').innerHTML = movieData.slice(0, 6).map(createMovieCard).join('');
}

function scrollMovies(e, amount) {
    const container = e.target.closest('.movies-scroll-wrapper').querySelector('.movies-container');
    container.scrollBy({ left: amount, behavior: 'smooth' });
}

function movieDetails(slug) {
    window.location.href = `/movie/${slug}`;
}

function bookMovie(slug) {
    window.location.href = `/shows/${slug}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadMovies);

// Close dropdown on page show (handles back button navigation from cache)
window.addEventListener('pageshow', () => {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
});

console.log('✅ Bookora loaded - Cursor-driven hero active');
