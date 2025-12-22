export class ProfilePage {
    constructor() {
        this.init();
    }

    async init() {
        // Initial render from cache (fast)
        let user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        this.renderUser(user);

        // Fetch fresh data from server (accurate)
        try {
            const freshUser = await api.get('/auth/me');
            if (freshUser) {
                localStorage.setItem('user', JSON.stringify(freshUser));
                this.renderUser(freshUser);
            }
        } catch (e) {
            console.error("Could not sync user data", e);
        }

        // Load History
        this.loadHistory();

        // Setup Avatar
        this.setupAvatarUpload();

        // Setup Logout
        // Setup Logout
        const logoutBtn = document.querySelector('.btn-logout-modern');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        const adminBtn = document.getElementById('adminPanelButton');
        if (adminBtn && user && user.role === 'admin') {
            adminBtn.style.display = 'block';
        }
    }

    async renderUser(user) {
        // Basic Info
        const elName = document.getElementById('userName');
        const elEmail = document.getElementById('userEmail');
        if (elName) elName.textContent = user.name;
        if (elEmail) elEmail.textContent = user.email;

        // Render Avatar
        const img = document.getElementById('avatarImage');
        const ph = document.getElementById('avatarPlaceholder');

        if (user.avatar) {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const baseUrl = isLocal ? 'http://localhost:3000' : '';
            img.src = user.avatar.startsWith('http') ? user.avatar : `${baseUrl}/${user.avatar}`;

            img.style.display = 'block';
            ph.style.display = 'none';
        } else {
            img.style.display = 'none';
            ph.style.display = 'block';
        }

        // Load Game Config
        let xpPerLevel = 200;
        try {
            const config = await api.get('/services/config');
            if (config.xp_per_level) xpPerLevel = config.xp_per_level;
        } catch (e) { console.error('Failed to load config'); }

        // Level & XP
        const level = user.level || 1;
        const xp = user.xp || 0;

        // Calculate progress in current level (Simple model: cumulative XP) or (Per level XP reset)
        // The instruction suggests "cumulative XP" but display shows "X / 200 XP". 
        // Let's assume XP is cumulative total. 
        // Level 1: 0-199. Level 2: 200-399.
        // Current Level Progress = XP % xpPerLevel
        // BUT, server logic says: newLevel = floor(xp / xpPerLevel) + 1.
        // So yes, it is cumulative.

        const currentLevelXp = xp % xpPerLevel;
        const displayXp = currentLevelXp;

        document.getElementById('userLevel').textContent = level;
        document.getElementById('userXp').textContent = displayXp;
        const xpTotalText = document.querySelector('#userXp').nextSibling;
        if (xpTotalText) xpTotalText.textContent = ` / ${xpPerLevel} XP`;

        const pct = Math.min(100, Math.max(0, (displayXp / xpPerLevel) * 100));
        document.getElementById('xpBar').style.width = `${pct}%`;

        // Render Tier
        const badge = document.getElementById('tierBadge');
        const tierName = document.getElementById('tierName');

        let tier = { name: 'BRONZE', icon: '🥉', class: 'tier-bronze' };
        if (level >= 5) tier = { name: 'PRATA', icon: '🥈', class: 'tier-silver' };
        if (level >= 10) tier = { name: 'OURO', icon: '🥇', class: 'tier-gold' };
        if (level >= 15) tier = { name: 'DIAMANTE', icon: '💎', class: 'tier-diamond' };

        if (badge && tierName) {
            tierName.textContent = tier.name;
            badge.querySelector('span').textContent = tier.icon;
            badge.className = `tier-badge ${tier.class}`;
            badge.style.display = 'inline-flex';
        }
    }

    async loadHistory() {
        try {
            const history = await api.get('/quiz/history');
            const list = document.getElementById('quizHistory');

            if (history.length === 0) {
                list.innerHTML = '<p class="text-light">Nenhum quiz realizado.</p>';
            } else {
                list.innerHTML = history.map(h => {
                    // Check if payload is string or object
                    let payload = h.payload;
                    if (typeof payload === 'string') {
                        try { payload = JSON.parse(payload); } catch (e) { }
                    }
                    const score = payload.score || 0;
                    return `
                    <div class="card quiz-history-item">
                        <div class="quiz-history-content">
                            <strong>Pontuação: ${score}</strong>
                            <small>${new Date(h.created_at).toLocaleDateString()}</small>
                        </div>
                    </div>
                `}).join('');
            }
        } catch (e) {
            console.error(e);
        }
    }

    setupAvatarUpload() {
        const avatarContainer = document.getElementById('avatarContainer');
        const avatarInput = document.getElementById('avatarInput');

        if (!avatarContainer || !avatarInput) return;

        avatarContainer.addEventListener('click', () => avatarInput.click());

        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('avatar', file);

            try {
                // Show loading state/preview immediately
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.getElementById('avatarImage');
                    const ph = document.getElementById('avatarPlaceholder');
                    img.src = e.target.result;
                    img.style.display = 'block';
                    ph.style.display = 'none';
                };
                reader.readAsDataURL(file);

                const token = localStorage.getItem('token');
                const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

                const res = await fetch(`${baseUrl}/api/auth/avatar`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ error: 'Upload failed' }));
                    throw new Error(errorData.error || 'Upload failed');
                }

                const data = await res.json();

                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    user.avatar = data.avatar;
                    localStorage.setItem('user', JSON.stringify(user));
                    await this.renderUser(user);
                }
                Toast.success('Foto atualizada!');

            } catch (error) {
                console.error('Avatar upload failed', error);
                Toast.error('Erro ao enviar foto.');
            }
        });
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProfilePage();
});
