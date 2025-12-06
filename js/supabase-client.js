// Supabase Client Configuration
// This file handles all Supabase interactions for CodeQuest

// Initialize Supabase client
const SUPABASE_URL = 'https://unzionpazoxeotfxfwwf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuemlvbnBhem94ZW90Znhmd3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDY5ODAsImV4cCI6MjA4MDYyMjk4MH0.3Hkd9JNWW20Kv44FLRPZkKl6HShy3BSFY8RJYhdE53Q';

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} username - User display name
 * @returns {Object} User data or error
 */
async function signUp(email, password, username) {
    try {
        const { data, error } = await _supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: 'https://codequest-1212.netlify.app/',
                data: {
                    username: username
                }
            }
        });

        if (error) throw error;

        // Create user profile
        if (data.user) {
            await createUserProfile(data.user.id, username, email);
        }

        return { success: true, data: data };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sign in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} User data or error
 */
async function signIn(email, password) {
    try {
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        return { success: true, data: data };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sign out the current user
 */
async function signOut() {
    try {
        const { error } = await _supabase.auth.signOut();
        if (error) throw error;

        // Redirect to home page
        const isHtmlDir = window.location.pathname.includes('/html/');
        window.location.href = isHtmlDir ? '../Index.html' : 'Index.html';
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get the current user session
 * @returns {Object} Current user or null
 */
async function getCurrentUser() {
    try {
        const { data: { user } } = await _supabase.auth.getUser();
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

/**
 * Check if user is logged in
 * @returns {boolean} True if logged in
 */
async function isLoggedIn() {
    const user = await getCurrentUser();
    return user !== null;
}

// ============================================
// USER PROFILE FUNCTIONS
// ============================================

/**
 * Create user profile in database
 * @param {string} userId - User ID
 * @param {string} username - Username
 * @param {string} email - User email
 */
async function createUserProfile(userId, username, email) {
    try {
        const { error } = await _supabase
            .from('user_profiles')
            .insert([
                {
                    id: userId,
                    username: username,
                    email: email
                }
            ]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Create profile error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Object} User profile data
 */
async function getUserProfile(userId) {
    try {
        const { data, error } = await _supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Get profile error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Object containing updates (username, etc.)
 */
async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await _supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', userId)
            .select();

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update user password
 * @param {string} newPassword - New password
 */
async function updateUserPassword(newPassword) {
    try {
        const { data, error } = await _supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Update password error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Verify user password (re-authentication)
 * @param {string} email - User email
 * @param {string} password - Password to verify
 */
async function verifyPassword(email, password) {
    try {
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Verify password error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// USER PROGRESS FUNCTIONS
// ============================================

/**
 * Save user progress for a challenge
 * @param {string} userId - User ID
 * @param {string} language - Programming language
 * @param {number} challengeIndex - Challenge index
 * @param {boolean} completed - Completion status
 */
async function saveProgress(userId, language, challengeIndex, completed = true) {
    try {
        const { data, error } = await _supabase
            .from('user_progress')
            .upsert([
                {
                    user_id: userId,
                    language: language,
                    challenge_index: challengeIndex,
                    completed: completed,
                    completed_at: completed ? new Date().toISOString() : null
                }
            ], {
                onConflict: 'user_id,language,challenge_index'
            });

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Save progress error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user progress for a specific language
 * @param {string} userId - User ID
 * @param {string} language - Programming language
 * @returns {Array} Array of completed challenges
 */
async function getProgress(userId, language) {
    try {
        const { data, error } = await _supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('language', language)
            .eq('completed', true)
            .order('challenge_index', { ascending: true });

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Get progress error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all user progress across all languages
 * @param {string} userId - User ID
 * @returns {Array} Array of all completed challenges
 */
async function getAllProgress(userId) {
    try {
        const { data, error } = await _supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('completed', true);

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Get all progress error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// CERTIFICATE FUNCTIONS
// ============================================

/**
 * Save user certificate
 * @param {string} userId - User ID
 * @param {string} language - Programming language
 * @param {string} certificateCode - Certificate HTML code
 */
async function saveCertificate(userId, language, certificateCode) {
    try {
        const { data, error } = await _supabase
            .from('user_certificates')
            .upsert([
                {
                    user_id: userId,
                    language: language,
                    certificate_code: certificateCode,
                    earned_at: new Date().toISOString()
                }
            ], {
                onConflict: 'user_id,language'
            });

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Save certificate error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user certificates
 * @param {string} userId - User ID
 * @returns {Array} Array of earned certificates
 */
async function getCertificates(userId) {
    try {
        const { data, error } = await _supabase
            .from('user_certificates')
            .select('*')
            .eq('user_id', userId)
            .order('earned_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Get certificates error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// AUTHENTICATION STATE LISTENER
// ============================================

/**
 * Listen for authentication state changes
 */
_supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);

    if (event === 'SIGNED_IN') {
        updateUIForLoggedInUser(session.user);
    } else if (event === 'SIGNED_OUT') {
        updateUIForLoggedOutUser();
    }
});

/**
 * Update UI when user is logged in
 * @param {Object} user - User object
 */
/**
 * Update UI when user is logged in
 * @param {Object} user - User object
 */
async function updateUIForLoggedInUser(user) {
    // Elements for Index.html
    const signinLink = document.getElementById('signin-link');
    const signupLink = document.getElementById('signup-link');
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');

    // Elements for profile.html
    const profileTrigger = document.getElementById('profile-trigger');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const loginLink = document.getElementById('Slide login form-link');

    // Hide login/signup buttons
    if (signinLink) signinLink.style.display = 'none';
    if (signupLink) signinLink.style.display = 'none'; // Hide signin link if signup exists (typo fix logic)
    if (signupLink) signupLink.style.display = 'none';
    if (loginLink) loginLink.style.display = 'none';

    // Show user info
    if (userInfo) {
        // Check if it's the simple version (Index.html) or dropdown version (profile.html)
        if (userInfo.classList.contains('user-info-simple')) {
            userInfo.style.display = 'flex';
            userInfo.style.alignItems = 'center';
            userInfo.style.gap = '10px';
            userInfo.style.color = '#fff';
        } else {
            userInfo.style.display = 'block';
        }
    }

    // Get user profile to display username
    const profile = await getUserProfile(user.id);

    // Priority: 1. Profile DB (if edited) 2. Metadata (from signup) 3. Email fallback
    let displayName = user.email.split('@')[0];

    if (profile.success && profile.data && profile.data.username) {
        displayName = profile.data.username;
    } else if (user.user_metadata && user.user_metadata.username) {
        displayName = user.user_metadata.username;
    }

    if (usernameDisplay) {
        usernameDisplay.textContent = displayName;
    }

    // Add dropdown toggle functionality (only for profile.html or if dropdown exists)
    if (profileTrigger && dropdownMenu) {
        // Use onclick to avoid adding multiple listeners if called multiple times
        profileTrigger.onclick = function (e) {
            e.stopPropagation();
            profileTrigger.classList.toggle('active');
            dropdownMenu.classList.toggle('show');
        };

        // Close dropdown when clicking outside
        document.onclick = function (e) {
            if (!profileTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
                profileTrigger.classList.remove('active');
                dropdownMenu.classList.remove('show');
            }
        };
    }
}

/**
 * Update UI when user is logged out
 */
function updateUIForLoggedOutUser() {
    const signinLink = document.getElementById('signin-link');
    const signupLink = document.getElementById('signup-link');
    const userInfo = document.getElementById('user-info');
    const loginLink = document.getElementById('Slide login form-link');

    if (signinLink) signinLink.style.display = 'inline-block';
    if (signupLink) signupLink.style.display = 'inline-block';
    if (loginLink) loginLink.style.display = 'block';

    if (userInfo) userInfo.style.display = 'none';
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

/**
 * Initialize authentication state on page load
 */
async function initializeAuth() {
    const user = await getCurrentUser();
    if (user) {
        updateUIForLoggedInUser(user);
    } else {
        updateUIForLoggedOutUser();
    }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}
