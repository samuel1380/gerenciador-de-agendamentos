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
        this.intervalId = null;
        this.init();
    }

    async init() {
        const cached = this.getCachedAppointments();
        if (cached && cached.length) {
            this.renderList(cached);
        } else {
            this.list.innerHTML = '<div class="skeleton" style="height: 100px; width:100%; border-radius:12px;"></div>';
        }

        await this.loadAppointments(!cached || !cached.length);

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(() => this.loadAppointments(false), 5000);

        window.addEventListener('pagehide', () => {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }, { once: true });
    }

    getCachedAppointments() {
        if (typeof window === 'undefined' || !window.ClientCache) return null;
        return window.ClientCache.get('appointments_me_cache', 60000);
    }

    setCachedAppointments(appts) {
        if (typeof window === 'undefined' || !window.ClientCache) return;
        window.ClientCache.set('appointments_me_cache', appts);
    }

    async loadAppointments(showSkeleton = false) {
        try {
            if (showSkeleton) {
                this.list.innerHTML = '<div class="skeleton" style="height: 100px; width:100%; border-radius:12px;"></div>';
            }
            const appts = await api.get('/appointments/me');

            if (appts.length === 0) {
                this.list.innerHTML = `
                    <div class="text-center" style="padding: 2rem;">
                        <p class="text-light">Você ainda não tem agendamentos.</p>
                        <a href="schedule.html" class="btn btn-outline" style="margin-top: 1rem; display:inline-block; width:auto;">Agendar Agora</a>
                    </div>`;
                this.setCachedAppointments([]);
                return;
            }

            appts.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateB - dateA;
            });

            this.renderList(appts);
            this.setCachedAppointments(appts);

        } catch (e) {
            console.error(e);
            if (showSkeleton) {
                this.list.innerHTML = '<p style="color:red">Erro ao carregar agendamentos.</p>';
            }
            if (typeof Toast !== 'undefined') {
                Toast.error('Erro ao conectar com o servidor.');
            }
        }
    }

    renderList(appts) {
        if (!appts || !appts.length) {
            this.list.innerHTML = `
                <div class="text-center" style="padding: 2rem;">
                    <p class="text-light">Você ainda não tem agendamentos.</p>
                    <a href="schedule.html" class="btn btn-outline" style="margin-top: 1rem; display:inline-block; width:auto;">Agendar Agora</a>
                </div>`;
            return;
        }

        this.list.innerHTML = appts.map(a => this.renderCard(a)).join('');

        const buttons = document.querySelectorAll('.btn-cancel');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => this.cancelAppointment(e.target.dataset.id));
        });
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
            if (typeof Toast !== 'undefined') {
                Toast.success('Agendamento cancelado com sucesso!');
            }
            this.loadAppointments(false);
        } catch (e) {
            if (typeof Toast !== 'undefined') {
                Toast.error(e.message || 'Erro ao cancelar.');
            }
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new AppointmentsPage();
});
