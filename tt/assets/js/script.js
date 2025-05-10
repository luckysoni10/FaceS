// Utility Function to Handle Redirects
function redirectTo(url) {
    try {
        window.location.href = url;
        console.log(`Redirect successful to ${url}`);
    } catch (error) {
        console.error(`Redirect failed: ${error.message}`);
    }
}

// Logo Click Redirect to TT Index Page (Updated by Grok 3)
document.querySelector('.navbar-brand')?.addEventListener('click', function (e) {
    e.preventDefault(); // Prevent default link behavior
    console.log('Logo clicked! Redirecting to TT index.html');
    redirectTo('/tt/index.html'); // Absolute path to TT index.html
});

// Index Page - Face Scan and Email/Password Login
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.split('/').pop() === 'index.html') {
        // Face Scan Login
        const startScanBtn = document.getElementById('startScan');
        const scanResult = document.getElementById('scanResult');

        startScanBtn?.addEventListener('click', function () {
            startScanBtn.disabled = true;
            startScanBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Scanning...';
            scanResult.textContent = 'Scanning Face...';

            setTimeout(() => {
                const validUsers = [{ username: "lucky_soni", faceId: "face001" }];
                const scanSuccess = validUsers[0]; // Simulated success for Lucky Soni

                if (scanSuccess) {
                    scanResult.classList.remove('failed');
                    scanResult.classList.add('verified');
                    scanResult.textContent = 'Verified';
                    alert('Login successful! Redirecting to dashboard...');
                    setTimeout(() => {
                        redirectTo('../tt/assets/pages/tt-dashboard.html'); // Absolute path to dashboard
                    }, 1000);
                } else {
                    scanResult.classList.remove('verified');
                    scanResult.classList.add('failed');
                    scanResult.textContent = 'Failed. Face not recognized.';
                    alert('Login failed. Please try again or contact support.');
                    startScanBtn.disabled = false;
                    startScanBtn.innerHTML = '<i class="fas fa-camera me-2"></i> Start Face Scan';
                }
            }, 2000);
        });

        // Email and Password Login
        const emailLoginForm = document.getElementById('emailLoginForm');
        const emailLoginResult = document.getElementById('emailLoginResult');

        emailLoginForm?.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            // Hardcoded credentials for testing
            const validCredentials = {
                email: "tt@example.com",
                password: "tt123"
            };

            if (email && password) {
                if (email === validCredentials.email && password === validCredentials.password) {
                    emailLoginResult.classList.remove('failed');
                    emailLoginResult.classList.add('verified');
                    emailLoginResult.textContent = 'Login Successful!';
                    alert('Login successful! Redirecting to dashboard...');
                    setTimeout(() => {
                        redirectTo('/tt/assets/pages/tt-dashboard.html'); // Absolute path to dashboard
                    }, 1000);
                } else {
                    emailLoginResult.classList.remove('verified');
                    emailLoginResult.classList.add('failed');
                    emailLoginResult.textContent = 'Invalid email or password. Please try again.';
                }
            } else {
                emailLoginResult.classList.remove('verified');
                emailLoginResult.classList.add('failed');
                emailLoginResult.textContent = 'Please enter both email and password.';
            }
        });
    }

    // TT Dashboard Functionality
    if (window.location.pathname.split('/').pop() === 'tt-dashboard.html') {
        const passengers = [
            { ticketId: "TICKET001", name: "Lucky Soni", source: "Mumbai", destination: "Delhi", train: "Rajdhani Express", date: "2025-03-10", status: "Confirmed", faceId: "face001" }
        ];

        // Generic Search and Verification Function
        function processSearchOrScan(query, isFaceScan = false) {
            const foundPassenger = passengers.find(p => 
                p.ticketId.toLowerCase() === query.toLowerCase() || 
                p.name.toLowerCase() === query.toLowerCase() || 
                p.faceId.toLowerCase() === query.toLowerCase()
            );

            const searchResult = document.getElementById(isFaceScan ? 'faceScanResult' : 'searchResult');
            const passengerList = document.getElementById('passengerList');
            const ticketDetailsSection = document.getElementById('ticketDetailsSection');

            if (foundPassenger) {
                searchResult.classList.remove('d-none', 'text-danger');
                searchResult.classList.add('text-success');
                searchResult.textContent = `${isFaceScan ? 'Passenger' : 'Passenger'} Found!`;

                passengerList.classList.remove('d-none');
                document.getElementById('passengerTableBody').innerHTML = `
                    <tr>
                        <td><a href="/tt/assets/pages/passenger-ticket-details.html?ticketId=${foundPassenger.ticketId}" class="ticket-link">${foundPassenger.ticketId}</a></td>
                        <td>${foundPassenger.name}</td>
                        <td>${foundPassenger.source}</td>
                        <td>${foundPassenger.destination}</td>
                    </tr>
                `;

                ticketDetailsSection.classList.remove('d-none');
                document.getElementById('ticketId').textContent = foundPassenger.ticketId;
                document.getElementById('passengerName').textContent = foundPassenger.name;
                document.getElementById('source').textContent = foundPassenger.source;
                document.getElementById('destination').textContent = foundPassenger.destination;
                document.getElementById('train').textContent = foundPassenger.train;
                document.getElementById('date').textContent = foundPassenger.date;
                document.getElementById('status').textContent = foundPassenger.status;
                document.getElementById('status').className = `badge bg-${foundPassenger.status === 'Confirmed' ? 'success' : 'warning'}`;
            } else {
                searchResult.classList.remove('d-none', 'text-success');
                searchResult.classList.add('text-danger');
                searchResult.textContent = `${isFaceScan ? 'Face' : 'Passenger'} not found. Please check the input or try again.`;
                passengerList.classList.add('d-none');
                ticketDetailsSection.classList.add('d-none');
            }
        }

        // Search Passenger Functionality
        const searchForm = document.getElementById('searchPassengerForm');
        const searchInput = document.getElementById('searchInput');
        searchForm?.addEventListener('submit', function (e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (!query) {
                alert('Please enter a Ticket ID or Passenger Name to search.');
                return;
            }
            processSearchOrScan(query);
        });

        // Face Scan Functionality
        const startFaceScanBtn = document.getElementById('startFaceScanBtn');
        startFaceScanBtn?.addEventListener('click', function () {
            startFaceScanBtn.disabled = true;
            startFaceScanBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Scanning...';
            document.getElementById('faceScanResult').textContent = 'Scanning Face...';

            setTimeout(() => {
                const scanSuccess = passengers[0]; // Simulated success for Lucky Soni
                processSearchOrScan(scanSuccess.faceId, true);

                startFaceScanBtn.disabled = false;
                startFaceScanBtn.innerHTML = '<i class="fas fa-camera me-2"></i> Start Face Scan';
            }, 2000);
        });

        // Logout Functionality (Updated by Grok 3)
        document.getElementById('logoutBtn')?.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                alert('Logging out...');
                redirectTo('/tt/index.html'); // Absolute path to TT index.html
            }
        });
    }

    console.log("TT Travel Script loaded successfully!");
});
