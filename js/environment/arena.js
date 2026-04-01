AFRAME.registerComponent('concert-arena', {
    init: function () {
        const sceneEl = this.el.sceneEl || this.el;

        // 1. ARENA SHELL (Defining the indoor space)
        const arenaShell = document.createElement('a-entity');
        // Back wall
        const backWall = document.createElement('a-plane');
        backWall.setAttribute('width', 100);
        backWall.setAttribute('height', 50);
        backWall.setAttribute('position', '0 25 -50');
        backWall.setAttribute('material', 'color: #050505; roughness: 1; metalness: 0');
        arenaShell.appendChild(backWall);

        // Side walls
        for (let side of [-1, 1]) {
            const sideWall = document.createElement('a-plane');
            sideWall.setAttribute('width', 100);
            sideWall.setAttribute('height', 50);
            sideWall.setAttribute('position', `${side * 50} 25 0`);
            sideWall.setAttribute('rotation', `0 ${side * -90} 0`);
            sideWall.setAttribute('material', 'color: #030303; roughness: 1');
            arenaShell.appendChild(sideWall);
        }

        // Roof
        const roof = document.createElement('a-plane');
        roof.setAttribute('width', 100);
        roof.setAttribute('height', 100);
        roof.setAttribute('position', '0 50 0');
        roof.setAttribute('rotation', '90 0 0');
        roof.setAttribute('material', 'color: #020202; roughness: 1');
        arenaShell.appendChild(roof);

        sceneEl.appendChild(arenaShell);

        // 2. LIGHTING RIGS (Truss structures with glowing lights)
        for (let i = 0; i < 5; i++) {
            const zPos = -40 + i * 15;
            const truss = document.createElement('a-entity');
            truss.setAttribute('position', `0 20 ${zPos}`);
            
            // Horizontal bar
            const bar = document.createElement('a-box');
            bar.setAttribute('width', 80);
            bar.setAttribute('height', 0.2);
            bar.setAttribute('depth', 0.2);
            bar.setAttribute('color', '#111');
            truss.appendChild(bar);

            // Small glowing stage lights along the truss
            for (let j = 0; j < 10; j++) {
                const xPos = -35 + j * 7 + (Math.random() - 0.5) * 2;
                const lightSpot = document.createElement('a-sphere');
                lightSpot.setAttribute('radius', 0.15);
                lightSpot.setAttribute('position', `${xPos} -0.1 0`);
                const lightColor = (j % 2 === 0) ? '#4466ff' : '#8844ff';
                lightSpot.setAttribute('material', {
                    shader: 'flat',
                    color: lightColor,
                    emissive: lightColor,
                    emissiveIntensity: 3
                });
                truss.appendChild(lightSpot);
            }
            sceneEl.appendChild(truss);
        }

        // 3. IMPROVED VISIBLE CROWD
        for (let i = 0; i < 300; i++) {
            const crowd = document.createElement('a-entity');
            const x = (Math.random() - 0.5) * 80;
            const z = -5 - Math.random() * 45;
            const height = 1.6 + Math.random() * 0.3;
            
            crowd.setAttribute('geometry', `primitive: box; width: 0.4; height: ${height}; depth: 0.2`);
            // Lighter gray so they are visible against the dark walls
            const gray = 10 + Math.floor(Math.random() * 15);
            crowd.setAttribute('material', `color: rgb(${gray}, ${gray}, ${gray + 5}); roughness: 1`);
            crowd.setAttribute('position', `${x} ${height / 2} ${z}`);

            const head = document.createElement('a-sphere');
            head.setAttribute('radius', 0.16);
            head.setAttribute('color', `rgb(${gray}, ${gray}, ${gray + 5})`);
            head.setAttribute('position', `0 ${height / 2 + 0.1} 0`);
            crowd.appendChild(head);

            crowd.setAttribute('animation', {
                property: 'rotation',
                from: '0 0 -1',
                to: '0 0 1',
                dur: 1500 + Math.random() * 1000,
                dir: 'alternate',
                loop: true,
                easing: 'easeInOutSine'
            });

            sceneEl.appendChild(crowd);
        }

        // 4. INTENSE VOLUMETRIC BEAMS
        const createVolumetricBeam = (pos, color, rotation) => {
            const beamGroup = document.createElement('a-entity');
            beamGroup.setAttribute('position', pos);
            beamGroup.setAttribute('rotation', rotation);

            const core = document.createElement('a-cylinder');
            core.setAttribute('radius', 0.08);
            core.setAttribute('height', 100);
            core.setAttribute('material', {
                shader: 'flat',
                color: color,
                transparent: true,
                opacity: 0.6,
                blending: 'additive'
            });
            beamGroup.appendChild(core);

            const glow = document.createElement('a-cylinder');
            glow.setAttribute('radius', 1.5);
            glow.setAttribute('height', 100);
            glow.setAttribute('material', {
                shader: 'flat',
                color: color,
                transparent: true,
                opacity: 0.08,
                blending: 'additive'
            });
            beamGroup.appendChild(glow);

            beamGroup.setAttribute('animation', {
                property: 'rotation',
                from: `${rotation.x} ${rotation.y} ${rotation.z - 15}`,
                to: `${rotation.x} ${rotation.y} ${rotation.z + 15}`,
                dur: 4000 + Math.random() * 2000,
                dir: 'alternate',
                loop: true,
                easing: 'easeInOutSine'
            });

            sceneEl.appendChild(beamGroup);
        }

        const beamColors = ['#4466ff', '#8844ff', '#44aaff', '#9933ff'];
        for (let i = 0; i < 12; i++) {
            const xPos = -30 + i * 6;
            createVolumetricBeam(`${xPos} 30 -45`, beamColors[i % 4], { x: 50, y: 0, z: 0 });
        }

        // 5. ATMOSPHERIC PARTICLES
        for (let i = 0; i < 200; i++) {
            const part = document.createElement('a-sphere');
            part.setAttribute('radius', 0.01 + Math.random() * 0.04);
            const x = (Math.random() - 0.5) * 60;
            const y = Math.random() * 20;
            const z = -5 - Math.random() * 40;
            part.setAttribute('position', `${x} ${y} ${z}`);
            part.setAttribute('material', {
                color: '#fff',
                transparent: true,
                opacity: 0.3,
                blending: 'additive'
            });
            sceneEl.appendChild(part);
        }
    }
});
