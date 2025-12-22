document.addEventListener('DOMContentLoaded', () => {
    loadData();

    // Event Listeners
    document.getElementById('searchInput').addEventListener('input', debounce(loadData, 500));
    document.getElementById('statusFilter').addEventListener('change', loadData);
    document.getElementById('sortFilter').addEventListener('change', loadData);
    document.getElementById('dateStart').addEventListener('change', loadData);
    document.getElementById('dateEnd').addEventListener('change', loadData);

    // Edit Form
    document.getElementById('editForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const id = formData.get('id');
        try {
            await api.put(`/admin/appointments/${id}`, {
                date: formData.get('date'),
                time: formData.get('time')
            });
            closeEdit();
            Toast.success('Reagendado com sucesso!');
            loadData();
        } catch (err) {
            Toast.error(err.message);
        }
    });

    // Close Modal on Outside Click
    window.onclick = (e) => {
        const modal = document.getElementById('editModal');
        if (e.target == modal) modal.style.display = 'none';
    }
    // Auto-refresh every 5 seconds
    setInterval(() => {
        // Only refresh if no modal is open (to avoid disrupting edits)
        const modal = document.getElementById('editModal');
        if (!modal || modal.style.display !== 'flex') {
            loadData(true); // Pass true to indicate background refresh
        }
    }, 5000);
});

let debounceTimer;
function debounce(func, timeout = 300) {
    return (...args) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

async function loadData(isBackground = false) {
    const tbody = document.getElementById('tableBody');
    if (!isBackground) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="padding: 3rem;">
                    <i class="ph-bold ph-spinner ph-spin" style="font-size: 2rem; color: var(--primary);"></i>
                    <p style="margin-top: 1rem; color: var(--text-secondary);">Carregando agendamentos...</p>
                </td>
            </tr>`;
    }

    const status = document.getElementById('statusFilter').value;
    const sort = document.getElementById('sortFilter').value;
    const startDate = document.getElementById('dateStart').value;
    const endDate = document.getElementById('dateEnd').value;
    const search = document.getElementById('searchInput').value;

    try {
        let url = '/admin/appointments?_t=' + Date.now();
        if (status) url += `&status=${status}`;
        if (sort) url += `&sort=${sort}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        const rows = await api.get(url);

        // Client-side search filtering
        let filteredRows = rows;
        if (search) {
            const lower = search.toLowerCase();
            filteredRows = rows.filter(r =>
                r.user_name.toLowerCase().includes(lower) ||
                (r.user_phone && r.user_phone.includes(lower)) ||
                r.service_title.toLowerCase().includes(lower) ||
                r.status.includes(lower)
            );
        }

        // Client-side Sorting
        filteredRows.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);

            if (sort === 'oldest') {
                return dateA - dateB;
            } else if (sort === 'upcoming') {
                const now = new Date();
                const isAFuture = dateA >= now;
                const isBFuture = dateB >= now;
                if (isAFuture && !isBFuture) return -1;
                if (!isAFuture && isBFuture) return 1;
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });

        if (filteredRows.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 3rem;">
                        <i class="ph-duotone ph-calendar-x" style="font-size: 3rem; color: var(--text-light);"></i>
                        <p style="margin-top: 1rem; color: var(--text-secondary);">Nenhum agendamento encontrado.</p>
                    </td>
                </tr>`;
            window.lastRows = [];
            return;
        }

        window.lastRows = filteredRows;

        tbody.innerHTML = filteredRows.map(r => `
            <tr class="card-mobile-${r.status}">
                <td data-label="ID">#${r.id}</td>
                <td data-label="Cliente">
                    <div style="font-weight:600;">${r.user_name}</div>
                    <div style="font-size:0.8rem; color:#666;">${r.user_phone || ''}</div>
                </td>
                <td data-label="Serviço">${r.service_title}</td>
                <td data-label="Data">${formatDate(r.date)}</td>
                <td data-label="Hora">${r.time}</td>
                <td data-label="Status"><span class="badge ${getStatusBadge(r.status)}">${getStatusLabel(r.status)}</span></td>
                <td data-label="Ações">
                    <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content: flex-end;">
                        ${getActionButtons(r)}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
        if (!isBackground) Toast.error('Erro ao carregar agendamentos');
    }
}

function getStatusBadge(status) {
    if (status === 'accepted') return 'badge-success'; // Or distinct color
    if (status === 'pending') return 'badge-warning';
    if (status === 'completed') return 'badge-success';
    if (status === 'cancelled') return 'badge-danger';
    if (status === 'rejected') return 'badge-danger';
    return '';
}

function getStatusLabel(status) {
    const map = {
        'pending': 'Pendente',
        'accepted': 'Aceito',
        'completed': 'Concluído',
        'cancelled': 'Cancelado',
        'rejected': 'Recusado'
    };
    return map[status] || status;
}

function getActionButtons(r) {
    if (r.status === 'pending') {
        return `
            <button onclick="update(${r.id}, 'accepted')" class="btn-icon" title="Aceitar" style="color:var(--success);">
                <i class="ph-bold ph-check"></i>
            </button>
            <button onclick="update(${r.id}, 'rejected')" class="btn-icon" title="Recusar" style="color:var(--error);">
                <i class="ph-bold ph-x"></i>
            </button>
        `;
    }
    if (r.status === 'accepted') {
        return `
            <button onclick="openEdit(${r.id}, '${r.date}', '${r.time}')" class="btn-icon" title="Reagendar" style="color:var(--primary);">
                <i class="ph-bold ph-calendar-pencil"></i>
            </button>
            <button onclick="update(${r.id}, 'completed')" class="btn-icon" title="Concluir" style="color:var(--success);">
                <i class="ph-bold ph-check-circle"></i>
            </button>
            <button onclick="update(${r.id}, 'cancelled')" class="btn-icon" title="Cancelar" style="color:var(--error);">
                <i class="ph-bold ph-prohibit"></i>
            </button>
        `;
    }
    // Completed/Cancelled items usually don't need actions or maybe just 'Archive'? For now, show nothing or just view details (if implemented)
    // User requested specifically for "Accept, Refuse, Reschedule, Complete, Cancel".
    // Completed items are done.
    return `<span style="color:#aaa;">-</span>`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
}

window.update = async function (id, status) {
    const actionMap = { accepted: 'Aceitar', rejected: 'Recusar', completed: 'Concluir', cancelled: 'Cancelar' };
    if (!confirm(`Deseja realmente ${actionMap[status] || status} este agendamento?`)) return;

    try {
        await api.put(`/admin/appointments/${id}/status`, { status });
        Toast.success('Status atualizado!');
        loadData();
    } catch (e) { Toast.error(e.message); }
}

window.openEdit = function (id, date, time) {
    const modal = document.getElementById('editModal');
    const form = document.getElementById('editForm');
    form.elements['id'].value = id;
    form.elements['date'].value = date;
    form.elements['time'].value = time;
    modal.style.display = 'flex';
}

window.closeEdit = function () {
    document.getElementById('editModal').style.display = 'none';
}

window.exportCSV = function () {
    if (!window.lastRows || window.lastRows.length === 0) return Toast.info('Nada para exportar');

    const rows = window.lastRows;
    const headers = ['ID', 'Cliente', 'Telefone', 'Serviço', 'Data', 'Hora', 'Status'];
    const csvContent = [
        headers.join(','),
        ...rows.map(r => [
            r.id,
            `"${r.user_name}"`,
            `"${r.user_phone || ''}"`,
            `"${r.service_title}"`,
            r.date,
            r.time,
            r.status
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agendamentos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}
