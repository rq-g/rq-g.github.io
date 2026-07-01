document.addEventListener('DOMContentLoaded', function() {
    const sphereContainer = document.getElementById('sphereContainer');
    const sphere = document.getElementById('sphere');
    if (!sphereContainer || !sphere) return;

    const tags = document.querySelectorAll('.tag-item');
    const totalTags = tags.length;
    
    let rotationX = -20;
    let rotationY = 0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let autoRotate = true;
    let animationId = null;
    let scale = 1;

    // 根据屏幕宽度动态设置球体半径
    function getSphereRadius() {
        const width = window.innerWidth;
        if (width <= 480) return 90;
        if (width <= 768) return 115;
        return 270;
    }

    let SPHERE_RADIUS = getSphereRadius();
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

    function initSphere() {
        tags.forEach((tag, index) => {
            const phi = Math.acos(-1 + (2 * index) / totalTags);
            const theta = GOLDEN_ANGLE * index;

            const x = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta);
            const y = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta);
            const z = SPHERE_RADIUS * Math.cos(phi);

            // 使用 translate(-50%, -50%) 让标签以中心点为基准，再进行 3D 变换
            tag.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px)`;
            tag.dataset.x = x;
            tag.dataset.y = y;
            tag.dataset.z = z;

            const scaleFactor = 0.7 + (0.3 * (z + SPHERE_RADIUS)) / (2 * SPHERE_RADIUS);
            tag.style.opacity = 0.3 + (0.7 * (z + SPHERE_RADIUS)) / (2 * SPHERE_RADIUS);
            tag.style.fontSize = `${12 * scaleFactor}px`;
        });
        startAutoRotate();
    }

    function updateRotation() {
        sphere.style.transform = `scale(${scale})`;
        
        tags.forEach(tag => {
            const x = parseFloat(tag.dataset.x);
            const y = parseFloat(tag.dataset.y);
            const z = parseFloat(tag.dataset.z);
            
            const cosX = Math.cos(rotationX * Math.PI / 180);
            const sinX = Math.sin(rotationX * Math.PI / 180);
            const cosY = Math.cos(rotationY * Math.PI / 180);
            const sinY = Math.sin(rotationY * Math.PI / 180);

            const newX = x * cosY + z * sinY;
            const newZ = -x * sinY + z * cosY;
            const newY = y * cosX - newZ * sinX;
            const finalZ = y * sinX + newZ * cosX;

            const scaleFactor = 0.7 + (0.3 * (finalZ + SPHERE_RADIUS)) / (2 * SPHERE_RADIUS);
            const opacity = 0.3 + (0.7 * (finalZ + SPHERE_RADIUS)) / (2 * SPHERE_RADIUS);
            const zIndex = Math.floor(finalZ + SPHERE_RADIUS);

            tag.style.opacity = opacity;
            tag.style.transform = `translate(-50%, -50%) translate3d(${newX}px, ${newY}px, ${finalZ}px) scale(${scaleFactor * scale})`;
            tag.style.zIndex = zIndex;
        });
    }

    function startAutoRotate() {
        if (animationId) cancelAnimationFrame(animationId);
        
        function animate() {
            if (autoRotate) {
                rotationY += 0.3;
                updateRotation();
            }
            animationId = requestAnimationFrame(animate);
        }
        animate();
    }

    function stopAutoRotate() {
        autoRotate = false;
    }

    function resumeAutoRotate() {
        autoRotate = true;
    }

    sphereContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        stopAutoRotate();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;

        rotationY += deltaX * 0.5;
        rotationX -= deltaY * 0.5;

        rotationX = Math.max(-90, Math.min(90, rotationX));

        updateRotation();

        lastX = e.clientX;
        lastY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            setTimeout(resumeAutoRotate, 2000);
        }
    });

    sphereContainer.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            setTimeout(resumeAutoRotate, 2000);
        }
    });

    sphereContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        scale = Math.max(0.5, Math.min(2, scale + delta));
        updateRotation();
    }, { passive: false });

    tags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            stopAutoRotate();
        });

        tag.addEventListener('mouseleave', () => {
            if (!isDragging) {
                setTimeout(resumeAutoRotate, 1000);
            }
        });
    });

    // 响应式支持：窗口大小改变时重新初始化
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newRadius = getSphereRadius();
            if (newRadius !== SPHERE_RADIUS) {
                SPHERE_RADIUS = newRadius;
                initSphere();
            }
        }, 250);
    });

    initSphere();
});