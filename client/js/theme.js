(async function () {
    try {
        // Apply saved theme from local storage instantly to prevent flash
        const localTheme = localStorage.getItem('client_theme');
        if (localTheme) {
            document.body.classList.add('theme-' + localTheme);
        }

        // Use global api object if available
        if (typeof api !== 'undefined') {
            const data = await api.get('/settings/public');
            if (data.client_theme) {
                if (localTheme !== data.client_theme) {
                    // Remove old theme classes
                    document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
                    document.body.classList.add('theme-' + data.client_theme);
                    localStorage.setItem('client_theme', data.client_theme);
                }
            }
        } else {
            console.warn('Theme: api object not found, skipping fetch.');
        }
    } catch (e) {
        // Silent fail on theme load to not disturb UX
        console.log('Theme sync skipped');
    }
})();
