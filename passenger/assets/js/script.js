// Base URL for backend APIs
const BASE_URL = 'http://localhost/FACES/backend/api/';

// Logo Click Redirect to Index Page
document.querySelector('.navbar-brand')?.addEventListener('click', function (e) {
    e.preventDefault(); // Prevent default link behavior
    const currentPage = window.location.pathname.split('/').pop();

    console.log('Logo clicked! Current page:', currentPage);

    if (currentPage === 'index.html') {
        console.log('Already on index.html, no redirect needed.');
    } else {
        console.log('Redirecting to ../../index.html');
        try {
            window.location.href = '../../index.html'; // Redirect to index.html in root directory (2 levels up)
            console.log('Redirect successful!');
        } catch (error) {
            console.error('Redirect failed:', error);
        }
    }
});

// Navbar Scroll Effect
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Button Hover Animation
const buttons = document.querySelectorAll('.btn, .animate-button');
buttons.forEach(button => {
    button.addEventListener('mouseover', function () {
        this.style.transition = 'transform 0.3s ease';
        this.style.transform = 'translateY(-3px)';
    });
    button.addEventListener('mouseout', function () {
        this.style.transform = 'translateY(0)';
    });
});

// Webcam Utilities
async function startWebcam(videoElement) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
    } catch (err) {
        console.error('Webcam error:', err);
        alert('Unable to access webcam. Please allow camera permissions.');
    }
}

function stopWebcam(videoElement) {
    const stream = videoElement.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
    }
}

// Sign Up Page - Face Scan with Webcam
let capturedImage = null;

document.getElementById('startScan')?.addEventListener('click', async function () {
    const name = document.getElementById('name')?.value.trim();
    const scanResultElement = document.getElementById('scanResult');
    const registerBtn = document.getElementById('registerBtn');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');

    if (!name) {
        scanResultElement.classList.remove('d-none', 'text-success');
        scanResultElement.classList.add('text-danger');
        scanResultElement.textContent = 'Please enter your name.';
        return;
    }

    // Start webcam
    await startWebcam(video);
    const context = canvas.getContext('2d');

    // Capture image after 2 seconds
    setTimeout(() => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedImage = canvas.toDataURL('image/png');
        stopWebcam(video);

        scanResultElement.classList.remove('d-none', 'text-danger');
        scanResultElement.classList.add('text-success');
        scanResultElement.textContent = 'Face captured successfully.';
        registerBtn.disabled = false; // Enable register button
    }, 2000);
});

// Sign Up Page - Form Submission
document.getElementById('signupForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const formMessage = document.getElementById('formMessage');
    const registerBtnText = document.getElementById('registerBtnText');
    const registerBtnSpinner = document.getElementById('registerBtnSpinner');

    if (!name || !email || !password || !capturedImage) {
        formMessage.classList.remove('d-none', 'alert-success');
        formMessage.classList.add('alert-danger');
        formMessage.textContent = 'Please fill all fields and scan your face.';
        return;
    }

    registerBtnText.classList.add('d-none');
    registerBtnSpinner.classList.remove('d-none');

    const formData = { name, email, password, face_data: capturedImage };

    try {
        const response = await fetch(`${BASE_URL}signup.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok) {
            formMessage.classList.remove('d-none', 'alert-danger');
            formMessage.classList.add('alert-success');
            formMessage.textContent = data.message;
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } else {
            formMessage.classList.remove('d-none', 'alert-success');
            formMessage.classList.add('alert-danger');
            formMessage.textContent = data.error;
        }
    } catch (error) {
        console.error('Signup error:', error);
        formMessage.classList.remove('d-none', 'alert-success');
        formMessage.classList.add('alert-danger');
        formMessage.textContent = 'An error occurred during signup.';
    } finally {
        registerBtnText.classList.remove('d-none');
        registerBtnSpinner.classList.add('d-none');
    }
});

// Login Page - Face Scan with Webcam
document.getElementById('startFaceScan')?.addEventListener('click', async function () {
    const scanResultElement = document.getElementById('scanResultFace');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');

    await startWebcam(video);
});

// Capture Face button in Face Scan Modal
document.getElementById('captureFace')?.addEventListener('click', async function () {
    const scanResultElement = document.getElementById('scanResultFace');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const modal = bootstrap.Modal.getInstance(document.getElementById('faceScanModal'));

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    capturedImage = canvas.toDataURL('image/png');
    stopWebcam(video);
    modal.hide();

    // Send to backend for face matching
    try {
        const response = await fetch(`${BASE_URL}login_face.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ face_image: capturedImage })
        });
        const data = await response.json();
        if (response.ok) {
            scanResultElement.classList.remove('d-none', 'text-danger');
            scanResultElement.classList.add('text-success');
            scanResultElement.textContent = 'Face scan successful.';
            localStorage.setItem('user', JSON.stringify(data));
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            scanResultElement.classList.remove('d-none', 'text-success');
            scanResultElement.classList.add('text-danger');
            scanResultElement.textContent = 'Face not recognized.';
        }
    } catch (error) {
        console.error('Face login error:', error);
        scanResultElement.classList.remove('d-none', 'text-success');
        scanResultElement.classList.add('text-danger');
        scanResultElement.textContent = 'An error occurred during face login.';
    }
});

