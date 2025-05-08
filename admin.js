// Import Firebase services
import { db, auth } from './firebase-config.js';
import * as XLSX from 'xlsx';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const exportBtn = document.getElementById('exportBtn');
const selectWinnerBtn = document.getElementById('selectWinnerBtn');
const clearDataBtn = document.getElementById('clearDataBtn');
const winnerDisplay = document.getElementById('winnerDisplay');
const winnerInfo = document.getElementById('winnerInfo');
const totalEntries = document.getElementById('totalEntries');
const todayEntries = document.getElementById('todayEntries');
const entriesTableBody = document.getElementById('entriesTableBody');
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmCancel = document.getElementById('confirmCancel');
const confirmOk = document.getElementById('confirmOk');
const closeModal = document.querySelector('.close');

// Store submissions
let submissions = [];

// Check if user is already logged in
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        loadSubmissions();
    } else {
        // User is signed out
        dashboardSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    }
});

// Login form submission
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('username').value + '@admin.com'; // Convert username to email format
    const password = document.getElementById('password').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        // Auth state change listener will handle UI updates
        loginError.classList.add('hidden');
    } catch (error) {
        console.error("Error signing in: ", error);
        loginError.textContent = "Invalid username or password";
        loginError.classList.remove('hidden');
    }
});

// Logout button
logoutBtn.addEventListener('click', async function() {
    try {
        await auth.signOut();
        // Auth state change listener will handle UI updates
        loginForm.reset();
    } catch (error) {
        console.error("Error signing out: ", error);
    }
});

// Load submissions from Firestore
async function loadSubmissions() {
    try {
        const snapshot = await db.collection('submissions').get();
        submissions = [];
        snapshot.forEach(doc => {
            submissions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        updateDashboard();
    } catch (error) {
        console.error("Error loading submissions: ", error);
    }
}

// Export to Excel
exportBtn.addEventListener('click', function() {
    if (submissions.length === 0) {
        alert('No submissions to export');
        return;
    }
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(submissions);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions');
    
    // Generate Excel file
    XLSX.writeFile(workbook, 'giveaway_submissions.xlsx');
});

// Select random winner
selectWinnerBtn.addEventListener('click', function() {
    if (submissions.length === 0) {
        alert('No submissions to select from');
        return;
    }
    
    // Select random entry
    const randomIndex = Math.floor(Math.random() * submissions.length);
    const winner = submissions[randomIndex];
    
    // Format date
    const submissionDate = new Date(winner.timestamp);
    const formattedDate = submissionDate.toLocaleDateString();
    
    // Display winner
    winnerDisplay.classList.remove('hidden');
    winnerInfo.innerHTML = `
        <div class="winner-row"><strong>Name:</strong> ${winner.name}</div>
        <div class="winner-row"><strong>Email:</strong> ${winner.email}</div>
        <div class="winner-row"><strong>Phone:</strong> ${winner.phone}</div>
        <div class="winner-row"><strong>College:</strong> ${winner.college}</div>
        <div class="winner-row"><strong>Course:</strong> ${winner.course}</div>
        <div class="winner-row"><strong>Year:</strong> ${winner.year}</div>
        <div class="winner-row"><strong>Submission Date:</strong> ${formattedDate}</div>
    `;
    
    // Scroll to winner display
    winnerDisplay.scrollIntoView({ behavior: 'smooth' });
});

// Clear all data
clearDataBtn.addEventListener('click', function() {
    if (submissions.length === 0) {
        alert('No data to clear');
        return;
    }
    
    // Show confirmation modal
    confirmMessage.textContent = "Are you sure you want to delete all entries? This action cannot be undone.";
    confirmModal.style.display = 'block';
    
    // Set up confirmation action
    confirmOk.onclick = async function() {
        try {
            // Delete all submissions in batches
            const batchSize = 500; // Firestore limit
            const batches = [];
            
            for (let i = 0; i < submissions.length; i += batchSize) {
                const batch = db.batch();
                const chunk = submissions.slice(i, i + batchSize);
                
                chunk.forEach(submission => {
                    const docRef = db.collection('submissions').doc(submission.id);
                    batch.delete(docRef);
                });
                
                batches.push(batch.commit());
            }
            
            await Promise.all(batches);
            submissions = [];
            updateDashboard();
            winnerDisplay.classList.add('hidden');
            
        } catch (error) {
            console.error("Error clearing data: ", error);
            alert("There was an error clearing the data. Please try again.");
        } finally {
            confirmModal.style.display = 'none';
        }
    };
});

// Cancel confirmation
confirmCancel.addEventListener('click', function() {
    confirmModal.style.display = 'none';
});

// Close modal when clicking the X
closeModal.addEventListener('click', function() {
    confirmModal.style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', function(e) {
    if (e.target === confirmModal) {
        confirmModal.style.display = 'none';
    }
});

// Update dashboard with current data
function updateDashboard() {
    // Update stats
    totalEntries.textContent = submissions.length;
    
    // Count today's entries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = submissions.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
    }).length;
    
    todayEntries.textContent = todayCount;
    
    // Update table
    entriesTableBody.innerHTML = '';
    
    submissions.forEach(entry => {
        const row = document.createElement('tr');
        
        // Format date
        const submissionDate = new Date(entry.timestamp);
        const formattedDate = submissionDate.toLocaleDateString();
        
        row.innerHTML = `
            <td>${entry.name}</td>
            <td>${entry.email}</td>
            <td>${entry.phone}</td>
            <td>${entry.college}</td>
            <td>${entry.course}</td>
            <td>${entry.year}</td>
            <td>${formattedDate}</td>
        `;
        
        entriesTableBody.appendChild(row);
    });
}