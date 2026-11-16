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
       Preloader
       --------------------------------------------------------------------- */

    var preloader = document.getElementById('preloader');
    var preloaderCard = document.getElementById('preloader-card');
    var preloaderBar = document.getElementById('preloader-bar');
    var preloaderPercent = document.getElementById('preloader-percent');
    var preloaderStatus = document.getElementById('preloader-status');

    var preloaderStart = window.performance && window.performance.now ? window.performance.now() : Date.now();
    var preloaderFinished = false;
    var loadFired = (document.readyState === 'complete');
    var forceReady = false;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var preloaderActive = !!preloader &&
        root.classList.contains('is-loading') &&
        !root.classList.contains('preloader-skip');

    var minDuration = reducedMotion ? 600 : 1200;
    var safetyTimeout = 6000;

    var currentProgress = 0;
    var targetProgress = 0;
    var rafId = null;

    window.addEventListener('load', function () { loadFired = true; });

    function easeProgress(t) {
        // fast start, slower middle, quick finish
        if (t < 0.5) {
            return 2 * t - 2 * t * t;
        }
        return 2 * t * t - 2 * t + 1;
    }

    function stageText(p) {
        if (p < 30) return 'Initializing experience...';
        if (p < 60) return 'Loading assets...';
        if (p < 90) return 'Preparing interface...';
        return 'Almost ready...';
    }

    function renderPreloader(p) {
        if (preloaderBar) {
            preloaderBar.style.transform = 'scaleX(' + (p / 100).toFixed(4) + ')';
        }
        if (preloaderPercent) {
            preloaderPercent.textContent = Math.round(p) + '%';
        }
        if (preloaderStatus) {
            preloaderStatus.textContent = stageText(p);
        }
    }

    function lockScroll() {
        document.body.classList.add('preloader-lock');
    }

    function unlockScroll() {
        document.body.classList.remove('preloader-lock');
    }

    function finishPreloader() {
        if (!preloaderActive || preloaderFinished) return;
        preloaderFinished = true;
        if (rafId) { window.cancelAnimationFrame(rafId); rafId = null; }

        currentProgress = 100;
        targetProgress = 100;
        renderPreloader(100);

        window.setTimeout(function () {
            if (preloaderCard) preloaderCard.classList.add('is-exiting');
            window.setTimeout(function () {
                root.classList.remove('is-loading');
                root.classList.add('preloader-done');
                if (preloader) preloader.classList.add('is-gone');
                unlockScroll();
                try { sessionStorage.setItem('preloader-seen', '1'); } catch (e) { /* storage blocked */ }
                initReveals();
            }, 500);
        }, 250);
    }

    function tick() {
        if (!preloaderActive || preloaderFinished) return;

        var now = window.performance && window.performance.now ? window.performance.now() : Date.now();
        var elapsed = now - preloaderStart;

        // target based on time + readiness
        var t = Math.min(1, elapsed / minDuration);
        var base = easeProgress(t) * 90;
        if (loadFired || forceReady) base = Math.max(base, 92);
        if ((loadFired || forceReady) && elapsed >= minDuration) base = 100;
        targetProgress = Math.min(100, base);

        // smooth current toward target
        currentProgress += (targetProgress - currentProgress) * 0.14;
        if (targetProgress === 100 && currentProgress > 99) currentProgress = 100;

        renderPreloader(currentProgress);

        if (currentProgress >= 100) {
            finishPreloader();
        } else {
            rafId = window.requestAnimationFrame(tick);
        }
    }

    if (preloaderActive) {
        lockScroll();
        // safety timeout
        window.setTimeout(function () { forceReady = true; }, safetyTimeout);
        rafId = window.requestAnimationFrame(tick);
    } else {
        unlockScroll();
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
    var heroGrid = document.querySelector('.hero-grid');
    var documentHeight = 0;

    function renderScrollState() {
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;

        if (header) header.classList.toggle('is-scrolled', y > 8);

        if (progressBar) {
            var max = Math.max(documentHeight - window.innerHeight, 0);
            var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
            progressBar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        }

        if (heroGrid) {
            var lift = reduceMotion.matches ? 0 : Math.min(y * 0.07, 36);
            heroGrid.style.setProperty('--hero-lift', lift.toFixed(2) + 'px');
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
    var revealsReady = false;

    function initReveals() {
        if (revealsReady) return;
        revealsReady = true;

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
    }

    if (!preloaderActive) initReveals();

    /* ---------------------------------------------------------------------
       Cursor aura
       --------------------------------------------------------------------- */

    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    var cursorGlow = document.getElementById('cursor-glow');
    var hotSelector = 'a, button, [role="button"], input, textarea, select, label, .tags li, .work-toggle';
    var cursorFrame = null;
    var cursorActive = false;
    var cursorTime = 0;
    var pointerX = 0;
    var pointerY = 0;
    var glowX = 0;
    var glowY = 0;

    function cursorAllowed() {
        return !!cursorGlow &&
            !reduceMotion.matches &&
            finePointer.matches &&
            window.innerWidth >= 900;
    }

    function paintCursor() {
        if (!cursorGlow) return;
        cursorGlow.style.transform = 'translate3d(' + glowX.toFixed(2) + 'px,' + glowY.toFixed(2) + 'px,0)';
    }

    function cursorStep(now) {
        cursorFrame = null;

        var dt = Math.min(Math.max((now - cursorTime) / 16.667, 0.5), 3);
        cursorTime = now;

        var easeGlow = 1 - Math.pow(1 - 0.14, dt);

        glowX += (pointerX - glowX) * easeGlow;
        glowY += (pointerY - glowY) * easeGlow;

        paintCursor();

        if (Math.abs(pointerX - glowX) > 0.15 || Math.abs(pointerY - glowY) > 0.15) {
            cursorFrame = window.requestAnimationFrame(cursorStep);
        }
    }

    function startCursorLoop() {
        if (cursorFrame || !cursorAllowed()) return;
        cursorTime = window.performance && window.performance.now ? window.performance.now() : Date.now();
        cursorFrame = window.requestAnimationFrame(cursorStep);
    }

    /* Fade the light out without bringing the system cursor back. */
    function hideAura() {
        if (cursorFrame) {
            window.cancelAnimationFrame(cursorFrame);
            cursorFrame = null;
        }
        cursorActive = false;
        root.classList.remove('cursor-hot', 'cursor-down');
        if (cursorGlow) cursorGlow.classList.remove('is-on');
    }

    function enableCursor() {
        if (!cursorAllowed()) return;
        root.classList.add('has-cursor');
    }

    function disableCursor() {
        hideAura();
        root.classList.remove('has-cursor');
    }

    function syncCursor() {
        if (cursorAllowed()) {
            enableCursor();
        } else {
            disableCursor();
        }
    }

    if (cursorGlow) {
        /* Hide the system cursor up front, before the first movement. */
        syncCursor();

        document.addEventListener('pointermove', function (event) {
            if (event.pointerType === 'touch' || !cursorAllowed()) return;

            pointerX = event.clientX;
            pointerY = event.clientY;

            if (!cursorActive) {
                cursorActive = true;
                glowX = pointerX;
                glowY = pointerY;
                cursorGlow.classList.add('is-on');
            }

            /* Paint immediately so the aura tracks the pointer even when
               animation frames are throttled, then let rAF ease the trail. */
            glowX += (pointerX - glowX) * 0.18;
            glowY += (pointerY - glowY) * 0.18;
            paintCursor();

            startCursorLoop();
        }, { passive: true });

        document.addEventListener('pointerover', function (event) {
            if (!cursorActive) return;
            var target = event.target;
            var hot = target && target.closest ? target.closest(hotSelector) : null;
            root.classList.toggle('cursor-hot', !!hot);
        }, { passive: true });

        document.addEventListener('pointerout', function (event) {
            if (!cursorActive) return;
            var next = event.relatedTarget;
            if (next && next.closest && next.closest(hotSelector)) return;
            root.classList.remove('cursor-hot');
        }, { passive: true });

        document.addEventListener('pointerdown', function () {
            if (cursorActive) root.classList.add('cursor-down');
        }, { passive: true });

        document.addEventListener('pointerup', function () {
            root.classList.remove('cursor-down');
        }, { passive: true });

        document.addEventListener('mouseleave', hideAura);
        window.addEventListener('blur', hideAura);
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) hideAura();
        });

        window.addEventListener('resize', syncCursor);

        if (finePointer.addEventListener) finePointer.addEventListener('change', syncCursor);
        if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', syncCursor);
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