// Login Page - Form Submission
document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const formMessage = document.getElementById('formMessage');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginBtnSpinner = document.getElementById('loginBtnSpinner');

    if (!email || !password) {
        formMessage.classList.remove('d-none', 'alert-success');
        formMessage.classList.add('alert-danger');
        formMessage.textContent = 'Please enter both email and password.';
        return;
    }

    loginBtnText.classList.add('d-none');
    loginBtnSpinner.classList.remove('d-none');

    try {
        const response = await fetch(`${BASE_URL}login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            formMessage.classList.remove('d-none', 'alert-danger');
            formMessage.classList.add('alert-success');
            formMessage.textContent = 'Login successful! Redirecting to Dashboard...';
            localStorage.setItem('user', JSON.stringify(data));
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            formMessage.classList.remove('d-none', 'alert-success');
            formMessage.classList.add('alert-danger');
            formMessage.textContent = data.error;
        }
    } catch (error) {
        console.error('Login error:', error);
        formMessage.classList.remove('d-none', 'alert-success');
        formMessage.classList.add('alert-danger');
        formMessage.textContent = 'An error occurred during login.';
    } finally {
        loginBtnText.classList.remove('d-none');
        loginBtnSpinner.classList.add('d-none');
    }
});

// Dynamic Heading Based on Page
document.addEventListener('DOMContentLoaded', async function () {
    const welcomeMessage = document.querySelector('.animate-welcome');
    const loading = document.getElementById('loading');
    const ticketCards = document.getElementById('ticketCards');
    const profileName = document.getElementById('profileName');
    const profilePic = document.getElementById('profilePic');
    const profileForm = document.getElementById('profileForm');
    const formMessage = document.getElementById('formMessage');

    if (welcomeMessage) {
        const currentPage = window.location.pathname.split('/').pop();

        switch (currentPage) {
            case 'index.html':
                welcomeMessage.innerHTML = '<i class="fas fa-train"></i> Welcome';
                break;
            case 'signup.html':
                welcomeMessage.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
                break;
            case 'login.html':
                welcomeMessage.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                break;
            case 'dashboard.html':
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                welcomeMessage.innerHTML = `<i class="fas fa-check-circle"></i> Welcome, ${user.name || '[User Name]'}!`;
                document.getElementById('mainPersonName').textContent = user.name || '[User Name]';
                document.getElementById('mainPersonId').textContent = user.user_id || '[User ID]';
                break;
            case 'ticket-booking.html':
                welcomeMessage.innerHTML = '<i class="fas fa-ticket-alt"></i> Ticket Booking';
                break;
            case 'my-tickets.html':
                welcomeMessage.innerHTML = '<i class="fas fa-ticket-alt"></i> My Tickets';
                break;
            case 'profile.html':
                welcomeMessage.innerHTML = '<i class="fas fa-user"></i> My Profile';
                break;
            case 'payment.html':
                welcomeMessage.innerHTML = '<i class="fas fa-credit-card"></i> Payment';
                break;
            case 'ticket-confirmation.html':
                welcomeMessage.innerHTML = '<i class="fas fa-check-circle"></i> Ticket Confirmation';
                break;
            case 'station-verification.html':
                welcomeMessage.innerHTML = '<i class="fas fa-camera"></i> Station Verification';
                break;
            case 'access-granted.html':
                welcomeMessage.innerHTML = '<i class="fas fa-check-circle"></i> Access Granted';
                break;
            case 'access-denied.html':
                welcomeMessage.innerHTML = '<i class="fas fa-ban"></i> Access Denied';
                break;
            case 'contact-support.html':
                welcomeMessage.innerHTML = '<i class="fas fa-headset"></i> Contact Support';
                break;
            default:
                welcomeMessage.innerHTML = '<i class="fas fa-train"></i> Welcome';
        }

        welcomeMessage.classList.add('animate__animated', 'animate__fadeInDown');
    }

    // Fetch and display profile details
    if (profileName && profilePic && profileForm) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.name) {
            profileName.textContent = user.name || '[Name]';
            document.getElementById('fullName').value = user.name || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('gender').value = user.gender || 'Male';
            document.getElementById('dob').value = user.dob || '';

            // Set profile picture if available
            if (user.profile_pic) {
                profilePic.src = user.profile_pic; // Assuming profile_pic is a URL or base64
            }
        } else {
            formMessage.classList.remove('d-none', 'alert-success');
            formMessage.classList.add('alert-danger');
            formMessage.textContent = 'User data not found. Please login again.';
        }

        // Handle profile form submission
        profileForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formMessage = document.getElementById('formMessage');
            const saveBtnText = profileForm.querySelector('button[type="submit"] .text');
            const saveBtnSpinner = profileForm.querySelector('button[type="submit"] .spinner');

            if (saveBtnText && saveBtnSpinner) {
                saveBtnText.classList.add('d-none');
                saveBtnSpinner.classList.remove('d-none');
            }

            const updatedData = {
                user_id: user.user_id,
                name: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                gender: document.getElementById('gender').value,
                dob: document.getElementById('dob').value
            };

            try {
                const response = await fetch(`${BASE_URL}update_profile.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });
                const data = await response.json();
                if (response.ok) {
                    formMessage.classList.remove('d-none', 'alert-danger');
                    formMessage.classList.add('alert-success');
                    formMessage.textContent = 'Profile updated successfully!';
                    localStorage.setItem('user', JSON.stringify({ ...user, ...updatedData }));
                } else {
                    formMessage.classList.remove('d-none', 'alert-success');
                    formMessage.classList.add('alert-danger');
                    formMessage.textContent = data.error || 'Failed to update profile.';
                }
            } catch (error) {
                console.error('Profile update error:', error);
                formMessage.classList.remove('d-none', 'alert-success');
                formMessage.classList.add('alert-danger');
                formMessage.textContent = 'An error occurred while updating profile.';
            } finally {
                if (saveBtnText && saveBtnSpinner) {
                    saveBtnText.classList.remove('d-none');
                    saveBtnSpinner.classList.add('d-none');
                }
            }
        });

        // Handle profile picture upload
        window.uploadProfilePic = async function (event) {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('profile_pic', file);
                formData.append('user_id', user.user_id);

                try {
                    const response = await fetch(`${BASE_URL}upload_profile_pic.php`, {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();
                    if (response.ok) {
                        formMessage.classList.remove('d-none', 'alert-danger');
                        formMessage.classList.add('alert-success');
                        formMessage.textContent = 'Profile picture updated successfully!';
                        profilePic.src = data.profile_pic; // Update image source
                        localStorage.setItem('user', JSON.stringify({ ...user, profile_pic: data.profile_pic }));
                    } else {
                        formMessage.classList.remove('d-none', 'alert-success');
                        formMessage.classList.add('alert-danger');
                        formMessage.textContent = data.error || 'Failed to upload profile picture.';
                    }
                } catch (error) {
                    console.error('Profile pic upload error:', error);
                    formMessage.classList.remove('d-none', 'alert-success');
                    formMessage.classList.add('alert-danger');
                    formMessage.textContent = 'An error occurred while uploading profile picture.';
                }
            }
        };
    }

    // Fetch and display upcoming tickets
    if (ticketCards) {
        loading.classList.remove('d-none');
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await fetch(`${BASE_URL}get_tickets.php?user_id=${user.user_id || '[User ID]'}`);
            const tickets = await response.json();
            if (response.ok && tickets.length > 0) {
                tickets.forEach(ticket => {
                    const ticketCard = document.createElement('div');
                    ticketCard.className = 'ticket-card mb-3';
                    ticketCard.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">Ticket #${ticket.ticket_id || 'N/A'}</h5>
                            <p class="card-text"><strong>Source:</strong> ${ticket.source_station || 'N/A'}</p>
                            <p class="card-text"><strong>Destination:</strong> ${ticket.destination_station || 'N/A'}</p>
                            <p class="card-text"><strong>Train:</strong> ${ticket.train_number || 'N/A'}</p>
                            <p class="card-text"><strong>Date:</strong> ${ticket.journey_date || 'N/A'}</p>
                            <p class="card-text"><strong>Amount:</strong> ₹${ticket.total_amount || 'N/A'}</p>
                            <p class="card-text"><strong>Status:</strong> <span class="badge ${ticket.payment_status === 'confirmed' ? 'bg-success' : 'bg-warning text-dark'}">${ticket.payment_status || 'Pending'}</span></p>
                            <div class="mt-3">
                                <button class="btn btn-info btn-sm me-2 animate-button view-details-btn" data-ticket-id="${ticket.ticket_id || ''}">View Details</button>
                                <button class="btn btn-outline-danger btn-sm animate-button cancel-ticket-btn" data-ticket-id="${ticket.ticket_id || ''}"><i class="fas fa-trash"></i> Cancel Ticket</button>
                            </div>
                        </div>
                    `;
                    ticketCards.appendChild(ticketCard);
                });

                // Add event listeners for View Details buttons
                document.querySelectorAll('.view-details-btn').forEach(button => {
                    button.addEventListener('click', function (e) {
                        e.preventDefault();
                        const ticketId = this.getAttribute('data-ticket-id');
                        const modalBody = document.querySelector('#ticketDetailsModal .modal-body');
                        modalBody.innerHTML = `
                            <p><strong>Ticket ID:</strong> ${ticketId}</p>
                            <p><strong>Passenger:</strong> ${user.name || '[Logged-in User]'}</p>
                            <p><strong>Status:</strong> Confirmed</p>
                        `;
                        const modal = new bootstrap.Modal(document.getElementById('ticketDetailsModal'));
                        modal.show();
                    });
                });

                // Add event listeners for Cancel Ticket buttons
                document.querySelectorAll('.cancel-ticket-btn').forEach(button => {
                    button.addEventListener('click', async function (e) {
                        e.preventDefault();
                        const ticketId = this.getAttribute('data-ticket-id');
                        if (confirm(`Are you sure you want to cancel Ticket #${ticketId}?`)) {
                            try {
                                const response = await fetch(`${BASE_URL}cancel_ticket.php`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ticket_id: ticketId })
                                });
                                const data = await response.json();
                                if (response.ok) {
                                    alert('Ticket cancelled successfully!');
                                    window.location.reload(); // Reload to refresh ticket list
                                } else {
                                    alert(data.error || 'Failed to cancel ticket.');
                                }
                            } catch (error) {
                                console.error('Cancel ticket error:', error);
                                alert('An error occurred while cancelling the ticket.');
                            }
                        }
                    });
                });
            } else {
                ticketCards.innerHTML = '<p class="text-center text-muted">No upcoming tickets found.</p>';
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            ticketCards.innerHTML = '<p class="text-center text-danger">Failed to load tickets. Please try again later.</p>';
        } finally {
            loading.classList.add('d-none');
        }
    }
});

