// math.js

const Vec2 = {
    add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
    sub: (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),
    scale: (v, s) => ({ x: v.x * s, y: v.y * s }),
    mag: (v) => Math.sqrt(v.x * v.x + v.y * v.y),
    normalize: (v) => {
        const m = Math.sqrt(v.x * v.x + v.y * v.y);
        return m === 0 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
    }
};

const BezierMath = {
    // Formula: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
    getPoint: (t, p0, p1, p2, p3) => {
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;

        const x = mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x;
        const y = mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y;
        return { x, y };
    },

    // Derivative: B'(t) = 3(1-t)²(P1-P0) + 6(1-t)t(P2-P1) + 3t²(P3-P2)
    getTangent: (t, p0, p1, p2, p3) => {
        const mt = 1 - t;
        const term1 = Vec2.scale(Vec2.sub(p1, p0), 3 * mt * mt);
        const term2 = Vec2.scale(Vec2.sub(p2, p1), 6 * mt * t);
        const term3 = Vec2.scale(Vec2.sub(p3, p2), 3 * t * t);

        const tangent = Vec2.add(Vec2.add(term1, term2), term3);
        return Vec2.normalize(tangent);
    }
};

