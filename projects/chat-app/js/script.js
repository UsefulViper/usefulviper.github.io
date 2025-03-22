// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const chatInterface = document.getElementById('chat-interface');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const registerLink = document.getElementById('register-link');
const loginLink = document.getElementById('login-link');
const googleAuthBtn = document.getElementById('google-auth');
const logoutBtn = document.getElementById('logout-btn');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages');
const channelsList = document.getElementById('channels-list');
const dmList = document.getElementById('dm-list');
const currentChannelTitle = document.getElementById('current-channel');
const membersCount = document.getElementById('members-count');
const newChannelBtn = document.getElementById('new-channel-btn');
const newDmBtn = document.getElementById('new-dm-btn');
const channelInfoBtn = document.getElementById('channel-info-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const channelInfoSidebar = document.getElementById('channel-info-sidebar');
const newChannelModal = document.getElementById('new-channel-modal');
const newChannelForm = document.getElementById('new-channel-form');
const closeModalBtns = document.querySelectorAll('.close-modal-btn');
const themeSwitch = document.getElementById('checkbox');
const typingIndicator = document.querySelector('.typing-indicator');
const typingText = document.querySelector('.typing-text');
const attachmentBtn = document.getElementById('attachment-btn');
const emojiBtn = document.getElementById('emoji-btn');
const loadingOverlay = document.querySelector('.loading-overlay');
const notification = document.getElementById('notification');

// Application State
let currentUser = null;
let currentChannel = 'general';
let isTyping = false;
let typingTimeout = null;
let userChannels = [];
let userDMs = [];
let unreadMessages = {};
let channelListeners = {};
let darkMode = localStorage.getItem('darkMode') === 'true';

// Initialize the application
function init() {
    setupTheme();
    setupEventListeners();
    setupAuthStateListener();
    setupMobileResponsiveness();
}

// Setup theme based on user preference
function setupTheme() {
    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeSwitch.checked = false;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Auth forms
    loginForm?.addEventListener('submit', handleLogin);
    registerForm?.addEventListener('submit', handleRegister);
    registerLink?.addEventListener('click', toggleAuthForms);
    loginLink?.addEventListener('click', toggleAuthForms);
    googleAuthBtn?.addEventListener('click', handleGoogleAuth);
    logoutBtn?.addEventListener('click', handleLogout);
    
    // Chat functionality
    messageInput?.addEventListener('keypress', handleTyping);
    messageInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    sendBtn?.addEventListener('click', sendMessage);
    
    // Channel and DM navigation
    channelsList?.addEventListener('click', handleChannelClick);
    dmList?.addEventListener('click', handleDmClick);
    
    // Modals and sidebars
    newChannelBtn?.addEventListener('click', () => toggleModal(newChannelModal, true));
    newDmBtn?.addEventListener('click', handleNewDm);
    channelInfoBtn?.addEventListener('click', () => toggleSidebar(channelInfoSidebar, true));
    closeSidebarBtn?.addEventListener('click', () => toggleSidebar(channelInfoSidebar, false));
    closeModalBtns?.forEach(btn => btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        toggleModal(modal, false);
    }));
    newChannelForm?.addEventListener('submit', handleNewChannel);
    
    // Theme toggle
    themeSwitch?.addEventListener('change', toggleTheme);
    
    // File attachments and emoji
    attachmentBtn?.addEventListener('click', handleAttachment);
    emojiBtn?.addEventListener('click', handleEmoji);
}

// Setup authentication state listener
function setupAuthStateListener() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            currentUser = user;
            updateUserProfile(user);
            showChatInterface();
            loadUserChannels();
            loadUserDMs();
            subscribeToChannel(currentChannel);
        } else {
            // User is signed out
            currentUser = null;
            showAuthScreen();
            unsubscribeFromAllChannels();
        }
    });
}

// Update user profile in the UI
function updateUserProfile(user) {
    if (userName) {
        userName.textContent = user.displayName || 'User';
    }
    
    if (userAvatar) {
        userAvatar.src = user.photoURL || 'https://via.placeholder.com/40';
    }
    
    if (logoutBtn) {
        logoutBtn.classList.remove('hidden');
    }
}

// Show the authentication screen
function showAuthScreen() {
    if (authScreen) authScreen.classList.remove('hidden');
    if (chatInterface) chatInterface.classList.add('hidden');
}

