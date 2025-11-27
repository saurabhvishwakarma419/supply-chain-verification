// Mock shipment data
const mockShipments = {
    'SC001': {
        id: 'SC001',
        product: 'Electronic Components',
        status: 'In Transit',
        origin: 'Shenzhen, China',
        destination: 'Mumbai, India',
        currentLocation: 'Port of Singapore',
        verified: true,
        timeline: [
            { stage: 'Manufacturer', location: 'Shenzhen Factory', date: '2025-11-20', status: 'completed', verified: true, icon: 'factory' },
            { stage: 'Quality Check', location: 'Shenzhen QC Center', date: '2025-11-21', status: 'completed', verified: true, icon: 'check' },
            { stage: 'Export Port', location: 'Port of Shenzhen', date: '2025-11-22', status: 'completed', verified: true, icon: 'anchor' },
            { stage: 'In Transit', location: 'Port of Singapore', date: '2025-11-25', status: 'current', verified: true, icon: 'truck' },
            { stage: 'Import Port', location: 'Mumbai Port', date: 'Expected 2025-11-28', status: 'pending', verified: false, icon: 'anchor' },
            { stage: 'Distribution', location: 'Mumbai Warehouse', date: 'Expected 2025-11-29', status: 'pending', verified: false, icon: 'store' }
        ]
    },
    'SC002': {
        id: 'SC002',
        product: 'Textile Goods',
        status: 'Delivered',
        origin: 'Ahmedabad, India',
        destination: 'New Delhi, India',
        currentLocation: 'Delivered',
        verified: true,
        timeline: [
            { stage: 'Manufacturer', location: 'Ahmedabad Mill', date: '2025-11-15', status: 'completed', verified: true, icon: 'factory' },
            { stage: 'Quality Check', location: 'Ahmedabad QC', date: '2025-11-16', status: 'completed', verified: true, icon: 'check' },
            { stage: 'Warehouse', location: 'Ahmedabad Hub', date: '2025-11-17', status: 'completed', verified: true, icon: 'store' },
            { stage: 'In Transit', location: 'On Route NH48', date: '2025-11-18', status: 'completed', verified: true, icon: 'truck' },
            { stage: 'Distribution Center', location: 'Delhi Hub', date: '2025-11-19', status: 'completed', verified: true, icon: 'store' },
            { stage: 'Delivered', location: 'Customer Location', date: '2025-11-20', status: 'completed', verified: true, icon: 'check' }
        ]
    }
};

// SVG Icons
const icons = {
    checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    xCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    factory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M17 18h1"></path><path d="M12 18h1"></path><path d="M7 18h1"></path></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>',
    store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path><path d="M2 7h20"></path><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"></path></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>',
    anchor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="22" x2="12" y2="8"></line><path d="M5 12H2a10 10 0 0 0 20 0h-3"></path></svg>',
    mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>'
};

// DOM Elements
const trackingInput = document.getElementById('trackingInput');
const searchBtn = document.getElementById('searchBtn');
const btnText = document.getElementById('btnText');
const resultsContainer = document.getElementById('resultsContainer');
const notFoundMsg = document.getElementById('notFoundMsg');
const notFoundText = document.getElementById('notFoundText');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
trackingInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

function handleSearch() {
    const trackingId = trackingInput.value.trim().toUpperCase();
    
    if (!trackingId) return;

    // Show loading state
    searchBtn.disabled = true;
    btnText.textContent = 'Searching...';
    
    // Hide previous results
    resultsContainer.innerHTML = '';
    notFoundMsg.classList.add('hidden');

    // Simulate API call
    setTimeout(() => {
        const shipment = mockShipments[trackingId];
        
        if (shipment) {
            displayShipment(shipment);
        } else {
            showNotFound(trackingId);
        }
        
        // Reset button
        searchBtn.disabled = false;
        btnText.textContent = 'Track';
    }, 1000);
}

function displayShipment(shipment) {
    resultsContainer.innerHTML = `
        ${createShipmentCard(shipment)}
        ${createTimelineCard(shipment)}
    `;
}

function createShipmentCard(shipment) {
    const verifiedClass = shipment.verified ? 'verified' : 'unverified';
    const verifiedText = shipment.verified ? 'Verified' : 'Unverified';
    const verifiedIcon = shipment.verified ? icons.checkCircle : icons.xCircle;

    return `
        <div class="shipment-card">
            <div class="shipment-header">
                <div>
                    <h2 class="shipment-title">${shipment.product}</h2>
                    <p class="tracking-id">Tracking ID: <span>${shipment.id}</span></p>
                </div>
                <div class="verification-badge ${verifiedClass}">
                    <div class="verification-icon">${verifiedIcon}</div>
                    <span>${verifiedText}</span>
                </div>
            </div>
            
            <div class="shipment-details">
                <div class="detail-item">
                    <h4>Origin</h4>
                    <p>${shipment.origin}</p>
                </div>
                <div class="detail-item">
                    <h4>Current Location</h4>
                    <p>${shipment.currentLocation}</p>
                </div>
                <div class="detail-item">
                    <h4>Destination</h4>
                    <p>${shipment.destination}</p>
                </div>
            </div>
            
            <div class="status-badge">Status: ${shipment.status}</div>
        </div>
    `;
}

function createTimelineCard(shipment) {
    const timelineItems = shipment.timeline.map((item, index) => {
        const isLast = index === shipment.timeline.length - 1;
        return createTimelineItem(item, isLast);
    }).join('');

    return `
        <div class="timeline-card">
            <h3 class="timeline-title">Shipment Timeline</h3>
            <div class="timeline">
                ${timelineItems}
            </div>
        </div>
    `;
}

function createTimelineItem(item, isLast) {
    const statusIcon = getStatusIcon(item.status);
    const stageIcon = icons[item.icon] || icons.mapPin;
    const lineClass = item.status === 'completed' ? 'completed' : 'pending';
    const wrapperClass = item.status === 'current' ? 'current' : '';

    return `
        <div class="timeline-item">
            <div class="timeline-indicator">
                ${statusIcon}
                ${!isLast ? `<div class="timeline-line ${lineClass}"></div>` : ''}
            </div>
            <div class="timeline-content">
                <div class="timeline-stage">
                    <div class="stage-icon-wrapper ${wrapperClass}">
                        <div class="stage-icon">${stageIcon}</div>
                    </div>
                    <div class="stage-details">
                        <div class="stage-header">
                            <h4 class="stage-name">${item.stage}</h4>
                            ${item.verified ? '<span class="verified-badge">Verified</span>' : ''}
                        </div>
                        <p class="stage-location">${item.location}</p>
                        <p class="stage-date">${item.date}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getStatusIcon(status) {
    switch (status) {
        case 'completed':
            return `<div class="timeline-icon completed">${icons.checkCircle}</div>`;
        case 'current':
            return `<div class="timeline-icon current">${icons.clock}</div>`;
        default:
            return '<div class="pending"></div>';
    }
}

function showNotFound(trackingId) {
    notFoundText.textContent = `No shipment found with tracking ID: ${trackingId}`;
    notFoundMsg.classList.remove('hidden');
}
