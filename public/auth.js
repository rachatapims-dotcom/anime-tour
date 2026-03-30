function updateNavigation() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName') || 'User';

    const menu = document.querySelector('.menu');
    if (!menu) return;

    // Remove ALL dynamic elements (login, dashboard, user badge, logout)
    const existingDash = menu.querySelector('[data-dashboard]');
    if (existingDash) existingDash.remove();

    const existingLogin = menu.querySelector('[data-login]');
    if (existingLogin) existingLogin.remove();
    
    const existingUser = menu.querySelector('[data-user]');
    if (existingUser) existingUser.remove();

    if (isLoggedIn) {
        if (userRole === 'admin') {
            const hasStaticDashboard = !!menu.querySelector('a[href="backend.html"]');
            if (!hasStaticDashboard) {
                const dashLink = document.createElement('a');
                dashLink.href = 'backend.html';
                dashLink.textContent = '📊 Dashboard';
                dashLink.style.cssText = `
                    color: #ff6b35 !important;
                    font-weight: 700 !important;
                    text-decoration: none !important;
                    padding: 8px 12px !important;
                    border-radius: 999px !important;
                    background: rgba(255, 107, 53, 0.1) !important;
                    display: inline-block !important;
                `;
                dashLink.setAttribute('data-dashboard', 'true');
                menu.appendChild(dashLink);
            }
        }

        const userLabel = document.createElement('span');
        userLabel.style.cssText = `
            color: var(--muted) !important;
            padding: 8px 12px !important;
            border-radius: 999px !important;
            background: var(--brand-soft) !important;
            display: inline-block !important;
        `;
        userLabel.textContent = `👤 ${userName}`;
        menu.appendChild(userLabel);

        const logoutBtn = document.createElement('a');
        userLabel.setAttribute('data-user', 'true');
        logoutBtn.href = '#';
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.cssText = `
            text-decoration: none !important;
            color: var(--text) !important;
            font-weight: 500 !important;
            padding: 8px 12px !important;
            border-radius: 999px !important;
            display: inline-block !important;
        `;
        logoutBtn.setAttribute('data-login', 'true');
        logoutBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            await window.writeSystemLog?.('auth.logout', 'info', 'User clicked logout', {
                email: localStorage.getItem('userEmail') || null,
                role: localStorage.getItem('userRole') || null
            });

            if (window.sb && window.sb.auth) {
                try {
                    await window.sb.auth.signOut();
                } catch (error) {
                    console.warn('Supabase signOut failed:', error);
                }
            }

            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.setItem('pendingSupabaseSignOut', 'true');
            window.location.href = 'login.html?logged_out=1';
        });
        menu.appendChild(logoutBtn);
    } else {
        const loginLink = document.createElement('a');
        loginLink.href = 'login.html';
        loginLink.textContent = 'Login';
        loginLink.style.cssText = `
            border-radius: 999px !important;
            background: var(--brand) !important;
            color: white !important;
            padding: 8px 12px !important;
            text-decoration: none !important;
            font-weight: 500 !important;
            display: inline-block !important;
        `;
        loginLink.setAttribute('data-login', 'true');
        menu.appendChild(loginLink);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavigation);
} else {
    updateNavigation();
}