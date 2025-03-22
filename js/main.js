// Create floating shapes
function createShapes() {
    const shapes = document.getElementById('shapes');
    const numShapes = 15;

    for (let i = 0; i < numShapes; i++) {
        const shape = document.createElement('div');
        shape.className = 'shape';
        
        // Random size between 50px and 200px
        const size = Math.random() * 150 + 50;
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        
        // Random position
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.top = `${Math.random() * 100}%`;
        
        // Random animation
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * -20;
        
        shape.style.animation = `
            float ${duration}s ${delay}s infinite linear,
            pulse ${Math.random() * 5 + 2}s infinite ease-in-out
        `;
        
        shapes.appendChild(shape);
    }
}

// Implement smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Initialize
createShapes();

// Add scroll animation for nav
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 100) {
        nav.style.transform = 'translateY(-100%)';
    } else {
        nav.style.transform = 'translateY(0)';
    }
    lastScroll = currentScroll;
});