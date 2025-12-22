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
    try {
        const data = await api.get('/admin/analytics/financials');

        // Update Cards
        document.getElementById('totalRevenue').textContent = formatCurrency(data.total);
        document.getElementById('monthRevenue').textContent = formatCurrency(data.month);
        document.getElementById('todayRevenue').textContent = formatCurrency(data.today);

        // Update Services Table
        const serviceTable = document.getElementById('serviceRevenueTable');
        if (data.by_service.length === 0) {
            serviceTable.innerHTML = '<tr><td colspan="3" class="text-center">Sem dados.</td></tr>';
        } else {
            serviceTable.innerHTML = data.by_service.map(s => `
                <tr>
                    <td>${s.title}</td>
                    <td>${s.count}</td>
                    <td>${formatCurrency(s.total)}</td>
                </tr>
            `).join('');
        }

        // Update Recent Transactions
        const recentTable = document.getElementById('recentTransactionsTable');
        if (data.recent.length === 0) {
            recentTable.innerHTML = '<tr><td colspan="4" class="text-center">Sem transações recentes.</td></tr>';
        } else {
            recentTable.innerHTML = data.recent.map(t => `
                <tr>
                    <td>${new Date(t.date).toLocaleDateString()} ${t.time}</td>
                    <td>${t.user_name}</td>
                    <td>${t.title}</td>
                    <td style="color:var(--success); font-weight:bold;">+ ${formatCurrency(t.price)}</td>
                </tr>
            `).join('');
        }

    } catch (e) {
        console.error(e);
        Toast.error('Erro ao carregar dados financeiros.');
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
