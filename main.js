/* ==========================================================================
   Jandel L. Escalera — portfolio interactions
   Plain ES5-friendly JavaScript, no dependencies.
   ========================================================================== */

(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* ---------------------------------------------------------------------
       Theme
       --------------------------------------------------------------------- */

    var themeToggle = document.getElementById('theme-toggle');

    function syncThemeLabel() {
        if (!themeToggle) return;
        var isDark = root.getAttribute('data-theme') === 'dark';
        themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        try { localStorage.setItem('theme', theme); } catch (e) { /* storage blocked */ }
        syncThemeLabel();
    }

    if (themeToggle) {
        syncThemeLabel();
        themeToggle.addEventListener('click', function () {
            setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        });
    }

    /* ---------------------------------------------------------------------
       Local time (Asia/Manila)
       --------------------------------------------------------------------- */

    var clocks = [document.getElementById('clock'), document.getElementById('clock-footer')]
        .filter(Boolean);

    function updateClock() {
        if (!clocks.length) return;
        var value;
        try {
            value = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Manila',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(new Date());
        } catch (e) {
            value = new Intl.DateTimeFormat('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(new Date());
        }
        clocks.forEach(function (el) { el.textContent = value; });
    }

    updateClock();
    window.setInterval(updateClock, 15000);

    /* ---------------------------------------------------------------------
       Header state + reading progress
       --------------------------------------------------------------------- */

    var header = document.getElementById('site-header');
    var progressBar = document.getElementById('progress-bar');
    var documentHeight = 0;

    function renderScrollState() {
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;

        if (header) header.classList.toggle('is-scrolled', y > 8);

        if (progressBar) {
            var max = Math.max(documentHeight - window.innerHeight, 0);
            var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
            progressBar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        }
    }

    function measureDocument() {
        documentHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );
        renderScrollState();
    }

    window.addEventListener('scroll', renderScrollState, { passive: true });
    window.addEventListener('resize', measureDocument);
    window.addEventListener('load', measureDocument);
    measureDocument();
    window.setTimeout(measureDocument, 600);

    /* ---------------------------------------------------------------------
       Active navigation link
       --------------------------------------------------------------------- */

    var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
    var navSections = navLinks
        .map(function (link) { return document.getElementById(link.getAttribute('data-nav')); })
        .filter(Boolean);

    if (navLinks.length && navSections.length && 'IntersectionObserver' in window) {
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (link) {
                    if (link.getAttribute('data-nav') === entry.target.id) {
                        link.setAttribute('aria-current', 'true');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        navSections.forEach(function (section) { navObserver.observe(section); });
    }

    /* ---------------------------------------------------------------------
       Mobile menu
       --------------------------------------------------------------------- */

    var menuToggle = document.getElementById('menu-toggle');
    var mobileMenu = document.getElementById('mobile-menu');

    function menuIsOpen() {
        return !!(mobileMenu && mobileMenu.classList.contains('is-open'));
    }

    function setMenu(open, restoreFocus) {
        if (!mobileMenu || !menuToggle) return;

        mobileMenu.classList.toggle('is-open', open);
        document.body.classList.toggle('menu-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        mobileMenu.setAttribute('aria-hidden', String(!open));

        if (open) {
            mobileMenu.removeAttribute('inert');
            var first = mobileMenu.querySelector('a');
            if (first) first.focus();
        } else {
            mobileMenu.setAttribute('inert', '');
            if (restoreFocus) menuToggle.focus();
        }
    }

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            setMenu(!menuIsOpen(), false);
        });

        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () { setMenu(false, false); });
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && menuIsOpen()) {
                setMenu(false, true);
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 900 && menuIsOpen()) setMenu(false, false);
        });
    }

    /* ---------------------------------------------------------------------
       Work accordion
       --------------------------------------------------------------------- */

    var workItems = Array.prototype.slice.call(document.querySelectorAll('.work-item'));

    function closeItem(item) {
        item.classList.remove('is-open');
        var button = item.querySelector('.work-toggle');
        if (button) button.setAttribute('aria-expanded', 'false');
    }

    workItems.forEach(function (item) {
        var button = item.querySelector('.work-toggle');
        if (!button) return;

        button.addEventListener('click', function () {
            var willOpen = !item.classList.contains('is-open');

            workItems.forEach(function (other) {
                if (other !== item && other.classList.contains('is-open')) closeItem(other);
            });

            item.classList.toggle('is-open', willOpen);
            button.setAttribute('aria-expanded', String(willOpen));

        });
    });

    /* ---------------------------------------------------------------------
       Reveal on scroll
       --------------------------------------------------------------------- */

    var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

    if ('IntersectionObserver' in window && !reduceMotion.matches) {
        revealItems.forEach(function (el) {
            var siblings = Array.prototype.slice.call(el.parentElement.children)
                .filter(function (child) { return child.classList.contains('reveal'); });
            var order = siblings.indexOf(el);
            if (order > 0) el.style.transitionDelay = Math.min(order * 70, 280) + 'ms';
        });

        var revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealItems.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealItems.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------------------------------------------------------------------
       Copy email
       --------------------------------------------------------------------- */

    var copyButton = document.getElementById('copy-email');
    var copyTimer = null;

    if (copyButton) {
        var copyLabel = copyButton.querySelector('.copy-label');

        var markCopied = function () {
            copyButton.classList.add('is-copied');
            if (copyLabel) copyLabel.textContent = 'Copied';
            window.clearTimeout(copyTimer);
            copyTimer = window.setTimeout(function () {
                copyButton.classList.remove('is-copied');
                if (copyLabel) copyLabel.textContent = 'Copy email';
            }, 2000);
        };

        var legacyCopy = function (text) {
            var field = document.createElement('textarea');
            field.value = text;
            field.setAttribute('readonly', '');
            field.style.position = 'fixed';
            field.style.top = '-1000px';
            document.body.appendChild(field);
            field.select();
            try {
                document.execCommand('copy');
                markCopied();
            } catch (e) {
                if (copyLabel) copyLabel.textContent = 'Copy failed';
            }
            document.body.removeChild(field);
        };

        copyButton.addEventListener('click', function () {
            var email = copyButton.getAttribute('data-email') || '';
            if (!email) return;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(markCopied, function () {
                    legacyCopy(email);
                });
            } else {
                legacyCopy(email);
            }
        });
    }

    /* ---------------------------------------------------------------------
       Footer year
       --------------------------------------------------------------------- */

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
})();
