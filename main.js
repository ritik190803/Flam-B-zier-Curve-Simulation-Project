const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoPanel = document.getElementById('info-panel');
const controlModeInput = document.getElementById('control-mode');
const lineLengthInput = document.getElementById('line-length');
const tangentLengthInput = document.getElementById('tangent-length');

// --- Global State ---
let animationFrameId = null;
let lastTime = 0;

// --- Configuration ---
const CONFIG = {
    steps: 100,
    tangentInterval: 10,
    tangentLength: 100,
    stiffness: 80,   // Internal value for auto mode
    damping: 10,     // Internal value for auto mode
    lineLength: 200,
    controlMode: 'auto' // 'auto' or 'manual'
};

// --- Event Listeners ---
lineLengthInput.addEventListener('input', (e) => {
    CONFIG.lineLength = parseFloat(e.target.value);
    resetAndStart();
});

tangentLengthInput.addEventListener('input', (e) => {
    CONFIG.tangentLength = parseFloat(e.target.value);
    if (CONFIG.controlMode === 'manual') {
        draw(); // Redraw static image with new tangent length
    }
});

controlModeInput.addEventListener('change', (e) => {
    CONFIG.controlMode = e.target.value;
    resetAndStart();
});

// --- State Objects ---
let dimensions = {
    width: window.innerWidth - 350,
    height: window.innerHeight
};

const state = {
    p0: { x: 0, y: 0 },
    p3: { x: 0, y: 0 },
    p1: null,
    p2: null
};

const mouse = { x: 0, y: 0 };
let isDragging = false;
let draggedPoint = null;

// --- Core Functions ---

function resetAndStart() {
    // Stop any existing animation loop
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    lastTime = 0;

    // Reset canvas and anchor points
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    state.p0 = { x: cx - CONFIG.lineLength / 2, y: cy };
    state.p3 = { x: cx + CONFIG.lineLength / 2, y: cy };

    // Initialize control points based on mode
    if (CONFIG.controlMode === 'auto') {
        state.p1 = new SpringPoint(state.p0.x, state.p0.y - 100, CONFIG.stiffness, CONFIG.damping);
        state.p2 = new SpringPoint(state.p3.x, state.p3.y - 100, CONFIG.stiffness, CONFIG.damping);
    } else { // Manual mode
        // Use simple objects, not SpringPoints
        state.p1 = { pos: { x: state.p0.x + 50, y: state.p0.y - 50 } };
        state.p2 = { pos: { x: state.p3.x - 50, y: state.p3.y + 50 } };
    }

    // Start the appropriate loop/draw
    if (CONFIG.controlMode === 'auto') {
        animationFrameId = requestAnimationFrame(animate);
    } else {
        draw(); // Draw a single static frame for manual mode
    }
}

function init() {
    resetAndStart();
}

// --- Animation Loop (for Auto Mode) ---
function animate(time) {
    // Ensure the loop only runs in auto mode
    if (CONFIG.controlMode !== 'auto') {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        return;
    }

    if (!lastTime) lastTime = time;
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    const safeDt = Math.min(dt, 0.1);

    // Update physics
    state.p1.update(safeDt);
    state.p2.update(safeDt);

    // Render the scene
    draw();

    // Continue the loop
    animationFrameId = requestAnimationFrame(animate);
}

// --- Static Drawing Function (for both modes) ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();


    const { p0, p1, p2, p3 } = state;

    // Draw Curve
    const gradient = ctx.createLinearGradient(p0.x, p0.y, p3.x, p3.y);
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, '#00ffff');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);

    const stepSize = 1 / CONFIG.steps;
    for (let i = 0; i <= CONFIG.steps; i++) {
        const t = i * stepSize;
        const pt = BezierMath.getPoint(t, p0, p1.pos, p2.pos, p3);
        ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Draw Handles
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#888';

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.pos.x, p1.pos.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p2.pos.x, p2.pos.y);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw Tangents
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    for (let i = 1; i < CONFIG.steps; i += CONFIG.tangentInterval) {
        const t = i * stepSize;
        const origin = BezierMath.getPoint(t, p0, p1.pos, p2.pos, p3);
        const dir = BezierMath.getTangent(t, p0, p1.pos, p2.pos, p3);

        const start = Vec2.sub(origin, Vec2.scale(dir, CONFIG.tangentLength / 2));
        const end = Vec2.add(origin, Vec2.scale(dir, CONFIG.tangentLength / 2));

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    // Draw Control Points
    ctx.fillStyle = '#ff00ff';
    [p1, p2].forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.pos.x, pt.pos.y, 6, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Start and End Points
    ctx.fillStyle = '#ffffff';
    [p0, p3].forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Update Info Panel
    updateInfoPanel();
}

