// Configuration
const API_URL = 'http://localhost:5000';

// Get movie slug from URL path
// URL format: /movie/slug-name
const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
const movieSlug = pathParts[pathParts.length - 1]; // Get last non-empty part

console.log('Movie slug:', movieSlug);
console.log('Full pathname:', window.location.pathname);

// Global state
let currentMovie = null;
let isMovieSaved = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!movieSlug || movieSlug === 'movie') {
        showError('Movie not found');
        return;
    }
    
    loadMovieDetails();
});



// Load movie details from API
async function loadMovieDetails() {
    console.log('Loading movie details for slug:', movieSlug);
    
    try {
        const apiUrl = `${API_URL}/api/movies/slug/${movieSlug}`;
        console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data.success) {
            currentMovie = data.movie;
            console.log('Movie data:', currentMovie);
            displayMovieDetails(data.movie);
            initScrollHandler();
            // Check saved status asynchronously (don't block page load)
            checkSavedStatus().catch(err => console.error('Error checking saved status:', err));
        } else {
            showError(data.message || 'Movie not found');
        }
    } catch (error) {
        console.error('Error loading movie details:', error);
        showError('Unable to connect to server. Please try again later.');
    }
}

// Display movie details
function displayMovieDetails(movie) {
    // Set document title
    document.title = `${movie.title} - Bookora`;
    
    // Hero banner background
    const banner = document.getElementById('movieBanner');
    if (banner && movie.banner_url) {
        banner.style.backgroundImage = `url('${movie.banner_url}')`;
        banner.style.backgroundSize = 'cover';
        banner.style.backgroundPosition = 'center';
        console.log('Banner URL:', movie.banner_url);
    }
    
    // Banner Poster (LEFT ZONE)
    const posterImg = document.getElementById('bannerPoster');
    if (posterImg && movie.poster_url) {
        posterImg.src = movie.poster_url;
        posterImg.alt = movie.title;
        console.log('Poster URL:', posterImg.src);
    }
    
    // Title (CENTER ZONE)
    const titleEl = document.getElementById('movieTitle');
    if (titleEl) titleEl.textContent = movie.title;
    
    // Set navbar movie title for scroll state
    const navbarTitle = document.getElementById('navbarTitleTextScrolled');
    if (navbarTitle) navbarTitle.textContent = movie.title;
    
    // Rating Pill (CENTER ZONE)
    const ratingEl = document.getElementById('bannerRating');
    if (ratingEl) {
        ratingEl.innerHTML = `
            <i class="fas fa-star"></i>
            <span class="rating-value">${movie.rating || '8.5'}/10</span>
            <span class="rating-divider">|</span>
            <span class="rating-votes">${movie.votes || '150K'} votes</span>
        `;
    }
    
    // Metadata Rows (CENTER ZONE)
    const metadataEl = document.getElementById('bannerMetadata');
    if (metadataEl) {
        const languages = Array.isArray(movie.language) ? movie.language.join(', ') : movie.language;
        const genres = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;
        
        metadataEl.innerHTML = `
            <div class="metadata-row">
                <i class="fas fa-clock"></i>
                <span>${formatDuration(movie.duration)}</span>
            </div>
            <div class="metadata-row">
                <i class="fas fa-film"></i>
                <span>${genres}</span>
            </div>
            <div class="metadata-row">
                <i class="fas fa-language"></i>
                <span>${languages}</span>
            </div>
            <div class="metadata-row">
                <i class="fas fa-info-circle"></i>
                <span>${movie.certification || movie.rating || 'UA'}</span>
            </div>
            <div class="metadata-row">
                <i class="fas fa-calendar-alt"></i>
                <span>${formatDate(movie.release_date)}</span>
            </div>
        `;
    }
    
    // Movie info section - REMOVED (already shown in banner)
    
    // Description
    const descEl = document.getElementById('movieDescription');
    if (descEl) descEl.textContent = movie.description || 'No description available.';
    
    // Cast
    const castEl = document.getElementById('movieCast');
    if (castEl && movie.cast) {
        const castArray = Array.isArray(movie.cast) ? movie.cast : movie.cast.split(',').map(c => c.trim());
        const castHTML = castArray.map(actor => 
            `<div class="cast-item">${actor}</div>`
        ).join('');
        castEl.innerHTML = castHTML;
    }
}

// Format duration (minutes to hours and minutes)
function formatDuration(minutes) {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Book movie
function bookMovie() {
    const user = localStorage.getItem('bookora_user');
    if (!user) {
        openSignInModal();
        return;
    }
    
    // Navigate to shows page with movie slug
    window.location.href = `/shows/${movieSlug}`;
}

// Notify me for upcoming movies
function notifyMe(movieId) {
    const user = localStorage.getItem('bookora_user');
    if (!user) {
        alert('Please sign in to get notifications');
        window.location.href = 'index.html';
        return;
    }
    
    alert('You will be notified when tickets are available!');
    // Future: Implement notification system
}

// Open trailer in modal
function openTrailer(trailerUrl) {
    const modal = document.getElementById('trailer-modal');
    const iframe = document.getElementById('trailer-iframe');
    
    // Convert YouTube URL to embed URL
    let embedUrl = trailerUrl;
    if (trailerUrl.includes('youtube.com/watch')) {
        const videoId = new URL(trailerUrl).searchParams.get('v');
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (trailerUrl.includes('youtu.be/')) {
        const videoId = trailerUrl.split('youtu.be/')[1].split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    
    iframe.src = embedUrl;
    modal.style.display = 'flex';
    
    // Close modal
    const closeBtn = document.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        iframe.src = '';
    };
    
    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            iframe.src = '';
        }
    };
}

