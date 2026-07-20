const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const deviceSelect = document.getElementById('device-select');
    const urlInput = document.getElementById('url-input');
    const goBtn = document.getElementById('go-btn');
    const rotateBtn = document.getElementById('rotate-btn');
    const closeBtn = document.getElementById('close-btn');
    const deviceScreen = document.getElementById('device-screen');
    const notch = document.getElementById('notch');

    let isLandscape = false;

    function updateUrl() {
        let url = urlInput.value.trim();
        if (!url) return;
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
            urlInput.value = url;
        }
        deviceScreen.src = url;
    }

    function updateSize() {
        const [w, h] = deviceSelect.value.split('x').map(Number);
        
        let width = isLandscape ? h : w;
        let height = isLandscape ? w : h;
        
        // Hide notch if in landscape, or if it's an iPad (too wide for a phone notch)
        if (isLandscape || w > 500) {
            notch.style.display = 'none';
        } else {
            notch.style.display = 'block';
        }

        // Add physical device bezels to window dimensions
        const outerWidth = width + 24; 
        const outerHeight = height + 24;

        // Tell main Electron process to resize the physical window
        ipcRenderer.send('resize-device', { width: outerWidth, height: outerHeight });
    }

    goBtn.addEventListener('click', updateUrl);
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') updateUrl();
    });

    deviceSelect.addEventListener('change', updateSize);

    rotateBtn.addEventListener('click', () => {
        isLandscape = !isLandscape;
        updateSize();
    });

    closeBtn.addEventListener('click', () => {
        window.close();
    });

    // Handle webview navigation changes to update the URL bar
    deviceScreen.addEventListener('did-navigate', (event) => {
        urlInput.value = event.url;
    });

    // Javascript-based hover logic to avoid CSS cursor glitches
    const controlsContainer = document.querySelector('.controls-container');
    let hoverTimeout;

    controlsContainer.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        controlsContainer.classList.add('active');
    });

    controlsContainer.addEventListener('mouseleave', () => {
        // Add a small 200ms delay before hiding, to forgive shaky mouse movements
        hoverTimeout = setTimeout(() => {
            controlsContainer.classList.remove('active');
        }, 200);
    });

    // Initialize Size
    updateSize();
});