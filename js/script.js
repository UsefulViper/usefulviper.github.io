// Mobile navigation toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close menu when clicking on a nav link
const navItems = document.querySelectorAll('.nav-links a');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Theme switcher
const toggleSwitch = document.querySelector('#checkbox');
const themeIcons = document.querySelectorAll('.theme-icon i');

// Create a custom event for theme changes
const themeChangeEvent = new Event('themeChange');

// Check for saved theme preference or default to light theme
function initTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleSwitch.checked = true;
        updateThemeIcons('dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        toggleSwitch.checked = false;
        updateThemeIcons('light');
    }
    
    // Dispatch theme change event on initialization
    document.dispatchEvent(themeChangeEvent);
}

// Function to update theme icon colors
function updateThemeIcons(theme) {
    if (theme === 'dark') {
        themeIcons[0].style.color = '#777'; // Dim sun icon
        themeIcons[1].style.color = '#ffeb3b'; // Bright moon icon
    } else {
        themeIcons[0].style.color = '#ffc107'; // Bright sun icon
        themeIcons[1].style.color = '#777'; // Dim moon icon
    }
}

// Switch theme function
function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateThemeIcons('dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateThemeIcons('light');
    }
    
    // Dispatch theme change event
    document.dispatchEvent(themeChangeEvent);
}

// Event listener for theme toggle
toggleSwitch.addEventListener('change', switchTheme);

// Initialize theme
document.addEventListener('DOMContentLoaded', initTheme);

// Make switchTheme function globally available
window.switchTheme = switchTheme;

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, // Adjust for header height
                behavior: 'smooth'
            });
        }
    });
});

// Scroll to top button
const scrollBtn = document.createElement('div');
scrollBtn.classList.add('scroll-top-btn');
scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
document.body.appendChild(scrollBtn);

scrollBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Show/hide scroll to top button
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollBtn.classList.add('show');
    } else {
        scrollBtn.classList.remove('show');
    }
});

// Add scroll indicator on page
const scrollIndicator = document.createElement('div');
scrollIndicator.classList.add('scroll-indicator');
document.body.appendChild(scrollIndicator);

window.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight;
    const fullHeight = document.body.scrollHeight;
    const scrolled = window.scrollY;
    
    const scrollPercent = (scrolled / (fullHeight - windowHeight)) * 100;
    scrollIndicator.style.width = `${scrollPercent}%`;
});

// Animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 50) {
            element.classList.add('animated');
        }
    });
};

// Add the animation class to elements that should animate
window.addEventListener('DOMContentLoaded', () => {
    // Add animation classes to elements
    document.querySelectorAll('.project-card, .skill-category, .contact-item').forEach(el => {
        el.classList.add('animate-on-scroll');
    });
    
    // Initial check for animations
    animateOnScroll();
    
    // Check for animations on scroll
    window.addEventListener('scroll', animateOnScroll);
});

// Add CSS for the new elements
const style = document.createElement('style');
style.textContent = `
    .scroll-top-btn {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: var(--primary-color);
        color: white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s, transform 0.3s;
        z-index: 999;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    .scroll-top-btn.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .scroll-indicator {
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        background-color: var(--primary-color);
        z-index: 1001;
        width: 0;
    }
    
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s, transform 0.6s;
    }
    
    .animate-on-scroll.animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    .hamburger.active span:nth-child(1) {
        transform: translateY(9px) rotate(45deg);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: translateY(-9px) rotate(-45deg);
    }
`;
document.head.appendChild(style); 