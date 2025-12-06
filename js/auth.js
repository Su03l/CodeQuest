// Authentication Handler for Login/Signup Form
// This file handles the login and signup form interactions

document.addEventListener('DOMContentLoaded', function () {
    // Get form elements
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('signup-username').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            // Show loading state
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;

            try {
                const result = await signUp(email, password, username);

                if (result.success) {
                    showAlert('Account created successfully! Please check your email.', 'success');
                    signupForm.reset();
                    // Optionally redirect to login or home
                    setTimeout(() => {
                        const isHtmlDir = window.location.pathname.includes('/html/');
                        window.location.href = isHtmlDir ? '../Index.html' : 'Index.html';
                    }, 1500);
                } else {
                    showAlert('Error: ' + result.error, 'error');
                }
            } catch (error) {
                showAlert('An error occurred. Please try again.', 'error');
                console.error(error);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;

            try {
                const result = await signIn(email, password);

                if (result.success) {
                    showAlert('Login successful!', 'success');
                    loginForm.reset();
                    setTimeout(() => {
                        const isHtmlDir = window.location.pathname.includes('/html/');
                        window.location.href = isHtmlDir ? '../Index.html' : 'Index.html';
                    }, 1000);
                } else {
                    showAlert('Error: ' + result.error, 'error');
                }
            } catch (error) {
                showAlert('An error occurred. Please try again.', 'error');
                console.error(error);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Handle logout button
    // Handle logout (Event Delegation for robustness)
    document.addEventListener('click', function (e) {
        const logoutBtn = e.target.closest('#logout-btn');
        if (logoutBtn) {
            e.preventDefault();
            console.log('Logout clicked'); // Debugging

            showConfirm('Are you sure you want to sign out?', async () => {
                await signOut();
                showAlert('Signed out successfully', 'success');

                // Force reload/redirect to ensure UI updates
                setTimeout(() => {
                    const isHtmlDir = window.location.pathname.includes('/html/');
                    window.location.href = isHtmlDir ? '../Index.html' : 'Index.html';
                }, 1000);
            });
        }
    });
});
