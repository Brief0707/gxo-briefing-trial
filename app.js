const defaultData = {
    shift: "AM / Days Shift",
    safetyMessage: "Ensure clear thoroughfares. Watch out for FLT movement near marshalling lanes. Full PPE mandatory outside green walkways.",
    pickingTarget: "180 cases per hour",
    marshallingTarget: "12 bays cleared per hour",
    overtime: [
        "Sunday AM Goods-In: 4 slots open",
        "Monday PM Picking (Ambient): 6 slots open"
    ],
    announcements: [
        "Sainsbury's weekend volume is high. Excellent pacing team!",
        "Chilled chamber team briefing at 10:00 AM."
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    loadBriefingData();
});

function loadBriefingData() {
    let data;
    try {
        let savedData = localStorage.getItem('gxo_briefing_data');
        data = savedData ? JSON.parse(savedData) : defaultData;
        
        // Safety validation to prevent freeze if switching code styles
        if (!data.overtime || !Array.isArray(data.overtime)) {
            data = defaultData;
        }
    } catch(e) {
        data = defaultData;
    }

    // Automatic Live Date Generation
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Render data to UI
    document.getElementById('shift-info').innerText = `${formattedDate} | ${data.shift || 'Shift'}`;
    document.getElementById('safety-text').innerHTML = (data.safetyMessage || '').replace(/\n/g, '<br>');
    
    document.getElementById('targets-list').innerHTML = `
        <li><strong>Picking Target:</strong> ${data.pickingTarget || 'N/A'}</li>
        <li><strong>Marshalling Target:</strong> ${data.marshallingTarget || 'N/A'}</li>
    `;

    // Render Overtime list safely
    const otList = data.overtime || [];
    document.getElementById('overtime-list').innerHTML = otList.length > 0 
        ? otList.map(item => `<li>${item}</li>`).join('')
        : "<li>No overtime slots listed for this shift.</li>";
    
    // Render Announcements list safely
    const annList = data.announcements || [];
    document.getElementById('announcements-list').innerHTML = annList.length > 0
        ? annList.map(item => `<li>${item}</li>`).join('')
        : "<li>No announcements listed.</li>";

    // Pre-populate editing input boxes cleanly
    document.getElementById('input-shift').value = data.shift || '';
    document.getElementById('input-safety').value = data.safetyMessage || '';
    document.getElementById('input-picking').value = data.pickingTarget || '';
    document.getElementById('input-marshalling').value = data.marshallingTarget || '';
    document.getElementById('input-overtime').value = otList.join('\n');
    document.getElementById('input-announcements').value = annList.join('\n');
}

function checkAdminPassword() {
    const inputPass = document.getElementById('admin-pass-input').value;
    if (inputPass === "gxo123") {
        document.getElementById('admin-form-block').style.display = 'block';
        document.getElementById('password-gate-block').style.display = 'none';
        document.getElementById('admin-pass-input').value = "";
    } else {
        alert("Access Denied: Incorrect PIN Code.");
    }
}

function lockAdminPanel() {
    document.getElementById('admin-form-block').style.display = 'none';
    document.getElementById('password-gate-block').style.display = 'block';
}

function saveManagerUpdates() {
    const overtimeLines = document.getElementById('input-overtime').value.split('\n').filter(line => line.trim() !== '');
    const announcementLines = document.getElementById('input-announcements').value.split('\n').filter(line => line.trim() !== '');

    const updatedData = {
        shift: document.getElementById('input-shift').value,
        safetyMessage: document.getElementById('input-safety').value,
        pickingTarget: document.getElementById('input-picking').value,
        marshallingTarget: document.getElementById('input-marshalling').value,
        overtime: overtimeLines,
        announcements: announcementLines
    };

    localStorage.setItem('gxo_briefing_data', JSON.stringify(updatedData));
    loadBriefingData();
    lockAdminPanel();
}