import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { HomeService } from '../home.service';

@Component({
  selector: 'app-info-sesion',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './info-sesion.component.html',
})
export class InfoSesionComponent implements OnInit, OnDestroy{

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    estadoSesion: string = 'StandBy';

    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _homeService: HomeService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
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
            }
        });
    }
}
