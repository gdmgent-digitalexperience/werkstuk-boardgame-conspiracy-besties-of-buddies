// reset-game.js - Reset button functionaliteit

document.addEventListener('DOMContentLoaded', function() {
    const resetBtn = document.querySelector('.reset-btn');
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            showResetConfirm();
        });
    }
});

function showResetConfirm() {
    // Controleer of popup al bestaat
    let confirmDialog = document.querySelector('.reset-confirm-dialog');
    if (confirmDialog) {
        confirmDialog.remove();
    }

    // Creëer confirm dialog
    confirmDialog = document.createElement('div');
    confirmDialog.className = 'reset-confirm-dialog';
    confirmDialog.innerHTML = `
        <div class="reset-confirm-content">
            <h3>Spel resetten?</h3>
            <p>Dit wist alle voortgang en speeldata.</p>
            <div class="reset-confirm-buttons">
                <button class="reset-confirm-btn reset-cancel">Annuleren</button>
                <button class="reset-confirm-btn reset-confirm">Ja, resetten</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmDialog);
    
    // Animatie in
    setTimeout(() => {
        confirmDialog.classList.add('active');
    }, 10);
    
    // Event listeners
    document.querySelector('.reset-cancel').addEventListener('click', function() {
        confirmDialog.classList.remove('active');
        setTimeout(() => confirmDialog.remove(), 300);
    });
    
    document.querySelector('.reset-confirm').addEventListener('click', function() {
        resetGame();
        confirmDialog.classList.remove('active');
        setTimeout(() => confirmDialog.remove(), 300);
    });
    
    // Sluit met ESC toets
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            confirmDialog.classList.remove('active');
            setTimeout(() => confirmDialog.remove(), 300);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function resetGame() {
    // Wis alle localStorage data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('inventory_')) {
            localStorage.removeItem(key);
        }
    });
    
    // Redirect naar index.html
    window.location.href = './index.html';
}