// Show the chat interface
function showChatInterface() {
    if (authScreen) authScreen.classList.add('hidden');
    if (chatInterface) chatInterface.classList.remove('hidden');
}

// Toggle between login and register forms
function toggleAuthForms(e) {
    e.preventDefault();
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm.classList.contains('hidden')) {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showLoading(true);
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            showLoading(false);
            showNotification('Successfully signed in!', 'success');
        })
        .catch(error => {
            showLoading(false);
            showNotification(`Error: ${error.message}`, 'error');
        });
}

// Handle registration form submission
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    showLoading(true);
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            return userCredential.user.updateProfile({
                displayName: name
            });
        })
        .then(() => {
            showLoading(false);
            showNotification('Account created successfully!', 'success');
        })
        .catch(error => {
            showLoading(false);
            showNotification(`Error: ${error.message}`, 'error');
        });
}

// Handle Google authentication
function handleGoogleAuth() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    showLoading(true);
    
    auth.signInWithPopup(provider)
        .then(() => {
            showLoading(false);
            showNotification('Successfully signed in with Google!', 'success');
        })
        .catch(error => {
            showLoading(false);
            showNotification(`Error: ${error.message}`, 'error');
        });
}

// Handle logout
function handleLogout() {
    showLoading(true);
    
    auth.signOut()
        .then(() => {
            showLoading(false);
            showNotification('Successfully signed out', 'info');
        })
        .catch(error => {
            showLoading(false);
            showNotification(`Error: ${error.message}`, 'error');
        });
}

// Load user's channels
function loadUserChannels() {
    db.collection('channels')
        .orderBy('createdAt', 'desc')
        .get()
        .then(snapshot => {
            userChannels = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            renderChannelsList();
        })
        .catch(error => {
            console.error('Error loading channels:', error);
            showNotification('Failed to load channels', 'error');
        });
}

// Render the channels list in the sidebar
function renderChannelsList() {
    if (!channelsList) return;
    
    // Keep the "Add Channel" button
    channelsList.innerHTML = '';
    
    userChannels.forEach(channel => {
        const li = document.createElement('li');
        li.className = `channel ${channel.id === currentChannel ? 'active' : ''}`;
        li.setAttribute('data-channel-id', channel.id);
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = `# ${channel.id}`;
        li.appendChild(nameSpan);
        
        if (unreadMessages[channel.id] && unreadMessages[channel.id] > 0) {
            const badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.textContent = unreadMessages[channel.id];
            li.appendChild(badge);
        }
        
        channelsList.appendChild(li);
    });
}

// Load user's direct messages
function loadUserDMs() {
    // In a real app, you would fetch user's DM connections from Firestore
    // For this demo, we'll just use the static data
}

// Subscribe to a channel to receive messages
function subscribeToChannel(channelId) {
    // Unsubscribe from previous channel
    if (channelListeners[currentChannel]) {
        channelListeners[currentChannel]();
        delete channelListeners[currentChannel];
    }
    
    currentChannel = channelId;
    currentChannelTitle.textContent = `# ${channelId}`;
    
    // Update active channel in UI
    document.querySelectorAll('.channel').forEach(el => {
        if (el.getAttribute('data-channel-id') === channelId) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    
    // Clear unread count for this channel
    if (unreadMessages[channelId]) {
        unreadMessages[channelId] = 0;
        renderChannelsList();
    }
    
    // Clear messages container
    messagesContainer.innerHTML = '';
    
    // Subscribe to channel messages
    const channelRef = db.collection('channels').doc(channelId).collection('messages');
    
    // Load initial messages
    channelRef.orderBy('timestamp', 'asc')
        .limit(50)
        .get()
        .then(snapshot => {
            snapshot.docs.forEach(doc => {
                const message = doc.data();
                renderMessage(message);
            });
            
            // Scroll to bottom
            scrollToBottom();
        });
    
    // Listen for new messages
    const unsubscribe = channelRef.orderBy('timestamp', 'asc')
        .limit(1)
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const message = change.doc.data();
                    
                    // Check if the message is already rendered
                    const messageExists = document.querySelector(`[data-message-id="${change.doc.id}"]`);
                    
                    if (!messageExists) {
                        renderMessage(message);
                        scrollToBottom();
                    }
                }
            });
        });
    
    // Save the unsubscribe function
    channelListeners[channelId] = unsubscribe;
    
    // Update members count (in a real app, this would be dynamic)
    membersCount.textContent = '3 members';
}

