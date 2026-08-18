const encerrado = true;

        const supabaseUrl = 'https://gaejvymnzwvhwkehopoi.supabase.co';
        const supabaseKey = 'sb_publishable_hx5Squj4TZDF8P8TaXp7uw_etpAVIGc';
        const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

        const closedMessage = document.getElementById('closed-message');
        const formWrapper = document.getElementById('form-wrapper');

        if (encerrado === true || encerrado === 1) {
            closedMessage.classList.remove('hidden');
            formWrapper.classList.add('hidden');
        } else {
            closedMessage.classList.add('hidden');
            formWrapper.classList.remove('hidden');
        }
        window.addEventListener('load', () => {
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
                    const ipField = document.getElementById('ip-address');
                    if (ipField) {
                        ipField.value = data.ip;
                    }
                })
                .catch(error => {
                    console.error('Não foi possível obter o endereço IP:', error);
                    const ipField = document.getElementById('ip-address');
                    if (ipField) {
                        ipField.value = 'IP não disponível';
                    }
                });
        });

        const form = document.getElementById('party-form');
        const submitButton = document.getElementById('submit-button');
        const formContainer = document.getElementById('form-container');
        const confirmationMessage = document.getElementById('confirmation-message');
        const errorMessage = document.getElementById('error-message');
        const privacyCheckbox = document.getElementById('privacidade-box');

        submitButton.disabled = true;

        privacyCheckbox.addEventListener('change', function () {
            submitButton.disabled = !this.checked;
        });

        form.addEventListener('submit', async function (event) {
            event.preventDefault(); 

            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const formspreeEndpoint = 'https://formspree.io/f/xovlwjql';

            try {
                const response = await fetch(formspreeEndpoint, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                const { error: supabaseError } = await supabaseClient
                    .from('candidaturas_representante')
                    .insert([
                        {
                            nome_candidato: data['Nome do Candidato'],
                            nick_ingame: data['Nick'],
                            discord_id: data['Discord'],
                            endereco_ip: data['Endereço IP']
                        }
                    ]);

                if (response.ok && !supabaseError) {
                    formContainer.classList.add('hidden');
                    confirmationMessage.classList.remove('hidden');
                    errorMessage.classList.add('hidden');
                } else {
                    if (supabaseError) console.error('Erro no Supabase:', supabaseError);
                    throw new Error('Falha no envio para o servidor ou banco de dados.');
                }
            } catch (error) {
                console.error('Erro ao enviar o formulário:', error);
                formContainer.classList.add('hidden');
                errorMessage.classList.remove('hidden');
                submitButton.textContent = 'Candidatar-se a Representante';
                submitButton.disabled = false;
            }
        });

        async function checkAuthStatus() {
            const { data: { session } } = await supabaseClient.auth.getSession();
            const btnLogin = document.getElementById('btn-login-nav');
            const userInfo = document.getElementById('user-info-nav');
            const nameDisplay = document.getElementById('user-name-display');

            if (session) {
                btnLogin.classList.add('hidden');
                userInfo.classList.remove('hidden');
                const userName = session.user.user_metadata?.name || 'Administrador';
                nameDisplay.textContent = `Olá, ${userName}`;
            } else {
                btnLogin.classList.remove('hidden');
                userInfo.classList.add('hidden');
            }
        }

        document.getElementById('btn-logout')?.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            window.location.reload();
        });

        checkAuthStatus();
