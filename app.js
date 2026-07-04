// --- CONFIGURATION MANAGEMENT ---
// Replace the blank token string below with your newly generated secret Personal Access Token (classic).
const GITHUB_TOKEN = "ghp_YOUR_NEW_SECRET_TOKEN_HERE"; 
const REPO_OWNER = "Kebabs69"; 
const REPO_NAME = "gxo-briefing-trial";
const FILE_PATH = "briefing-data.json";

// --- DOM ELEMENTS CONFIGURATION ---
const displayPick = document.getElementById('display-pick-target');
const displayPack = document.getElementById('display-pack-target');
const displayAnnounce = document.getElementById('display-announcement');
const displayOT = document.getElementById('display-ot-slots');
const currentDateEl = document.getElementById('current-date');

const authSection = document.getElementById('manager-auth-section');
const panelSection = document.getElementById('manager-panel-section');
const pinInput = document.getElementById('manager-pin');

const inputPick = document.getElementById('input-pick-target');
const inputPack = document.getElementById('input-pack-target');
const inputAnnounce = document.getElementById('input-announcement');
const inputOT = document.getElementById('input-ot-slots');

// Set current calendar date UI element
const today = new Date();
currentDateEl.innerText = today.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// --- DATA ACCESS LAYERS (UNLIMITED CONSUMPTION BY WORKERS) ---
function loadBriefingData() {
    // Append unique cache-busting parameter string to guarantee real-time downloads
    fetch(`${FILE_PATH}?t=${new Date().getTime()}`)
        .then(response => {
            if (!response.ok) throw new Error("Database initialization file missing.");
            return response.json();
        })
        .then(data => {
            renderDashboard(data);
            populateFormInputs(data);
        })
        .catch(error => {
            console.error("Error synchronizing tracking data matrix:", error);
            displayAnnounce.innerText = "Failed to sync updates from server. Please refresh your view.";
        });
}

function renderDashboard(data) {
    displayPick.innerText = data.pickingTarget || '--';
    displayPack.innerText = data.packingTarget || '--';
    displayAnnounce.innerText = data.announcement || 'No active updates currently broadcast.';
    
    displayOT.innerHTML = '';
    if (data.overtimeSlots && data.overtimeSlots.length > 0) {
        data.overtimeSlots.forEach(slot => {
            const li = document.createElement('li');
            li.className = 'ot-item';
            li.innerHTML = `<span class="clock-icon">🕒</span> <span class="time-text">${slot}</span>`;
            displayOT.appendChild(li);
        });
    } else {
        displayOT.innerHTML = `<li class="ot-empty">No overtime windows open for this shift.</li>`;
    }
}

function populateFormInputs(data) {
    inputPick.value = data.pickingTarget || '';
    inputPack.value = data.packingTarget || '';
    inputAnnounce.value = data.announcement || '';
    inputOT.value = data.overtimeSlots ? data.overtimeSlots.join(', ') : '';
}

// --- ADMINISTRATIVE SECURITY CONTROL PANELS ---
document.getElementById('btn-unlock').addEventListener('click', () => {
    if (pinInput.value === 'gxo123') {
        authSection.classList.add('hidden');
        panelSection.classList.remove('hidden');
        pinInput.value = '';
    } else {
        alert('Invalid Administrative Verification Credentials.');
    }
});

document.getElementById('btn-lock').addEventListener('click', () => {
    panelSection.classList.add('hidden');
    authSection.classList.remove('hidden');
});

// --- CLOUD WRITE LAYER (VIA SECURE GITHUB API ENDPOINTS) ---
document.getElementById('btn-publish').addEventListener('click', () => {
    const otArray = inputOT.value.split(',')
                                 .map(item => item.trim())
                                 .filter(item => item.length > 0);

    const updatedPayload = {
        pickingTarget: parseInt(inputPick.value) || 0,
        packingTarget: parseInt(inputPack.value) || 0,
        announcement: inputAnnounce.value,
        overtimeSlots: otArray
    };

    const targetUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

    // Step A: Grab data signature (SHA) from target repository structure
    fetch(targetUrl)
        .then(res => {
            if (!res.ok) throw new Error("Could not fetch remote version info.");
            return res.json();
        })
        .then(fileMeta => {
            const currentSha = fileMeta.sha;
            // Convert data to uniform Base64 structure for safe server transport
            const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(updatedPayload, null, 2))));

            // Step B: Direct payload injection to cloud repository files
            return fetch(targetUrl, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${GITHUB_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: "Administrative metrics update via Briefing Panel",
                    content: encodedContent,
                    sha: currentSha,
                    branch: "main"
                })
            });
        })
        .then(response => {
            if (response.ok) {
                alert("Success! The data has been deployed safely. All worker devices will show the updates within seconds.");
                loadBriefingData(); // Reload UI locally
            } else {
                alert("Write request rejected. Check authorization key verification settings inside source scripts.");
            }
        })
        .catch(err => {
            console.error("Critical API Synchronization Error:", err);
            alert("Connection lost. Could not deliver payload update to remote Git repositories.");
        });
});

// Start initialization on startup
loadBriefingData();