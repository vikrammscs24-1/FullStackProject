function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    if (!username.trim() || !password.trim()) {
        errorEl.innerText = 'Please enter both username and password.';
        return;
    }

    errorEl.innerText = '';
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');
}

function generateEvent() {
    const machineNumber = Math.floor(Math.random() * 10) + 1;
    const machineId = 'M' + machineNumber;
    const machineElement = document.getElementById(machineId);

    document.querySelectorAll('.machine').forEach((el) => {
        el.style.background = '#0f766e';
    });

    machineElement.style.background = 'red';

    document.getElementById('machineName').innerText = machineId;
    document.getElementById('faultType').innerText = 'Bearing Fault';
    document.getElementById('severityLevel').innerText = 'High';
    document.getElementById('noiseLevel').innerText = '112 dB';
}
