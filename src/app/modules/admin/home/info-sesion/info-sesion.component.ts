import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { finalize, Subject, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { HomeService } from '../home.service';
import { ShowForRolesDirective } from 'app/core/directives/show-for-roles.directive';
import { FormatTimePipe } from 'app/shared/pipes/format-time.pipe';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import Hls from 'hls.js';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-info-sesion',
  standalone: true,
  imports: [CommonModule, MatButtonModule, ShowForRolesDirective, FormatTimePipe, RouterLink, MatIconModule],
  templateUrl: './info-sesion.component.html',
})
export class InfoSesionComponent implements OnInit, OnDestroy, AfterViewInit{

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    estadoSesion: string = '';

    sesion: any = {};

    loading: boolean = false;
    loadingStatistics: boolean = false;
    statistics: any = {};

    Toast: any;

    imgbase64: any = '';

    statusFile: string = '';

    countdown: number = 10;
    interval: any = 10;
    countdownMapping: any = {
        '=1'   : '# segundo.',
        'other': '# segundos.',
    };

    estadoMatizzo: string = 'No transmitiendo';

    init: boolean = false;
    intervalId: any = null;

    showVideo: boolean = false;

    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _homeService: HomeService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
        this.Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
        });
    }

    ngOnInit(): void {

        this._homeService.sesion$.pipe(takeUntil(this._unsubscribeAll)).subscribe((sesion) => {
            this.sesion = sesion.data;
            this.estadoSesion = sesion.data.estado_transmision;
            this.estadoMatizzo = this.sesion.estado_matizzo;
            // this.takeScreenShot();

            if(this.estadoSesion !== 'No transmitiendo' && this.estadoSesion !== 'Transmisión finalizada' && !this.init){
                // this.getStatisticsData();
                // this.getStatisticsData();
                // this.takeScreenShot();
                this.init = true;
                this.showVideo = true;
                // this.takeScreenShot();
            }

            // this.ejecutarAccion();
            if(this.estadoSesion === 'Transmisión finalizada'){
                this.countdown = 0;
                this.imgbase64 = '';
                this.showVideo = false;
                this.getStatusSesion();
            }
            this._changeDetectorRef.markForCheck();
        });

        // let minutos = 1;
        // let milisegundos = minutos * this.interval * 1000;

        // timer(1000, 1000).pipe(finalize(() => {
        //         this.countdown = this.interval;
        // }),
        // takeWhile(() => this.countdown > 0),
        // takeUntil(this._unsubscribeAll),
        // tap(() => this.countdown--)).subscribe();

        // this.intervalId =  setInterval(() => {
        //     if(this.estadoSesion !== 'No transmitiendo' && this.estadoSesion !== 'Transmisión finalizada'){
        //         // this.getStatisticsData();
        //         // Redirect after the countdown
        //         timer(1000, 1000).pipe(finalize(() => {
        //                 this.countdown = this.interval;
        //             }),
        //             takeWhile(() => this.countdown > 0),
        //             takeUntil(this._unsubscribeAll),
        //             tap(() => this.countdown--)).subscribe();

        //         this.takeScreenShot();
        //     }

        //     if(!this.init && this.estadoSesion === 'No transmitiendo'){
        //         this.updateSesionData();
        //     }
        // }, milisegundos);
    }

    ngAfterViewInit(): void {
        this.initializeVideoStream();
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    //-----------------------------------
    // Metodos dialogos
    //-----------------------------------
    mostrarDialogoConfimar() {

        if(this.loading){
            return;
        }
        // Open the confirmation and save the reference
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Aviso',
            message: '¿Estas seguro que deseas terminar la sesión?, si aceptas la sesión dejara de ser grabada.',
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warn',
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Terminar Sesión',
                    color: 'warn',
                },
                cancel: {
                    show: true,
                    label: 'Cancelar',
                },
            },
            dismissible: true,
        });

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {
            if(result === 'confirmed'){
                // this.updateEstadoSesionTerminarSesion();
                this.stopRecording();
            }
        });
    }

    mostrarDialogoConfimarIniciarSesion() {

            if(this.loading){
                return;
            }

            const valid = this.validarSiPuedeIniciarSesion();

            if(valid){
                this.updateEstadoSesionIniciarSesion();
                return;
            }


            // Open the confirmation and save the reference
            const dialogRef = this._fuseConfirmationService.open({
                title: 'Aviso',
                message: '¿Estas seguro que deseas iniciar la sesión?, La fecha actual no coincide con la fecha indicada para la sesión.',
                icon: {
                    show: true,
                    name: 'heroicons_outline:exclamation-triangle',
                    color: 'accent',
                },
                actions: {
                    confirm: {
                        show: true,
                        label: 'Iniciar Sesión',
                        color: 'accent',
                    },
                    cancel: {
                        show: true,
                        label: 'Cancelar',
                    },
                },
                dismissible: true,
            });

            // Subscribe to afterClosed from the dialog reference
            dialogRef.afterClosed().subscribe((result) => {
                if(result === 'confirmed'){
                    this.updateEstadoSesionIniciarSesion();
                }
            });
    }

    mostrarDialogoEstadisticas(estadistias:any){

        const dialogRef = this._fuseConfirmationService.open({
            title: 'Estadisticas',
            message: `Estadisticas de la sesion: <br><br>
            <strong>Grabacion en progreso: </strong> ${estadistias.isRecording ? 'Si': 'No'}<br><br>
            <strong>La grabacion esta en pausa: </strong> ${estadistias.isRecordingPaused ? 'Si': 'No'}<br><br>
            <strong>Tiempo de grabacion: </strong> ${estadistias.recordTimecode ? estadistias.recordTimecode: '00:00:00'}<br><br>
            `,
            icon: {
                show: true,
                name: 'heroicons_outline:chart-pie',
                color: 'primary',
            },
            actions: {
                confirm: {
                    show: false,
                    label: 'Aceptar',
                    color: 'primary',
                },
                cancel: {
                    show: true,
                    label: 'Cerrar',
                },
            },
            dismissible: true,
        });

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {
            if(result === 'confirmed'){
            }
        });
    }

    //-----------------------------------
    // Metodos http
    //-----------------------------------

    updateSesionData(){

        this._homeService.getSesionById(this.sesion.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this._homeService.sesion = response;

                this.loading = false;
                this._changeDetectorRef.markForCheck();
            },(error) => {
                console.log(error);
            }
        );
    }

    updateEstadoSesionIniciarSesion(){
        if(this.loading){
            return;
        }

        this._homeService.iniciarSesion(this.sesion.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this.updateSesionData();
                // if(response.ok === true){
                //     this.startRecording();
                // }
            },(error) => {
                console.log(error);
            }
        );
    }

    updateEstadoSesionTerminarSesion(){
        if(this.loading){
            return;
        }
        this._homeService.terminarSesion(this.sesion.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this.updateSesionData();
            },(error) => {
                console.log(error);
            }
        );
    }

    finRegistroAsistentes(){
        if(this.loading){
            return;
        }
        this._homeService.finRegistroAsistentes(this.sesion.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this.updateSesionData();
            },(error) => {
                console.log(error);
            }
        );
    }


    startRecording(){
        if(this.loading){
            return;
        }

        this.loading = true;
        this._homeService.starObs(this.sesion.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                if(response.ok === true){
                    this.updateSesionData();
                }

                // setTimeout(() => {
                //     this.getStatisticsData();
                // }, 400);

                this.loading = false;
            },(error) => {
                this.loading = false;
                this._changeDetectorRef.markForCheck();
                const message = (error.error.message).replace(/"2"/g, '');
                this.Toast.fire({
                    icon: 'error',
                    title: message
                });
            }
        );
    }

    stopRecording(){
        if(this.loading){
            return;
        }

        this.loading = true;
        this._homeService.stopObs(this.sesion.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                if(response.ok === true){
                    this.updateSesionData();
                }

                // setTimeout(() => {
                //     this.getStatisticsData();
                // }, 400);
                this.loading = false;
            },(error) => {
                this.loading = false;
                this._changeDetectorRef.markForCheck();
                this.Toast.fire({
                    icon: 'error',
                    title: error.error.message
                });
            }
        );
    }

    getStatisticsData(showModal:any = false){
        if(this.loadingStatistics){
            return;
        }

        this.loadingStatistics = true
        this._homeService.statisticsObs().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                // console.log(response);
                if(!showModal){
                    this.loadingStatistics = false;
                    // this.takeScreenShot();
                }else{
                    this.loadingStatistics = false;
                    this.mostrarDialogoEstadisticas(response.statistics);
                }

                this.loadingStatistics = false
                this._changeDetectorRef.markForCheck();
            },(error) => {
                this.loadingStatistics = false
                this._changeDetectorRef.markForCheck();
                this.Toast.fire({
                    icon: 'error',
                    title: error.error.message
                });
            }
        );
    }

    changeFileNameRecord(){
        if(this.loading){
            return;
        }

        this._homeService.changeFileNameRecord(this.sesion.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                // this.updateSesionData();
                if(response.ok === true){
                    this.startRecording();
                }

            },(error) => {
                this.Toast.fire({
                    icon: 'error',
                    title: error.error.message
                });
            }
        );
    }

    takeScreenShot(){
        if(this.loadingStatistics){
            return;
        }

        this.loadingStatistics = true

        this._homeService.takeScreenShot(this.sesion.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                if(response.ok === true){
                    // this.updateSesionData();
                    this.imgbase64 = response.base64Image;
                    this.statistics = response.statistics;
                    this._homeService.sesion = {data : response.sesion};
                }

                this.loadingStatistics = false;
                this._changeDetectorRef.markForCheck();
            },(error) => {
                this.loadingStatistics = false;
                this._changeDetectorRef.markForCheck();
                this.Toast.fire({
                    icon: 'error',
                    title: error.error.message
                });
            }
        );
    }

    getStatusSesion(){
        // const nombre = this.setNombreArchivo();

        this._homeService.getStatusSesion({sesion: this.sesion.id}).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                if(response.ok === true){
                    const status = response.status.estado;

                    if(status === 'iniciado'){
                        this.statusFile = 'Archivo creado en espera de ser procesado.';
                    }

                    if(status === 'finalizado'){
                        this.statusFile = 'El archivo está siendo procesado.';
                    }

                    if(status === 'transcrito'){
                        this.statusFile = 'Archivo procesado.';
                    }
                }

                this._changeDetectorRef.markForCheck();
            },(error) => {
                this.statusFile = 'No encontrado';
                // this.Toast.fire({
                //     icon: 'error',
                //     title: `Estado archivo: ${error.error.status}`
                // });
                this._changeDetectorRef.markForCheck();

            }
        );
    }
    //-----------------------------------
    // Metodos validacion
    //-----------------------------------
    validarSiPuedeIniciarSesion(): boolean{
        let fechaActual = new Date();
        let fechaInicio = new Date(this.convertirDate(this.sesion.fecha_inicio_sesion));

        fechaActual.setHours(0,0,0,0);
        fechaInicio.setHours(0,0,0,0);

        if(fechaActual.getTime() === fechaInicio.getTime()){
            return true;
        }

        return false;
    }

    convertirDate(data: any): Date {
        let dateN = new Date(data.replace(/-/g, '/'));
        // console.log(dateN);
        return dateN;
    }

    setNombreArchivo(){
        const nombre = `SB-${this.sesion.fecha_inicio_sesion}-${this.sesion.tema.replace(/ /g, '_')}`;

        return nombre;
    }

    private initializeVideoStream(): void {
        const video = document.getElementById('obs-video') as HTMLVideoElement;

        if(!video) {
            console.error('Video element not found');
            return;
        }

        if (Hls.isSupported()) {
            this.initializeHLS(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            this.initializeNativeHLS(video);
        } else {
            console.error('HLS is not supported in this browser.');
        }
    }

    private initializeHLS(video: HTMLVideoElement): void {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            manifestLoadingRetryDelay: 1000,
            manifestLoadingMaxRetry: 10,
            levelLoadingRetryDelay: 1000,
            levelLoadingMaxRetry: 10,
            fragLoadingRetryDelay: 1000,
            fragLoadingMaxRetry: 10
        });

        let retryCount = 0;
        const maxRetries = 30; // 30 intentos = 5 minutos con intervalos de 10 segundos
        const retryInterval = 10000; // 10 segundos

        const loadStream = () => {
            console.log(`Intentando cargar stream (intento ${retryCount + 1}/${maxRetries})`);

            hls.loadSource(environment.sourceRmtp);
            hls.attachMedia(video);

            // Timeout para detectar si la carga falla
            const loadTimeout = setTimeout(() => {
                if (video.readyState === 0) {
                    console.log('Stream no disponible, reintentando...');
                    this.retryConnection(hls, video, retryCount, maxRetries, retryInterval, loadStream);
                }
            }, 5000);

            // Eventos de HLS
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('Manifest cargado correctamente');
                clearTimeout(loadTimeout);
                retryCount = 0; // Reset retry count on success

                // Intentar reproducir automáticamente
                video.play().catch(error => {
                    console.log('Autoplay bloqueado:', error);
                    // Mostrar mensaje al usuario para hacer click y activar el video
                    this.showPlayButton(video);
                });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                clearTimeout(loadTimeout);
                console.error('Error HLS:', data);

                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('Error de red, reintentando...');
                            this.retryConnection(hls, video, retryCount, maxRetries, retryInterval, loadStream);
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('Error de media, intentando recuperar...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.log('Error fatal, reintentando conexión...');
                            this.retryConnection(hls, video, retryCount, maxRetries, retryInterval, loadStream);
                            break;
                    }
                }
            });

            // Evento cuando el video está listo para reproducir
            video.addEventListener('canplay', () => {
                console.log('Video listo para reproducir');
                this.showVideo = true;
                this._changeDetectorRef.markForCheck();
            });

            // Evento cuando el video se está reproduciendo
            video.addEventListener('playing', () => {
                console.log('Video reproduciéndose');
            });

            // Evento cuando el video se pausa por falta de datos
            video.addEventListener('waiting', () => {
                console.log('Video esperando datos...');
            });
        };

        loadStream();
    }

    private initializeNativeHLS(video: HTMLVideoElement): void {
        let retryCount = 0;
        const maxRetries = 30;
        const retryInterval = 10000;

        const loadStream = () => {
            console.log(`Intentando cargar stream nativo (intento ${retryCount + 1}/${maxRetries})`);

            video.src = environment.sourceRmtp;

            const loadTimeout = setTimeout(() => {
                if (video.readyState === 0) {
                    console.log('Stream no disponible, reintentando...');
                    this.retryNativeConnection(video, retryCount, maxRetries, retryInterval, loadStream);
                }
            }, 5000);

            video.addEventListener('canplay', () => {
                console.log('Video nativo listo para reproducir');
                clearTimeout(loadTimeout);
                retryCount = 0;
                this.showVideo = true;
                this._changeDetectorRef.markForCheck();

                video.play().catch(error => {
                    console.log('Autoplay bloqueado:', error);
                    this.showPlayButton(video);
                });
            });

            video.addEventListener('error', () => {
                clearTimeout(loadTimeout);
                console.error('Error en video nativo');
                this.retryNativeConnection(video, retryCount, maxRetries, retryInterval, loadStream);
            });
        };

        loadStream();
    }

    private retryConnection(hls: any, video: HTMLVideoElement, retryCount: number, maxRetries: number, retryInterval: number, loadStream: () => void): void {
        retryCount++;

        if (retryCount >= maxRetries) {
            console.error('Máximo número de reintentos alcanzado');
            this.Toast.fire({
                icon: 'error',
                title: 'No se pudo conectar con la transmisión',
                text: 'Por favor, verifica que OBS esté transmitiendo correctamente'
            });
            return;
        }

        // Destruir la instancia HLS actual
        hls.destroy();

        // Mostrar mensaje de reintento
        this.Toast.fire({
            icon: 'info',
            title: `Reintentando conexión (${retryCount}/${maxRetries})`,
            timer: 2000
        });

        setTimeout(() => {
            this.initializeHLS(video);
        }, retryInterval);
    }

    private retryNativeConnection(video: HTMLVideoElement, retryCount: number, maxRetries: number, retryInterval: number, loadStream: () => void): void {
        retryCount++;

        if (retryCount >= maxRetries) {
            console.error('Máximo número de reintentos alcanzado');
            this.Toast.fire({
                icon: 'error',
                title: 'No se pudo conectar con la transmisión'
            });
            return;
        }

        this.Toast.fire({
            icon: 'info',
            title: `Reintentando conexión (${retryCount}/${maxRetries})`,
            timer: 2000
        });

        setTimeout(loadStream, retryInterval);
    }

    private showPlayButton(video: HTMLVideoElement): void {
        // Crear overlay para el botón de play si no existe
        let playOverlay = document.getElementById('play-overlay');
        if (!playOverlay) {
            playOverlay = document.createElement('div');
            playOverlay.id = 'play-overlay';
            playOverlay.className = 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer z-10';
            playOverlay.innerHTML = `
                <div class="text-white text-center">
                    <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <p class="text-lg font-semibold">Click para reproducir</p>
                </div>
            `;

            playOverlay.addEventListener('click', () => {
                video.play().then(() => {
                    playOverlay?.remove();
                });
            });

            video.parentElement?.appendChild(playOverlay);
        }
    }

    // Método para reiniciar manualmente la conexión (puedes llamarlo desde un botón)
    restartVideoConnection(): void {
        const video = document.getElementById('obs-video') as HTMLVideoElement;
        if (video) {
            // Limpiar el video actual
            video.src = '';
            video.load();

            // Reinicializar
            setTimeout(() => {
                this.initializeVideoStream();
            }, 1000);
        }
    }
}
