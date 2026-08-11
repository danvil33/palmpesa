<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bet · Live Feed</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0b0e11;
            color: #eaecef;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 16px;
            padding-top: 30px;
        }

        .app-container {
            width: 100%;
            max-width: 820px;
            background: #1e2329;
            border-radius: 24px;
            border: 1px solid #2b3139;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
            overflow: hidden;
        }

        /* ===== HEADER ===== */
        .app-header {
            padding: 18px 24px;
            background: #181a20;
            border-bottom: 1px solid #2b3139;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
        }

        .app-brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .app-brand .logo-icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #f0b90b, #f8d33a);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #181a20;
            font-weight: 700;
        }

        .app-brand h1 {
            font-size: 20px;
            font-weight: 700;
            color: #f0b90b;
        }

        .app-brand h1 span {
            color: #eaecef;
            font-weight: 400;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .user-profile {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #2b3139;
            padding: 4px 14px 4px 8px;
            border-radius: 40px;
            font-size: 12px;
            font-weight: 500;
            color: #eaecef;
            cursor: default;
        }

        .user-profile .avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #f0b90b;
            color: #181a20;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
        }

        .btn {
            border: none;
            padding: 7px 18px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 12px;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #2b3139;
            color: #eaecef;
        }

        .btn:hover {
            background: #3b424b;
            transform: translateY(-1px);
        }

        .btn-primary {
            background: #f0b90b;
            color: #181a20;
        }

        .btn-primary:hover {
            background: #f8d33a;
            box-shadow: 0 4px 16px rgba(240, 185, 11, 0.3);
        }

        .btn-danger {
            background: #f6465d;
            color: white;
        }

        .btn-danger:hover {
            background: #ff6b7f;
        }

        .hidden {
            display: none !important;
        }

        /* ===== MAIN CONTENT ===== */
        .main-content {
            padding: 20px 24px 18px;
        }

        /* ===== STATUS BAR ===== */
        .status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 14px;
            background: #181a20;
            border-radius: 10px;
            margin-bottom: 16px;
            font-size: 12px;
            color: #848e9c;
            border: 1px solid #2b3139;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 6px;
        }

        .status-dot.online {
            background: #0ecb81;
            box-shadow: 0 0 12px rgba(14, 203, 129, 0.4);
        }
        .status-dot.offline {
            background: #f6465d;
        }
        .status-dot.connecting {
            background: #f0b90b;
            animation: pulse 1.2s infinite;
        }

        @keyframes pulse {
            0%,
            100% {
                opacity: 1;
            }
            50% {
                opacity: 0.4;
            }
        }

        .badge-count {
            background: #2b3139;
            padding: 2px 10px;
            border-radius: 40px;
            font-size: 11px;
            font-weight: 600;
            color: #eaecef;
        }

        /* ===== AUTH PAGE ===== */
        .auth-page {
            padding: 40px 30px;
            background: #181a20;
            border-radius: 16px;
            border: 1px solid #2b3139;
            margin-bottom: 12px;
            max-width: 420px;
            margin-left: auto;
            margin-right: auto;
        }

        .auth-page .auth-header {
            text-align: center;
            margin-bottom: 28px;
        }

        .auth-page .auth-header .lock-icon {
            font-size: 48px;
            color: #f0b90b;
            margin-bottom: 12px;
            display: block;
        }

        .auth-page .auth-header h3 {
            font-weight: 600;
            font-size: 22px;
            color: #eaecef;
            margin-bottom: 4px;
        }

        .auth-page .auth-header p {
            color: #848e9c;
            font-size: 14px;
        }

        .auth-page .form-group {
            margin-bottom: 16px;
        }

        .auth-page .form-group label {
            display: block;
            font-size: 12px;
            font-weight: 500;
            color: #848e9c;
            margin-bottom: 4px;
        }

        .auth-page .form-group input {
            width: 100%;
            padding: 10px 14px;
            background: #0b0e11;
            border: 1px solid #2b3139;
            border-radius: 10px;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            color: #eaecef;
            transition: border 0.2s;
            outline: none;
        }

        .auth-page .form-group input:focus {
            border-color: #f0b90b;
            box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
        }

        .auth-page .role-badge {
            background: #2b3139;
            padding: 8px 14px;
            border-radius: 10px;
            font-size: 13px;
            color: #eaecef;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            border: 1px solid #3b424b;
        }

        .auth-page .role-badge i {
            color: #f0b90b;
        }

        .auth-page .role-badge strong {
            color: #f0b90b;
        }

        .auth-page .btn {
            width: 100%;
            justify-content: center;
            padding: 10px;
            font-size: 14px;
        }

        .auth-page .auth-toggle {
            text-align: center;
            margin-top: 14px;
            font-size: 13px;
            color: #848e9c;
        }

        .auth-page .auth-toggle a {
            color: #f0b90b;
            cursor: pointer;
            font-weight: 600;
            text-decoration: none;
        }

        .auth-page .auth-toggle a:hover {
            text-decoration: underline;
        }

        .auth-page .auth-error {
            color: #f6465d;
            font-size: 13px;
            padding: 8px 12px;
            background: rgba(246, 70, 93, 0.1);
            border-radius: 8px;
            border-left: 3px solid #f6465d;
            margin-bottom: 12px;
        }

        .auth-page .auth-error.hidden {
            display: none;
        }

        /* ===== FEED ===== */
        .feed-container {
            background: #181a20;
            border-radius: 16px;
            border: 1px solid #2b3139;
            min-height: 340px;
            max-height: 460px;
            overflow-y: auto;
            padding: 8px 0;
        }

        .feed-container::-webkit-scrollbar {
            width: 4px;
        }

        .feed-container::-webkit-scrollbar-thumb {
            background: #2b3139;
            border-radius: 8px;
        }

        .empty-feed {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 50px 20px;
            color: #848e9c;
        }

        .empty-feed i {
            font-size: 42px;
            color: #2b3139;
            margin-bottom: 12px;
        }

        .empty-feed h3 {
            font-weight: 500;
            margin-bottom: 4px;
            color: #eaecef;
        }

        .empty-feed p {
            font-size: 13px;
        }

        /* ===== MESSAGE ITEM ===== */
        .message-item {
            padding: 14px 18px;
            border-bottom: 1px solid #2b3139;
            transition: background 0.15s;
            animation: slideIn 0.25s ease;
        }

        .message-item:hover {
            background: #1e2329;
        }

        .message-item:last-child {
            border-bottom: none;
        }

        .message-item .msg-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            font-size: 12px;
            color: #848e9c;
        }

        .message-item .msg-header .sender {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 600;
            color: #f0b90b;
        }

        .message-item .msg-header .time {
            font-size: 11px;
            background: #2b3139;
            padding: 2px 10px;
            border-radius: 40px;
        }

        .message-item .msg-body {
            font-size: 14px;
            line-height: 1.6;
            color: #eaecef;
            word-break: break-word;
        }

        .message-item .msg-body i {
            color: #f0b90b;
            margin-right: 6px;
            font-size: 13px;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-6px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* ===== TOAST ===== */
        .toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #1e2329;
            border: 1px solid #2b3139;
            color: #eaecef;
            padding: 12px 24px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            z-index: 2000;
            animation: toastUp 0.35s ease;
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .toast i {
            font-size: 16px;
        }

        .toast.success i {
            color: #0ecb81;
        }
        .toast.error i {
            color: #f6465d;
        }
        .toast.info i {
            color: #f0b90b;
        }

        @keyframes toastUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 640px) {
            .app-header {
                padding: 14px 16px;
                flex-direction: column;
                align-items: stretch;
                gap: 8px;
            }

            .header-actions {
                justify-content: space-between;
            }

            .main-content {
                padding: 14px 16px 14px;
            }

            .auth-page {
                padding: 28px 18px;
            }

            .message-item {
                padding: 12px 14px;
            }

            .message-item .msg-body {
                font-size: 13px;
            }
        }
    </style>
