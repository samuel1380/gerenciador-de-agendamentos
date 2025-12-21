document.addEventListener('DOMContentLoaded', async () => {
    // Auth Check
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../client/login.html';
        return;
    }

    // Load Users
    loadUsers();

    // Modal Close Logic
    const modal = document.getElementById('userModal');
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = 'none';
    }
    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = 'none';
    }
});

let allUsers = [];

async function loadUsers() {
    const list = document.getElementById('usersList');
    list.innerHTML = '<tr><td colspan="6" class="text-center">Carregando...</td></tr>';

    try {
        const users = await api.get('/admin/users');
        allUsers = users;
        renderUsers(allUsers);
    } catch (e) {
        console.error(e);
        list.innerHTML = '<tr><td colspan="6" class="text-center text-error">Erro ao carregar usuários.</td></tr>';
    }
}

function renderUsers(users) {
    const list = document.getElementById('usersList');

    if (users.length === 0) {
        list.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-secondary);">Nenhum cliente encontrado.</td></tr>';
        return;
    }

    list.innerHTML = users.map(u => `
        <tr class="${u.active ? '' : 'user-banned'}" style="transition: background 0.2s;">
            <td>
                <div style="font-weight:600; color: var(--text-main);">${u.name}</div>
                <div style="font-size:0.85rem; color: var(--text-secondary);">${u.email}</div>
            </td>
            <td>
                <div style="font-weight: 500; color: var(--primary);">Nível ${u.level || 1}</div>
                <small style="color: var(--text-muted);">${u.xp || 0} XP</small>
            </td>
            <td style="font-weight: 600;">R$ ${Number(u.ltv || 0).toFixed(2)}</td>
            <td><span style="background: var(--bg-body); padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">${u.total_appointments || 0}</span></td>
            <td><span class="badge ${(u.active ?? 1) ? 'badge-success' : 'badge-danger'}">${(u.active ?? 1) ? 'Ativo' : 'Bloqueado'}</span></td>
            <td>
                <button onclick="viewUser(${u.id})" class="btn-icon" title="Ver Detalhes" style="color:var(--info);">
                    <i class="ph-bold ph-eye"></i>
                </button>
                <button onclick="toggleUser(${u.id})" class="btn-icon" title="${(u.active ?? 1) ? 'Bloquear' : 'Desbloquear'}" style="color:${(u.active ?? 1) ? 'var(--error)' : 'var(--success)'};">
                    <i class="ph-bold ${(u.active ?? 1) ? 'ph-prohibit' : 'ph-check-circle'}"></i>
                </button>
                <button onclick="makeAdmin(${u.id})" class="btn-icon" title="Promover a Admin" style="color:var(--warning);">
                    <i class="ph-bold ph-crown"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

window.filterUsers = function () {
    const term = document.getElementById('userSearch').value.toLowerCase();
    const filtered = allUsers.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone && u.phone.includes(term))
    );
    renderUsers(filtered);
}

window.sortUsers = function () {
    const criteria = document.getElementById('userSort').value;
    let sorted = [...allUsers]; // copy to avoid mutation issues if any

    if (criteria === 'recent') {
        // Assuming higher ID is more recent for now, or use created_at if available
        sorted.sort((a, b) => b.id - a.id);
    } else if (criteria === 'ltv') {
        sorted.sort((a, b) => (b.ltv || 0) - (a.ltv || 0));
    } else if (criteria === 'appointments') {
        sorted.sort((a, b) => b.total_appointments - a.total_appointments);
    }

    // Apply current filter as well? For simplicity, we sort the *displayed* list? 
    // Actually better to sort allUsers and re-filter, but for now let's just re-filter sorted list
    // Simplest: Sort `allUsers` then call filter to maintain search state.
    allUsers.sort((a, b) => { // Apply sort to master list
        if (criteria === 'recent') return b.id - a.id;
        if (criteria === 'ltv') return (b.ltv || 0) - (a.ltv || 0);
        if (criteria === 'appointments') return b.total_appointments - a.total_appointments;
        return 0;
    });

    // Re-run filter to update view
    window.filterUsers();
}

async function viewUser(id) {
    const modal = document.getElementById('userModal');
    const content = document.getElementById('modalContent');
    content.innerHTML = '<p>Carregando...</p>';
    modal.style.display = 'flex'; // Changed to flex for centering

    try {
        const data = await api.get(`/admin/users/${id}`);
        const { user, appointments, quizzes } = data;

        // Determine Most Frequent Service (basic logic)
        // ...

        content.innerHTML = `
            <div style="display:flex; align-items:center; gap:16px; margin-bottom:1.5rem;">
                <div style="width:64px; height:64px; background:#f0f0f0; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; overflow:hidden;">
                    ${user.avatar ? `<img src="../${user.avatar}" style="width:100%; height:100%; object-fit:cover;">` : '<i class="ph-duotone ph-user"></i>'}
                </div>
                <div>
                    <h2 style="margin:0;">${user.name}</h2>
                    <p style="margin:0; color:#666;">${user.phone || 'Sem telefone'}</p>
                </div>
                <div style="margin-left:auto; text-align:right;">
                    <div style="font-weight:bold;">LTV: R$ ${(appointments.reduce((sum, a) => sum + (a.status === 'completed' ? Number(a.price) : 0), 0)).toFixed(2)}</div>
                    <div style="color:#666;">Cadastrado em: ${user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                <div>
                    <h3>Histórico de Agendamentos</h3>
                    <div style="max-height:300px; overflow-y:auto; border:1px solid #eee; border-radius:8px; padding:10px;">
                        ${appointments.length ? appointments.map(a => `
                            <div style="padding:8px; border-bottom:1px solid #eee; font-size:0.9rem;">
                                <strong>${a.service_title}</strong> <span style="font-size:0.8rem; float:right;">${new Date(a.date).toLocaleDateString()}</span><br>
                                <span class="status-${a.status}">${a.status}</span> - R$ ${Number(a.price).toFixed(2)}
                            </div>
                        `).join('') : '<p>Sem agendamentos.</p>'}
                    </div>
                </div>

                <div>
                    <h3>Perfil & Preferências</h3>
                    <div style="background:#f9f9f9; padding:15px; border-radius:8px;">
                        <p><strong>Nível:</strong> ${user.level} (XP: ${user.xp})</p>
                        <p><strong>Quizzes Realizados:</strong> ${quizzes.length}</p>
                        ${quizzes.length > 0 ? `<p><strong>Último Estilo:</strong> ${getStyleFromScore(quizzes[0].payload.score)}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        content.innerHTML = `<p class="text-error">Erro: ${e.message}</p>`;
    }
}

function getStyleFromScore(score) {
    if (score <= 4) return 'Clássica';
    if (score <= 7) return 'Moderna';
    return 'Ousada';
}

window.toggleUser = async function (id) {
    if (!confirm('Tem certeza que deseja alterar o status deste usuário?')) return;
    try {
        await api.put(`/admin/users/${id}/toggle`, {});
        loadUsers();
    } catch (e) { alert(e.message); }
}

window.makeAdmin = async function (id) {
    if (!confirm('ATENÇÃO: Deseja promover este usuário a ADMINISTRADOR? \n\nEle terá acesso total ao painel admin.')) return;
    try {
        await api.put(`/admin/users/${id}/promote`, {});
        alert('Usuário promovido com sucesso!');
        loadUsers();
    } catch (e) {
        alert(e.message);
    }
}

// Global for viewUser access
window.viewUser = viewUser;
