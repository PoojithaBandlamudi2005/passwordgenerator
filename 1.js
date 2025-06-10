const getEl = id => document.getElementById(id);More actions

const passwordEl = getEl('password');
const lengthEl = getEl('length');
const uppercaseEl = getEl('uppercase');
const lowercaseEl = getEl('lowercase');
const numbersEl = getEl('numbers');
const symbolsEl = getEl('symbols');
const excludeSimilarEl = getEl('exclude-similar');
const excludeAmbiguousEl = getEl('exclude-ambiguous');
const generateBtn = getEl('generate-btn');
const copyBtn = getEl('copy-btn');
const strengthBar = getEl('strength-bar');
const strengthText = getEl('strength-text');
const historyList = getEl('history-list');
const clearHistoryBtn = getEl('clear-history');
const exportHistoryBtn = getEl('export-history');

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR = /[1lI0O]/g;
const AMBIGUOUS = /[\{\}\[\]\(\)\/\\]/g;

let history = JSON.parse(localStorage.getItem('passwordHistory')) || [];

function generatePassword() {
    let chars = '';
    if (uppercaseEl.checked) chars += UPPERCASE;
    if (lowercaseEl.checked) chars += LOWERCASE;
    if (numbersEl.checked) chars += NUMBERS;
    if (symbolsEl.checked) chars += SYMBOLS;

    if (excludeSimilarEl.checked) chars = chars.replace(SIMILAR, '');
    if (excludeAmbiguousEl.checked) chars = chars.replace(AMBIGUOUS, '');

    if (!chars) return alert('Select at least one character type');

    const len = +lengthEl.value;
    let password = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    password = enforceCharacterTypes(password, len);
    passwordEl.value = password;
    updateStrength(password);
    saveToHistory(password);
}

function enforceCharacterTypes(password, len) {
    const insertChar = (charSet, test) => {
        if (!test(password)) {
            const chars = charSet
                .replace(excludeSimilarEl.checked ? SIMILAR : '', '')
                .replace(excludeAmbiguousEl.checked ? AMBIGUOUS : '', '');
            const i = Math.floor(Math.random() * len);
            return password.substring(0, i) + chars[Math.floor(Math.random() * chars.length)] + password.substring(i + 1);
        }
        return password;
    };
    if (uppercaseEl.checked) password = insertChar(UPPERCASE, str => /[A-Z]/.test(str));
    if (lowercaseEl.checked) password = insertChar(LOWERCASE, str => /[a-z]/.test(str));
    if (numbersEl.checked) password = insertChar(NUMBERS, str => /[0-9]/.test(str));
    if (symbolsEl.checked) password = insertChar(SYMBOLS, str => /[^A-Za-z0-9]/.test(str));
    return password;
}

function updateStrength(password) {
    const score = calculateStrength(password);
    strengthBar.style.setProperty('--strength', `${score}%`);
    let text = score < 33 ? 'Weak' : score < 66 ? 'Moderate' : 'Strong';
    let color = score < 33 ? '#ef4444' : score < 66 ? '#eab308' : '#22c55e';
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
}

function calculateStrength(pwd) {
    let score = Math.min(25, pwd.length * 2);
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[a-z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 20;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    if (pwd.length >= 12) score += 10;
    if (/(?=.*[A-Z].*[A-Z])/.test(pwd)) score += 5;
    if (/.*[^A-Za-z0-9].*[^A-Za-z0-9]/.test(pwd)) score += 5;
    score -= (pwd.length - new Set(pwd).size) * 5;
    if (/012|123|234|345|456|567|678|789/.test(pwd)) score -= 10;
    if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(pwd)) score -= 10;
    return Math.max(0, Math.min(100, score));
}

function saveToHistory(password) {
    history.unshift({ password, timestamp: new Date().toISOString() });
    if (history.length > 10) history.pop();
    localStorage.setItem('passwordHistory', JSON.stringify(history));
    displayHistory();
}

function displayHistory() {
    historyList.innerHTML = '';
    history.forEach(({ password, timestamp }) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <span class="history-password">${password}</span>
            <span class="history-time">${new Date(timestamp).toLocaleString()}</span>`;
        div.onclick = () => {
            passwordEl.value = password;
            updateStrength(password);
        };
        historyList.appendChild(div);
    });
}

function clearHistory() {
    history = [];
    localStorage.removeItem('passwordHistory');
    displayHistory();
}

function exportHistory() {
    const csv = 'Password,Generated\n' + history.map(
        h => `"${h.password}","${new Date(h.timestamp).toLocaleString()}"`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'password_history.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(passwordEl.value);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = 'Copy'), 2000);
    } catch {
        alert('Failed to copy password');
    }
}

generateBtn.onclick = generatePassword;
copyBtn.onclick = copyToClipboard;
clearHistoryBtn.onclick = clearHistory;
exportHistoryBtn.onclick = exportHistory;

displayHistory();
generatePassword();
  