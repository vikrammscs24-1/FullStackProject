const API = "http://localhost:8000";

const FAULTS = ["Bearing Fault", "Rotor Imbalance", "Gear Wear", "Overheating", "Vibration Spike"];
const SEVERITIES = ["Low", "Medium", "High"];
const NOISE_LEVELS = ["85 dB", "92 dB", "100 dB", "108 dB", "112 dB", "120 dB"];

// ─── AUTH ────────────────────────────────────────────────────────────────────

async function loginUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorEl = document.getElementById('loginError');

    if (!username || !password) {
        errorEl.innerText = 'Please enter both username and password.';
        return;
    }

    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            errorEl.innerText = 'Invalid username or password.';
            return;
        }

        const data = await res.json();
        errorEl.innerText = '';
        sessionStorage.setItem('loggedInUser', data.username);

        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('dashboardPage').classList.remove('hidden');
        document.getElementById('loggedInUser').innerText = `👤 ${data.username}`;

        loadEvents();
    } catch (err) {
        errorEl.innerText = 'Cannot connect to server. Is the backend running?';
    }
}

function logoutUser() {
    sessionStorage.removeItem('loggedInUser');
    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    // Reset machines
    document.querySelectorAll('.machine').forEach(el => el.style.background = '#0f766e');
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────

async function generateEvent() {
    const machineNumber = Math.floor(Math.random() * 10) + 1;
    const machineId = 'M' + machineNumber;
    const fault = FAULTS[Math.floor(Math.random() * FAULTS.length)];
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const noise = NOISE_LEVELS[Math.floor(Math.random() * NOISE_LEVELS.length)];

    // Update UI
    document.querySelectorAll('.machine').forEach(el => el.style.background = '#0f766e');
    document.getElementById(machineId).style.background = 'red';
    document.getElementById('machineName').innerText = machineId;
    document.getElementById('faultType').innerText = fault;
    document.getElementById('severityLevel').innerText = severity;
    document.getElementById('noiseLevel').innerText = noise;

    // Save to backend
    try {
        await fetch(`${API}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                machine_id: machineId,
                fault_type: fault,
                severity: severity,
                noise_level: noise
            })
        });
        loadEvents();
    } catch (err) {
        console.error('Failed to save event:', err);
    }
}

async function loadEvents() {
    try {
        const res = await fetch(`${API}/events`);
        const events = await res.json();
        renderTable(events);
    } catch (err) {
        console.error('Failed to load events:', err);
    }
}

async function clearEvents() {
    if (!confirm('Clear all event history?')) return;
    try {
        await fetch(`${API}/events`, { method: 'DELETE' });
        renderTable([]);
        // Reset alert panel
        document.getElementById('machineName').innerText = '-';
        document.getElementById('faultType').innerText = '-';
        document.getElementById('severityLevel').innerText = '-';
        document.getElementById('noiseLevel').innerText = '-';
        document.querySelectorAll('.machine').forEach(el => el.style.background = '#0f766e');
    } catch (err) {
        console.error('Failed to clear events:', err);
    }
}

function renderTable(events) {
    const tbody = document.getElementById('eventTableBody');
    if (!events.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No events yet.</td></tr>';
        return;
    }
    tbody.innerHTML = events.map(e => {
        const sevClass = `severity-${e.severity.toLowerCase()}`;
        const time = new Date(e.timestamp).toLocaleString();
        return `
            <tr>
                <td>${time}</td>
                <td>${e.machine_id}</td>
                <td>${e.fault_type}</td>
                <td class="${sevClass}">${e.severity}</td>
                <td>${e.noise_level}</td>
            </tr>`;
    }).join('');
}

// Allow Enter key on login
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !document.getElementById('loginPage').classList.contains('hidden')) {
        loginUser();
    }
});