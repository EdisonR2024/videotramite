import './style.css';
import { AzureVideoService } from './azure-service.js';

// Instancia del servicio
const azureService = new AzureVideoService();

// Estado de la aplicación
let cameraOn = false;
let micOn = false;

// Referencias a elementos del DOM
const elements = {
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    videoContainer: document.getElementById('videoContainer'),
    cameraOffPlaceholder: document.getElementById('cameraOffPlaceholder'),
    cameraBtn: document.getElementById('cameraBtn'),
    micBtn: document.getElementById('micBtn'),
    cameraText: document.getElementById('cameraText'),
    micText: document.getElementById('micText'),
    cameraIcon: document.getElementById('cameraIcon'),
    micIcon: document.getElementById('micIcon'),
    cameraSelector: document.getElementById('cameraSelector'),
    cameraSelect: document.getElementById('cameraSelect'),
    deviceInfo: document.getElementById('deviceInfo'),
    cameraCount: document.getElementById('cameraCount'),
    micCount: document.getElementById('micCount')
};

// SVG Icons
const icons = {
    cameraOn: `<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>`,
    cameraOff: `<path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>`,
    micOn: `<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>`,
    micOff: `<path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>`
};

/**
 * Inicializar la aplicación
 */
async function init() {
    try {
        // Inicializar servicio de Azure
        const devices = await azureService.initialize();

        // Actualizar UI
        updateDeviceInfo(devices);
        setupCameraSelector(devices.cameras);

        // Habilitar botones
        elements.cameraBtn.disabled = devices.cameras.length === 0;
        elements.micBtn.disabled = devices.microphones.length === 0;

        // Ocultar loading y mostrar info
        elements.loading.classList.add('hidden');
        elements.deviceInfo.classList.remove('hidden');

    } catch (error) {
        console.error('Error en inicialización:', error);
        showError(error.message);
        elements.loading.classList.add('hidden');
    }
}

/**
 * Mostrar mensaje de error
 */
function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove('hidden');

    // Ocultar después de 5 segundos
    setTimeout(() => {
        elements.errorMessage.classList.add('hidden');
    }, 5000);
}

/**
 * Actualizar información de dispositivos
 */
function updateDeviceInfo(devices) {
    elements.cameraCount.textContent = devices.cameras.length;
    elements.micCount.textContent = devices.microphones.length;
}

/**
 * Configurar selector de cámaras
 */
function setupCameraSelector(cameras) {
    if (cameras.length > 1) {
        // Limpiar opciones existentes
        elements.cameraSelect.innerHTML = '';

        // Agregar opciones
        cameras.forEach((camera, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = camera.name || `Cámara ${index + 1}`;
            elements.cameraSelect.appendChild(option);
        });

        // Mostrar selector
        elements.cameraSelector.classList.remove('hidden');
    }
}

/**
 * Toggle cámara
 */
async function toggleCamera() {
    try {
        if (!cameraOn) {
            await startCamera();
        } else {
            await stopCamera();
        }
    } catch (error) {
        console.error('Error al controlar cámara:', error);
        showError(error.message);
    }
}

/**
 * Iniciar cámara
 */
async function startCamera() {
    const cameraIndex = parseInt(elements.cameraSelect.value) || 0;
    
    // Iniciar video y obtener elemento HTML
    const videoElement = await azureService.startVideo(cameraIndex);

    // Limpiar contenedor y agregar video
    elements.videoContainer.innerHTML = '';
    elements.videoContainer.appendChild(videoElement);

    // Actualizar estado UI
    cameraOn = true;
    elements.cameraBtn.classList.add('active');
    elements.cameraText.textContent = 'Apagar Cámara';
    elements.cameraIcon.innerHTML = icons.cameraOff;
}

/**
 * Detener cámara
 */
async function stopCamera() {
    await azureService.stopVideo();

    // Restaurar placeholder
    elements.videoContainer.innerHTML = '';
    elements.videoContainer.appendChild(elements.cameraOffPlaceholder);

    // Actualizar estado UI
    cameraOn = false;
    elements.cameraBtn.classList.remove('active');
    elements.cameraText.textContent = 'Encender Cámara';
    elements.cameraIcon.innerHTML = icons.cameraOn;
}

/**
 * Cambiar de cámara
 */
async function handleCameraChange() {
    if (cameraOn) {
        await stopCamera();
        await startCamera();
    }
}

/**
 * Toggle micrófono
 */
function toggleMicrophone() {
    micOn = !micOn;

    if (micOn) {
        elements.micBtn.classList.add('active');
        elements.micText.textContent = 'Apagar Micrófono';
        elements.micIcon.innerHTML = icons.micOff;
        console.log('🎤 Micrófono encendido');
    } else {
        elements.micBtn.classList.remove('active');
        elements.micText.textContent = 'Encender Micrófono';
        elements.micIcon.innerHTML = icons.micOn;
        console.log('🎤 Micrófono apagado');
    }
}

/**
 * Limpieza al cerrar
 */
window.addEventListener('beforeunload', () => {
    azureService.cleanup();
});

// Event Listeners
elements.cameraBtn.addEventListener('click', toggleCamera);
elements.micBtn.addEventListener('click', toggleMicrophone);
elements.cameraSelect.addEventListener('change', handleCameraChange);

// Inicializar
init();