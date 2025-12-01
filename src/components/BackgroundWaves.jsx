import React, { useEffect, useRef } from 'react';

const BackgroundWaves = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let width, height;
        let particles = [];

        // Configuration for the "floor" of dots
        const rows = 50;
        const cols = 50;
        const spacing = 40; // Space between dots

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    particles.push({
                        x: j * spacing - (cols * spacing) / 2, // Center horizontally
                        z: i * spacing, // Depth
                        y: 0, // Base height
                        initialX: j * spacing - (cols * spacing) / 2,
                        initialZ: i * spacing,
                        phase: (i * 0.2) + (j * 0.1) // Wave phase offset
                    });
                }
            }
        };

        const draw = (time) => {
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, width, height);

            const t = time * 0.001; // Time scale

            // Camera/Perspective settings
            const fov = 300;
            const cameraY = -150; // Keep camera height
            const cameraZ = -100;
            const centerY = height + 38; // Move waves down by ~1cm (38px)
            const centerX = width / 2;

            particles.forEach(p => {
                // Animate Y position (Wave effect)
                // Restore dynamic waves
                p.y = Math.sin(p.initialX * 0.01 + p.initialZ * 0.02 + t) * 30 +
                    Math.cos(p.initialZ * 0.03 + t * 0.5) * 20;

                // 3D Projection
                const scale = fov / (fov + p.z + cameraZ);
                const x2d = (p.x) * scale + centerX;
                const y2d = (p.y + cameraY) * scale + centerY;

                // Only draw if visible and reasonably sized
                if (scale > 0) {
                    const alpha = Math.min(1, scale * 1.5); // Fade out in distance
                    const size = Math.max(0.5, 3 * scale); // Size based on distance

                    ctx.beginPath();
                    ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`; // Purple dots
                    ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw(0);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
                opacity: 0.8
            }}
        />
    );
};

export default BackgroundWaves;
