document.addEventListener('DOMContentLoaded', async () => {
    // Basic Auth Check
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../client/login.html';
        return;
    }

    // Sidebar buttons are now handled by ../layout.js

    // Set Date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('pt-BR', dateOptions);
    const dateEl = document.getElementById('dateDisplay');
    if (dateEl) dateEl.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    loadDashboardData();

    // Auto-refresh every 5 seconds (Real-time simulation)
    setInterval(loadDashboardData, 5000);
});

async function loadDashboardData() {
    try {
        // Parallel Fetching for Performance
        const [stats, financials, appointments, users] = await Promise.all([
            api.get('/admin/stats'),                    // { pending, today, month }
            api.get('/admin/analytics/financials'),     // { month, etc }
            api.get('/admin/appointments'),             // All appointments (for charts)
            api.get('/admin/users')                     // All users (for client count)
        ]);

        // 1. Fill KPI Cards
        document.getElementById('statsPending').textContent = stats.pending;
        document.getElementById('statsToday').textContent = stats.today_completed;
        document.getElementById('statsClients').textContent = `+${stats.today_new_users}`;

        document.getElementById('statsRevenue').textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financials.month);


        // 2. Render Charts
        renderCharts(appointments);

        // 3. Render Pending Table
        renderPendingTable(appointments.filter(a => a.status === 'pending'));

    } catch (e) {
        console.error("Dashboard Load Error:", e);
        Toast.error('Erro ao carregar dashboard.');
    }
}

// Global store for charts to prevent "Canvas is already in use" error
window.dashboardCharts = {
    appointments: null,
    status: null
};

function renderCharts(appointments) {
    // A. Appointments per Day (Last 30 Days)
    const days = [];
    const counts = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        // Format for Label (e.g., 10/12)
        days.push(`${d.getDate()}/${d.getMonth() + 1}`);

        // Count appointments for this status
        const count = appointments.filter(a => a.date === dateStr).length;
        counts.push(count);
    }

    const ctxApp = document.getElementById('appointmentsChart').getContext('2d');

    // Destroy previous instance if exists
    if (window.dashboardCharts.appointments) {
        window.dashboardCharts.appointments.destroy();
    }

    window.dashboardCharts.appointments = new Chart(ctxApp, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Agendamentos',
                data: counts,
                borderColor: '#ec4899', // Pink
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } },
                x: { grid: { display: false } }
            },
            animation: false // Disable animation for updates to prevent distraction
        }
    });

    // B. Status Distribution
    const statusCounts = {
        completed: 0,
        cancelled: 0,
        pending: 0,
        other: 0
    };

    appointments.forEach(a => {
        if (a.status === 'completed') statusCounts.completed++;
        else if (a.status === 'cancelled' || a.status === 'rejected') statusCounts.cancelled++;
        else if (a.status === 'pending') statusCounts.pending++;
        else statusCounts.other++;
    });

    const ctxStatus = document.getElementById('statusChart').getContext('2d');

    // Destroy previous instance
    if (window.dashboardCharts.status) {
        window.dashboardCharts.status.destroy();
    }

    window.dashboardCharts.status = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Concluídos', 'Cancelados', 'Pendentes'],
            datasets: [{
                data: [statusCounts.completed, statusCounts.cancelled, statusCounts.pending],
                backgroundColor: [
                    '#10b981', // green
                    '#ef4444', // red
                    '#f59e0b', // amber
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 10 } } }
            },
            cutout: '70%',
            animation: false
        }
    });
}

function renderPendingTable(pending) {
    const tbody = document.getElementById('pendingTable');
    if (pending.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="color:#999; padding:2rem;">Nenhum agendamento pendente! 🎉</td></tr>';
        return;
    }


    tbody.innerHTML = pending.slice(0, 5).map(app => `
        <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:12px;"><strong>${app.user_name}</strong></td>
            <td>${app.service_title}</td>
            <td>${new Date(app.date).toLocaleDateString()} - ${app.time}</td>
            <td>
                <button onclick="quickAction(${app.id}, 'accepted')" class="btn-icon" style="color:var(--success);" title="Aceitar">
                    <i class="ph-bold ph-check"></i>
                </button>
                <button onclick="quickAction(${app.id}, 'rejected')" class="btn-icon" style="color:var(--error);" title="Recusar">
                    <i class="ph-bold ph-x"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

window.quickAction = async function (id, status) {
    if (!confirm(`Deseja ${status === 'accepted' ? 'ACEITAR' : 'RECUSAR'} este agendamento?`)) return;
    try {
        await api.put(`/admin/appointments/${id}/status`, { status });
        Toast.success('Atualizado!');
        loadDashboardData(); // Reload everything to update charts and list
    } catch (e) {
        Toast.error(e.message);
    }
}
