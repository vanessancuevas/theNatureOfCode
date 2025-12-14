const logo = document.getElementById('logo');
const container = document.getElementById('container');

// Initial position and velocity (slowed down)
let x = Math.random() * (window.innerWidth - 200);
let y = Math.random() * (window.innerHeight - 100);
let dx = 1 + Math.random() * 0.5; // Speed between 1-1.5 pixels (slowed down)
let dy = 1 + Math.random() * 0.5;

// Color array for changing colors on bounce
const colors = [
    '#E50914', // Netflix Red
    '#FF6B6B', // Light Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#FFD93D', // Yellow
    '#6BCF7F', // Green
    '#A8E6CF', // Light Green
    '#FF6F91', // Pink
    '#C7CEEA', // Lavender
    '#B4A7D6'  // Purple
];

let currentColor = colors[0];
let hueRotation = 120; // Start with a green/cyan color

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomHue() {
    return Math.floor(Math.random() * 360);
}

function animate() {
    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const logoWidth = logo.clientWidth;
    const logoHeight = logo.clientHeight;

    // Update position
    x += dx;
    y += dy;

    // Check for collision with walls
    if (x + logoWidth >= containerWidth) {
        x = containerWidth - logoWidth;
        dx = -dx;
        hueRotation = getRandomHue();
    } else if (x <= 0) {
        x = 0;
        dx = -dx;
        hueRotation = getRandomHue();
    }

    if (y + logoHeight >= containerHeight) {
        y = containerHeight - logoHeight;
        dy = -dy;
        hueRotation = getRandomHue();
    } else if (y <= 0) {
        y = 0;
        dy = -dy;
        hueRotation = getRandomHue();
    }

    // Apply position and color using filter
    logo.style.left = x + 'px';
    logo.style.top = y + 'px';
    logo.style.filter = `hue-rotate(${hueRotation}deg) saturate(150%) brightness(1)`;

    requestAnimationFrame(animate);
}

// Handle window resize
window.addEventListener('resize', () => {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const logoWidth = logo.clientWidth;
    const logoHeight = logo.clientHeight;

    // Keep logo within bounds after resize
    if (x + logoWidth > containerWidth) x = containerWidth - logoWidth;
    if (y + logoHeight > containerHeight) y = containerHeight - logoHeight;
});

// Set initial position and color immediately
logo.style.left = x + 'px';
logo.style.top = y + 'px';
logo.style.filter = `hue-rotate(${hueRotation}deg) saturate(150%) brightness(1)`;

// Start animation
animate();