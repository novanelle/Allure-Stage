AFRAME.registerComponent('glass-panel', {
    schema: {
        width: { type: 'number', default: 1 },
        height: { type: 'number', default: 0.6 },
        opacity: { type: 'number', default: 0.75 }, 
        color: { type: 'color', default: '#161616' }, 
        header: { type: 'string', default: '' },
    },

    init: function () {
        const data = this.data;
        const el = this.el;

        // Clean, borderless frosted backing
        const bg = document.createElement('a-plane');
        this.bg = bg;
        bg.setAttribute('width', data.width);
        bg.setAttribute('height', data.height);
        bg.setAttribute('position', '0 0 0');
        bg.setAttribute('material', {
            shader: 'flat',
            color: data.color,
            transparent: true,
            opacity: data.opacity,
            blending: 'normal'
        });
        el.appendChild(bg);

        // Minimal Header (Large clean text without complex background blocks)
        if (data.header) {
            const headerText = document.createElement('a-text');
            this.headerText = headerText;
            headerText.setAttribute('value', data.header);
            headerText.setAttribute('align', 'left');
            headerText.setAttribute('width', data.width * 1.5); 
            headerText.setAttribute('position', `${-data.width / 2 + 0.15} ${data.height / 2 - 0.15} 0.01`);
            headerText.setAttribute('color', '#ffffff');
            headerText.setAttribute('font', 'roboto');
            headerText.setAttribute('opacity', 1.0);
            el.appendChild(headerText);
        }
        el.classList.add('raycastable');
        el.addEventListener('mouseenter', () => {
            if (!this.isCollapsed) bg.setAttribute('material', 'opacity', 0.3);
        });
        el.addEventListener('mouseleave', () => {
            bg.setAttribute('material', 'opacity', data.opacity);
        });
    }
});

