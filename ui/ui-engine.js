AFRAME.registerComponent('glass-panel', {
    schema: {
        width: { type: 'number', default: 1 },
        height: { type: 'number', default: 0.6 },
        opacity: { type: 'number', default: 0.15 },
        color: { type: 'color', default: '#020408' }, // Deeper, more premium glass
        borderColor: { type: 'color', default: '#ffffff' }, // Subtle white border
        header: { type: 'string', default: '' },
        rounded: { type: 'boolean', default: true },
        specular: { type: 'boolean', default: true }
    },
    init: function () {
        const el = this.el;
        const data = this.data;

        // Background plane (Premium Glass Effect)
        const bg = document.createElement('a-plane');
        bg.setAttribute('width', data.width);
        bg.setAttribute('height', data.height);
        bg.setAttribute('material', {
            shader: 'flat',
            color: data.color,
            transparent: true,
            opacity: data.opacity,
            blending: 'normal' // Natural transparency
        });
        el.appendChild(bg);

        // Subtle White Border (Thin SF-style)
        const border = document.createElement('a-entity');
        border.setAttribute('geometry', {
            primitive: 'plane',
            width: data.width,
            height: data.height
        });
        border.setAttribute('material', {
            shader: 'flat',
            color: '#ffffff',
            transparent: true,
            opacity: 0.1,
            wireframe: true,
            wireframeLinewidth: 1
        });
        border.setAttribute('position', '0 0 0.005');
        el.appendChild(border);

        // Specular Reflection (Light sweep)
        if (data.specular) {
            const spec = document.createElement('a-plane');
            spec.setAttribute('width', data.width * 1.5);
            spec.setAttribute('height', 0.2);
            spec.setAttribute('position', '0 0 0.002');
            spec.setAttribute('rotation', '0 0 45');
            spec.setAttribute('material', {
                shader: 'flat',
                color: '#ffffff',
                transparent: true,
                opacity: 0.03,
                blending: 'additive'
            });
            el.appendChild(spec);
        }

        // Soft Outer Glow (Ambient reflection)
        if (data.rounded) {
            const glow = document.createElement('a-plane');
            glow.setAttribute('width', data.width + 0.1);
            glow.setAttribute('height', data.height + 0.1);
            glow.setAttribute('position', '0 0 -0.05');
            glow.setAttribute('material', {
                shader: 'flat',
                color: '#ffffff',
                transparent: true,
                opacity: 0.02,
                blending: 'additive'
            });
            el.appendChild(glow);
        }

        // Header (Refined typography)
        if (data.header) {
            const headerText = document.createElement('a-text');
            headerText.setAttribute('value', data.header);
            headerText.setAttribute('align', 'center');
            headerText.setAttribute('width', data.width * 1.5);
            headerText.setAttribute('position', `0 ${data.height / 2 - 0.1} 0.01`);
            headerText.setAttribute('color', '#ffffff');
            headerText.setAttribute('opacity', 0.6);
            headerText.setAttribute('font', 'https://cdn.aframe.io/fonts/Exo2Bold.fnt'); // Using available clean font
            el.appendChild(headerText);
        }

        // Interaction
        el.classList.add('raycastable');
        el.addEventListener('mouseenter', () => {
            bg.setAttribute('material', 'opacity', 0.25);
            el.setAttribute('scale', '1.02 1.02 1.02');
        });
        el.addEventListener('mouseleave', () => {
            bg.setAttribute('material', 'opacity', data.opacity);
            el.setAttribute('scale', '1 1 1');
        });
    }
});

AFRAME.registerComponent('ui-layout', {
    init: function () {
        const el = this.el;
        const panels = el.querySelectorAll('[glass-panel]');

        // Refined Spatial Layout: Center panel closest, sides angled and pushed back
        // 0: Top Nav, 1: Center, 2: Left Chat, 3: Right Next Up, 4: Bottom Dock
        const layout = [
            { x: 0, y: 0.8, z: -2.3, rx: 10, ry: 0 },    // Top Nav (Floating above)
            { x: 0, y: 0, z: -2.5, rx: 0, ry: 0 },      // Center Focus (Natural eye level)
            { x: -2.2, y: 0, z: -2.2, rx: 0, ry: 25 },  // Left Panel (Angled back)
            { x: 2.2, y: 0, z: -2.2, rx: 0, ry: -25 }, // Right Panel (Angled back)
            { x: 0, y: -0.85, z: -2.3, rx: -10, ry: 0 }  // Bottom Dock (Floating below)
        ];

        panels.forEach((panel, i) => {
            if (layout[i]) {
                panel.setAttribute('position', `${layout[i].x} ${layout[i].y} ${layout[i].z}`);
                panel.setAttribute('rotation', `${layout[i].rx} ${layout[i].ry} 0`);
            }
        });
    }
});
