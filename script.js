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
            // Get the button that was clicked
            const btn = event ? event.currentTarget : null;

            try {
                // Try modern clipboard API first
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

                // Update button to show "Copied" state
                if (btn) {
                    const icon = btn.querySelector('i');
                    const textSpan = btn.querySelector('span');
                    const originalIconClass = icon.className;
                    const originalText = textSpan ? textSpan.textContent : '';

                    // Change to checkmark and "Copied"
                    icon.className = 'fa-solid fa-check';
                    if (textSpan) textSpan.textContent = 'Copied';
                    btn.classList.add('copied');

                    // Revert after delay
                    setTimeout(() => {
                        icon.className = originalIconClass;
                        if (textSpan) textSpan.textContent = originalText;
                        btn.classList.remove('copied');
                    }, 2000);
                }

                // Show toast notification
                const toast = document.getElementById('toast');
                toast.classList.remove('translate-y-28', 'opacity-0');
                toast.classList.add('translate-y-0', 'opacity-100');

                // Haptic feedback
                if (navigator.vibrate) navigator.vibrate(50);

                // Hide toast after delay
                setTimeout(() => {
                    toast.classList.add('translate-y-28', 'opacity-0');
                    toast.classList.remove('translate-y-0', 'opacity-100');
                }, 2500);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }

        // ===== Scroll Reveal Animations =====
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Stop observing once revealed
                }
            });
        }, { threshold: 0.1 });

        // Observe reveal elements
        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

        // ===== Step Reveal Animations (Staggered) =====
        const stepRevealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Stop observing once revealed
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        // Observe step-reveal elements
        document.querySelectorAll('.step-reveal').forEach(el => stepRevealObserver.observe(el));

        // ===== Active Nav Indicator (Scroll Spy) - Optimized =====
        const sections = document.querySelectorAll('.section-spy');
        const navLinks = document.querySelectorAll('.nav-link');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        let updateScheduled = false;

        // Function to update active nav link
        function updateActiveNav() {
            const scrollPos = window.scrollY + 150; // Offset for nav height

            let currentSection = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                }
            });

            // Batch DOM updates
            requestAnimationFrame(() => {
                // Update desktop nav links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSection}`) {
                        link.classList.add('active');
                    }
                });

                // Update mobile nav links
                mobileNavLinks.forEach(link => {
                    link.classList.remove('text-cisco-blue');
                    if (link.getAttribute('href') === `#${currentSection}`) {
                        link.classList.add('text-cisco-blue');
                    }
                });

                updateScheduled = false; // Reset flag
            });
        }

        // Optimized Scroll Listener using requestAnimationFrame
        window.addEventListener('scroll', () => {
            if (!updateScheduled) {
                updateScheduled = true;
                updateActiveNav();
            }
        }, { passive: true });

        // Initial call on page load
        updateActiveNav();

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

        // Current hostname (default)
        let currentHostname = localStorage.getItem('ciscoHostname') || '';

        // Hostname validation regex (letters, numbers, hyphens, no spaces)
        const hostnameRegex = /^[a-zA-Z][a-zA-Z0-9-]{0,62}$/;

        // Function to validate hostname
        function isValidHostname(hostname) {
            return hostnameRegex.test(hostname) && hostname.length > 0;
        }

        // Function to update all hostname displays
        function updateHostnameDisplays(hostname) {
            // Update terminal command (specific IDs)
            const hostnameCmdValue = document.getElementById('hostname-cmd-value');
            const hostnamePromptValue = document.getElementById('hostname-prompt-value');

            if (hostnameCmdValue) hostnameCmdValue.textContent = hostname;
            if (hostnamePromptValue) hostnamePromptValue.textContent = hostname;

            // Update ALL dynamic hostname elements across the page
            document.querySelectorAll('.hostname-dynamic').forEach(el => {
                el.textContent = hostname;
            });

            // Update navbar buttons
            if (navHostnameDisplay) navHostnameDisplay.textContent = hostname;
            if (mobileHostnameDisplay) mobileHostnameDisplay.textContent = hostname;

            // Store in localStorage
            localStorage.setItem('ciscoHostname', hostname);
            currentHostname = hostname;
        }

        // Function to copy hostname command
        function copyHostnameCommand(event) {
            const command = `hostname ${currentHostname}`;
            copyText(command, event);
        }

        // Make it available globally
        window.copyHostnameCommand = copyHostnameCommand;

        // Function to open modal
        function openHostnameModal() {
            hostnameModal.classList.add('active');
            hostnameInput.value = currentHostname;
            hostnameInput.focus();
            hostnameError.classList.remove('show');
            hostnameInput.classList.remove('error');
        }

        // Function to close modal (only if valid input)
        function closeHostnameModal() {
            hostnameModal.classList.remove('active');
        }

        // Function to handle hostname submission
        function submitHostname() {
            const hostname = hostnameInput.value.trim();

            if (!isValidHostname(hostname)) {
                hostnameError.classList.add('show');
                hostnameInput.classList.add('error');
                hostnameInput.focus();
                return;
            }

            // Valid hostname - update displays and close modal
            updateHostnameDisplays(hostname);
            closeHostnameModal();
        }

        // Event Listeners
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

        // Navbar hostname button click
        if (navHostnameBtn) {
            navHostnameBtn.addEventListener('click', openHostnameModal);
        }

        // Mobile hostname button click
        if (mobileHostnameBtn) {
            mobileHostnameBtn.addEventListener('click', openHostnameModal);
        }

        // Check if hostname is already set in localStorage
        if (currentHostname) {
            // Hostname exists - update displays (modal is hidden by default)
            updateHostnameDisplays(currentHostname);
        } else {
            // No hostname - show modal on page load
            hostnameModal.classList.add('active');
            hostnameInput.focus();
        }
        // ===== Tab Switching Logic =====
        function switchTab(tabId) {
            // 1. Toggle Tab Buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeBtn = document.getElementById('tab-' + tabId);
            if (activeBtn) activeBtn.classList.add('active');

            // 2. Toggle Content Sections
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden-force');
            });
            const activeContent = document.getElementById(tabId + '-content');
            if (activeContent) activeContent.classList.remove('hidden-force');

            // 3. Toggle Navbar Groups
            // Hide all groups first
            document.querySelectorAll('.nav-group-login, .nav-group-vlan').forEach(el => {
                el.classList.add('hidden-force');
            });

            // Show target group
            const targetGroupClass = 'nav-group-' + tabId;
            document.querySelectorAll('.' + targetGroupClass).forEach(el => {
                el.classList.remove('hidden-force');
            });

            // 4. Force layout update for ScrollSpy
            requestAnimationFrame(() => {
                updateActiveNav();
            });
        }
