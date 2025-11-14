import { CallClient, LocalVideoStream, VideoStreamRenderer } from '@azure/communication-calling';

/**
 * Clase para manejar Azure Communication Services
 */
export class AzureVideoService {
    constructor() {
        this.callClient = null;
        this.deviceManager = null;
        this.localVideoStream = null;
        this.videoStreamRenderer = null;
        this.availableCameras = [];
        this.availableMicrophones = [];
        this.isInitialized = false;
    }

    /**
     * Inicializar el servicio
     */
    async initialize() {
        try {
            console.log('🚀 Inicializando Azure Communication Services...');

            // Crear cliente de llamadas
            this.callClient = new CallClient();

            // Obtener Device Manager
            this.deviceManager = await this.callClient.getDeviceManager();

            // Solicitar permisos
            console.log('🔐 Solicitando permisos de dispositivos...');
            await this.deviceManager.askDevicePermission({ video: true, audio: true });

            // Obtener dispositivos disponibles
            this.availableCameras = await this.deviceManager.getCameras();
            this.availableMicrophones = await this.deviceManager.getMicrophones();

            console.log('📹 Cámaras encontradas:', this.availableCameras.length);
            console.log('🎤 Micrófonos encontrados:', this.availableMicrophones.length);

            this.isInitialized = true;

            return {
                cameras: this.availableCameras,
                microphones: this.availableMicrophones
            };

        } catch (error) {
            console.error('❌ Error en inicialización:', error);
            throw new Error(`Error al inicializar: ${error.message}`);
        }
    }

    /**
     * Iniciar stream de video
     */
    async startVideo(cameraIndex = 0) {
        if (!this.isInitialized) {
            throw new Error('El servicio no está inicializado');
        }

        if (this.availableCameras.length === 0) {
            throw new Error('No se encontró ninguna cámara');
        }

        try {
            console.log('▶️ Iniciando video...');

            // Obtener cámara seleccionada
            const selectedCamera = this.availableCameras[cameraIndex];

            // Crear stream de video local
            this.localVideoStream = new LocalVideoStream(selectedCamera);

            // Crear renderer
            this.videoStreamRenderer = new VideoStreamRenderer(this.localVideoStream);
            const view = await this.videoStreamRenderer.createView();

            console.log('✅ Video iniciado correctamente');

            return view.target; // Retorna el elemento HTML de video

        } catch (error) {
            console.error('❌ Error al iniciar video:', error);
            throw new Error(`Error al iniciar video: ${error.message}`);
        }
    }

    /**
     * Detener stream de video
     */
    async stopVideo() {
        try {
            console.log('⏹️ Deteniendo video...');

            // Limpiar renderer
            if (this.videoStreamRenderer) {
                this.videoStreamRenderer.dispose();
                this.videoStreamRenderer = null;
            }

            // Limpiar stream
            if (this.localVideoStream) {
                this.localVideoStream.dispose();
                this.localVideoStream = null;
            }

            console.log('✅ Video detenido correctamente');

        } catch (error) {
            console.error('❌ Error al detener video:', error);
            throw new Error(`Error al detener video: ${error.message}`);
        }
    }

    /**
     * Verificar si el video está activo
     */
    isVideoActive() {
        return this.localVideoStream !== null && this.videoStreamRenderer !== null;
    }

    /**
     * Obtener dispositivos
     */
    getDevices() {
        return {
            cameras: this.availableCameras,
            microphones: this.availableMicrophones
        };
    }

    /**
     * Limpiar recursos
     */
    cleanup() {
        if (this.videoStreamRenderer) {
            this.videoStreamRenderer.dispose();
        }
        if (this.localVideoStream) {
            this.localVideoStream.dispose();
        }
        console.log('🧹 Recursos limpiados');
    }
}