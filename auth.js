/**
 * Authentication Module for IUIS-web
 * Master Password validation & Session Management
 */

const MASTER_PASSWORD = 'Inmuno2026';
const AUTH_STORAGE_KEY = 'iei_auth_session';

function isAuthenticated() {
    try {
        return localStorage.getItem(AUTH_STORAGE_KEY) === 'true' || 
               sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch (e) {
        return false;
    }
}

function login(inputPassword, rememberMe = true) {
    if (!inputPassword) {
        return { success: false, error: 'Por favor ingrese la clave de acceso.' };
    }

    const cleanInput = inputPassword.trim();
    if (cleanInput === MASTER_PASSWORD || cleanInput.toLowerCase() === MASTER_PASSWORD.toLowerCase()) {
        try {
            if (rememberMe) {
                localStorage.setItem(AUTH_STORAGE_KEY, 'true');
            } else {
                sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
            }
        } catch (e) { }
        return { success: true };
    } else {
        return { success: false, error: 'Clave incorrecta. Por favor intente nuevamente.' };
    }
}

function logout() {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) { }
    if (typeof window !== 'undefined') {
        window.location.href = 'login.html';
    }
}

function requireAuth() {
    if (!isAuthenticated() && typeof window !== 'undefined') {
        window.location.href = 'login.html';
    }
}

function redirectIfAuth() {
    if (isAuthenticated() && typeof window !== 'undefined') {
        window.location.href = 'index.html';
    }
}

// Global exposure
if (typeof window !== 'undefined') {
    window.isAuthenticated = isAuthenticated;
    window.login = login;
    window.logout = logout;
    window.requireAuth = requireAuth;
    window.redirectIfAuth = redirectIfAuth;
}
if (typeof module !== 'undefined') {
    module.exports = { isAuthenticated, login, logout, requireAuth, redirectIfAuth, MASTER_PASSWORD };
}
