// App State
let complaints = JSON.parse(localStorage.getItem('complaints')) || [];
let currentFilter = 'all';
let isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

const form = document.getElementById('complaint-form');
const listContainer = document.getElementById('complaints-list');
const openCountEl = document.getElementById('open-count');
const resolvedCountEl = document.getElementById('resolved-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');
const clearResolvedBtn = document.getElementById('clear-resolved');
const logoutBtn = document.getElementById('logout-btn');

// Theme Logic
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Auth Initial Check
if (isAuthenticated) {
    showApp();
}

// Initial Render
renderComplaints();
updateStats();

// Event Listeners
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin();
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const flatNumber = document.getElementById('flat-number').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const urgency = document.querySelector('input[name="urgency"]:checked').value;

    const newComplaint = {
        id: Date.now(),
        category,
        description,
        urgency,
        status: 'open',
        timestamp: new Date().toLocaleString(),
        location: `Apartment ${flatNumber}`
    };

    complaints.unshift(newComplaint); // Add completely new one to the top
    saveAndRender();
    form.reset();
});

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    location.reload(); // Simple way to reset everything
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');

    if (theme === 'dark') {
        icon.className = 'ph-fill ph-moon';
        text.textContent = 'Dark Mode';
    } else {
        icon.className = 'ph-fill ph-sun';
        text.textContent = 'Light Mode';
    }
}

// Filter Functionality

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active to clicked
        btn.classList.add('active');

        currentFilter = btn.dataset.filter;
        renderComplaints();
    });
});

clearResolvedBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all resolved complaints? This action cannot be undone.')) {
        complaints = complaints.filter(c => c.status !== 'resolved');
        saveAndRender();
    }
});

// Helper Functions
function handleLogin() {
    // Simple mock authentication - anyone can login for now
    localStorage.setItem('isLoggedIn', 'true');
    showApp();
}

function showApp() {
    loginScreen.style.display = 'none';
    mainApp.style.display = 'grid';
    // Re-render specifically for layout adjustments if needed
    renderComplaints();
}

function saveAndRender() {
    localStorage.setItem('complaints', JSON.stringify(complaints));
    renderComplaints();
    updateStats();
}

function updateStats() {
    const open = complaints.filter(c => c.status === 'open').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;

    openCountEl.textContent = open;
    resolvedCountEl.textContent = resolved;
}

function renderComplaints() {
    listContainer.innerHTML = '';

    let filtered = complaints;
    if (currentFilter !== 'all') {
        filtered = complaints.filter(c => c.status === currentFilter);
    }

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <i class="ph-duotone ph-clipboard-text"></i>
                <p>No ${currentFilter === 'all' ? '' : currentFilter} complaints found.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(complaint => {
        const card = document.createElement('div');
        card.className = 'complaint-card';

        const isResolved = complaint.status === 'resolved';

        card.innerHTML = `
            <div class="card-content">
                <h3>
                    <span class="category-icon">${getIconForCategory(complaint.category)}</span>
                    ${complaint.category}
                    <span class="status-badge ${complaint.status}">${complaint.status}</span>
                </h3>
                <div class="card-meta">
                    <span><i class="ph ph-map-pin"></i> ${complaint.location}</span>
                    <span><i class="ph ph-clock"></i> ${complaint.timestamp}</span>
                    <span><i class="ph ph-warning"></i> ${complaint.urgency} Priority</span>
                </div>
                <div class="card-body">
                    ${complaint.description}
                </div>
            </div>
            <div class="card-actions">
                <button class="resolve-btn" onclick="toggleStatus(${complaint.id})" title="${isResolved ? 'Mark as Open' : 'Mark as Resolved'}">
                    <i class="ph-bold ${isResolved ? 'ph-arrow-counter-clockwise' : 'ph-check'}"></i>
                </button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// Make toggleStatus global so it can be called from HTML onclick
window.toggleStatus = (id) => {
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
        complaint.status = complaint.status === 'open' ? 'resolved' : 'open';
        saveAndRender();
    }
};

function getIconForCategory(category) {
    const icons = {
        'Water Leakage': '💧',
        'Power Failure': '⚡',
        'Lift Malfunction': '🛗',
        'Garbage/Hygiene': '🗑️',
        'Noise Complaint': '🔊',
        'Other': '📝'
    };
    return icons[category] || '📌';
}
