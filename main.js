// =============================================
// THEME TOGGLE (Light / Dark Mode)
// =============================================
const html = document.documentElement;

function applyTheme(theme) {
    if (theme === 'light') {
        html.classList.add('light');
    } else {
        html.classList.remove('light');
    }
    // Update navbar scroll bg
    updateNavbarBg();
}

function toggleTheme() {
    const isLight = html.classList.contains('light');
    const next = isLight ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    applyTheme(next);
}

// On load: apply saved theme or system preference
(function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        applyTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        applyTheme('light');
    }
})();

// =============================================
// TYPING EFFECT
// =============================================
const roles = [
    ".NET Full-Stack Developer",
    "ASP.NET Core Specialist",
    ".NET MAUI Developer",
    "LGU Solutions Architect"
];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingElement = document.getElementById('typing-text');

function typeEffect() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
        typingElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentRole.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 500;
    }

    setTimeout(typeEffect, typeSpeed);
}

typeEffect();

// =============================================
// MOBILE MENU TOGGLE
// =============================================
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// =============================================
// NAVBAR SCROLL EFFECT
// =============================================
let lastScroll = 0;
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

function updateNavbarBg() {
    const isLight = html.classList.contains('light');
    if (window.pageYOffset > 50) {
        navbar.classList.add('shadow-lg');
        if (isLight) {
            navbar.style.backgroundColor = 'rgba(248,250,252,0.95)';
        } else {
            navbar.style.backgroundColor = 'rgba(2,6,23,0.95)';
        }
    } else {
        navbar.classList.remove('shadow-lg');
        navbar.style.backgroundColor = '';
    }
}

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    updateNavbarBg();

    if (currentScroll > 500) {
        backToTop.classList.remove('translate-y-20', 'opacity-0');
    } else {
        backToTop.classList.add('translate-y-20', 'opacity-0');
    }

    lastScroll = currentScroll;
});

// =============================================
// SMOOTH SCROLL
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('mobile-menu').classList.add('hidden');
        }
    });
});

// =============================================
// INTERSECTION OBSERVER (Fade-in)
// =============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            entry.target.style.opacity = '1';
        }
    });
}, observerOptions);

document.querySelectorAll('.hover-card').forEach((el) => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Footer year
document.getElementById('footer-year').textContent =
    `© ${new Date().getFullYear()} Jandel L. Escalera. All rights reserved.`;