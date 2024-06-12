import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { HomeService } from '../home.service';
import { ShowForRolesDirective } from 'app/core/directives/show-for-roles.directive';

@Component({
  selector: 'app-info-sesion',
  standalone: true,
  imports: [CommonModule, MatButtonModule, ShowForRolesDirective],
  templateUrl: './info-sesion.component.html',
})
export class InfoSesionComponent implements OnInit, OnDestroy{

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    estadoSesion: string = 'No transmitiendo';

    sesion: any = {};

    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _homeService: HomeService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {

        this._homeService.sesion$.pipe(takeUntil(this._unsubscribeAll)).subscribe((sesion) => {
            this.sesion = sesion.data;
            this.estadoSesion = sesion.data.estado_transmision;

            this._changeDetectorRef.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    //-----------------------------------
    // Metodos dialogos
    //-----------------------------------
    mostrarDialogoConfimar() {
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
                this.updateEstadoSesionTerminarSesion();
            }
        });
    }

    updateSesionData(){
        this._homeService.getSesionById(this.sesion.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this._homeService.sesion = response;
                this._changeDetectorRef.markForCheck();
            },(error) => {
                console.log(error);
            }
        );
    }

    updateEstadoSesionIniciarSesion(){
        this._homeService.iniciarSesion(this.sesion.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this.updateSesionData();
            },(error) => {
                console.log(error);
            }
        );
    }

    updateEstadoSesionTerminarSesion(){
        this._homeService.terminarSesion(this.sesion.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this.updateSesionData();
            },(error) => {
                console.log(error);
            }
        );
    }
}
