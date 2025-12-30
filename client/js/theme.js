(function () {
    try {
        const localTheme = localStorage.getItem('client_theme');
        const localColors = localStorage.getItem('client_theme_colors');

        applyThemeFromStorage(localTheme);
        if (localColors) applyCustomColors(JSON.parse(localColors));

        if (typeof api !== 'undefined') {
            syncThemeFromServer();
        } else {
            window.addEventListener('client-api-ready', function () {
                syncThemeFromServer();
            }, { once: true });
        }
    } catch (e) {
    }

    function applyThemeFromStorage(theme) {
        if (!theme) return;
        const className = 'theme-' + theme;
        const root = document.documentElement;
        if (!root.classList.contains(className)) {
            root.classList.add(className);
        }
    }

    async function syncThemeFromServer() {
        if (typeof api === 'undefined') return;

        try {
            const data = await api.get('/settings/public');
            const currentTheme = localStorage.getItem('client_theme');

            if (data.client_theme && currentTheme !== data.client_theme) {
                clearThemeClasses();
                applyThemeFromStorage(data.client_theme);
                localStorage.setItem('client_theme', data.client_theme);
            }

            if (data.client_theme_colors) {
                localStorage.setItem('client_theme_colors', data.client_theme_colors);
                applyCustomColors(JSON.parse(data.client_theme_colors));
            } else {
                localStorage.removeItem('client_theme_colors');
                removeCustomColors();
            }
        } catch (e) {
        }
    }

    function clearThemeClasses() {
        const root = document.documentElement;
        const classes = root.className.split(/\s+/).filter(Boolean);
        const filtered = classes.filter(function (c) { return !/^theme-[\w-]+$/.test(c); });
        root.className = filtered.join(' ');
    }

    function applyCustomColors(colors) {
        if (!colors) return;
        const root = document.documentElement;
        if (colors.primary) root.style.setProperty('--primary', colors.primary);
        if (colors.bg) root.style.setProperty('--bg', colors.bg);
    }

    function removeCustomColors() {
        const root = document.documentElement;
        root.style.removeProperty('--primary');
        root.style.removeProperty('--bg');
    }
})();