// Show error
function showError(message) {
    console.error('Error:', message);
    alert(message);
}

// ==========================================
// SCROLL HANDLER - NAVBAR STATE MANAGEMENT
// ==========================================
function initScrollHandler() {
    const bannerHeight = document.getElementById('movieBanner')?.offsetHeight || 500;
    const navbarLogo = document.getElementById('navbarLogo');
    const navbarMenu = document.getElementById('navbarMenu');
    const navbarCity = document.getElementById('navbarCity');
    const authContainer = document.getElementById('authContainer');
    const navbarMovieTitleScrolled = document.getElementById('navbarMovieTitleScrolled');
    const navbarBookBtnScrolled = document.getElementById('navbarBookBtnScrolled');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        if (scrollY > bannerHeight - 100) {
            // SCROLLED STATE: Hide everything, show only Movie Title + Book Now
            if (navbarLogo) navbarLogo.style.display = 'none';
            if (navbarMenu) navbarMenu.style.display = 'none';
            if (navbarCity) navbarCity.style.display = 'none';
            if (authContainer) authContainer.style.display = 'none';
            if (navbarMovieTitleScrolled) navbarMovieTitleScrolled.style.display = 'block';
            if (navbarBookBtnScrolled) navbarBookBtnScrolled.style.display = 'flex';
        } else {
            // DEFAULT STATE: Show normal navbar, hide scrolled elements
            if (navbarLogo) navbarLogo.style.display = 'block';
            if (navbarMenu) navbarMenu.style.display = 'flex';
            if (navbarCity) navbarCity.style.display = 'flex';
            if (authContainer) authContainer.style.display = 'flex';
            if (navbarMovieTitleScrolled) navbarMovieTitleScrolled.style.display = 'none';
            if (navbarBookBtnScrolled) navbarBookBtnScrolled.style.display = 'none';
        }
    });
}

// ==========================================
// BOOKMARK FEATURE
// ==========================================
async function checkSavedStatus() {
    const user = JSON.parse(localStorage.getItem('bookoraUser') || 'null');
    if (!user || !currentMovie) return;
    
    try {
        const response = await fetch(`${API_URL}/api/check-saved/${user.id}/${currentMovie.id}`);
        
        // Check if response is ok
        if (!response.ok) {
            console.warn('Saved status check failed, continuing without it');
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            isMovieSaved = data.is_saved;
            
            if (isMovieSaved) {
                const bookmarkBtn = document.getElementById('bookmarkBtn');
                if (bookmarkBtn) {
                    bookmarkBtn.classList.add('saved');
                    const heartIcon = bookmarkBtn.querySelector('i');
                    if (heartIcon) heartIcon.className = 'fas fa-heart';
                }
            }
        }
    } catch (error) {
        // Silently fail - don't break page load
        console.warn('Could not check saved status (non-critical):', error);
    }
}

async function toggleBookmark() {
    const user = JSON.parse(localStorage.getItem('bookoraUser') || 'null');
    
    if (!user) {
        // User not logged in - open sign-in modal
        if (typeof openSignInModal === 'function') {
            openSignInModal('save');
        } else {
            alert('Please sign in to save movies to your watchlist');
        }
        return;
    }
    
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    const heartIcon = bookmarkBtn?.querySelector('i');
    
    // Optimistic UI update
    isMovieSaved = !isMovieSaved;
    if (bookmarkBtn) bookmarkBtn.classList.toggle('saved', isMovieSaved);
    
    if (heartIcon) {
        heartIcon.className = isMovieSaved ? 'fas fa-heart' : 'far fa-heart';
    }
    
    try {
        const endpoint = isMovieSaved ? '/api/save-movie' : '/api/unsave-movie';
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                movie_id: currentMovie.id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(isMovieSaved ? '✓ Saved to your watchlist' : 'Removed from watchlist');
        } else {
            // Revert on error
            isMovieSaved = !isMovieSaved;
            if (bookmarkBtn) bookmarkBtn.classList.toggle('saved', isMovieSaved);
            if (heartIcon) heartIcon.className = isMovieSaved ? 'fas fa-heart' : 'far fa-heart';
            showToast('Error saving movie');
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        // Revert on error
        isMovieSaved = !isMovieSaved;
        if (bookmarkBtn) bookmarkBtn.classList.toggle('saved', isMovieSaved);
        if (heartIcon) heartIcon.className = isMovieSaved ? 'fas fa-heart' : 'far fa-heart';
        showToast('Error saving movie');
    }
}

// ==========================================
// SHARE FEATURE - REMOVED
// ==========================================
// Share button has been removed from UI

// ==========================================
// TOAST NOTIFICATION
// ==========================================
function showToast(message) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(212, 165, 154, 0.95);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: 600;
        z-index: 10000;
        animation: slideUp 0.3s ease-out;
        box-shadow: 0 4px 20px rgba(212, 165, 154, 0.4);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Open trailer
function openTrailer() {
    if (currentMovie && currentMovie.trailer_url) {
        window.open(currentMovie.trailer_url, '_blank');
    } else {
        alert('Trailer not available');
    }
}

// Handle Book Now - NO LOGIN REQUIRED (BookMyShow-style flow)
function handleBookNow() {
    // Navigate directly to shows page - login required only at payment
    if (currentMovie && currentMovie.slug) {
        console.log('Navigating to shows page:', `/shows/${currentMovie.slug}`);
        window.location.href = `/shows/${currentMovie.slug}`;
    } else if (currentMovie && currentMovie.id) {
        console.log('Navigating to shows page with ID:', `/shows/${currentMovie.id}`);
        window.location.href = `/shows/${currentMovie.id}`;
    } else {
        console.error('No movie data available:', currentMovie);
        alert('Movie information not available');
    }
}
