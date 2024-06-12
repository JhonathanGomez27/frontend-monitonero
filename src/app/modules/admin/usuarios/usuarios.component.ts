import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatPaginator, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { environment } from 'environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioModalComponent } from './modals/usuario-modal/usuario-modal.component';
import { UsuariosService } from './usuarios.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule],
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit, AfterViewInit, OnDestroy{

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    displayedColumns: string[] = ['id', 'nombre', 'rol', 'correo', 'online', 'acciones'];
    dataSource = new MatTableDataSource<any>([]);

    totalUsuarios: number = 0;
    page: number = 0;

    limit: any = environment.pagination;

    loading: boolean = false;

    constructor(
        private titleService: Title,
        public dialog: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usuariosService: UsuariosService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
        this.titleService.setTitle('Relatoría | Usuarios');
    }

    ngOnInit() {
        this._usuariosService.usuarios$.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            this.dataSource = new MatTableDataSource<any>(response.data);
            this.totalUsuarios = response.total;

            this._changeDetectorRef.markForCheck();
        });

        this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { page: '1' }});
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        // this.abrirDialogoCrearUsuario();

    }


    //-----------------------------------
    // Metodos usuarios
    //-----------------------------------

    getUsuariosPaginated(page:any){
        this._usuariosService.getUsuariosPaginated(page).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this._usuariosService.usuarios = response;
                this.loading = false;

                this._changeDetectorRef.markForCheck();
            },(error) => {
                this.loading = false;

                this._changeDetectorRef.markForCheck();
            }
        );
    }

    //-----------------------------------
    // Pagination
    //-----------------------------------
    handlePageEvent(event: any) {

        let pagina = event.pageIndex + 1;
        this.page = event.pageIndex;

        this.loading = true;
        this.getUsuariosPaginated(pagina);
    }

    //-----------------------------------
    // Dialog
    //-----------------------------------
    abrirDialogoCrearUsuario() {
        const dialogRef = this.dialog.open(UsuarioModalComponent, {
            disableClose: true,
            width: '500px',
            data: { action: 'create', title: 'Crear usuario' }
        });

        dialogRef.afterClosed().subscribe(result => {

            let pagina = this.page + 1;

            if(result === 'cancelar') return;

            this.getUsuariosPaginated(pagina);
        });
    }

    abrirDialogoEditarUsuario(usuario: any) {
        const dialogRef = this.dialog.open(UsuarioModalComponent, {
            disableClose: true,
            width: '500px',
            data: { action: 'edit', title: 'Editar usuario', usuario }
        });

        dialogRef.afterClosed().subscribe(result => {
            let pagina = this.page + 1;

            if(result === 'cancelar') return;

            this.getUsuariosPaginated(pagina);
        });

    }
}
