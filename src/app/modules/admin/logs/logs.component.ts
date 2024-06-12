import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LogsService } from './logs.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { environment } from 'environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule],
  templateUrl: './logs.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class LogsComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    displayedColumns: string[] = ['tipo_ingreso', 'usuario', 'descripcion', 'fecha'];
    dataSource = new MatTableDataSource<any>([]);

    //search bar
    searchControl: UntypedFormControl = new UntypedFormControl();
    diasControl: UntypedFormControl = new UntypedFormControl();

    loading: boolean = false;

    logs: any = [];
    totalLogs: number = 0;

    page: number = 0;
    limit: any = environment.pagination;
    debounce: number = 1500;

    constructor(
        private titleService: Title,
        private _logsService: LogsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) {
        this.titleService.setTitle('Relatoría | Monitoreo Logs');
    }

    ngOnInit(): void {
        this._logsService.logs$.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            this.logs = response.logs;
            this.totalLogs = response.total;

            this.dataSource = new MatTableDataSource<any>(this.logs);
            this._changeDetectorRef.markForCheck();
        });

        this.activatedRoute.queryParams.subscribe(params => {
            if(!params.page){
                this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { page: '1' }});
                this.page = 0;
            }else{
                this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { page: params.page }});
                this.page = parseInt(params.page) - 1;
            }
        });

        // Subscribe to the search field value changes
        this.searchControl.valueChanges.pipe(debounceTime(this.debounce), takeUntil(this._unsubscribeAll)).subscribe((value) => {
            if (!this.loading) {
                this.aplicarFiltro(0);
            }
            // console.log("object");
            this._changeDetectorRef.markForCheck();
        });

        // Subscribe to the search field value changes
        this.diasControl.valueChanges.pipe(debounceTime(this.debounce), takeUntil(this._unsubscribeAll)).subscribe((value) => {
            if (!this.loading) {
                this.aplicarFiltro(0);
            }
            // console.log("object");
            this._changeDetectorRef.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    //-----------------------------------
    // Methods search
    //-----------------------------------
    aplicarFiltro(page:any): void {
        this.page = page;
        let pagina = page + 1;
        this.loading = true;
        let data = {
            usuario: this.searchControl.value || '',
            cantidadDias: this.diasControl.value || ''
        }

        this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { page: pagina }});

        this._logsService.getLogsPaginated(pagina, data).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this._logsService.logs = response;
                this.loading = false;

                this._changeDetectorRef.markForCheck();
            },(error) => {
                this.loading = false;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    //-----------------------------------
    // Methods pagination
    //-----------------------------------
    handlePageChangeEvent(event: PageEvent): void {
        this.aplicarFiltro(event.pageIndex);
    }
}
