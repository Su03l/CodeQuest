/**
 * UI Helper Functions
 * Handles styled alerts (toasts) and confirmation modals
 */

// Create container for toasts if it doesn't exist
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Create confirmation modal container if it doesn't exist
    if (!document.getElementById('confirm-modal')) {
        const modal = document.createElement('div');
        modal.id = 'confirm-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content confirm-content">
                <h2 id="confirm-title">Confirmation</h2>
                <p id="confirm-message">Are you sure?</p>
                <div class="modal-actions">
                    <button id="confirm-cancel" class="btn btn-secondary">Cancel</button>
                    <button id="confirm-ok" class="btn">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
});

/**
 * Show a styled alert (toast)
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showAlert(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return; // Should exist from DOMContentLoaded

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';

    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300); // Wait for fade out animation
    }, 3000);
}

/**
 * Show a styled confirmation modal
 * @param {string} message - The confirmation message
 * @param {Function} onConfirm - Callback function if confirmed
 */
function showConfirm(message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    const msgEl = document.getElementById('confirm-message');
    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    if (!modal) return;

    msgEl.textContent = message;
    modal.classList.add('show');

    // Handle Confirm
    const handleConfirm = () => {
        modal.classList.remove('show');
        cleanup();
        if (onConfirm) onConfirm();
    };

    // Handle Cancel
    const handleCancel = () => {
        modal.classList.remove('show');
        cleanup();
    };

    // Cleanup listeners to avoid duplicates
    const cleanup = () => {
        okBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
    };

    okBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
}
