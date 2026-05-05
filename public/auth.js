function updateNavigation() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName') || 'User';

    const menu = document.querySelector('.menu');
    if (!menu) return;

    // Clear dynamic elements
    const dynamicElements = menu.querySelectorAll('[data-dynamic]');
    dynamicElements.forEach(el => el.remove());

    if (isLoggedIn) {
        if (userRole === 'admin') {
            const hasStaticDashboard = !!menu.querySelector('a[href="backend.html"]');
            if (!hasStaticDashboard) {
                const dashLink = document.createElement('a');
                dashLink.href = 'backend.html';
                dashLink.textContent = '📊 Dashboard';
                dashLink.className = 'nav-admin-link';
                dashLink.setAttribute('data-dynamic', 'true');
                menu.appendChild(dashLink);
            }
        }

        const userLabel = document.createElement('span');
        userLabel.className = 'nav-user-badge';
        userLabel.textContent = `👤 ${userName}`;
        userLabel.setAttribute('data-dynamic', 'true');
        menu.appendChild(userLabel);

        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'nav-logout-btn';
        logoutBtn.setAttribute('data-dynamic', 'true');
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
        loginLink.className = 'nav-login-btn';
        loginLink.setAttribute('data-dynamic', 'true');
        menu.appendChild(loginLink);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavigation);
} else {
    updateNavigation();
}