function updateInfoPanel() {
    const { p0, p1, p2, p3 } = state;
    let t = (mouse.x - p0.x) / (p3.x - p0.x);
    t = Math.max(0, Math.min(1, t));

    const pt = BezierMath.getPoint(t, p0, p1.pos, p2.pos, p3);
    const tan = BezierMath.getTangent(t, p0, p1.pos, p2.pos, p3);

    infoPanel.innerHTML = `
        <div class="section">
            <div class="section-title">Control Points</div>
            <div class="grid-row">
                <span class="label">P0:</span> <span>(${Math.round(p0.x)}, ${Math.round(p0.y)})</span>
            </div>
            <div class="grid-row">
                <span class="label">P1:</span> <span>(${Math.round(p1.pos.x)}, ${Math.round(p1.pos.y)})</span>
            </div>
            <div class="grid-row">
                <span class="label">P2:</span> <span>(${Math.round(p2.pos.x)}, ${Math.round(p2.pos.y)})</span>
            </div>
            <div class="grid-row">
                <span class="label">P3:</span> <span>(${Math.round(p3.x)}, ${Math.round(p3.y)})</span>
            </div>
        </div>

        <div class="section">
            <div class="cursor-title">Cursor (t ≈ ${t.toFixed(2)})</div>
            <div class="grid-row-cursor">
                <span class="label">Pos:</span> <span>(${Math.round(pt.x)}, ${Math.round(pt.y)})</span>
            </div>
            <div class="grid-row-cursor">
                <span class="label">Tan:</span> <span>(${tan.x.toFixed(2)}, ${tan.y.toFixed(2)})</span>
            </div>
            <div class="grid-row-cursor">
                <span class="label">Angle:</span> <span>${(Math.atan2(tan.y, tan.x) * 180 / Math.PI).toFixed(1)}°</span>
            </div>
        </div>
    `;
}

// --- Event Handlers ---
window.addEventListener('resize', () => {
    dimensions.width = window.innerWidth - 350;
    dimensions.height = window.innerHeight;
    resetAndStart();
});

canvas.addEventListener('mousedown', (e) => {
    if (CONFIG.controlMode !== 'manual') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const distP1 = Vec2.mag(Vec2.sub({x, y}, state.p1.pos));
    const distP2 = Vec2.mag(Vec2.sub({x, y}, state.p2.pos));
    const hitRadius = 20;

    if (distP1 < hitRadius) {
        isDragging = true;
        draggedPoint = state.p1;
    } else if (distP2 < hitRadius) {
        isDragging = true;
        draggedPoint = state.p2;
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    draggedPoint = null;
});

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    mouse.x = mouseX;
    mouse.y = mouseY;

    if (CONFIG.controlMode === 'auto') {
        // In auto mode, update physics targets with the logic from the React example
        state.p1.target = { x: mouseX, y: mouseY };
        state.p2.target = { x: mouseX + 200, y: dimensions.height - mouseY };
        canvas.style.cursor = 'crosshair';
    } else { // Manual mode
        const distP1 = Vec2.mag(Vec2.sub(mouse, state.p1.pos));
        const distP2 = Vec2.mag(Vec2.sub(mouse, state.p2.pos));

        if (!isDragging) {
            canvas.style.cursor = (distP1 < 20 || distP2 < 20) ? 'grab' : 'default';
        } else {
            canvas.style.cursor = 'grabbing';
        }

        if (isDragging && draggedPoint) {
            draggedPoint.pos = { x: mouseX, y: mouseY };
            draw(); // Redraw static scene on drag
        }
    }
});

// --- Initial Load ---
init();

