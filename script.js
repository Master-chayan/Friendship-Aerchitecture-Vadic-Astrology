        // GLOBAL STATE
        let allData = {
            clients: [],
            architectureRequests: [],
            astrologyConsultations: [],
            appointments: [],
            payments: []
        };

        let config = {
            business_name: 'Friendship Civil Architect & Astrology Consultancy',
            tagline: 'Professional Civil Architecture & Vedic Astrology Consultancy',
            phone_number: '+91 9874968071',
            email_address: 'info@friendshipconsultancy.com',
            whatsapp_number: '9874968071'
        };

        const defaultOwnerProfile = {
            name: 'Architect Rajendra Singh',
            credentials: 'B.Arch (Gold Medalist) | Vedic Astrology Specialist',
            bio: 'With 15+ years of experience in civil architecture and Vedic astrology, I bring a unique blend of scientific design principles and ancient wisdom to create harmonious living spaces. My mission is to help clients build not just structures, but homes aligned with cosmic principles for prosperity and well-being.',
            mission: 'To merge modern architecture with traditional Vastu and astrological principles, creating spaces that enhance both aesthetics and positive energy flow.'
        };
        let ownerProfile = { ...defaultOwnerProfile };

        let analyticsChart = null;
        let isOwnerAuthenticated = false;
        const OWNER_USERNAME = 'owner';
        const OWNER_PASSWORD_KEY = 'friendship-consultancy-owner-password';
        let ownerPassword = 'Owner@2026';
        try {
            ownerPassword = localStorage.getItem(OWNER_PASSWORD_KEY) || ownerPassword;
        } catch (error) {
            // Keep the default password available if browser storage is disabled.
        }
        // Keep forms usable when the hosted data SDK is unavailable.
        if (!window.dataSdk) {
            const localDataKey = 'friendship-consultancy-data';
            let localDataHandler = null;

            const readLocalData = () => {
                try {
                    return JSON.parse(localStorage.getItem(localDataKey) || '[]');
                } catch (error) {
                    return [];
                }
            };

            const writeLocalData = (data) => {
                localStorage.setItem(localDataKey, JSON.stringify(data));
                if (localDataHandler) localDataHandler(data);
            };

            window.dataSdk = {
                async init(handler) {
                    localDataHandler = handler.onDataChanged;
                    handler.onDataChanged(readLocalData());
                    return { isOk: true };
                },
                async create(record) {
                    const data = readLocalData();
                    const id = window.crypto && crypto.randomUUID
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
                    const savedRecord = { ...record, __backendId: id };
                    data.push(savedRecord);
                    writeLocalData(data);
                    return { isOk: true, data: savedRecord };
                },
                async update(record) {
                    const data = readLocalData();
                    const index = data.findIndex(item => item.__backendId === record.__backendId);
                    if (index < 0) return { isOk: false };
                    data[index] = record;
                    writeLocalData(data);
                    return { isOk: true, data: record };
                },
                async delete(record) {
                    const data = readLocalData().filter(item => item.__backendId !== record.__backendId);
                    writeLocalData(data);
                    return { isOk: true };
                }
            };
        }

        // INITIALIZE SDK
        (async () => {
            const dataHandler = {
                onDataChanged(data) {
                    processAllData(data);
                    updateAllDisplays();
                }
            };

            const result = await window.dataSdk.init(dataHandler);
            if (result.isOk) {
                console.log('Data SDK initialized');
            }

            // Initialize Element SDK
            if (window.elementSdk) {
                window.elementSdk.init({
                    defaultConfig: config,
                    onConfigChange: (newConfig) => {
                        config = { ...config, ...newConfig };
                        updateUIWithConfig();
                    },
                    mapToCapabilities: () => ({
                        recolorables: [],
                        borderables: [],
                        fontEditable: undefined,
                        fontSizeable: undefined
                    }),
                    mapToEditPanelValues: (cfg) => new Map([
                        ['business_name', cfg.business_name || config.business_name],
                        ['tagline', cfg.tagline || config.tagline],
                        ['phone_number', cfg.phone_number || config.phone_number],
                        ['email_address', cfg.email_address || config.email_address],
                        ['whatsapp_number', cfg.whatsapp_number || config.whatsapp_number]
                    ])
                });
            }
        })();

        function updateUIWithConfig() {
            document.getElementById('nav-business-name').textContent = config.business_name.split(' ')[0];
            document.getElementById('hero-title').textContent = config.business_name;
            document.getElementById('hero-tagline').textContent = config.tagline;
            document.getElementById('contact-phone').textContent = config.phone_number;
            document.getElementById('contact-email').textContent = config.email_address;
            document.getElementById('contact-whatsapp').textContent = config.whatsapp_number;
        }

        function loadOwnerProfile() {
            try {
                const savedProfile = JSON.parse(localStorage.getItem('friendship-consultancy-profile') || '{}');
                if (savedProfile && typeof savedProfile === 'object' && !Array.isArray(savedProfile)) {
                    Object.keys(defaultOwnerProfile).forEach(key => {
                        if (typeof savedProfile[key] === 'string') ownerProfile[key] = savedProfile[key];
                    });
                }
            } catch (error) {
                ownerProfile = { ...defaultOwnerProfile };
            }

            document.getElementById('owner-profile-name').textContent = ownerProfile.name;
            document.getElementById('owner-profile-credentials').textContent = ownerProfile.credentials;
            document.getElementById('owner-profile-bio').textContent = ownerProfile.bio;
            document.getElementById('owner-profile-mission').textContent = ownerProfile.mission;
            document.getElementById('home-about-name').textContent = ownerProfile.name;
            document.getElementById('home-about-credentials').textContent = ownerProfile.credentials;
            document.getElementById('home-about-bio').textContent = ownerProfile.bio;
            document.getElementById('home-team-name').textContent = ownerProfile.name;
            document.getElementById('home-team-credentials').textContent = ownerProfile.credentials;
            document.getElementById('home-team-bio').textContent = ownerProfile.bio;
        }

        function processAllData(data) {
            allData = {
                clients: data.filter(d => d.type === 'client'),
                architectureRequests: data.filter(d => d.type === 'architecture'),
                astrologyConsultations: data.filter(d => d.type === 'astrology'),
                appointments: data.filter(d => d.type === 'appointment'),
                payments: data.filter(d => d.type === 'payment')
            };
        }

        function updateAllDisplays() {
            updateClientsTable();
            updateArchitectureTable();
            updateAstrologyTable();
            updateAppointmentsTable();
            updatePaymentsTable();
            updateDashboardStats();
            updateAnalyticsChart();
        }

        // NAVIGATION
        function navigateTo(page) {
            document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
            document.querySelector('.main-content').style.display = 'block';
            document.getElementById('admin-panel').style.display = 'none';
            const pageMap = {
                'home': 'home-page',
                'about': 'about-page',
                'architecture-services': 'architecture-services-page',
                'astrology-services': 'astrology-services-page',
                'payments': 'payments-page',
                'appointments': 'appointments-page',
                'contact': 'contact-page',
                'client-access': 'client-access-page'
            };
            const targetPage = pageMap[page] || 'home-page';
            document.getElementById(targetPage).classList.add('active');
            window.scrollTo(0, 0);
        }

        function scrollToArchitectureRequest() {
            document.getElementById('architecture-request').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function activateArchitectureRequest(event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            scrollToArchitectureRequest();
        }

        document.querySelectorAll('#architecture-services-page .service-card').forEach(card => {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.addEventListener('click', scrollToArchitectureRequest);
            card.addEventListener('keydown', activateArchitectureRequest);
        });

        function scrollToAstrologyConsultation() {
            document.getElementById('astrology-consultation-request').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function activateAstrologyConsultation(event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            scrollToAstrologyConsultation();
        }

        document.querySelectorAll('#astrology-services-page .service-card').forEach(card => {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.addEventListener('click', scrollToAstrologyConsultation);
            card.addEventListener('keydown', activateAstrologyConsultation);
        });

        // CLIENT AREA
        function lookupClientStatus(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const email = String(formData.get('email') || '').trim().toLowerCase();
            const normalizePhone = value => {
                const digits = String(value || '').replace(/\D/g, '');
                return digits.length > 10 ? digits.slice(-10) : digits;
            };
            const phone = normalizePhone(formData.get('phone'));
            const matches = [...allData.architectureRequests, ...allData.astrologyConsultations, ...allData.appointments, ...allData.payments].filter(item => {
                const itemEmail = String(item.email || '').trim().toLowerCase();
                const itemPhone = normalizePhone(item.phone);
                return itemEmail === email && itemPhone === phone;
            });
            const result = document.getElementById('client-status-result');
            if (!matches.length) {
                result.innerHTML = '<div class="toast warning" style="position:static;">No matching request was found. Please check your email and phone number.</div>';
                result.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            result.innerHTML = '<div style="background:#f9f9f9; border-left:4px solid var(--accent-gold); padding:1rem; border-radius:4px;"><strong>Your request status</strong>' + matches.map(item => {
                if (item.type === 'payment') {
                    return `<p style="margin:.75rem 0 0;"><strong>Payment</strong> · ₹${item.amount} for ${item.purpose} · <span class="status-badge status-${item.status}">${item.status || 'pending'}</span></p>`;
                }
                return `<p style="margin:.75rem 0 0;"><strong>${item.type}</strong> · <span class="status-badge status-${item.status}">${item.status || 'pending'}</span>${item.appointment_date ? ` · ${item.appointment_date} at ${item.appointment_time || ''}` : ''}</p>`;
            }).join('') + '</div>';
            result.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }




        

        // ADMIN WORKSPACE
        function toggleAdminPanel() {
            const adminPanel = document.getElementById('admin-panel');
            const mainContent = document.querySelector('.main-content');

            if (adminPanel.style.display === 'none') {
                if (!isOwnerAuthenticated) {
                    openOwnerLogin();
                    return;
                }
                adminPanel.style.display = 'flex';
                mainContent.style.display = 'none';
                document.getElementById('admin-toggle-btn').textContent = 'Exit Admin';
                showAdminSection('dashboard');
            } else {
                exitAdminPanel();
            }
        }

        function openOwnerLogin() {
            const modal = document.getElementById('owner-login-modal');
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            document.getElementById('owner-username').focus();
        }

        function closeOwnerLogin() {
            const modal = document.getElementById('owner-login-modal');
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.getElementById('owner-login-form').reset();
            document.getElementById('owner-login-error').style.display = 'none';
        }

        function submitOwnerLogin(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const username = String(formData.get('username') || '').trim();
            const password = String(formData.get('password') || '');

            if (username !== OWNER_USERNAME || password !== ownerPassword) {
                document.getElementById('owner-login-error').style.display = 'block';
                document.getElementById('owner-password').value = '';
                document.getElementById('owner-password').focus();
                return;
            }

            isOwnerAuthenticated = true;
            closeOwnerLogin();
            toggleAdminPanel();
        }

        function changeOwnerPassword(event) {
            event.preventDefault();
            if (!isOwnerAuthenticated) {
                showToast('Admin sign-in is required to change the password.', 'error');
                return;
            }

            const formData = new FormData(event.target);
            const currentPassword = String(formData.get('currentPassword') || '');
            const newPassword = String(formData.get('newPassword') || '');
            const confirmPassword = String(formData.get('confirmPassword') || '');

            if (currentPassword !== ownerPassword) {
                showToast('Current password is incorrect.', 'error');
                return;
            }
            if (newPassword.length < 8) {
                showToast('New password must be at least 8 characters.', 'error');
                return;
            }
            if (newPassword !== confirmPassword) {
                showToast('New password and confirmation do not match.', 'error');
                return;
            }

            try {
                localStorage.setItem(OWNER_PASSWORD_KEY, newPassword);
                ownerPassword = newPassword;
                event.target.reset();
                showToast('Admin password changed successfully.', 'success');
            } catch (error) {
                showToast('Could not save the new password. Please try again.', 'error');
            }
        }

        function exitAdminPanel() {
            isOwnerAuthenticated = false;
            document.getElementById('admin-panel').style.display = 'none';
            document.querySelector('.main-content').style.display = 'block';
            document.getElementById('admin-toggle-btn').textContent = 'Owner Workspace';
            navigateTo('home');
        }

        function showAdminSection(section) {
            document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
            document.querySelectorAll('.admin-menu-btn').forEach(b => b.classList.remove('active'));
            
            document.getElementById(`admin-${section}`).style.display = 'block';
            document.querySelector(`[data-section="${section}"]`).classList.add('active');
            
            if (section === 'dashboard') {
                setTimeout(() => {
                    if (analyticsChart) analyticsChart.resize();
                }, 100);
            }
        }

        // FORM SUBMISSIONS
        async function submitArchitectureRequest(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                type: 'architecture',
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                plot_size: formData.get('plot_size'),
                location: formData.get('location'),
                project_type: formData.get('project_type'),
                description: formData.get('description'),
                status: 'pending',
                date: new Date().toISOString()
            };

            const result = await window.dataSdk.create(data);
            if (result.isOk) {
                showToast('Architecture request submitted successfully!', 'success');
                e.target.reset();
                navigateTo('home');
            } else {
                showToast('Failed to submit request', 'error');
            }
        }

        async function submitAstrologyConsultation(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                type: 'astrology',
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                dob: formData.get('dob'),
                tob: formData.get('tob'),
                pob: formData.get('pob'),
                service: formData.get('service'),
                description: formData.get('description'),
                status: 'pending',
                date: new Date().toISOString()
            };

            const result = await window.dataSdk.create(data);
            if (result.isOk) {
                showToast('Astrology consultation booked successfully!', 'success');
                e.target.reset();
                navigateTo('home');
            } else {
                showToast('Failed to book consultation', 'error');
            }
        }

        async function submitAppointment(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                type: 'appointment',
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                service: formData.get('service'),
                appointment_date: formData.get('appointment_date'),
                appointment_time: formData.get('appointment_time'),
                description: formData.get('description'),
                status: 'pending',
                date: new Date().toISOString()
            };

            const result = await window.dataSdk.create(data);
            if (result.isOk) {
                showToast('Appointment booked successfully!', 'success');
                e.target.reset();
                navigateTo('home');
            } else {
                showToast('Failed to book appointment', 'error');
            }
        }

        async function submitContactForm(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                type: 'contact',
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                title: formData.get('title'),
                message: formData.get('message'),
                status: 'new',
                date: new Date().toISOString()
            };

            const result = await window.dataSdk.create(data);
            if (result.isOk) {
                showToast('Message sent successfully!', 'success');
                e.target.reset();
                navigateTo('home');
            } else {
                showToast('Failed to send message', 'error');
            }
        }

        async function submitPaymentRequest(e) {
            e.preventDefault();
            const submitButton = e.target.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;
            const formData = new FormData(e.target);
            const data = {
                type: 'payment',
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                amount: formData.get('amount'),
                purpose: formData.get('purpose'),
                message: formData.get('message'),
                status: 'pending',
                date: new Date().toISOString()
            };

            try {
                const result = await window.dataSdk.create(data);
                if (result.isOk) {
                    showToast('Payment request submitted!', 'success');
                    e.target.reset();
                    navigateTo('home');
                } else {
                    showToast('Could not submit payment request.', 'error');
                }
            } catch (error) {
                showToast('Could not submit payment request. Please try again.', 'error');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        }

        // TABLE UPDATES
        function updatePaymentsTable() {
            const tbody = document.getElementById('payments-table-body');
            const payments = allData.payments;

            if (payments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-muted" style="text-align: center; padding: 2rem;">No payment requests yet</td></tr>';
                return;
            }

            tbody.innerHTML = payments.map(payment => `
                <tr>
                    <td>${payment.name}<br><small>${payment.phone}</small></td>
                    <td>₹${payment.amount}</td>
                    <td>${payment.purpose}</td>
                    <td><span class="status-badge status-${payment.status}">${payment.status}</span></td>
                    <td>${new Date(payment.date).toLocaleDateString()}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-sm btn-approve" onclick="updatePaymentStatus('${payment.__backendId}', 'approved')">Approve</button>
                            <button class="btn-sm btn-delete" onclick="deletePayment('${payment.__backendId}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        /*
         * Payment requests are stored separately from service requests so
         * client status lookup continues to show only service progress.
         */
        async function deletePayment(id) {
            const record = allData.payments.find(payment => payment.__backendId === id);
            if (record) {
                const result = await window.dataSdk.delete(record);
                if (result.isOk) showToast('Payment request deleted', 'success');
            }
        }

        async function updatePaymentStatus(id, newStatus) {
            const record = allData.payments.find(payment => payment.__backendId === id);
            if (record) {
                const result = await window.dataSdk.update({ ...record, status: newStatus });
                if (result.isOk) showToast(`Payment marked ${newStatus}`, 'success');
            }
        }

        function updateClientsTable() {
            const tbody = document.getElementById('clients-table-body');
            const clients = allData.clients;
            
            if (clients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-muted" style="text-align: center; padding: 2rem;">No clients yet</td></tr>';
                return;
            }

            tbody.innerHTML = clients.map(client => `
                <tr>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td>${client.phone}</td>
                    <td>${client.type}</td>
                    <td>${new Date(client.date).toLocaleDateString()}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-sm btn-delete" onclick="deleteClient('${client.__backendId}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function updateArchitectureTable() {
            const tbody = document.getElementById('architecture-table-body');
            const requests = allData.architectureRequests;
            
            if (requests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-muted" style="text-align: center; padding: 2rem;">No architecture requests yet</td></tr>';
                return;
            }

            tbody.innerHTML = requests.map(req => `
                <tr>
                    <td>${req.name}</td>
                    <td>${req.email}</td>
                    <td>${req.phone}</td>
                    <td>${req.location}</td>
                    <td>${req.project_type}</td>
                    <td><span class="status-badge status-${req.status}">${req.status}</span></td>
                    <td>${new Date(req.date).toLocaleDateString()}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-sm btn-approve" onclick="updateRequestStatus('${req.__backendId}', 'approved')">Approve</button>
                            <button class="btn-sm btn-delete" onclick="deleteRequest('${req.__backendId}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function updateAstrologyTable() {
            const tbody = document.getElementById('astrology-table-body');
            const consultations = allData.astrologyConsultations;
            
            if (consultations.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-muted" style="text-align: center; padding: 2rem;">No astrology consultations yet</td></tr>';
                return;
            }

            tbody.innerHTML = consultations.map(con => `
                <tr>
                    <td>${con.name}</td>
                    <td>${con.email}</td>
                    <td>${con.phone}</td>
                    <td>${con.service}</td>
                    <td>${con.dob}</td>
                    <td><span class="status-badge status-${con.status}">${con.status}</span></td>
                    <td>${new Date(con.date).toLocaleDateString()}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-sm btn-approve" onclick="updateRequestStatus('${con.__backendId}', 'completed')">Complete</button>
                            <button class="btn-sm btn-delete" onclick="deleteRequest('${con.__backendId}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function updateAppointmentsTable() {
            const tbody = document.getElementById('appointments-table-body');
            const appointments = allData.appointments;
            
            if (appointments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-muted" style="text-align: center; padding: 2rem;">No appointments yet</td></tr>';
                return;
            }

            tbody.innerHTML = appointments.map(apt => `
                <tr>
                    <td>${apt.name}</td>
                    <td>${apt.email}</td>
                    <td>${apt.phone}</td>
                    <td>${apt.service}</td>
                    <td>${apt.appointment_date}</td>
                    <td>${apt.appointment_time}</td>
                    <td><span class="status-badge status-${apt.status}">${apt.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-sm btn-approve" onclick="updateRequestStatus('${apt.__backendId}', 'approved')">Approve</button>
                            <button class="btn-sm btn-delete" onclick="deleteRequest('${apt.__backendId}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function updateDashboardStats() {
            document.getElementById('stat-clients').textContent = allData.clients.length;
            document.getElementById('stat-architecture').textContent = allData.architectureRequests.length;
            document.getElementById('stat-astrology').textContent = allData.astrologyConsultations.length;
            document.getElementById('stat-appointments').textContent = allData.appointments.length;
        }

        function updateAnalyticsChart() {
            const ctx = document.getElementById('analyticsChart');
            if (!ctx) return;

            const chartData = {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: 'Architecture Requests',
                        data: [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), allData.architectureRequests.length],
                        borderColor: '#d4af37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Astrology Consultations',
                        data: [Math.floor(Math.random() * 8), Math.floor(Math.random() * 8), Math.floor(Math.random() * 8), allData.astrologyConsultations.length],
                        borderColor: '#001f3f',
                        backgroundColor: 'rgba(0, 31, 63, 0.1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Appointments',
                        data: [Math.floor(Math.random() * 12), Math.floor(Math.random() * 12), Math.floor(Math.random() * 12), allData.appointments.length],
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        borderWidth: 2
                    }
                ]
            };

            if (analyticsChart) {
                analyticsChart.data = chartData;
                analyticsChart.update();
            } else {
                analyticsChart = new Chart(ctx, {
                    type: 'line',
                    data: chartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: { color: '#333' }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { color: '#666' },
                                grid: { color: '#eee' }
                            },
                            x: {
                                ticks: { color: '#666' },
                                grid: { color: '#eee' }
                            }
                        }
                    }
                });
            }
        }

        // DELETE OPERATIONS
        async function deleteRequest(id) {
            const record = [...allData.architectureRequests, ...allData.astrologyConsultations, ...allData.appointments].find(r => r.__backendId === id);
            if (record) {
                const result = await window.dataSdk.delete(record);
                if (result.isOk) {
                    showToast('Request deleted successfully', 'success');
                }
            }
        }

        async function deleteClient(id) {
            const record = allData.clients.find(c => c.__backendId === id);
            if (record) {
                const result = await window.dataSdk.delete(record);
                if (result.isOk) {
                    showToast('Client deleted', 'success');
                }
            }
        }

        // UPDATE STATUS
        async function updateRequestStatus(id, newStatus) {
            const allRequests = [...allData.architectureRequests, ...allData.astrologyConsultations, ...allData.appointments];
            const record = allRequests.find(r => r.__backendId === id);
            if (record) {
                const updated = { ...record, status: newStatus };
                const result = await window.dataSdk.update(updated);
                if (result.isOk) {
                    showToast(`Status updated to ${newStatus}`, 'success');
                }
            }
        }

        // TOAST NOTIFICATIONS
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = message;
            container.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // WHATSAPP
        function openWhatsApp() {
            const phone = config.whatsapp_number;
            const message = 'Hello, I would like to inquire about your services.';
            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }

        // Initialize UI
        updateUIWithConfig();
        loadOwnerProfile();