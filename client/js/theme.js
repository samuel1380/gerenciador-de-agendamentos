(async function () {
    try {
        // Apply saved theme from local storage instantly
        const localTheme = localStorage.getItem('client_theme');
        const localColors = localStorage.getItem('client_theme_colors');

        if (localTheme) document.body.classList.add('theme-' + localTheme);
        if (localColors) applyCustomColors(JSON.parse(localColors));

        if (typeof api !== 'undefined') {
            const data = await api.get('/settings/public');

            // Sync Theme
            if (data.client_theme && localTheme !== data.client_theme) {
                document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
                document.body.classList.add('theme-' + data.client_theme);
                localStorage.setItem('client_theme', data.client_theme);
            }

            // Sync Colors
            if (data.client_theme_colors) {
                localStorage.setItem('client_theme_colors', data.client_theme_colors);
                applyCustomColors(JSON.parse(data.client_theme_colors));
            } else {
                localStorage.removeItem('client_theme_colors');
                removeCustomColors();
            }
        }
    } catch (e) {
        // Silent fail
    }

    function applyCustomColors(colors) {
        if (!colors) return;
        const root = document.body || document.documentElement;
        if (colors.primary) root.style.setProperty('--primary', colors.primary);
        if (colors.bg) root.style.setProperty('--bg', colors.bg);
    }

    function removeCustomColors() {
        const root = document.body || document.documentElement;
        root.style.removeProperty('--primary');
        root.style.removeProperty('--bg');
    }
})();
