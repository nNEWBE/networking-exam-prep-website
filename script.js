// Enforce Dark Mode
document.documentElement.classList.add('dark');

// Copy Function
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

// Smooth Scroll
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

// Hostname Modal
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

// Tab Switching
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

    // Update body class for theming (scrollbar + scroll button)
    document.body.classList.remove('scrollbar-login', 'scrollbar-vlan');
    document.body.classList.add('scrollbar-' + tabId);

    // Update scrollbar color based on active tab
    updateScrollbarColor(tabId);

    // Update steps filter when tab changes
    populateStepsFilter(tabId);
}

// Dynamic Scrollbar
function updateScrollbarColor(tabId) {
    // Get or create the dynamic scrollbar style element
    let scrollbarStyle = document.getElementById('dynamic-scrollbar-style');
    if (!scrollbarStyle) {
        scrollbarStyle = document.createElement('style');
        scrollbarStyle.id = 'dynamic-scrollbar-style';
        document.head.appendChild(scrollbarStyle);
    }

    // Define colors for each tab
    const colors = {
        login: {
            main: '#00bceb',
            hover: '#00d4ff',
            glow1: 'rgba(0, 188, 235, 0.6)',
            glow2: 'rgba(0, 188, 235, 0.3)',
            hoverGlow1: 'rgba(0, 212, 255, 0.7)',
            hoverGlow2: 'rgba(0, 212, 255, 0.4)'
        },
        vlan: {
            main: '#f43f5e',
            hover: '#ff6b8a',
            glow1: 'rgba(244, 63, 94, 0.6)',
            glow2: 'rgba(244, 63, 94, 0.3)',
            hoverGlow1: 'rgba(255, 107, 138, 0.7)',
            hoverGlow2: 'rgba(255, 107, 138, 0.4)'
        }
    };

    const c = colors[tabId] || colors.login;

    // Generate scrollbar with outer glow effect
    scrollbarStyle.textContent = `
        ::-webkit-scrollbar-thumb {
            background: ${c.main} !important;
            border-radius: 10px !important;
            box-shadow: 0 0 6px 2px ${c.glow1}, 0 0 12px 4px ${c.glow2} !important;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: ${c.hover} !important;
            box-shadow: 0 0 8px 3px ${c.hoverGlow1}, 0 0 16px 6px ${c.hoverGlow2} !important;
        }
        html {
            scrollbar-color: ${c.main} #060810 !important;
        }
    `;
}

// Steps Filter

const stepsConfig = {
    login: [
        { id: 'login-basics', name: 'Basics', section: '#basics' },
        { id: 'login-security', name: 'User Mode Security', section: '#security' },
        { id: 'login-privileged', name: 'Privileged Mode Security', section: '#privileged' },
        { id: 'login-encryption', name: 'Password Encryption', section: '#encryption' },
        { id: 'login-verification', name: 'Verification', section: '#verification' }
    ],
    vlan: [
        { id: 'vlan-creation', name: 'VLAN Creation', section: '#vlan-creation' },
        { id: 'vlan-ports', name: 'Port Assignment', section: '#port-assignment' },
        { id: 'vlan-shutdown', name: 'VLAN Shutdown', section: '#vlan-shutdown' },
        { id: 'vlan-verification', name: 'VLAN Verification', section: '#vlan-verification' }
    ]
};

// Summary commands mapping
const summaryCommandsMap = {
    login: {
        'login-basics': {
            sectionComments: ['DEVICE IDENTITY'],
            commands: ['enable', 'configure terminal', 'hostname R1']
        },
        'login-security': {
            sectionComments: ['USER MODE SECURITY'],
            commands: ['line console 0', 'password cisco123', 'login', 'exit']
        },
        'login-privileged': {
            sectionComments: ['PRIVILEGED MODE SECURITY'],
            commands: ['enable secret class123']
        },
        'login-encryption': {
            sectionComments: ['PASSWORD ENCRYPTION'],
            commands: ['service password-encryption', 'no service password-encryption']
        },
        'login-verification': {
            sectionComments: ['FINAL VERIFICATION'],
            commands: ['end', 'show running-config']
        }
    },
    vlan: {
        'vlan-creation': {
            sectionComments: ['VLAN CREATION'],
            commands: ['vlan 10', 'name SALES', 'exit']
        },
        'vlan-ports': {
            sectionComments: ['PORT ASSIGNMENT (SINGLE PORT)', 'PORT ASSIGNMENT (RANGE)'],
            commands: ['interface fa0/6', 'interface range fa0/1 - 5', 'switchport mode access', 'switchport access vlan 10', 'exit']
        },
        'vlan-shutdown': {
            sectionComments: ['VLAN SHUTDOWN', 'VLAN RESTORE'],
            commands: ['interface vlan 10', 'shutdown', 'exit', 'no shutdown']
        },
        'vlan-verification': {
            sectionComments: ['VLAN VERIFICATION'],
            commands: ['end', 'show vlan brief', 'show interfaces status', 'show ip interface brief']
        }
    }
};

