// ===== Enforce Dark Mode =====
document.documentElement.classList.add('dark');

// ===== Mobile Menu Logic =====
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });
}

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
    });
});

// ===== Copy Function with Enhanced Feedback =====
async function copyText(text, event) {
    const btn = event ? event.currentTarget : null;

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }

        if (btn) {
            const icon = btn.querySelector('i');
            const textSpan = btn.querySelector('span');
            const originalIconClass = icon.className;
            const originalText = textSpan ? textSpan.textContent : '';

            icon.className = 'fa-solid fa-check';
            if (textSpan) textSpan.textContent = 'Copied';
            btn.classList.add('copied');

            setTimeout(() => {
                icon.className = originalIconClass;
                if (textSpan) textSpan.textContent = originalText;
                btn.classList.remove('copied');
            }, 2000);
        }

        const toast = document.getElementById('toast');
        toast.classList.remove('translate-y-28', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');

        if (navigator.vibrate) navigator.vibrate(50);

        setTimeout(() => {
            toast.classList.add('translate-y-28', 'opacity-0');
            toast.classList.remove('translate-y-0', 'opacity-100');
        }, 2500);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Hostname Modal Functionality =====
const hostnameModal = document.getElementById('hostname-modal');
const hostnameInput = document.getElementById('hostname-input');
const hostnameSubmitBtn = document.getElementById('hostname-submit');
const hostnameError = document.getElementById('hostname-error');
const navHostnameBtn = document.getElementById('nav-hostname-btn');
const navHostnameDisplay = document.getElementById('nav-hostname-display');
const mobileHostnameBtn = document.getElementById('mobile-hostname-btn');
const mobileHostnameDisplay = document.getElementById('mobile-hostname-display');

let currentHostname = localStorage.getItem('ciscoHostname') || '';
const hostnameRegex = /^[a-zA-Z][a-zA-Z0-9-]{0,62}$/;

function isValidHostname(hostname) {
    return hostnameRegex.test(hostname) && hostname.length > 0;
}

function updateHostnameDisplays(hostname) {
    const hostnameCmdValue = document.getElementById('hostname-cmd-value');
    const hostnamePromptValue = document.getElementById('hostname-prompt-value');

    if (hostnameCmdValue) hostnameCmdValue.textContent = hostname;
    if (hostnamePromptValue) hostnamePromptValue.textContent = hostname;

    document.querySelectorAll('.hostname-dynamic').forEach(el => {
        el.textContent = hostname;
    });

    if (navHostnameDisplay) navHostnameDisplay.textContent = hostname;
    if (mobileHostnameDisplay) mobileHostnameDisplay.textContent = hostname;

    localStorage.setItem('ciscoHostname', hostname);
    currentHostname = hostname;
}

function copyHostnameCommand(event) {
    const command = `hostname ${currentHostname}`;
    copyText(command, event);
}

window.copyHostnameCommand = copyHostnameCommand;

function openHostnameModal() {
    hostnameModal.classList.add('active');
    hostnameInput.value = currentHostname;
    hostnameInput.focus();
    hostnameError.classList.remove('show');
    hostnameInput.classList.remove('error');
}

function closeHostnameModal() {
    hostnameModal.classList.remove('active');
}

function submitHostname() {
    const hostname = hostnameInput.value.trim();

    if (!isValidHostname(hostname)) {
        hostnameError.classList.add('show');
        hostnameInput.classList.add('error');
        hostnameInput.focus();
        return;
    }

    updateHostnameDisplays(hostname);
    closeHostnameModal();
}

hostnameSubmitBtn.addEventListener('click', submitHostname);

hostnameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitHostname();
    }
});

hostnameInput.addEventListener('input', () => {
    hostnameError.classList.remove('show');
    hostnameInput.classList.remove('error');
});

if (navHostnameBtn) {
    navHostnameBtn.addEventListener('click', openHostnameModal);
}

if (mobileHostnameBtn) {
    mobileHostnameBtn.addEventListener('click', openHostnameModal);
}

if (currentHostname) {
    updateHostnameDisplays(currentHostname);
} else {
    hostnameModal.classList.add('active');
    hostnameInput.focus();
}

// ===== Tab Switching Logic =====
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById('tab-' + tabId);
    if (activeBtn) activeBtn.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden-force');
    });
    const activeContent = document.getElementById(tabId + '-content');
    if (activeContent) activeContent.classList.remove('hidden-force');

    document.querySelectorAll('.nav-group-login, .nav-group-vlan').forEach(el => {
        el.classList.add('hidden-force');
    });

    const targetGroupClass = 'nav-group-' + tabId;
    document.querySelectorAll('.' + targetGroupClass).forEach(el => {
        el.classList.remove('hidden-force');
    });
}

