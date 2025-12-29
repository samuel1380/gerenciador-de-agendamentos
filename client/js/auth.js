// Auth Logic
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const errorMsg = document.getElementById('errorMsg');

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const res = await api.post('/auth/login', data);
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));

                if (res.user.role === 'admin') {
                    window.location.href = '../admin/index.html';
                } else {
                    window.location.href = 'home.html';
                }
            } catch (err) {
                showError(err.message);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const res = await api.post('/auth/register', data);
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                window.location.href = 'home.html'; // New users are always normal users
            } catch (err) {
                showError(err.message);
            }
        });
    }

    if (localStorage.getItem('token') && (window.location.pathname.includes('login') || window.location.pathname.includes('register'))) {
        api.get('/auth/me')
            .then(user => {
                if (!user || !user.id) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    return;
                }
                localStorage.setItem('user', JSON.stringify(user));
                if (user.role === 'admin') {
                    window.location.href = '../admin/index.html';
                } else {
                    window.location.href = 'home.html';
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            });
    }
});