// Store visibility state
const stepsVisibility = {};

// Initialize visibility state
Object.values(stepsConfig).flat().forEach(step => {
    stepsVisibility[step.id] = true;
});

// Populate the steps filter dropdown
function populateStepsFilter(tabId) {
    const filterListDesktop = document.getElementById('steps-filter-list');
    const filterListMobile = document.getElementById('mobile-steps-filter-list');

    const populateList = (list, isMobile) => {
        if (!list) return;

        const steps = stepsConfig[tabId] || [];
        list.innerHTML = '';

        steps.forEach(step => {
            const item = document.createElement('div');
            item.className = 'steps-filter-item';
            const uniqueId = isMobile ? `mobile-filter-${step.id}` : `filter-${step.id}`;

            item.innerHTML = `
                <div class="custom-checkbox">
                    <input type="checkbox" id="${uniqueId}" ${stepsVisibility[step.id] ? 'checked' : ''}>
                    <div class="checkbox-box"></div>
                </div>
                <label for="${uniqueId}">${step.name}</label>
            `;

            const checkbox = item.querySelector('input');
            checkbox.addEventListener('change', () => {
                stepsVisibility[step.id] = checkbox.checked;

                // Sync with other checkbox
                const otherId = isMobile ? `filter-${step.id}` : `mobile-filter-${step.id}`;
                const otherCheckbox = document.getElementById(otherId);
                if (otherCheckbox) otherCheckbox.checked = checkbox.checked;

                toggleStepVisibility(step, checkbox.checked, tabId);
            });

            list.appendChild(item);
        });
    };

    populateList(filterListDesktop, false);
    populateList(filterListMobile, true);
}

// Toggle step visibility
function toggleStepVisibility(step, visible, tabId) {
    // Try to find the section
    let section = null;
    const sectionId = step.section.replace('#', '');

    if (step.section.startsWith('#')) {
        section = document.querySelector(step.section);
    } else {
        // Complex selector - find by content
        const sections = document.querySelectorAll('section');
        sections.forEach(s => {
            const h2 = s.querySelector('h2');
            if (h2 && h2.textContent.includes(step.name.split(' ')[0])) {
                section = s;
            }
        });
    }

    if (section) {
        if (visible) {
            section.classList.remove('step-hidden');
        } else {
            section.classList.add('step-hidden');
        }
    }

    // Toggle corresponding navigation links (both desktop and mobile)
    const navLinks = document.querySelectorAll(`a[href="#${sectionId}"]`);
    navLinks.forEach(link => {
        if (visible) {
            link.classList.remove('nav-link-hidden');
        } else {
            link.classList.add('nav-link-hidden');
        }
    });

    updateSummaryCommands(tabId);
}

function updateSummaryCommands(tabId) {
    const summaryId = tabId === 'login' ? 'login-summary' : 'vlan-summary';
    const summarySection = document.getElementById(summaryId);
    if (!summarySection) return;

    const terminalBody = summarySection.querySelector('.terminal-body > div');
    if (!terminalBody) return;

    const commandsMap = summaryCommandsMap[tabId];
    if (!commandsMap) return;

    // Helper function to check if text matches any section pattern
    function matchesSectionPattern(text, patterns) {
        return patterns.some(pattern => text.includes(pattern));
    }

    // Get all elements (comments and commands)
    const allElements = terminalBody.children;
    let currentStepId = null;
    let elementsToProcess = [];

    // First pass: identify which elements belong to which step
    Array.from(allElements).forEach(element => {
        // Check if this is a section comment (identifies the step)
        if (element.classList.contains('text-gray-500') && element.textContent.includes('=====')) {
            // Find which step this comment belongs to
            for (const [stepId, stepData] of Object.entries(commandsMap)) {
                if (matchesSectionPattern(element.textContent, stepData.sectionComments)) {
                    currentStepId = stepId;
                    elementsToProcess.push({ element, stepId: currentStepId, isComment: true });
                    break;
                }
            }
        } else if (element.classList.contains('cmd-line') && currentStepId) {
            elementsToProcess.push({ element, stepId: currentStepId, isComment: false });
        } else if (element.classList.contains('mt-3') && element.classList.contains('text-gray-500')) {
            // This is a section divider with comment
            for (const [stepId, stepData] of Object.entries(commandsMap)) {
                if (matchesSectionPattern(element.textContent, stepData.sectionComments)) {
                    currentStepId = stepId;
                    elementsToProcess.push({ element, stepId: currentStepId, isComment: true });
                    break;
                }
            }
        }
    });

    // Second pass: show/hide elements based on visibility
    elementsToProcess.forEach(({ element, stepId }) => {
        if (stepsVisibility[stepId]) {
            element.style.display = '';
            element.classList.remove('summary-hidden');
        } else {
            element.style.display = 'none';
            element.classList.add('summary-hidden');
        }
    });

    // Update the Copy All button text
    updateCopyAllButton(tabId, summarySection);
}