// Dashboard Page - Logout Functionality
document.getElementById('logoutBtn')?.addEventListener('click', function (e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        alert('Logging out...');
        window.location.href = '../../index.html';
    }
});

// Ticket Booking Page - Form Validation and Proceed to Payment
let bookingDetails = {};
let groupMembers = [];

document.getElementById('bookingForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    proceedToPayment();
});

document.getElementById('proceedToPaymentBtn')?.addEventListener('click', proceedToPayment);

async function proceedToPayment() {
    const sourceStation = document.getElementById('sourceStation')?.value;
    const destinationStation = document.getElementById('destinationStation')?.value;
    const trainSelect = document.getElementById('trainSelect')?.value;
    const travelDate = document.getElementById('travelDate')?.value;
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!sourceStation || !destinationStation || !trainSelect || !travelDate || sourceStation === destinationStation) {
        alert('Please fill all fields correctly. Source and Destination cannot be the same.');
        return;
    }

    const ticketData = {
        booked_by: user.user_id || '[User ID]',
        train_number: trainSelect,
        source_station: sourceStation,
        destination_station: destinationStation,
        journey_date: travelDate,
        total_amount: (groupMembers.length + 1) * 1500, // Example amount
        payment_status: 'pending',
        passengers: groupMembers.length > 0 ? groupMembers : [{ name: user.name || '[Logged-in User]', id: user.user_id || '[User ID]' }]
    };

    try {
        const response = await fetch(`${BASE_URL}book_ticket.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData)
        });
        const data = await response.json();
        if (response.ok) {
            bookingDetails = { ...ticketData, ticket_id: data.ticket_id };
            localStorage.setItem('ticket', JSON.stringify(bookingDetails));
            alert('Ticket booked! Redirecting to payment...');
            window.location.href = 'payment.html';
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Booking error:', error);
        alert('An error occurred during booking.');
    }
}

// Group Travel Functionality
const groupTravelBtn = document.getElementById('groupTravelBtn');
const groupTravelSection = document.getElementById('groupTravelSection');
const confirmGroupBtn = document.getElementById('confirmGroupBtn');
const addMemberBtn = document.getElementById('addMemberBtn');
const groupMembersContainer = document.getElementById('groupMembers');
let memberCount = 1;

groupTravelBtn?.addEventListener('click', function () {
    groupTravelSection.style.display = 'block';
    groupTravelSection.scrollIntoView({ behavior: 'smooth' });
    simulateFaceScanForMain();
});

addMemberBtn?.addEventListener('click', function () {
    if (memberCount < 5) {
        memberCount++;
        const memberDiv = document.createElement('div');
        memberDiv.className = 'mb-3';
        memberDiv.id = `memberContainer${memberCount}`;
        memberDiv.innerHTML = `
            <label for="memberName${memberCount}" class="form-label">Passenger ${memberCount} Name</label>
            <input type="text" class="form-control" id="memberName${memberCount}" placeholder="Enter name" required>
            <button type="button" class="btn btn-outline-primary mt-2" id="scanMember${memberCount}">
                <i class="fas fa-camera"></i> Scan Face
            </button>
            <small id="scanResult${memberCount}" class="form-text text-danger d-none">Scan failed.</small>
        `;
        groupMembersContainer.appendChild(memberDiv);
    } else {
        alert('Maximum 5 passengers allowed (including main person).');
    }
});

confirmGroupBtn?.addEventListener('click', async function () {
    groupMembers = [];
    let allScanned = true;

    const mainScanResult = document.getElementById('scanResultMain').classList.contains('d-none');
    if (!mainScanResult) {
        allScanned = false;
        alert('Main person face scan failed. Please scan again.');
        return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    groupMembers.push({ name: user.name || '[Logged-in User]', id: user.user_id || '[User ID]' });

    for (let i = 1; i <= memberCount; i++) {
        const memberName = document.getElementById(`memberName${i}`)?.value;
        if (memberName) {
            const scanResultElement = document.getElementById(`scanResult${i}`);
            const scanResult = simulateFaceScan(memberName);
            if (scanResult) {
                scanResultElement.classList.add('d-none');
                groupMembers.push({ name: memberName, id: scanResult.id });
            } else {
                scanResultElement.classList.remove('d-none');
                allScanned = false;
                if (confirm(`Passenger ${memberName} is new. Do you want to sign up first?`)) {
                    window.location.href = 'signup.html';
                }
            }
        }
    }

    if (allScanned && groupMembers.length > 0) {
        alert('All passengers validated. Booking a single ticket for the group...');
        proceedToPayment();
    } else {
        alert('Please ensure all passengers are scanned and validated.');
    }
});

// Simulate Face Scan for Main Person
function simulateFaceScanForMain() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const mainPersonName = user.name || '[Logged-in User]';
    const scanResult = simulateFaceScan(mainPersonName);
    const scanResultElement = document.getElementById('scanResultMain');
    if (scanResult) {
        scanResultElement.classList.add('d-none');
        alert(`Face scan for ${mainPersonName} successful. ID verified.`);
    } else {
        scanResultElement.classList.remove('d-none');
        alert(`Face scan for ${mainPersonName} failed. Please contact support.`);
    }
}

// Simulate Face Scan (Temporary until real face recognition is integrated)
function simulateFaceScan(memberName) {
    const registeredFaces = {
        'John Doe': { id: 'JD001', fullName: 'John Doe', email: 'john@example.com' },
        'Jane Smith': { id: 'JS002', fullName: 'Jane Smith', email: 'jane@example.com' },
        '[Logged-in User]': { id: '[User ID]', fullName: '[Logged-in User]', email: 'user@example.com' }
    };
    return registeredFaces[memberName] ? registeredFaces[memberName] : false;
}

// Dynamic Scan Buttons for Group Members
document.addEventListener('click', function (e) {
    if (e.target && e.target.id.startsWith('scanMember')) {
        const memberId = e.target.id.replace('scanMember', '');
        const memberName = document.getElementById(`memberName${memberId}`)?.value;
        const scanResultElement = document.getElementById(`scanResult${memberId}`);
        if (memberName) {
            const scanResult = simulateFaceScan(memberName);
            if (scanResult) {
                scanResultElement.classList.add('d-none');
                alert(`Face scan for ${memberName} successful. ID verified.`);
            } else {
                scanResultElement.classList.remove('d-none');
                alert(`Face scan for ${memberName} failed. ID not found or new user.`);
            }
        } else {
            alert('Please enter a name before scanning.');
        }
    }
    if (e.target && e.target.id === 'scanMainPerson') {
        simulateFaceScanForMain();
    }
});

// Payment Page - Populate Ticket Details and Handle Payment
document.addEventListener('DOMContentLoaded', function () {
    const ticketDetailsCard = document.getElementById('ticketDetailsCard');
    if (ticketDetailsCard) {
        const ticket = JSON.parse(localStorage.getItem('ticket') || '{}');
        ticketDetailsCard.innerHTML = `
            <p><strong>Ticket ID:</strong> ${ticket.ticket_id || 'N/A'}</p>
            <p><strong>Source:</strong> ${ticket.source_station || 'N/A'}</p>
            <p><strong>Destination:</strong> ${ticket.destination_station || 'N/A'}</p>
            <p><strong>Train:</strong> ${ticket.train_number || 'N/A'}</p>
            <p><strong>Date:</strong> ${ticket.journey_date || 'N/A'}</p>
            <p><strong>Total Amount:</strong> ₹${ticket.total_amount || 'N/A'}</p>
            <p><strong>Passengers:</strong> ${ticket.passengers?.map(p => p.name).join(', ') || 'N/A'}</p>
        `;

        const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
        const paymentFields = document.getElementById('paymentFields');
        if (paymentMethodRadios && paymentFields) {
            paymentMethodRadios.forEach(radio => {
                radio.addEventListener('change', function () {
                    if (this.value === 'creditCard') {
                        paymentFields.innerHTML = `
                            <div class="payment-fields">
                                <div class="mb-4">
                                    <label for="cardNumber" class="form-label">Card Number</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control rounded-end animate-input" id="cardNumber" placeholder="1234 5678 9012 3456" required autocomplete="cc-number">
                                        <span class="input-group-text bg-primary text-white"><i class="fas fa-credit-card"></i></span>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-4">
                                        <label for="expiryDate" class="form-label">Expiry Date</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control rounded-end animate-input" id="expiryDate" placeholder="MM/YY" required autocomplete="cc-exp">
                                            <span class="input-group-text bg-primary text-white"><i class="fas fa-calendar-alt"></i></span>
                                        </div>
                                    </div>
                                    <div class="col-md-6 mb-4">
                                        <label for="cvv" class="form-label">CVV</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control rounded-end animate-input" id="cvv" placeholder="123" required autocomplete="cc-csc">
                                            <span class="input-group-text bg-primary text-white"><i class="fas fa-lock"></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else if (this.value === 'upi') {
                        paymentFields.innerHTML = `
                            <div class="payment-fields mb-4">
                                <label for="upiId" class="form-label">UPI ID</label>
                                <div class="input-group">
                                    <input type="text" class="form-control rounded-end animate-input" id="upiId" placeholder="example@bank" required autocomplete="section-upi">
                                    <span class="input-group-text bg-primary text-white"><i class="fas fa-mobile-alt"></i></span>
                                </div>
                            </div>
                        `;
                    } else if (this.value === 'netBanking') {
                        paymentFields.innerHTML = `
                            <div class="payment-fields mb-4">
                                <label for="bankAccount" class="form-label">Bank Account</label>
                                <div class="input-group">
                                    <input type="text" class="form-control rounded-end animate-input" id="bankAccount" placeholder="Account Number" required autocomplete="section-bank">
                                    <span class="input-group-text bg-primary text-white"><i class="fas fa-university"></i></span>
                                </div>
                            </div>
                        `;
                    }
                });
            });
            // Trigger change event to load default fields (credit card)
            document.querySelector('input[name="paymentMethod"]:checked')?.dispatchEvent(new Event('change'));
        }

        document.getElementById('paymentForm')?.addEventListener('submit', async function (e) {
            e.preventDefault();
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
            const formMessage = document.getElementById('formMessage');
            const paymentBtnText = document.getElementById('paymentBtnText');
            const paymentBtnSpinner = document.getElementById('paymentBtnSpinner');
            let isValid = true;

            if (!formMessage) {
                console.error('formMessage element not found!');
                alert('An error occurred. Please refresh the page.');
                return;
            }

            if (paymentMethod === 'creditCard') {
                const cardNumber = document.getElementById('cardNumber')?.value;
                const expiryDate = document.getElementById('expiryDate')?.value;
                const cvv = document.getElementById('cvv')?.value;
                if (!cardNumber || !expiryDate || !cvv) {
                    formMessage.classList.remove('d-none', 'alert-success');
                    formMessage.classList.add('alert-danger');
                    formMessage.textContent = 'Please fill all credit card details.';
                    isValid = false;
                }
            } else if (paymentMethod === 'upi') {
                const upiId = document.getElementById('upiId')?.value;
                if (!upiId) {
                    formMessage.classList.remove('d-none', 'alert-success');
                    formMessage.classList.add('alert-danger');
                    formMessage.textContent = 'Please enter a valid UPI ID.';
                    isValid = false;
                }
            } else if (paymentMethod === 'netBanking') {
                const bankAccount = document.getElementById('bankAccount')?.value;
                if (!bankAccount) {
                    formMessage.classList.remove('d-none', 'alert-success');
                    formMessage.classList.add('alert-danger');
                    formMessage.textContent = 'Please enter a valid bank account number.';
                    isValid = false;
                }
            }

            if (isValid) {
                if (paymentBtnText && paymentBtnSpinner) {
                    paymentBtnText.classList.add('d-none');
                    paymentBtnSpinner.classList.remove('d-none');
                }

                const ticket = JSON.parse(localStorage.getItem('ticket') || '{}');
                try {
                    const response = await fetch(`${BASE_URL}process_payment.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ticket_id: ticket.ticket_id, payment_method: paymentMethod })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        formMessage.classList.remove('d-none', 'alert-danger');
                        formMessage.classList.add('alert-success');
                        formMessage.textContent = 'Payment processed successfully! Redirecting to Ticket Confirmation...';
                        setTimeout(() => {
                            window.location.href = 'ticket-confirmation.html';
                        }, 1500);
                    } else {
                        formMessage.classList.remove('d-none', 'alert-success');
                        formMessage.classList.add('alert-danger');
                        formMessage.textContent = data.error || 'An error occurred during payment.';
                    }
                } catch (error) {
                    console.error('Payment error:', error);
                    formMessage.classList.remove('d-none', 'alert-success');
                    formMessage.classList.add('alert-danger');
                    formMessage.textContent = 'An error occurred during payment. Please try again.';
                } finally {
                    if (paymentBtnText && paymentBtnSpinner) {
                        paymentBtnText.classList.remove('d-none');
                        paymentBtnSpinner.classList.add('d-none');
                    }
                }
            }
        });
    }
});

// Station Verification Page - QR Code and Face Scan
document.getElementById('startQRScan')?.addEventListener('click', function () {
    const qrFeed = document.getElementById('qrFeed');
    const statusText = document.getElementById('statusText');

    setTimeout(() => {
        qrFeed.style.backgroundImage = 'url("https://via.placeholder.com/150?text=QR+Scanned")';
        statusText.textContent = 'Verified';
        statusText.className = 'verification-status verified';
        alert('QR code verified successfully! Redirecting to Access Granted...');
        setTimeout(() => {
            window.location.href = 'access-granted.html';
        }, 1000);
    }, 1000);
});

document.getElementById('startFaceVerification')?.addEventListener('click', async function () {
    const cameraFeed = document.getElementById('cameraFeed');
    const statusText = document.getElementById('statusText');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');

    await startWebcam(video);
    const context = canvas.getContext('2d');

    setTimeout(async () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const faceImage = canvas.toDataURL('image/png');
        stopWebcam(video);

        try {
            const response = await fetch(`${BASE_URL}tt_verify.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ face_image: faceImage })
            });
            const data = await response.json();
            if (response.ok) {
                cameraFeed.style.backgroundImage = 'url("https://via.placeholder.com/150?text=Face+Scanned")';
                statusText.textContent = 'Verified';
                statusText.className = 'verification-status verified';
                alert('Face verified successfully! Redirecting to Access Granted...');
                setTimeout(() => {
                    window.location.href = 'access-granted.html';
                }, 1000);
            } else {
                statusText.textContent = 'Not Verified';
                statusText.className = 'verification-status not-verified';
                alert(data.error);
            }
        } catch (error) {
            console.error('Face verification error:', error);
            alert('An error occurred during face verification.');
        }
    }, 2000);
});

