import { ChangeDetectorRef, Component, LOCALE_ID, OnDestroy, OnInit, ViewEncapsulation,} from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
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
import { HomeService } from '../home.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatRippleModule, NgClass, MatIconModule, NgIf, NgFor, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatRadioModule, FormsModule, MatDatepickerModule, MatSelectModule, TitleCasePipe, MatMenuModule, MatPaginatorModule, RouterOutlet, RouterLink, ReactiveFormsModule, MatProgressSpinnerModule, ShowForRolesDirective],
  templateUrl: './sesiones.component.html',
})
export class SesionesComponent implements OnInit, OnDestroy{

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    debounce: number = 1500;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    comision: any = {};
    sesiones: any[] = [];
    total: number = 0;

    minDate: any;

    //pagination variables
    page: number = 0;
    limit: number = environment.pagination;

    loading: boolean = false;

    filtroBusqueda: any = 0;

    constructor(
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _changeDetectorRef: ChangeDetectorRef,
        private titleService: Title, public dialog: MatDialog,
        private _homeService: HomeService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ){
        this.minDate = new Date();
    }

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(params => {
            if(!params.page){
                this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { page: '1' }});
                this.page = 0;
            }else{
                this.page = parseInt(params.page) - 1;
            }

            // if(this.initial === 'init'){
            //     this.aplicarFiltro(0);
            // }
        });

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

        this._homeService.sesiones$.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            this.sesiones = response.data;
            this.total = response.total;
            this.comision = response.comision;
            this.titleService.setTitle(`Portal de Monitoreo | ${this.comision.nombre}`);

            this._changeDetectorRef.markForCheck();
        });
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
            disableClose: true,
            data: {accion: 'crear', title: 'Crear sesión', comision: 1},
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result === 'guardar') this.obtenerSesiones(1);
        });
    }

    editarSesionDialog(sesion:any): void {
        const dialogRef = this.dialog.open(ModalCrearEditarSesionComponent, {
            width: '600px',
            disableClose: true,
            data: {accion: 'editar', title: 'Editar sesión', data: {tema: sesion.tema, fecha: sesion.fecha_inicio_sesion, hora: sesion.hora_inicio_sesion, responsable: sesion.responsable, id: sesion.id, comision: 1}}
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result === 'guardar') this.obtenerSesiones(1);
        });
    }

    //-----------------------------------
    // Methods http
    //-----------------------------------

    obtenerSesiones(pagina:any): void {
        this.loading = true;

        this._homeService.getAllSesionesPaginated(pagina).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this.loading = false;
                this._homeService.sesiones = response;
                this._changeDetectorRef.markForCheck();
            },(error) => {
                console.log(error);
            }
        );
    }

    getSesionesSinFiltro(pagina:any): void {
        this.loading = true;

        this._homeService.getSesionesSinFiltro(pagina).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this.loading = false;
                this._homeService.sesiones = response;
                this._changeDetectorRef.markForCheck();
            },(error) => {
                console.log(error);
            }
        );
    }

    aplicarFiltro(filtro:any): void {
        this.filtroBusqueda = filtro;

        if(filtro === 0){
            this.obtenerSesiones(1);
        }

        if(filtro === 2){
            this.getSesionesSinFiltro(1);
        }
        // this.obtenerSesiones(1);
    }

    //-----------------------------------
    // Pagination
    //-----------------------------------
    handlePageEnvent(event: PageEvent): void {
        let pagina = event.pageIndex + 1;
        this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { page: pagina }});

        this.obtenerSesiones(pagina);
    }
}
