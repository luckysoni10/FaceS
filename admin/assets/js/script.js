// Wait for OpenCV to load
function onOpenCvReady() {
    console.log('OpenCV.js is ready!');
}

// Generic Search Function
function setupSearch(tableId, searchInputId, searchButtonId) {
    const searchInput = document.getElementById(searchInputId);
    const searchButton = document.getElementById(searchButtonId);
    const table = document.getElementById(tableId)?.querySelector('table');
    if (!table) return;

    const tableRows = table.querySelectorAll('tbody tr');

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        tableRows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            row.style.display = rowText.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Edit and Delete Functionality for Tables
function setupTableActions(tableId) {
    const table = document.getElementById(tableId)?.querySelector('table');
    if (!table) return;

    table.addEventListener('click', (e) => {
        const target = e.target;
        const row = target.closest('tr');
        if (!row) return;

        if (target.textContent === 'Delete') {
            e.preventDefault();
            if (confirm('Are you sure you want to delete this entry?')) {
                row.remove();
            }
        }

        if (target.textContent === 'Edit') {
            e.preventDefault();
            const cells = row.querySelectorAll('td');
            const id = cells[0].textContent;
            const name = cells[1].textContent;
            const email = cells[2].textContent;

            cells[1].innerHTML = `<input type="text" value="${name}" class="form-control">`;
            cells[2].innerHTML = `<input type="email" value="${email}" class="form-control">`;
            cells[3].innerHTML = `
                <a href="#" class="save">Save</a> | 
                <a href="#" class="cancel">Cancel</a>
            `;
        }

        if (target.textContent === 'Save') {
            e.preventDefault();
            const cells = row.querySelectorAll('td');
            const newName = cells[1].querySelector('input').value;
            const newEmail = cells[2].querySelector('input').value;

            cells[1].textContent = newName;
            cells[2].textContent = newEmail;
            cells[3].innerHTML = `
                <a href="#">Edit</a> | 
                <a href="#">Delete</a>
            `;
        }

        if (target.textContent === 'Cancel') {
            e.preventDefault();
            const cells = row.querySelectorAll('td');
            const originalName = cells[1].querySelector('input').defaultValue;
            const originalEmail = cells[2].querySelector('input').defaultValue;

            cells[1].textContent = originalName;
            cells[2].textContent = originalEmail;
            cells[3].innerHTML = `
                <a href="#">Edit</a> | 
                <a href="#">Delete</a>
            `;
        }
    });
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', () => {
    // Face Scan Functionality
    const video = document.getElementById('camera-feed');
    const faceScanBtn = document.getElementById('face-scan-btn');
    const scanResult = document.getElementById('scanResult');

    if (video) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => video.srcObject = stream)
            .catch(err => console.error('Camera access denied:', err));

        faceScanBtn?.addEventListener('click', () => {
            scanResult.textContent = 'Scanning...';
            setTimeout(() => {
                scanResult.textContent = 'Face detected successfully!';
                scanResult.className = 'text-success';
                setTimeout(() => window.location.href = '../admin/assets/pages/admin-dashboard.html', 1000);
            }, 2000);
        });
    }

    // Sidebar Navigation Highlighting and Logout
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    const logoutBtn = document.getElementById('logout');
    const currentPage = window.location.pathname.split('/').pop() || 'admin-dashboard.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href').split('/').pop();
        if (href === currentPage) {
            link.classList.add('active');
        }

        link.addEventListener('mouseenter', () => {
            if (!link.classList.contains('active') && link.id !== 'logout') {
                link.style.backgroundColor = '#0056b3';
                link.style.color = '#fff';
            }
        });

        link.addEventListener('mouseleave', () => {
            if (!link.classList.contains('active') && link.id !== 'logout') {
                link.style.backgroundColor = '';
                link.style.color = '#333';
            }
        });
    });

    // Logout Functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '../../index.html'; // Redirect to index.html
            }
        });
    }

    // Setup Search and Table Actions
    setupSearch('passengerList', 'searchInput', 'searchButton');
    setupSearch('ttList', 'searchInput', 'searchButton');
    setupTableActions('passengerList');
    setupTableActions('ttList');

    // Reports & Analytics Dynamic Data
    const userReportsSection = document.querySelector('main > div:nth-child(1)');
    if (userReportsSection) {
        const userData = [
            { label: 'Total Users', value: 500 },
            { label: 'Active Users', value: 450 },
            { label: 'Inactive Users', value: 50 }
        ];

        userData.forEach(item => {
            const p = document.createElement('p');
            p.textContent = `${item.label}: ${item.value}`;
            p.className = 'text-muted';
            userReportsSection.appendChild(p);
        });
    }
});

