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
    if (!isBackground) tbody.innerHTML = '<tr><td colspan="7" class="text-center">Carregando...</td></tr>';

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
        // Search is client-side filter or needs backend impl. Implementing Client-side for name/phone if backend doesn't support SEARCH query yet.
        // Backend doesn't support 'search' param in SQL yet, effectively. Admin route doesn't have LIKE %search%.
        // Assuming user wants filtering on loaded results or we add it to backend.
        // Let's filter client side for Search for now to be safe, or add backend search.
        // Adding backend search involves joining user tables which we did. 
        // Let's stick to filters provided by API.

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
                // Determine if future or past
                const now = new Date();
                const isAFuture = dateA >= now;
                const isBFuture = dateB >= now;

                if (isAFuture && !isBFuture) return -1; // Future first
                if (!isAFuture && isBFuture) return 1;

                // If both future or both past, sort ASC (closest to now for future, oldest for past)
                return dateA - dateB;
            } else {
                // Recent (Default) - Newest first
                return dateB - dateA;
            }
        });

        if (filteredRows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum registro encontrado.</td></tr>';
            window.lastRows = [];
            return;
        }

        window.lastRows = filteredRows; // Store for CSV export

        tbody.innerHTML = filteredRows.map(r => `
            <tr>
                <td>#${r.id}</td>
                <td>
                    <div style="font-weight:600;">${r.user_name}</div>
                    <div style="font-size:0.8rem; color:#666;">${r.user_phone || ''}</div>
                </td>
                <td>${r.service_title}</td>
                <td>${formatDate(r.date)}</td>
                <td>${r.time}</td>
                <td><span class="badge ${getStatusBadge(r.status)}">${getStatusLabel(r.status)}</span></td>
                <td>
                    <div style="display:flex; gap:4px;">
                        ${getActionButtons(r)}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
        Toast.error('Erro ao carregar agendamentos');
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