</head>
<body>

    <div class="app-container" id="app">
        <!-- HEADER -->
        <header class="app-header">
            <div class="app-brand">
                <div class="logo-icon">B</div>
                <h1>Bet<span>Live</span></h1>
            </div>
            <div class="header-actions">
                <div class="user-profile" id="userBadge">
                    <div class="avatar" id="userAvatar">G</div>
                    <span id="userNameDisplay">Guest</span>
                </div>
                <button class="btn btn-danger hidden" id="signOutBtn">
                    <i class="fa-regular fa-arrow-right-from-bracket"></i> Sign Out
                </button>
            </div>
        </header>

        <!-- MAIN -->
        <div class="main-content">
            <!-- Status Bar -->
            <div class="status-bar">
                <div>
                    <span class="status-dot" id="statusDot"></span>
                    <span id="statusText">Ready</span>
                </div>
                <div>
                    <span class="badge-count"><i class="fa-regular fa-message"></i> <span id="messageCount">0</span></span>
                </div>
            </div>

            <!-- ===== AUTH PAGE ===== -->
            <div id="authPage" class="auth-page">
                <div class="auth-header">
                    <i class="fa-regular fa-lock lock-icon"></i>
                    <h3 id="authTitle">Bettor Access</h3>
                    <p id="authSubtitle">Sign in to view live bets</p>
                </div>

                <div class="auth-error hidden" id="authError"></div>

                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="authEmail" placeholder="Enter your email" />
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="authPassword" placeholder="Enter your password" />
                </div>

                <div class="role-badge">
                    <i class="fa-regular fa-user"></i>
                    <span>You are registering as a <strong>Bettor</strong></span>
                </div>

                <button class="btn btn-primary" id="authSubmitBtn">
                    <i class="fa-regular fa-arrow-right-to-bracket"></i> Sign In
                </button>

                <div class="auth-toggle">
                    <span id="authToggleText">Don't have an account?</span>
                    <a id="authToggleLink">Create one</a>
                </div>
            </div>

            <!-- ===== FEED CONTENT ===== -->
            <div id="betContent" class="hidden">
                <div id="feedContainer" class="feed-container"></div>
            </div>
        </div>
    </div>

    <script>
        // ============================================================
        // FIREBASE CONFIG
        // ============================================================
        const firebaseConfig = {
            apiKey: "AIzaSyBEjeRSyKbpEmbNk0SYLUFPp3lbgP9x3Ow",
            authDomain: "volcanobxpl.firebaseapp.com",
            projectId: "volcanobxpl",
            storageBucket: "volcanobxpl.firebasestorage.app",
            messagingSenderId: "742861205377",
            appId: "1:742861205377:web:bbe8a42b78c90354a64280",
            measurementId: "G-G1KWGHLZES"
        };

        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();

        // ============================================================
        // STATE
        // ============================================================
        let currentUser = null;
        let isSignUp = false;
        let unsubscribe = null;

        // DOM refs
        const $ = id => document.getElementById(id);
        const authPage = $('authPage');
        const authEmail = $('authEmail');
        const authPassword = $('authPassword');
        const authSubmitBtn = $('authSubmitBtn');
        const authToggleLink = $('authToggleLink');
        const authToggleText = $('authToggleText');
        const authTitle = $('authTitle');
        const authSubtitle = $('authSubtitle');
        const authError = $('authError');
        const betContent = $('betContent');
        const signOutBtn = $('signOutBtn');
        const userAvatar = $('userAvatar');
        const userNameDisplay = $('userNameDisplay');
        const feedEl = $('feedContainer');
        const statusDot = $('statusDot');
        const statusText = $('statusText');
        const messageCountSpan = $('messageCount');

        const messagesRef = db.collection('messages');

        // ============================================================
        // AUTH FUNCTIONS
        // ============================================================
        function toggleAuthMode(signUp = false) {
            isSignUp = signUp;
            authError.classList.add('hidden');
            authError.textContent = '';
            authEmail.value = '';
            authPassword.value = '';

            if (signUp) {
                authTitle.textContent = 'Create Bettor Account';
                authSubtitle.textContent = 'Register to view live bets';
                authSubmitBtn.innerHTML = '<i class="fa-regular fa-user-plus"></i> Register as Bettor';
                authToggleText.textContent = 'Already have an account?';
                authToggleLink.textContent = 'Sign In';
            } else {
                authTitle.textContent = 'Bettor Sign In';
                authSubtitle.textContent = 'Sign in to view live bets';
                authSubmitBtn.innerHTML = '<i class="fa-regular fa-arrow-right-to-bracket"></i> Sign In';
                authToggleText.textContent = "Don't have an account?";
                authToggleLink.textContent = 'Create one';
            }
            setTimeout(() => authEmail.focus(), 100);
        }

        function showAuthError(msg) {
            authError.textContent = msg;
            authError.classList.remove('hidden');
        }

        function handleAuthSubmit() {
            const email = authEmail.value.trim();
            const pass = authPassword.value.trim();

            if (!email || !pass) {
                showAuthError('Please fill in all fields');
                return;
            }
            if (pass.length < 6) {
                showAuthError('Password must be at least 6 characters');
                return;
            }

            authError.classList.add('hidden');
            authSubmitBtn.disabled = true;
            authSubmitBtn.innerHTML = '<i class="fa-regular fa-spinner fa-spin"></i> Processing…';

            if (isSignUp) {
                auth.createUserWithEmailAndPassword(email, pass)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        return db.collection('users').doc(user.uid).set({
                            email: user.email,
                            role: 'bettor',
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        }).then(() => {
                            showToast('✅ Registered as Bettor!', 'success');
                        });
                    })
                    .catch((err) => {
                        console.error("Signup error:", err);
                        showAuthError(err.message);
                        authSubmitBtn.disabled = false;
                        authSubmitBtn.innerHTML = isSignUp ?
                            '<i class="fa-regular fa-user-plus"></i> Register as Bettor' :
                            '<i class="fa-regular fa-arrow-right-to-bracket"></i> Sign In';
                    });
            } else {
                auth.signInWithEmailAndPassword(email, pass)
                    .then(() => {
                        showToast('✅ Signed in successfully!', 'success');
                    })
                    .catch((err) => {
                        console.error("Login error:", err);
                        showAuthError(err.message);
                        authSubmitBtn.disabled = false;
                        authSubmitBtn.innerHTML = isSignUp ?
                            '<i class="fa-regular fa-user-plus"></i> Register as Bettor' :
                            '<i class="fa-regular fa-arrow-right-to-bracket"></i> Sign In';
                    });
            }
        }

        function signOut() {
            auth.signOut().then(() => {
                showToast('👋 Signed out', 'info');
            });
        }

        // ============================================================
        // USER UI UPDATE
        // ============================================================
        function updateUI(user) {
            if (user) {
                currentUser = user;
                const displayName = user.email || 'Bettor';
                const initial = displayName.charAt(0).toUpperCase();
                userAvatar.textContent = initial;
                userNameDisplay.textContent = displayName;
                signOutBtn.classList.remove('hidden');

                db.collection('users').doc(user.uid).get().then((doc) => {
                    if (doc.exists) {
                        const role = doc.data().role || 'bettor';
                        if (role === 'bettor') {
                            authPage.classList.add('hidden');
                            betContent.classList.remove('hidden');
                            startListening();
                        } else {
                            authPage.classList.remove('hidden');
                            betContent.classList.add('hidden');
                            toggleAuthMode(false);
                            showAuthError('Access Denied: This account is an admin. Please use admin.html.');
                            if (unsubscribe) { unsubscribe();
                                unsubscribe = null; }
                            updateStatus('offline', 'Admin Mode');
                            feedEl.innerHTML =
                            `<div class="empty-feed" style="color:#f0b90b;"><i class="fa-regular fa-user-gear"></i><h3>Admin Detected</h3><p>Please use the admin panel</p></div>`;
                        }
                    } else {
                        authPage.classList.add('hidden');
                        betContent.classList.remove('hidden');
                        startListening();
                    }
                });
            } else {
                currentUser = null;
                userAvatar.textContent = 'G';
                userNameDisplay.textContent = 'Guest';
                signOutBtn.classList.add('hidden');
                authPage.classList.remove('hidden');
                betContent.classList.add('hidden');
                toggleAuthMode(false);
                if (unsubscribe) { unsubscribe();
                    unsubscribe = null; }
                feedEl.innerHTML = '';
                messageCountSpan.textContent = '0';
                updateStatus('offline', 'Not signed in');
            }
        }

        // ============================================================
        // STATUS HELPER
        // ============================================================
        function updateStatus(state, text) {
            statusDot.className = 'status-dot';
            if (state === 'online') {
                statusDot.classList.add('online');
                statusText.textContent = text || 'Live';
            } else if (state === 'offline') {
                statusDot.classList.add('offline');
                statusText.textContent = text || 'Offline';
            } else {
                statusDot.classList.add('connecting');
                statusText.textContent = text || 'Connecting…';
            }
        }

        // ============================================================
        // FIRESTORE LISTENER
        // ============================================================
        function startListening() {
            if (unsubscribe) unsubscribe();
            updateStatus('connecting', 'Connecting…');

            unsubscribe = messagesRef.orderBy('timestamp', 'desc').onSnapshot((snapshot) => {
                updateStatus('online', 'Live');
                messageCountSpan.textContent = snapshot.size;

                if (snapshot.empty) {
                    feedEl.innerHTML = `
                        <div class="empty-feed">
                            <i class="fa-regular fa-comment-dots"></i>
                            <h3>No messages yet</h3>
                            <p>Admin will post updates here</p>
                        </div>
                    `;
                    return;
                }

                let html = '';
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const text = data.text || '⚠️ empty message';
                    const time = data.timestamp ? new Date(data.timestamp.seconds * 1000) : new Date();
                    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });

                    html += `
                        <div class="message-item">
                            <div class="msg-header">
                                <span class="sender"><i class="fa-regular fa-user"></i> Admin</span>
                                <span class="time">${dateStr} · ${timeStr}</span>
                            </div>
                            <div class="msg-body"><i class="fa-regular fa-message"></i> ${escapeHtml(text)}</div>
                        </div>
                    `;
                });
                feedEl.innerHTML = html;
                feedEl.scrollTop = 0;

            }, (error) => {
                console.error('Firestore listener error:', error);
                updateStatus('offline', 'Connection error');
                feedEl.innerHTML = `
                    <div class="empty-feed" style="color:#f6465d;">
                        <i class="fa-regular fa-triangle-exclamation"></i>
                        <h3 style="color:#f6465d;">Connection Error</h3>
                        <p>${error.message || 'Please check your network'}</p>
                    </div>
                `;
            });
        }

        function escapeHtml(unsafe) {
            if (!unsafe) return '';
            return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g,
                "&#039;");
        }

        // ============================================================
        // TOAST
        // ============================================================
        function showToast(msg, type = 'info') {
            const existing = document.querySelector('.toast');
            if (existing) existing.remove();

            const icons = {
                success: 'fa-regular fa-circle-check',
                error: 'fa-regular fa-circle-xmark',
                info: 'fa-regular fa-circle-info'
            };

            const div = document.createElement('div');
            div.className = `toast ${type}`;
            div.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${msg}`;
            document.body.appendChild(div);

            setTimeout(() => {
                if (div.parentNode) div.remove();
            }, 3500);
        }

        // ============================================================
        // AUTH STATE OBSERVER
        // ============================================================
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('👤 User logged in:', user.email);
                updateUI(user);
            } else {
                console.log('👤 No user');
                updateUI(null);
            }
        });

        // ============================================================
        // EVENT LISTENERS
        // ============================================================
        authSubmitBtn.addEventListener('click', handleAuthSubmit);
        authPassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuthSubmit(); });
        authEmail.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuthSubmit(); });

        authToggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthMode(!isSignUp);
        });

        signOutBtn.addEventListener('click', signOut);

        // ============================================================
        // INIT
        // ============================================================
        toggleAuthMode(false);
        updateStatus('connecting', 'Initializing…');
        console.log('🚀 BetLive · Bettor view ready');
        console.log('📌 Bettors can view messages from admin');
        console.log('📌 Firestore Collection: messages');
    </script>
</body>
</html>
