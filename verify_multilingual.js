const API_URL = 'http://127.0.0.1:5000/api';
// Credentials from .env and seedData
const ADMIN_EMAIL = 'admin@cortexsupport.com';
const ADMIN_PASSWORD = 'Admin@123';
const USER_EMAIL = 'john@example.com';
const PASSWORD = 'password123';

const apiRequest = async (url, method, body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log(`📡 API Request: ${method} ${url}`);
    if (token) console.log(`   Token (First 10): ${token.substring(0, 10)}...`);

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    if (!response.ok) {
        return { error: true, message: data.message || 'API Error', status: response.status, raw: data };
    }
    return data;
};

const runTest = async () => {
    try {
        console.log('🔄 Starting Multilingual Verification...');

        // 1. Login as User (or Register if needed)
        console.log('👤 Logging in as User...');
        let userRes = await apiRequest(`${API_URL}/auth/login`, 'POST', { email: USER_EMAIL, password: PASSWORD });

        let userToken;
        if (userRes.error) {
            console.log('⚠️  Login failed, attempting to register new user...');
            const regRes = await apiRequest(`${API_URL}/auth/register`, 'POST', {
                name: 'Verification User',
                email: `verify_${Date.now()}@example.com`,
                password: PASSWORD
            });

            if (regRes.error) {
                console.error('❌ Registration Failed:', regRes);
                throw new Error(`Registration failed: ${regRes.message}`);
            }
            userToken = regRes.data.token;
            console.log('✅ New User Registered and Logged in.');
        } else {
            userToken = userRes.data ? userRes.data.token : undefined;
            if (!userToken) {
                console.error('❌ Token not found in login response!', userRes);
                throw new Error('No user token');
            } else {
                console.log('✅ User logged in.');
            }
        }

        // 1.5 Sanity Check: Get User Profile
        console.log('🔍 Verifying User Token with /auth/me...');
        const meRes = await apiRequest(`${API_URL}/auth/me`, 'GET', null, userToken);
        if (meRes.error) {
            console.error('❌ Token Verification Failed:', meRes);
            throw new Error(`Token invalid: ${meRes.message}`);
        }
        console.log('✅ Token Verified. User ID:', meRes.data._id);

        // 2. Create Spanish Ticket
        console.log('🇪🇸 Creating Ticket in Spanish: "No puedo acceder a mi cuenta"');
        const ticketRes = await apiRequest(`${API_URL}/tickets`, 'POST', {
            title: 'No puedo acceder a mi cuenta',
            description: 'Hola, intenté restablecer mi contraseña pero no recibí el correo.',
            priority: 'High'
        }, userToken);

        if (ticketRes.error) throw new Error(`Ticket Creation Failed: ${ticketRes.message}`);

        const ticketId = ticketRes.data._id;
        console.log(`✅ Ticket Created (ID: ${ticketId})`);

        // 3. Login as Admin
        console.log('👮 Logging in as Admin...');
        const adminRes = await apiRequest(`${API_URL}/auth/login`, 'POST', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

        if (adminRes.error) throw new Error(`Admin Login Failed: ${adminRes.message}`);
        const adminToken = adminRes.data ? adminRes.data.token : undefined;

        if (!adminToken) throw new Error('Cannot proceed without Admin Token');

        // 4. Admin Replies in English
        console.log('🇬🇧 Admin replying in English: "Please check your spam folder."');
        const replyRes = await apiRequest(`${API_URL}/tickets/${ticketId}/comments`, 'POST', {
            text: 'Please check your spam folder.',
            isInternal: false
        }, adminToken);

        if (replyRes.error) throw new Error(`Reply Failed: ${replyRes.message}`);
        console.log('✅ Admin Reply Posted.');

        // 5. User Fetches Ticket to see Translation
        console.log('👤 User fetching ticket to verify translation...');
        const updatedTicketRes = await apiRequest(`${API_URL}/tickets/${ticketId}`, 'GET', null, userToken);

        if (updatedTicketRes.error) throw new Error(`Fetch Failed: ${updatedTicketRes.message}`);

        const reply = updatedTicketRes.data.comments[0];
        console.log(`   Original Text (En): "${reply.text}"`);
        console.log(`   Translated Text (Es): "${reply.translatedText}"`);

        if (reply.translatedText && reply.translatedText !== reply.text) {
            console.log('\n✅ VERIFICATION COMPLETE: ALL CHECKS PASSED');
        } else {
            console.log('\n⚠️ VERIFICATION PARTIAL: Translation might be missing or identical.');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
    }
};

runTest();
