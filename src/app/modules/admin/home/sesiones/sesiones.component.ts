import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation,} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DateAdapter, MAT_DATE_LOCALE, MatRippleModule,} from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, debounceTime, map, takeUntil } from 'rxjs';
import { MatCheckboxChange, MatCheckboxModule,} from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators,} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterLink, RouterOutlet,} from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ModalCrearEditarSesionComponent } from './modals/modal-crear-editar-sesion/modal-crear-editar-sesion.component';
import { ShowForRolesDirective } from 'app/core/directives/show-for-roles.directive';

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatRippleModule, NgClass, MatIconModule, NgIf, NgFor, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatRadioModule, FormsModule, MatDatepickerModule, MatSelectModule, TitleCasePipe, MatMenuModule, MatPaginatorModule, RouterOutlet, RouterLink, ReactiveFormsModule, MatProgressSpinnerModule, ShowForRolesDirective],
  templateUrl: './sesiones.component.html'
})
export class SesionesComponent implements OnInit, OnDestroy{

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    debounce: number = 1500;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _changeDetectorRef: ChangeDetectorRef,
        private titleService: Title, public dialog: MatDialog,
    ){

    }

    ngOnInit(): void {
        this.titleService.setTitle('Portal de Monitoreo | Comisión Primera de Boyaca');

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$.pipe(takeUntil(this._unsubscribeAll)).subscribe(
            ({matchingAliases}) =>{
                // Set the drawerMode and drawerOpened if the given breakpoint is active
                if ( matchingAliases.includes('md') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    //-----------------------------------
    // Methods navigation
    //-----------------------------------
    verSesion(): void {

    }

    //-----------------------------------
    // Methods dialogs
    //-----------------------------------
    crearSesionDialog(): void {
        const dialogRef = this.dialog.open(ModalCrearEditarSesionComponent, {
            width: '600px',
            data: {accion: 'crear', title: 'Crear sesión'}
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

    editarSesionDialog(): void {
        console.log('Editar sesion');
    }
}
