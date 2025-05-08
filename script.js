// Import Firebase services
import { db } from './firebase-config.js';

// DOM Elements
const giveawayForm = document.getElementById('giveawayForm');
const successModal = document.getElementById('successModal');
const closeModal = document.querySelector('.close');
const submitBtn = document.querySelector('.submit-btn');

// Form submission handler
giveawayForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Submitting...</span> <i class="fas fa-spinner fa-spin"></i>';
    
    // Get form data
    const formData = new FormData(giveawayForm);
    const submissionData = {};
    
    formData.forEach((value, key) => {
        submissionData[key] = value;
    });
    
    // Add timestamp
    submissionData.timestamp = new Date().toISOString();
    
    try {
        // Save submission to Firebase
        await db.collection('submissions').add(submissionData);
        
        // Show success modal
        successModal.style.display = 'block';
        
        // Reset form
        giveawayForm.reset();
    } catch (error) {
        console.error("Error adding submission: ", error);
        alert("There was an error submitting your entry. Please try again.");
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit Entry</span> <i class="fas fa-paper-plane"></i>';
    }
});

// Close modal when clicking the X
closeModal.addEventListener('click', function() {
    successModal.style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', function(e) {
    if (e.target === successModal) {
        successModal.style.display = 'none';
    }
});