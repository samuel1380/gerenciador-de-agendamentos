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

            if (data.notification_icon_url) {
                // Update Apple Touch Icon
                const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
                if (appleIcon) {
                    appleIcon.href = data.notification_icon_url;
                }
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
        if (colors.primary) {
            root.style.setProperty('--primary', colors.primary);
            // Derive variations
            const rgb = hexToRgb(colors.primary);
            if (rgb) {
                root.style.setProperty('--primary-rgb', rgb);
                root.style.setProperty('--primary-light', `rgba(${rgb}, 0.1)`);
            }
        }
        if (colors.primaryDark) root.style.setProperty('--primary-dark', colors.primaryDark);
        if (colors.accent) root.style.setProperty('--accent', colors.accent);
        if (colors.bg) root.style.setProperty('--bg', colors.bg);
        if (colors.bgCard) root.style.setProperty('--bg-card', colors.bgCard);
        if (colors.text) root.style.setProperty('--text', colors.text);
        if (colors.textLight) root.style.setProperty('--text-light', colors.textLight);
        if (colors.textMuted) root.style.setProperty('--text-muted', colors.textMuted);
        if (colors.border) root.style.setProperty('--border', colors.border);
        if (colors.radius) root.style.setProperty('--radius', colors.radius);
    }

    function hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : null;
    }

    function removeCustomColors() {
        const root = document.documentElement;
        root.style.removeProperty('--primary');
        root.style.removeProperty('--primary-dark');
        root.style.removeProperty('--primary-rgb');
        root.style.removeProperty('--primary-light');
        root.style.removeProperty('--accent');
        root.style.removeProperty('--bg');
        root.style.removeProperty('--bg-card');
        root.style.removeProperty('--text');
        root.style.removeProperty('--text-light');
        root.style.removeProperty('--text-muted');
        root.style.removeProperty('--border');
        root.style.removeProperty('--radius');
    }
})();
