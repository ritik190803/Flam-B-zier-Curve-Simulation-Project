🕸️ Interactive Bézier Curve Simulation
Where math meets art in the browser.

This project is a visual playground designed to demystify cubic Bézier curves. Instead of dry textbook formulas, it treats the curve like a living, breathing object—a springy rope that reacts to physics and user input. It's a simple yet powerful demonstration of how core mathematical principles can create organic, fluid motion on the web.

🔗 Live Demo (Replace with your actual link)

🚀 How It Works
At its core, this simulation visualizes a Cubic Bézier Curve. This curve is defined by four points:

Anchors (P₀ & P₃): The fixed start and end points of the "rope."

Controls (P₁ & P₂): The invisible magnets that pull the curve toward them, defining its shape.

The Two Engines
The project runs on two distinct systems working in harmony:

📐 The Math Engine (math.js): Calculates the precise path of the curve using the cubic Bézier formula. It also calculates the "tangent" (slope) at any given point to draw the yellow guide lines, giving you a peek into the curve's geometry.

⚛️ The Physics Engine (physics.js): This is what makes it feel alive. Instead of moving linearly, the control points are treated like physical objects attached to springs. They have mass, velocity, and damping (friction). When they move, they accelerate and settle smoothly rather than snapping instantly into place.

🎮 Controls & Modes
The simulation features two modes to explore the curve in different ways. You can toggle these from the sidebar.

1. Auto Mode (Default)
The Vibe: Playful & Dynamic.

What happens: The physics engine is fully active. The control points (P1 and P2) react to your mouse position dynamically, creating a "wind-like" effect.

Try this: Move your mouse quickly across the screen and watch the curve "whip" and settle like a slack rope.

2. Manual Mode
The Vibe: Precise & Architectural.

What happens: Physics are disabled. The curve freezes, allowing you to click and drag the control points (P1 and P2) to specific locations.

Why use it: This is perfect for understanding exactly how placing a control point here affects the curve there. It turns the simulation into a drawing tool.

Sidebar Settings
Line Length: Adjusts the distance between the two anchor points.

Tangent Length: Changes the visual length of the yellow tangent lines (the "derivative" indicators).

🛠️ Tech Stack
Canvas API (HTML5): Used for all rendering (lines, points, gradients).

Vanilla JavaScript (ES6+): No heavy frameworks.

main.js: Handles the animation loop, input events, and rendering.

math.js: Pure mathematical functions for vectors and Bézier calculations.

physics.js: A custom, lightweight Euler integration physics solver.

🧮 A Peek at the Code
If you're curious about the math, check out math.js. The curve is plotted using this specific interpolation formula:

JavaScript

// B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
const x = mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x;
And the physics in physics.js uses a classic Spring-Damper model:

JavaScript

// Spring Force pulls point to target
const forceSpring = Vec2.scale(displacement, -this.k);

// Damping Force resists motion (friction)
const forceDamp = Vec2.scale(this.vel, -this.damping);
📦 Running Locally
Clone the repo

Bash

git clone https://github.com/ritik190803/Flam-B-zier-Curve-Simulation-Project.git
Open it up Simply open index.html in your browser. No build steps or servers required!

📝 License
This project is open source. Feel free to use the code for learning, art, or your own projects!

