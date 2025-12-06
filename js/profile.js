// Profile Page JavaScript
// Handles fetching and displaying user data, progress, and certificates

document.addEventListener('DOMContentLoaded', async function () {
    // Check if user is logged in
    const user = await getCurrentUser();

    if (!user) {
        // Redirect to login if not authenticated
        window.location.href = 'Slide login form.html';
        return;
    }

    // Load user profile data
    await loadUserProfile(user);

    // Load progress data
    await loadUserProgress(user.id);

    // Load certificates
    await loadUserCertificates(user.id);

    // Profile Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.profile-content-section');
    const editProfileForm = document.getElementById('edit-profile-form');
    const changePasswordForm = document.getElementById('change-password-form');
    const editUsernameInput = document.getElementById('edit-username');

    // Handle Navigation Click
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');

            // Update Nav State
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Update Section Visibility
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.remove('hidden');
                    section.classList.add('active');
                } else {
                    section.classList.add('hidden');
                    section.classList.remove('active');
                }
            });

            // Pre-fill username and email if switching to edit profile
            if (targetId === 'section-edit-profile') {
                const currentUsername = document.getElementById('profile-username').textContent;
                const currentEmail = document.getElementById('profile-email').textContent;

                editUsernameInput.value = currentUsername !== 'Loading...' ? currentUsername : '';
                document.getElementById('edit-email').value = user.email;
            }
        });
    });

    // Avatar Logic
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const deleteAvatarBtn = document.getElementById('delete-avatar-btn');
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarPreview = document.querySelector('.avatar-preview');

    if (changeAvatarBtn && avatarUpload) {
        changeAvatarBtn.addEventListener('click', () => avatarUpload.click());

        avatarUpload.addEventListener('change', function (e) {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar Preview">`;
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    if (deleteAvatarBtn) {
        deleteAvatarBtn.addEventListener('click', () => {
            avatarPreview.innerHTML = '<i class="fas fa-user-circle"></i>';
            avatarUpload.value = ''; // Clear file input
        });
    }

    // Handle Edit Profile Form Submission
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const newUsername = editUsernameInput.value.trim();
            const newEmail = document.getElementById('edit-email').value.trim();

            if (!newUsername || !newEmail) return;

            const submitBtn = editProfileForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            try {
                // Update Profile (Username)
                const profileResult = await updateUserProfile(user.id, { username: newUsername });

                // Update Email if changed
                let emailSuccess = true;
                if (newEmail !== user.email) {
                    const { error } = await _supabase.auth.updateUser({ email: newEmail });
                    if (error) {
                        emailSuccess = false;
                        showAlert('Error updating email: ' + error.message, 'error');
                    } else {
                        showAlert('Confirmation email sent to ' + newEmail, 'success');
                    }
                }

                if (profileResult.success) {
                    // Update UI immediately
                    document.getElementById('profile-username').textContent = newUsername;
                    const headerUsername = document.getElementById('username-display');
                    if (headerUsername) headerUsername.textContent = newUsername;

                    if (emailSuccess && newEmail === user.email) {
                        showAlert('Profile updated successfully!', 'success');
                    }
                } else {
                    showAlert('Error updating profile: ' + profileResult.error, 'error');
                }
            } catch (error) {
                console.error(error);
                showAlert('An error occurred.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Handle Change Password Form Submission
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const oldPassword = document.getElementById('edit-password-old').value;
            const newPassword = document.getElementById('edit-password-new').value;
            const confirmPassword = document.getElementById('edit-password-confirm').value;

            if (newPassword !== confirmPassword) {
                showAlert('New passwords do not match!', 'error');
                return;
            }

            const submitBtn = changePasswordForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Verifying...';
            submitBtn.disabled = true;

            try {
                // Verify Old Password
                const verifyResult = await verifyPassword(user.email, oldPassword);

                if (!verifyResult.success) {
                    showAlert('Incorrect old password!', 'error');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }

                submitBtn.textContent = 'Updating...';

                // Update to New Password
                const passwordResult = await updateUserPassword(newPassword);

                if (passwordResult.success) {
                    showAlert('Password updated successfully!', 'success');
                    changePasswordForm.reset();
                } else {
                    showAlert('Error updating password: ' + passwordResult.error, 'error');
                }
            } catch (error) {
                console.error(error);
                showAlert('An error occurred.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});


/**
 * Load and display user profile information
 */
async function loadUserProfile(user) {
    const usernameEl = document.getElementById('profile-username');
    const emailEl = document.getElementById('profile-email');
    const memberSinceEl = document.getElementById('member-since');

    // Get user profile from database
    const profile = await getUserProfile(user.id);

    if (profile.success && profile.data) {
        usernameEl.textContent = profile.data.username || 'User';
        // Always use auth email as source of truth
        emailEl.textContent = user.email;

        // Format join date
        const joinDate = new Date(profile.data.created_at);
        memberSinceEl.textContent = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else {
        // Fallback to auth user data
        usernameEl.textContent = user.email.split('@')[0];
        emailEl.textContent = user.email;
        memberSinceEl.textContent = new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

/**
 * Load and display user progress for all languages
 */
async function loadUserProgress(userId) {
    const languages = ['python', 'html', 'css', 'javascript'];
    let totalCompleted = 0;
    const totalChallenges = 40; // 10 per language × 4 languages

    for (const language of languages) {
        const progressResult = await getProgress(userId, language);

        let completed = 0;
        if (progressResult.success && progressResult.data) {
            completed = progressResult.data.length;
            totalCompleted += completed;
        }

        // Update progress display
        updateProgressDisplay(language, completed, 10);
    }

    // Update total count
    document.getElementById('total-count').textContent = `${totalCompleted}/${totalChallenges}`;
}

/**
 * Update progress bar and count for a specific language
 */
function updateProgressDisplay(language, completed, total) {
    const countEl = document.getElementById(`${language}-count`);
    const progressEl = document.getElementById(`${language}-progress`);

    if (countEl && progressEl) {
        countEl.textContent = `${completed}/${total}`;
        const percentage = (completed / total) * 100;
        progressEl.style.width = `${percentage}%`;
    }
}

/**
 * Load and display earned certificates
 */
async function loadUserCertificates(userId) {
    const certificatesGrid = document.getElementById('certificates-grid');
    const certificatesResult = await getCertificates(userId);

    if (certificatesResult.success && certificatesResult.data && certificatesResult.data.length > 0) {
        // Clear "no certificates" message
        certificatesGrid.innerHTML = '';

        // Display each certificate
        certificatesResult.data.forEach(cert => {
            const certItem = createCertificateItem(cert);
            certificatesGrid.appendChild(certItem);
        });
    } else {
        // Show "no certificates" message
        certificatesGrid.innerHTML = '<p class="no-certificates">Complete all challenges in a language to earn a certificate!</p>';
    }
}

/**
 * Create certificate item element
 */
function createCertificateItem(certificate) {
    const div = document.createElement('div');
    div.className = 'certificate-item';

    const languageIcons = {
        'python': 'fab fa-python',
        'html': 'fab fa-html5',
        'css': 'fab fa-css3-alt',
        'javascript': 'fab fa-js'
    };

    const languageNames = {
        'python': 'Python',
        'html': 'HTML',
        'css': 'CSS',
        'javascript': 'JavaScript'
    };

    const icon = languageIcons[certificate.language] || 'fas fa-certificate';
    const name = languageNames[certificate.language] || certificate.language;
    const earnedDate = new Date(certificate.earned_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    div.innerHTML = `
        <i class="${icon}"></i>
        <h4>${name} Certificate</h4>
        <p>Earned on ${earnedDate}</p>
    `;

    return div;
}
