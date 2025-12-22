document.addEventListener('DOMContentLoaded', async () => {
    // Auth Check
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../client/login.html';
        return;
    }

    loadFinancials();
});

async function loadFinancials() {
    const serviceTable = document.getElementById('serviceRevenueTable');
    const recentTable = document.getElementById('recentTransactionsTable');

    // Loading States
    const loadingHtml = `
        <tr>
            <td colspan="4" class="text-center" style="padding: 2rem;">
                <i class="ph-bold ph-spinner ph-spin" style="font-size: 1.5rem; color: var(--primary);"></i>
            </td>
        </tr>`;
    serviceTable.innerHTML = loadingHtml;
    recentTable.innerHTML = loadingHtml;

    try {
        const data = await api.get('/admin/analytics/financials');

        // Update Cards
        document.getElementById('totalRevenue').textContent = formatCurrency(data.total);
        document.getElementById('monthRevenue').textContent = formatCurrency(data.month);
        document.getElementById('todayRevenue').textContent = formatCurrency(data.today);

        // Update Services Table
        if (data.by_service.length === 0) {
            serviceTable.innerHTML = '<tr><td colspan="3" class="text-center" style="padding:1rem; color:var(--text-secondary);">Sem dados.</td></tr>';
        } else {
            serviceTable.innerHTML = data.by_service.map(s => `
                <tr style="border-left: 4px solid var(--info);">
                    <td data-label="Serviço">${s.title}</td>
                    <td data-label="Qtd">${s.count}</td>
                    <td data-label="Total" style="font-weight:bold;">${formatCurrency(s.total)}</td>
                </tr>
            `).join('');
        }

        // Update Recent Transactions
        if (data.recent.length === 0) {
            recentTable.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                        <i class="ph-duotone ph-receipt" style="font-size: 2rem;"></i>
                        <p>Sem transações recentes.</p>
                    </td>
                </tr>`;
        } else {
            recentTable.innerHTML = data.recent.map(t => `
                <tr class="card-mobile-completed">
                    <td data-label="Data/Hora">${new Date(t.date).toLocaleDateString()} ${t.time}</td>
                    <td data-label="Cliente">${t.user_name}</td>
                    <td data-label="Serviço">${t.title}</td>
                    <td data-label="Valor" style="color:var(--success); font-weight:bold;">+ ${formatCurrency(t.price)}</td>
                </tr>
            `).join('');
        }

    } catch (e) {
        console.error(e);
        Toast.error('Erro ao carregar dados financeiros.');
        serviceTable.innerHTML = '<tr><td colspan="3" class="text-error">Erro.</td></tr>';
        recentTable.innerHTML = '<tr><td colspan="4" class="text-error">Erro.</td></tr>';
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
