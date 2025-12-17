// physics.js

class SpringPoint {
    constructor(x, y, k, damping) {
        this.pos = { x, y };      // Current Position
        this.target = { x, y };   // Target Position (Input)
        this.vel = { x: 0, y: 0 }; // Velocity
        this.k = k;               // Stiffness
        this.damping = damping;   // Damping factor
        this.trail = [];          // Motion Trail
    }

    update(dt) {
        // Spring Force: F = -k * (pos - target)
        const displacement = Vec2.sub(this.pos, this.target);
        const forceSpring = Vec2.scale(displacement, -this.k);

        // Damping Force: F = -damping * velocity
        const forceDamp = Vec2.scale(this.vel, -this.damping);

        // Total acceleration (assuming mass = 1, so F = a)
        const accel = Vec2.add(forceSpring, forceDamp);

        // Euler Integration
        // Update velocity: v = v + a * dt
        this.vel = Vec2.add(this.vel, Vec2.scale(accel, dt));
        // Update position: p = p + v * dt
        this.pos = Vec2.add(this.pos, Vec2.scale(this.vel, dt));

        // Update Trail
        this.trail.push({ x: this.pos.x, y: this.pos.y });
        if (this.trail.length > 20) {
            this.trail.shift();
        }
    }
}