// Update the Copy All button to only copy visible commands
function updateCopyAllButton(tabId, summarySection) {
    const copyBtn = summarySection.querySelector('.copy-btn');
    if (!copyBtn) return;

    const commandsMap = summaryCommandsMap[tabId];
    if (!commandsMap) return;

    // Build the commands string from visible steps
    let allCommands = [];

    // Always include mode entry commands
    if (tabId === 'login' || tabId === 'vlan') {
        // These are base commands that appear in DEVICE IDENTITY / ENTER CONFIG MODE
        if (stepsVisibility['login-basics'] && tabId === 'login') {
            allCommands.push('enable', 'configure terminal', `hostname ${currentHostname || 'R1'}`);
        }
        if (tabId === 'vlan') {
            // VLAN always needs enable and configure terminal
            allCommands.push('enable', 'configure terminal');
        }
    }

    // Add commands for each visible step
    const steps = stepsConfig[tabId] || [];
    steps.forEach(step => {
        if (stepsVisibility[step.id] && commandsMap[step.id]) {
            const stepCommands = commandsMap[step.id].commands;

            // Skip basics for login as we already added them
            if (step.id === 'login-basics') return;

            // Add the commands
            stepCommands.forEach(cmd => {
                if (!allCommands.includes(cmd)) {
                    allCommands.push(cmd);
                }
            });
        }
    });

    // Create the onclick handler with the new command string
    const commandString = allCommands.join('\\n');
    copyBtn.setAttribute('onclick', `copyText('${commandString}', event)`);
}

// Dropdown toggle
document.addEventListener('DOMContentLoaded', function () {
    const filterBtn = document.getElementById('steps-filter-btn');
    const filterDropdown = document.getElementById('steps-filter-dropdown');
    const filterArrow = document.getElementById('steps-filter-arrow');
    const selectAllBtn = document.getElementById('steps-select-all');

    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('show');
            filterDropdown.classList.toggle('hidden');
            filterArrow?.classList.toggle('rotated');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!filterDropdown.contains(e.target) && e.target !== filterBtn) {
                filterDropdown.classList.remove('show');
                filterDropdown.classList.add('hidden');
                filterArrow?.classList.remove('rotated');
            }
        });

        // Select All functionality
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                const checkboxes = filterDropdown.querySelectorAll('input[type="checkbox"]');
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);

                checkboxes.forEach(cb => {
                    cb.checked = !allChecked;
                    cb.dispatchEvent(new Event('change'));
                });

                selectAllBtn.textContent = allChecked ? 'Select All' : 'Deselect All';
            });
        }
    }

    populateStepsFilter('login');
    document.body.classList.add('scrollbar-login');
    updateScrollbarColor('login');

    // Mobile Menu Toggle - Robust implementation
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        // Function to close the menu
        function closeMobileMenu() {
            mobileMenu.classList.remove('open');
        }

        // Function to toggle the menu
        function toggleMobileMenu(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('open');
        }

        // Remove old listeners by replacing with clone, then add new listener
        const newBtn = mobileMenuBtn.cloneNode(true);
        mobileMenuBtn.parentNode.replaceChild(newBtn, mobileMenuBtn);
        newBtn.addEventListener('click', toggleMobileMenu);

        // Close menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            // If menu is open and click is outside menu and outside the button
            if (mobileMenu.classList.contains('open') &&
                !mobileMenu.contains(e.target) &&
                !newBtn.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close menu when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeMobileMenu();
            }
        });
    }

    // Mobile Steps Filter Toggle
    const mobileStepsBtn = document.getElementById('mobile-steps-filter-btn');
    const mobileStepsList = document.getElementById('mobile-steps-filter-list');
    const mobileStepsArrow = document.getElementById('mobile-steps-filter-arrow');

    if (mobileStepsBtn && mobileStepsList) {
        mobileStepsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileStepsList.classList.toggle('hidden');
            if (mobileStepsArrow) {
                mobileStepsArrow.style.transform = mobileStepsList.classList.contains('hidden')
                    ? 'rotate(0deg)'
                    : 'rotate(180deg)';
            }
        });

        // Prevent closing menu when clicking inside filter list
        mobileStepsList.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    initScrollToTop();
});

// Scroll to Top Button

function initScrollToTop() {
    const scrollBtn = document.getElementById('scroll-to-top');
    const progressBar = document.querySelector('.scroll-progress-bar');
    const percentageText = document.querySelector('.scroll-percentage');

    if (!scrollBtn || !progressBar) return;

    const circumference = 2 * Math.PI * 22;
    window.addEventListener('scroll', () => {
        updateScrollProgress();
    });

    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        const offset = circumference - (scrollPercent / 100) * circumference;
        progressBar.style.strokeDashoffset = offset;

        if (percentageText) {
            percentageText.textContent = Math.round(scrollPercent) + '%';
        }

        if (scrollTop > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }

    updateScrollProgress();
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
