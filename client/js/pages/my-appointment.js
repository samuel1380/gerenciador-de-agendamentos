export class AppointmentsPage {
    constructor() {
        this.list = document.getElementById('appointmentsList');
        this.statusMap = {
            'pending': { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800', style: 'background: #fef08a; color: #854d0e;' },
            'accepted': { label: 'Confirmado', class: 'bg-green-100 text-green-800', style: 'background: #86efac; color: #14532d;' },
            'rejected': { label: 'Recusado', class: 'bg-red-100 text-red-800', style: 'background: #fca5a5; color: #7f1d1d;' },
            'completed': { label: 'Concluído', class: 'bg-gray-100 text-gray-800', style: 'background: #f3f4f6; color: #374151;' },
            'cancelled': { label: 'Cancelado', class: 'bg-gray-100 text-gray-800', style: 'background: #f3f4f6; color: #9ca3af;' }
        };
        this.init();
    }

    async init() {
        await this.loadAppointments();

        // Auto-refresh every 5s
        setInterval(() => this.loadAppointments(), 5000);
    }

    async loadAppointments() {
        try {
            this.list.innerHTML = '<div class="skeleton" style="height: 100px; width:100%; border-radius:12px;"></div>';
            const appts = await api.get('/appointments/me');

            if (appts.length === 0) {
                this.list.innerHTML = `
                    <div class="text-center" style="padding: 2rem;">
                        <p class="text-light">Você ainda não tem agendamentos.</p>
                        <a href="schedule.html" class="btn btn-outline" style="margin-top: 1rem; display:inline-block; width:auto;">Agendar Agora</a>
                    </div>`;
                return;
            }

            // Sort: Date DESC (Newest/Future FIRST)
            // "Mais recentes" implies descending date order (2025 before 2024).
            // This ensures consistent order regardless of status changes.
            appts.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateB - dateA; // DESC
            });

            this.list.innerHTML = appts.map(a => this.renderCard(a)).join('');

            // Attach event listeners for cancel buttons
            document.querySelectorAll('.btn-cancel').forEach(btn => {
                btn.addEventListener('click', (e) => this.cancelAppointment(e.target.dataset.id));
            });

        } catch (e) {
            console.error(e);
            this.list.innerHTML = '<p style="color:red">Erro ao carregar agendamentos.</p>';
            Toast.error('Erro ao conectar com o servidor.');
        }
    }

    renderCard(a) {
        const st = this.statusMap[a.status] || { label: a.status, style: '' };
        const dateStr = a.date.split('-').reverse().join('/');

        let cancelBtn = '';
        if (a.status === 'pending' || a.status === 'accepted') {
            cancelBtn = `<button data-id="${a.id}" class="btn-cancel" style="padding: 4px 12px; font-size: 0.8rem; border: 1px solid var(--error); color: var(--error); background: transparent; border-radius: 99px; cursor: pointer;">Cancelar</button>`;
        }

        return `
        <div class="card" style="position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <div>
                    <h3 style="font-size: 1.1rem; margin:0;">${a.service_title}</h3>
                    <p style="color: var(--text-light); margin-top: 4px;">📅 ${dateStr} às ${a.time}</p>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                    <span style="font-size: 0.8rem; padding: 4px 8px; border-radius: 99px; ${st.style} font-weight:600;">${st.label}</span>
                    ${cancelBtn}
                </div>
            </div>
            ${a.note ? `<p style="font-size: 0.9rem; color: var(--text-light); border-top: 1px solid var(--gray-100); padding-top: 8px; margin-top: 8px;">📝 ${a.note}</p>` : ''}
        </div>
        `;
    }

    async cancelAppointment(id) {
        if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

        try {
            await api.put(`/appointments/${id}/cancel`, {});
            Toast.success('Agendamento cancelado com sucesso!');
            this.loadAppointments();
        } catch (e) {
            Toast.error(e.message || 'Erro ao cancelar.');
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new AppointmentsPage();
});