// Unsubscribe from all channel listeners
function unsubscribeFromAllChannels() {
    Object.values(channelListeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
    });
    
    channelListeners = {};
}

// Render a message in the chat
function renderMessage(message) {
    if (!message || !messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.setAttribute('data-message-id', message.id);
    
    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = message.user?.photoURL || 'https://via.placeholder.com/40';
    avatar.alt = 'User';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    
    const authorSpan = document.createElement('span');
    authorSpan.className = 'message-author';
    authorSpan.textContent = message.user?.displayName || 'User';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = formatTimestamp(message.timestamp);
    
    headerDiv.appendChild(authorSpan);
    headerDiv.appendChild(timeSpan);
    
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = message.text;
    
    contentDiv.appendChild(headerDiv);
    contentDiv.appendChild(messageParagraph);
    
    // Add attachments if any
    if (message.attachment) {
        const attachmentDiv = document.createElement('div');
        attachmentDiv.className = 'file-attachment';
        
        const icon = document.createElement('i');
        icon.className = getFileIcon(message.attachment.type);
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = message.attachment.name;
        
        const downloadLink = document.createElement('a');
        downloadLink.href = message.attachment.url;
        downloadLink.className = 'download-link';
        downloadLink.target = '_blank';
        
        const downloadIcon = document.createElement('i');
        downloadIcon.className = 'fas fa-download';
        
        downloadLink.appendChild(downloadIcon);
        
        attachmentDiv.appendChild(icon);
        attachmentDiv.appendChild(nameSpan);
        attachmentDiv.appendChild(downloadLink);
        
        contentDiv.appendChild(attachmentDiv);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
}

// Format message timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

// Get appropriate icon for file type
function getFileIcon(fileType) {
    if (!fileType) return 'fas fa-file';
    
    if (fileType.includes('image')) {
        return 'fas fa-file-image';
    } else if (fileType.includes('pdf')) {
        return 'fas fa-file-pdf';
    } else if (fileType.includes('word') || fileType.includes('document')) {
        return 'fas fa-file-word';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
        return 'fas fa-file-excel';
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
        return 'fas fa-file-powerpoint';
    } else if (fileType.includes('zip') || fileType.includes('archive')) {
        return 'fas fa-file-archive';
    } else if (fileType.includes('audio')) {
        return 'fas fa-file-audio';
    } else if (fileType.includes('video')) {
        return 'fas fa-file-video';
    } else if (fileType.includes('text')) {
        return 'fas fa-file-alt';
    } else if (fileType.includes('code') || fileType.includes('javascript') || fileType.includes('html') || fileType.includes('css')) {
        return 'fas fa-file-code';
    }
    
    return 'fas fa-file';
}

// Scroll chat to bottom
function scrollToBottom() {
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Send a message to the current channel
function sendMessage() {
    if (!messageInput || !currentUser || !currentChannel) return;
    
    const text = messageInput.value.trim();
    
    if (!text) return;
    
    const message = {
        text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        user: {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'User',
            photoURL: currentUser.photoURL || 'https://via.placeholder.com/40'
        }
    };
    
    // Send to Firestore
    db.collection('channels').doc(currentChannel).collection('messages').add(message)
        .then(() => {
            // Clear input
            messageInput.value = '';
            
            // Clear typing indicator
            clearTimeout(typingTimeout);
            isTyping = false;
            
            // Update typing status in Firestore (in a real app)
        })
        .catch(error => {
            console.error('Error sending message:', error);
            showNotification('Failed to send message', 'error');
        });
}

// Handle typing indicator
function handleTyping() {
    if (!isTyping) {
        isTyping = true;
        
        // In a real app, you would update the typing status in Firestore
        // to notify other users
    }
    
    clearTimeout(typingTimeout);
    
    typingTimeout = setTimeout(() => {
        isTyping = false;
        
        // In a real app, you would update the typing status in Firestore
    }, 3000);
}

// Handle channel click
function handleChannelClick(e) {
    const channelItem = e.target.closest('.channel');
    
    if (channelItem) {
        const channelId = channelItem.getAttribute('data-channel-id');
        
        if (channelId && channelId !== currentChannel) {
            subscribeToChannel(channelId);
        }
    }
}

// Handle DM click
function handleDmClick(e) {
    const dmItem = e.target.closest('.dm');
    
    if (dmItem) {
        const userId = dmItem.getAttribute('data-dm-id');
        
        if (userId) {
            // In a real app, you would handle switching to a DM channel
            
            // For now, we'll just show a notification
            showNotification('Direct messages are not implemented in this demo', 'info');
        }
    }
}

// Handle new channel creation
function handleNewChannel(e) {
    e.preventDefault();
    
    const channelName = document.getElementById('channel-name').value.trim().toLowerCase();
    const description = document.getElementById('channel-description').value.trim();
    const isPrivate = document.querySelector('input[name="privacy"]:checked').value === 'private';
    
    if (!channelName) return;
    
    // Validate channel name
    if (!/^[a-z0-9-]+$/.test(channelName)) {
        showNotification('Channel name can only contain lowercase letters, numbers, and hyphens', 'error');
        return;
    }
    
    showLoading(true);
    
    const newChannel = {
        id: channelName,
        description,
        isPrivate,
        createdBy: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        members: [currentUser.uid]
    };
    
    // In a real app, you would create the channel in Firestore
    // For this demo, we'll just add it to our local array
    
    userChannels.unshift(newChannel);
    renderChannelsList();
    
    // Close modal
    toggleModal(newChannelModal, false);
    
    // Switch to the new channel
    subscribeToChannel(channelName);
    
    showLoading(false);
    showNotification(`Channel #${channelName} created successfully!`, 'success');
}

// Handle new DM
function handleNewDm() {
    // In a real app, you would show a modal to select a user
    // For this demo, we'll just show a notification
    showNotification('New direct messages are not implemented in this demo', 'info');
}

// Handle file attachment
function handleAttachment() {
    // In a real app, you would implement file uploading to Firebase Storage
    // For this demo, we'll just show a notification
    showNotification('File attachments are not implemented in this demo', 'info');
}

// Handle emoji picker
function handleEmoji() {
    // In a real app, you would implement an emoji picker
    // For this demo, we'll just show a notification
    showNotification('Emoji picker is not implemented in this demo', 'info');
}

// Toggle theme
function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    
    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

// Toggle modal visibility
function toggleModal(modal, show) {
    if (!modal) return;
    
    if (show) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

// Toggle sidebar visibility
function toggleSidebar(sidebar, show) {
    if (!sidebar) return;
    
    if (show) {
        sidebar.classList.remove('hidden');
    } else {
        sidebar.classList.add('hidden');
    }
}

// Show loading overlay
function showLoading(show) {
    if (!loadingOverlay) return;
    
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    if (!notification) return;
    
    // Set message and icon
    const notificationMessage = notification.querySelector('.notification-message');
    const notificationIcon = notification.querySelector('.notification-icon');
    
    if (notificationMessage) {
        notificationMessage.textContent = message;
    }
    
    if (notificationIcon) {
        // Reset classes
        notificationIcon.className = 'notification-icon';
        
        // Add appropriate icon
        switch (type) {
            case 'success':
                notificationIcon.classList.add('fas', 'fa-check-circle');
                break;
            case 'error':
                notificationIcon.classList.add('fas', 'fa-exclamation-circle');
                break;
            case 'warning':
                notificationIcon.classList.add('fas', 'fa-exclamation-triangle');
                break;
            case 'info':
            default:
                notificationIcon.classList.add('fas', 'fa-info-circle');
                break;
        }
    }
    
    // Reset classes
    notification.className = 'notification';
    notification.classList.add(type);
    
    // Show notification
    notification.classList.remove('hidden');
    
    // Auto-hide after a delay
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

// Setup mobile responsiveness
function setupMobileResponsiveness() {
    // Add a button for mobile to toggle sidebar
    const chatHeader = document.querySelector('.chat-header');
    
    if (chatHeader) {
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        
        mobileMenuBtn.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('open');
            }
        });
        
        chatHeader.prepend(mobileMenuBtn);
        
        // Only show on mobile
        const style = document.createElement('style');
        style.textContent = `
            .mobile-menu-btn {
                display: none;
                color: var(--text-color);
                font-size: 1.2rem;
                margin-right: 1rem;
            }
            
            @media (max-width: 768px) {
                .mobile-menu-btn {
                    display: block;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', init); 