AFRAME.registerComponent('ui-layout', {
    init: function () {
        const el = this.el;
        let panels = Array.from(el.querySelectorAll('[glass-panel]'));
        
        // Exclude custom static and popup panels from auto-layout positioning logic
        panels = panels.filter(p => !['lyrics-panel', 'map-panel', 'merch-panel', 'wait-times-panel'].includes(p.id));

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

AFRAME.registerComponent('spotify-lyrics', {
    init: function () {
        this.lyrics = [
            "You know you love me",
            "I Know you care",
            "Just shout whenever",
            "And I'll be there",
            "You are my love",
            "You are my heart",
            "And we will never, ever, ever, be apart",
            "Are we an item? Girl quit playing",
            "We're just friends?",
            "What are you saying",
            "Said, There's another, and looked right in my eyes",
            "My first love broke my heart for the first time, and I was like",
            "Baby, baby, baby, oh"
        ];

        this.lines = [];
        this.currentIndex = 0;
        this.lineHeight = 0.16;

        this.container = document.createElement('a-entity');
        this.el.appendChild(this.container);

        this.lyrics.forEach((text, i) => {
            const line = document.createElement('a-text');
            line.setAttribute('value', text);
            line.setAttribute('align', 'center');
            line.setAttribute('width', 2.2);
            line.setAttribute('position', `0 ${-i * this.lineHeight} 0`);
            line.setAttribute('color', '#ffffff');
            line.setAttribute('font', 'roboto');
            line.setAttribute('opacity', 0.4);
            this.container.appendChild(line);
            this.lines.push(line);
        });

        this.updateHighlight();

        this.timer = setInterval(() => {
            this.currentIndex++;
            if (this.currentIndex >= this.lyrics.length) {
                this.currentIndex = 0;
            }
            this.updateHighlight();
        }, 2500);
    },

    updateHighlight: function () {
        this.lines.forEach((line, i) => {
            if (i === this.currentIndex) {
                line.setAttribute('opacity', 1.0);
                line.setAttribute('scale', '1.1 1.1 1.1');
                line.setAttribute('color', '#e41962'); // Accent Energy Red
            } else {
                line.setAttribute('opacity', 0.5);
                line.setAttribute('scale', '0.9 0.9 0.9');
                line.setAttribute('color', '#ffffff');
            }
        });

        const targetY = this.currentIndex * this.lineHeight;
        this.container.setAttribute('animation', {
            property: 'position',
            to: `0 ${targetY} 0`,
            dur: 400,
            easing: 'easeInOutQuad'
        });
    },

    remove: function () {
        clearInterval(this.timer);
    }
});

AFRAME.registerComponent('lyrics-trigger', {
    init: function () {
        const el = this.el;
        let isShowing = false;
        let lastClickTime = 0;

        el.addEventListener('click', (e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            const now = Date.now();
            if (now - lastClickTime < 500) return;
            lastClickTime = now;

            const lyricsWindow = document.getElementById('lyrics-panel');
            if (!lyricsWindow) return;

            // Force hide other popups if open
            const chatWindow = document.getElementById('left-panel');
            if (chatWindow && chatWindow.getAttribute('visible')) {
                chatWindow.emit('force-hide');
            }
            const mapWindow = document.getElementById('map-panel');
            if (mapWindow && mapWindow.getAttribute('visible')) mapWindow.emit('force-hide');
            
            const merchWindow = document.getElementById('merch-panel');
            if (merchWindow && merchWindow.getAttribute('visible')) merchWindow.emit('force-hide');

            isShowing = !isShowing;
            if (isShowing) {
                lyricsWindow.setAttribute('visible', true);
                lyricsWindow.emit('show-lyrics');
            } else {
                lyricsWindow.emit('hide-lyrics');
                setTimeout(() => lyricsWindow.setAttribute('visible', false), 250);
            }
        });

        const lyricsWindow = document.getElementById('lyrics-panel');
        if (lyricsWindow) {
            lyricsWindow.addEventListener('force-hide', () => {
                if (isShowing) {
                    isShowing = false;
                    lyricsWindow.emit('hide-lyrics');
                    setTimeout(() => lyricsWindow.setAttribute('visible', false), 250);
                }
            });
        }
    }
});

AFRAME.registerComponent('chat-trigger', {
    init: function () {
        const el = this.el;
        let isShowing = false;
        let lastClickTime = 0;

        el.addEventListener('click', (e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            const now = Date.now();
            if (now - lastClickTime < 500) return;
            lastClickTime = now;

            const chatWindow = document.getElementById('left-panel');
            if (!chatWindow) return;

            // Force hide other popups if open
            const lyricsWindow = document.getElementById('lyrics-panel');
            if (lyricsWindow && lyricsWindow.getAttribute('visible')) lyricsWindow.emit('force-hide');
            const mapWindow = document.getElementById('map-panel');
            if (mapWindow && mapWindow.getAttribute('visible')) mapWindow.emit('force-hide');
            const merchWindow = document.getElementById('merch-panel');
            if (merchWindow && merchWindow.getAttribute('visible')) merchWindow.emit('force-hide');

            isShowing = !isShowing;
            if (isShowing) {
                chatWindow.setAttribute('visible', true);
                chatWindow.emit('show-chat');
            } else {
                chatWindow.emit('hide-chat');
                setTimeout(() => chatWindow.setAttribute('visible', false), 250);
            }
        });

        const chatWindow = document.getElementById('left-panel');
        if (chatWindow) {
            chatWindow.addEventListener('force-hide', () => {
                if (isShowing) {
                    isShowing = false;
                    chatWindow.emit('hide-chat');
                    setTimeout(() => chatWindow.setAttribute('visible', false), 250);
                }
            });
        }
    }
});

AFRAME.registerComponent('map-trigger', {
    init: function () {
        const el = this.el;
        let isShowing = false;
        let lastClickTime = 0;
        
        el.addEventListener('click', (e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            const now = Date.now();
            if (now - lastClickTime < 500) return;
            lastClickTime = now;

            const mapWindow = document.getElementById('map-panel');
            if (!mapWindow) return;

            // Force hide Chat and Lyrics if open
            const lyricsWindow = document.getElementById('lyrics-panel');
            if (lyricsWindow && lyricsWindow.getAttribute('visible')) lyricsWindow.emit('force-hide');
            const chatWindow = document.getElementById('left-panel');
            if (chatWindow && chatWindow.getAttribute('visible')) chatWindow.emit('force-hide');
            const merchWindow = document.getElementById('merch-panel');
            if (merchWindow && merchWindow.getAttribute('visible')) merchWindow.emit('force-hide');
            
            isShowing = !isShowing;
            if (isShowing) {
                mapWindow.setAttribute('visible', true);
                mapWindow.emit('show-map');
            } else {
                mapWindow.emit('hide-map');
                setTimeout(() => mapWindow.setAttribute('visible', false), 250);
            }
        });

        const mapWindow = document.getElementById('map-panel');
        if (mapWindow) {
            mapWindow.addEventListener('force-hide', () => {
                if (isShowing) {
                    isShowing = false;
                    mapWindow.emit('hide-map');
                    setTimeout(() => mapWindow.setAttribute('visible', false), 250);
                }
            });
        }
    }
});

AFRAME.registerComponent('merch-trigger', {
    init: function () {
        const el = this.el;
        let isShowing = false;
        let lastClickTime = 0;
        
        el.addEventListener('click', (e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            const now = Date.now();
            if (now - lastClickTime < 500) return;
            lastClickTime = now;

            const merchWindow = document.getElementById('merch-panel');
            if (!merchWindow) return;

            // Force hide other mutually exclusive panels
            const lyricsWindow = document.getElementById('lyrics-panel');
            if (lyricsWindow && lyricsWindow.getAttribute('visible')) lyricsWindow.emit('force-hide');
            const chatWindow = document.getElementById('left-panel');
            if (chatWindow && chatWindow.getAttribute('visible')) chatWindow.emit('force-hide');
            const mapWindow = document.getElementById('map-panel');
            if (mapWindow && mapWindow.getAttribute('visible')) mapWindow.emit('force-hide');
            
            isShowing = !isShowing;
            if (isShowing) {
                merchWindow.setAttribute('visible', true);
                merchWindow.emit('show-merch');
            } else {
                merchWindow.emit('hide-merch');
                setTimeout(() => merchWindow.setAttribute('visible', false), 250);
            }
        });

        const merchWindow = document.getElementById('merch-panel');
        if (merchWindow) {
            merchWindow.addEventListener('force-hide', () => {
                if (isShowing) {
                    isShowing = false;
                    merchWindow.emit('hide-merch');
                    setTimeout(() => merchWindow.setAttribute('visible', false), 250);
                }
            });
        }
    }
});
