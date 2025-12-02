document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // 1. Initial Data and DOM Elements
    // ----------------------------------------------------

    // Simulate initial item data from three donors
    let donatedItems = [
        { name: "Electronic Calculator", category: "Appliances", description: "90% new, fully functional, suitable for students. Donor: Ms. Chen", status: "Available", contact: "Internal" },
        { name: "Complete Fairytale Book Set", category: "Books", description: "Hardcover, well-preserved, suitable for children aged 3-6. Donor: Mr. Wang", status: "Available", contact: "Internal" },
        { name: "Lightweight Down Jacket", category: "Apparel", description: "Size L, Black, cleaned, no damage. Donor: Ms. Lin", status: "Available", contact: "Internal" },
        { name: "Academic Thesis Guide", category: "Books", description: "Latest 2023 edition, no highlights. Donor: Ms. Chen", status: "Available", contact: "Internal" }
    ];

    const itemList = document.getElementById('item-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const donationForm = document.getElementById('donation-form');
    const submissionMessage = document.getElementById('submission-message');
    const modal = document.getElementById('item-modal');
    const closeBtn = document.querySelector('.close-btn');
    const modalDetailsContent = document.getElementById('modal-details-content');


    // ----------------------------------------------------
    // 2. Rendering and Filtering Logic
    // ----------------------------------------------------

    // Render item list
    function renderItems(items) {
        itemList.innerHTML = '';
        // Reverse the array copy to show the newest donations at the top
        items.slice().reverse().forEach(item => { 
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.setAttribute('data-category', item.category);
            
            const statusClass = item.status.toLowerCase().replace(/\s/g, '-');
            
            itemCard.innerHTML = `
                <div class="card-content">
                    <h3>${item.name}</h3>
                    <p class="category-tag">Category: ${item.category}</p>
                    <p>Status: <span class="status ${statusClass}">${item.status}</span></p>
                    <button class="details-btn">View Details</button>
                </div>
            `;
            
            itemCard.querySelector('.details-btn').addEventListener('click', () => {
                showModal(item);
            });
            itemList.appendChild(itemCard);
        });
    }

    // Handle filter button clicks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            let filteredItems = (category === 'All') 
                ? donatedItems 
                : donatedItems.filter(item => item.category === category);
            
            renderItems(filteredItems);
        });
    });


    // ----------------------------------------------------
    // 3. Form Submission Logic (Instant Update Core)
    // ----------------------------------------------------

    donationForm.addEventListener('submit', async function(e) {
        // Prevent default form submission (stops page redirect)
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const formspreeUrl = form.getAttribute('action');

        // Collect new item data for local display
        const newItem = {
            name: formData.get('Item Name'),
            category: formData.get('Category'),
            description: formData.get('Detailed Description'),
            status: "Available", // New items are assumed 'Available'
            contact: "Internal" // Internal tracking
        };

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;

        try {
            // Use Fetch API for asynchronous submission to Formspree
            const response = await fetch(formspreeUrl, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // 1. On success, add the new item to the local list (instant update)
                donatedItems.push(newItem);

                // 2. Re-render the item list
                renderItems(donatedItems); 
                
                // 3. Display success message
                submissionMessage.style.display = 'block';
                
                // 4. Clear the form
                form.reset();

                // 5. Hide message after a few seconds
                setTimeout(() => {
                    submissionMessage.style.display = 'none';
                }, 5000);

            } else {
                // Handle Formspree submission failure
                alert('Submission failed. Please ensure your Formspree Endpoint is correct and activated.');
            }
        } catch (error) {
            console.error('Submission Error:', error);
            alert('An error occurred during submission. Please check your network.');
        } finally {
            // Restore button state
            submitButton.textContent = 'Submit Donation Information';
            submitButton.disabled = false;
        }
    });


    // ----------------------------------------------------
    // 4. Modal Popup Logic
    // ----------------------------------------------------

    function showModal(item) {
        modalDetailsContent.innerHTML = `
            <h2>${item.name}</h2>
            <p><strong>Category:</strong> ${item.category}</p>
            <p><strong>Status:</strong> <span class="status ${item.status.toLowerCase().replace(/\s/g, '-')}">${item.status}</span></p>
            <hr>
            <h3>Condition and Details:</h3>
            <p>${item.description}</p>
            <hr>
            <div class="note-box">
                <p><strong>⚠️ Contact Information:</strong></p>
                <p>The donor's contact information is only used for handover coordination and will not be publicly displayed.</p>
            </div>
        `;
        modal.style.display = 'block';
    }

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }


    // ----------------------------------------------------
    // 5. Initialize Page
    // ----------------------------------------------------

    renderItems(donatedItems);
});