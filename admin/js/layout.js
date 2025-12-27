document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
        user = null;
    }
    if (!token || !user || user.role !== 'admin') {
        window.location.href = '../client/login.html';
        return;
    }

    // Shared Sidebar Logic for all Admin pages
    const nav = document.querySelector('.nav-links');
    if (nav) {
        // Prevent duplicate injection if this script runs multiple times or conflicts
        if (document.getElementById('layout-injected-divider')) return;

        // Divider
        const divider = document.createElement('div');
        divider.id = 'layout-injected-divider';
        divider.style.height = '1px';
        divider.style.background = 'rgba(0,0,0,0.05)';
        divider.style.margin = '1rem 0';
        nav.appendChild(divider);

        // Client App Button
        const clientBtn = document.createElement('a');
        clientBtn.href = '../client/home.html';
        clientBtn.className = 'nav-link';
        clientBtn.target = '_blank';
        clientBtn.style.marginTop = 'auto'; // Push to bottom if flex container has space
        clientBtn.style.color = 'var(--primary)';
        clientBtn.innerHTML = '<i class="ph-duotone ph-desktop"></i> Ver Site';
        nav.appendChild(clientBtn);

        // Logout Button
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'nav-link';
        // logoutBtn.style.marginTop = '0.5rem';
        logoutBtn.style.color = 'var(--error)';
        logoutBtn.innerHTML = '<i class="ph-duotone ph-sign-out"></i> Sair';
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm('Tem certeza que deseja sair?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Adjust path based on current location
                const isPages = window.location.pathname.includes('/pages/');
                window.location.href = isPages ? '../../client/login.html' : '../client/login.html';
            }
        };
        nav.appendChild(logoutBtn);
    }


    // --- Mobile Sidebar Toggle Logic ---
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Close sidebar when clicking a link on mobile
    if (nav) {
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                }
            });
        });
    }
});