// My Tickets Page - Modal for Ticket Details
document.querySelectorAll('.view-details-btn')?.forEach(button => {
    button.addEventListener('click', function () {
        const ticketId = this.getAttribute('data-ticket-id');
        const modalBody = document.querySelector('#ticketDetailsModal .modal-body');
        modalBody.innerHTML = `
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            <p><strong>Passenger:</strong> [Logged-in User]</p>
            <p><strong>Status:</strong> Confirmed</p>
        `;
        const modal = new bootstrap.Modal(document.getElementById('ticketDetailsModal'));
        modal.show();
    });
});

// Ticket Confirmation Page - Populate Ticket Details and Generate QR Code
document.addEventListener('DOMContentLoaded', async function () {
    const sourceElement = document.getElementById('source');
    const destinationElement = document.getElementById('destination');
    const trainElement = document.getElementById('train');
    const dateElement = document.getElementById('date');
    const amountElement = document.getElementById('amount');
    const qrCodeElement = document.getElementById('qrCode');
    const qrLoadingElement = document.getElementById('qrLoading');
    const ticketMessageElement = document.getElementById('ticketMessage');

    if (sourceElement && destinationElement && trainElement && dateElement && amountElement && qrCodeElement && qrLoadingElement && ticketMessageElement) {
        const ticket = JSON.parse(localStorage.getItem('ticket') || '{}');
        const ticketId = ticket.ticket_id;

        if (!ticketId) {
            ticketMessageElement.classList.remove('d-none', 'alert-success');
            ticketMessageElement.classList.add('alert-danger');
            ticketMessageElement.textContent = 'No ticket information found. Please try booking again.';
            return;
        }

        // Fetch ticket details from backend
        try {
            qrLoadingElement.classList.remove('d-none'); // Show loading spinner
            const response = await fetch(`${BASE_URL}get_tickets.php?ticket_id=${ticketId}`);
            const data = await response.json();

            if (response.ok && data) {
                // Populate ticket details
                sourceElement.textContent = data.source_station || 'N/A';
                destinationElement.textContent = data.destination_station || 'N/A';
                trainElement.textContent = data.train_number || 'N/A';
                dateElement.textContent = data.journey_date || 'N/A';
                amountElement.textContent = `₹${data.total_amount || 'N/A'}`;

                // Generate QR code using face data
                const qrResponse = await fetch(`${BASE_URL}generate_qr_from_ticket.php?ticket_id=${ticketId}`);
                const qrData = await qrResponse.json();

                if (qrResponse.ok && qrData.qr_code) {
                    qrCodeElement.src = `data:image/png;base64,${qrData.qr_code}`;
                    ticketMessageElement.classList.remove('d-none', 'alert-danger');
                    ticketMessageElement.classList.add('alert-success');
                    ticketMessageElement.textContent = 'Ticket confirmed successfully!';
                } else {
                    ticketMessageElement.classList.remove('d-none', 'alert-success');
                    ticketMessageElement.classList.add('alert-danger');
                    ticketMessageElement.textContent = qrData.error || 'Failed to generate QR code.';
                }
            } else {
                ticketMessageElement.classList.remove('d-none', 'alert-success');
                ticketMessageElement.classList.add('alert-danger');
                ticketMessageElement.textContent = data.error || 'Failed to fetch ticket details.';
            }
        } catch (error) {
            console.error('Ticket confirmation error:', error);
            ticketMessageElement.classList.remove('d-none', 'alert-success');
            ticketMessageElement.classList.add('alert-danger');
            ticketMessageElement.textContent = 'An error occurred while fetching ticket details. Please try again later.';
        } finally {
            qrLoadingElement.classList.add('d-none'); // Hide loading spinner
        }
    }
});