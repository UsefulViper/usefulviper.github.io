// Organic Morphing Bubbles Background
class MorphingBackground {
    constructor() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.classList.add('background-canvas');

        // Insert canvas as the first element in the body
        document.body.insertBefore(this.canvas, document.body.firstChild);

        // Set canvas styles
        this.setCanvasStyles();
        
        // Initialize properties
        this.blobs = [];
        this.mouse = { 
            x: window.innerWidth / 2, 
            y: window.innerHeight / 2 
        };
        this.lastMouse = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        };
        this.isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
        this.mouseInfluence = 0.1; // Reduced from 0.15
        this.isMouseMoving = false;
        this.mouseTimeout = null;
        this.time = 0;
        this.blobCount = window.innerWidth < 768 ? 5 : 8;
        this.easing = 0.1; // Add easing factor for smooth transitions
        
        // Initialize
        this.init();
        
        // Start animation
        this.animate();
        
        // Add event listeners
        this.addEventListeners();
    }
    
    setCanvasStyles() {
        // Set canvas to full viewport size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Apply CSS styles
        Object.assign(this.canvas.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '-1',
            pointerEvents: 'none'
        });
    }
    
    init() {
        // Create blobs
        this.createBlobs();
    }
    
    createBlobs() {
        this.blobs = [];
        
        // Define color palettes for both themes
        const darkThemeColors = [
            { r: 65, g: 0, b: 128, a: 0.5 },     // Purple
            { r: 0, g: 80, b: 140, a: 0.5 },     // Blue
            { r: 140, g: 30, b: 70, a: 0.5 },    // Magenta
            { r: 0, g: 100, b: 100, a: 0.5 },    // Teal
            { r: 100, g: 50, b: 150, a: 0.5 }    // Lavender
        ];
        
        const lightThemeColors = [
            { r: 80, g: 120, b: 255, a: 0.6 },   // Brighter blue
            { r: 150, g: 100, b: 255, a: 0.6 },  // Vibrant purple
            { r: 255, g: 100, b: 150, a: 0.6 },  // Stronger pink
            { r: 80, g: 200, b: 170, a: 0.6 },   // Vibrant teal
            { r: 255, g: 150, b: 100, a: 0.6 }   // Brighter peach
        ];
        
        const colors = this.isDarkTheme ? darkThemeColors : lightThemeColors;
        
        // Create blobs
        for (let i = 0; i < this.blobCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Create a blob with multiple control points
            const size = Math.random() * 0.4 + 0.2; // 20% - 60% of screen height
            const baseRadius = this.canvas.height * size;
            const centerX = Math.random() * this.canvas.width;
            const centerY = Math.random() * this.canvas.height;
            const speed = Math.random() * 0.0005 + 0.0002;
            const pointCount = Math.floor(Math.random() * 3) + 6; // 6-8 points
            
            // Create control points around the circle
            const points = [];
            const radiusVariance = 0.3; // How much the radius can vary
            
            for (let j = 0; j < pointCount; j++) {
                const angle = (j / pointCount) * Math.PI * 2;
                const radius = baseRadius * (1 + (Math.random() * radiusVariance * 2 - radiusVariance));
                
                points.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    angle: angle,
                    speed: Math.random() * 0.002 + 0.001,
                    radius: radius,
                    radiusBase: radius,
                    radiusVariance: Math.random() * 0.2 + 0.1
                });
            }
            
            this.blobs.push({
                x: centerX,
                y: centerY,
                baseRadius: baseRadius,
                color: color,
                points: points,
                speed: speed,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.001,
                xMovement: Math.random() * 0.5 + 0.25,
                yMovement: Math.random() * 0.5 + 0.25
            });
        }
    }
    
    addEventListeners() {
        // Track mouse movement
        window.addEventListener('mousemove', (e) => {
            this.lastMouse.x = this.mouse.x;
            this.lastMouse.y = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // Set flag that mouse is moving
            this.isMouseMoving = true;
            
            // Clear any existing timeout
            if (this.mouseTimeout) {
                clearTimeout(this.mouseTimeout);
            }
            
            // Reset flag after mouse stops moving
            this.mouseTimeout = setTimeout(() => {
                this.isMouseMoving = false;
            }, 100);
        });
        
        // Handle touch events for mobile
        window.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                this.lastMouse.x = this.mouse.x;
                this.lastMouse.y = this.mouse.y;
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
                this.isMouseMoving = true;
                
                if (this.mouseTimeout) {
                    clearTimeout(this.mouseTimeout);
                }
                
                this.mouseTimeout = setTimeout(() => {
                    this.isMouseMoving = false;
                }, 100);
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.blobCount = window.innerWidth < 768 ? 5 : 8;
            
            // Update mouse center position on resize
            if (!this.isMouseMoving) {
                this.mouse.x = window.innerWidth / 2;
                this.mouse.y = window.innerHeight / 2;
                this.lastMouse.x = this.mouse.x;
                this.lastMouse.y = this.mouse.y;
            }
            
            this.createBlobs();
        });
        
        // Handle theme changes
        document.addEventListener('themeChange', () => {
            this.updateTheme();
        });
        
        // Create subtle auto-movement when mouse is not moving
        setInterval(() => {
            if (!this.isMouseMoving) {
                // Create gentle drifting effect
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const time = Date.now() / 5000; // Slow cycle
                
                // Gently move the mouse position in a circular pattern
                this.lastMouse.x = this.mouse.x;
                this.lastMouse.y = this.mouse.y;
                this.mouse.x = centerX + Math.sin(time) * centerX * 0.2;
                this.mouse.y = centerY + Math.cos(time) * centerY * 0.2;
            }
        }, 50);
    }
    
    updateTheme() {
        this.isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
        // Create new blobs with the theme-appropriate colors
        this.createBlobs();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Increment time value for animations
        this.time += 0.01;
        
        // Update and draw blobs
        this.updateBlobs();
        this.drawBlobs();
    }
    
    updateBlobs() {
        // Calculate interpolated mouse position for smoother movement
        const interpolatedX = this.lastMouse.x + (this.mouse.x - this.lastMouse.x) * this.easing;
        const interpolatedY = this.lastMouse.y + (this.mouse.y - this.lastMouse.y) * this.easing;
        
        // Update last mouse position using easing
        this.lastMouse.x = interpolatedX;
        this.lastMouse.y = interpolatedY;
        
        this.blobs.forEach(blob => {
            // Update blob position with slight movement and damping
            const targetX = blob.x + Math.sin(this.time * blob.xMovement) * 0.5;
            const targetY = blob.y + Math.cos(this.time * blob.yMovement) * 0.5;
            
            // Apply easing to blob position
            blob.x += (targetX - blob.x) * 0.05;
            blob.y += (targetY - blob.y) * 0.05;
            
            // Update rotation with easing
            blob.rotation += blob.rotationSpeed;
            
            // Update control points
            blob.points.forEach(point => {
                // Create organic movement of control points with eased transitions
                const radiusChange = Math.sin(this.time * point.speed + point.angle) * point.radiusVariance;
                const targetRadius = point.radiusBase * (1 + radiusChange);
                
                // Apply easing to radius changes
                point.radius += (targetRadius - point.radius) * 0.1;
                
                // Check if mouse is close to this point
                const worldX = blob.x + Math.cos(point.angle + blob.rotation) * point.radius;
                const worldY = blob.y + Math.sin(point.angle + blob.rotation) * point.radius;
                
                const dx = interpolatedX - worldX;
                const dy = interpolatedY - worldY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Apply smoother mouse influence with damping
                const maxDist = blob.baseRadius * 2.5; // Slightly larger detection area
                if (distance < maxDist) {
                    // Calculate influence with a smoothstep function for less abrupt changes
                    let influence = 1 - distance / maxDist;
                    influence = influence * influence * (3 - 2 * influence); // Smoothstep function
                    influence *= this.mouseInfluence;
                    
                    // Apply influence with easing for smoother transitions
                    const targetRadiusWithInfluence = point.radius + blob.baseRadius * influence;
                    point.radius += (targetRadiusWithInfluence - point.radius) * 0.15;
                }
            });
        });
    }
    
    drawBlobs() {
        // Draw blobs
        this.blobs.forEach(blob => {
            if (blob.points.length < 3) return;
            
            this.ctx.save();
            
            // Create gradient for each blob
            const gradient = this.ctx.createRadialGradient(
                blob.x, blob.y, 0,
                blob.x, blob.y, blob.baseRadius * 1.5
            );
            
            gradient.addColorStop(0, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${blob.color.a})`);
            gradient.addColorStop(1, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0)`);
            
            this.ctx.fillStyle = gradient;
            
            // Draw the blob as a closed path
            this.ctx.beginPath();
            
            // Start at the first point
            const firstPointAngle = blob.points[0].angle + blob.rotation;
            const firstPointRadius = blob.points[0].radius;
            const startX = blob.x + Math.cos(firstPointAngle) * firstPointRadius;
            const startY = blob.y + Math.sin(firstPointAngle) * firstPointRadius;
            
            this.ctx.moveTo(startX, startY);
            
            // Connect points with bezier curves for smooth shape
            for (let i = 0; i < blob.points.length; i++) {
                const point = blob.points[i];
                const nextPoint = blob.points[(i + 1) % blob.points.length];
                
                const currentAngle = point.angle + blob.rotation;
                const nextAngle = nextPoint.angle + blob.rotation;
                
                const currentX = blob.x + Math.cos(currentAngle) * point.radius;
                const currentY = blob.y + Math.sin(currentAngle) * point.radius;
                
                const nextX = blob.x + Math.cos(nextAngle) * nextPoint.radius;
                const nextY = blob.y + Math.sin(nextAngle) * nextPoint.radius;
                
                // Calculate control points for the bezier curve
                const cp1x = currentX + Math.cos(currentAngle + Math.PI/2) * point.radius * 0.5;
                const cp1y = currentY + Math.sin(currentAngle + Math.PI/2) * point.radius * 0.5;
                
                const cp2x = nextX - Math.cos(nextAngle + Math.PI/2) * nextPoint.radius * 0.5;
                const cp2y = nextY - Math.sin(nextAngle + Math.PI/2) * nextPoint.radius * 0.5;
                
                this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextX, nextY);
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.restore();
        });
        
        // Apply global blend mode - different for light vs dark theme
        this.ctx.globalCompositeOperation = this.isDarkTheme ? 'screen' : 'multiply';
    }
}

// Initialize the background when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const morphingBackground = new MorphingBackground();
    
    // Create a custom event for theme changes
    const themeChangeEvent = new Event('themeChange');
    
    // Modify the switchTheme function to dispatch the event
    const originalSwitchTheme = window.switchTheme;
    if (typeof originalSwitchTheme === 'function') {
        window.switchTheme = function(e) {
            originalSwitchTheme(e);
            document.dispatchEvent(themeChangeEvent);
        };
    }
}); 