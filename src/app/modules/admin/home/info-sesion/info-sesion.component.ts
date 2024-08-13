import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-info-sesion',
  standalone: true,
  imports: [CommonModule, MatButtonModule, ShowForRolesDirective, FormatTimePipe, RouterLink, MatIconModule],
  templateUrl: './info-sesion.component.html',
})
export class InfoSesionComponent implements OnInit, OnDestroy{

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
                this.takeScreenShot();
            }

            // this.ejecutarAccion();
            if(this.estadoSesion === 'Transmisión finalizada'){
                this.countdown = 0;
                this.imgbase64 = '';
                this.getStatusSesion();
            }
            this._changeDetectorRef.markForCheck();
        });

        let minutos = 1;
        let milisegundos = minutos * this.interval * 1000;

        timer(1000, 1000).pipe(finalize(() => {
                this.countdown = this.interval;
        }),
        takeWhile(() => this.countdown > 0),
        takeUntil(this._unsubscribeAll),
        tap(() => this.countdown--)).subscribe();

        this.intervalId =  setInterval(() => {
            if(this.estadoSesion !== 'No transmitiendo' && this.estadoSesion !== 'Transmisión finalizada'){
                // this.getStatisticsData();
                // Redirect after the countdown
                timer(1000, 1000).pipe(finalize(() => {
                        this.countdown = this.interval;
                    }),
                    takeWhile(() => this.countdown > 0),
                    takeUntil(this._unsubscribeAll),
                    tap(() => this.countdown--)).subscribe();

                this.takeScreenShot();
            }

            if(!this.init && this.estadoSesion === 'No transmitiendo'){
                this.updateSesionData();
            }
        }, milisegundos);
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
}
