// Initialize Lucide Icons
lucide.createIcons();

// Typing Effect
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

// Start typing effect
typeEffect();

// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Navbar background
    if (currentScroll > 50) {
        navbar.classList.add('shadow-lg');
        navbar.classList.add('bg-slate-900/95');
    } else {
        navbar.classList.remove('shadow-lg');
        navbar.classList.remove('bg-slate-900/95');
    }

    // Back to top button
    if (currentScroll > 500) {
        backToTop.classList.remove('translate-y-20', 'opacity-0');
    } else {
        backToTop.classList.add('translate-y-20', 'opacity-0');
    }

    lastScroll = currentScroll;
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            document.getElementById('mobile-menu').classList.add('hidden');
        }
    });
});

// Intersection Observer for fade-in animations
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

// Observe elements
document.querySelectorAll('.hover-card').forEach((el) => {
    el.style.opacity = '0';
    observer.observe(el);
});