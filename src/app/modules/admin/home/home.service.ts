import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HomeService {
    // variables url
    private url: string = environment.url;
    private limit: any = environment.pagination;

    private _httpCliente = inject(HttpClient);

    //variables
    private _sesiones: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    private _comisiones: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    private _sesion: BehaviorSubject<any> = new BehaviorSubject<any>({});


    //-----------------------------------
    // Metodos set
    //-----------------------------------
    set sesiones(value: any) {
        this._sesiones.next(value);
    }

    set comisiones(value: any) {
        this._comisiones.next(value);
    }

    set sesion(value: any) {
        this._sesion.next(value);
    }

    //-----------------------------------
    // Metodos get
    //-----------------------------------

    get sesiones$() {
        return this._sesiones.asObservable();
    }

    get comisiones$() {
        return this._comisiones.asObservable();
    }

    get sesion$() {
        return this._sesion.asObservable();
    }

    //-----------------------------------
    // Metodos http
    //-----------------------------------

    getAllComisiones(): Observable<any> {
        return this._httpCliente.get(`${this.url}comisiones`).pipe(
            tap((response: any) => {
                this._comisiones.next(response);
            })
        );
    }

    getAllSesiones(page:any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);

        return this._httpCliente.get(`${this.url}sesiones`, {params}).pipe(
            tap((response: any) => {
                this._sesiones.next(response);
            })
        );
    }

    getAllSesionesPaginated(page: any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);
        return this._httpCliente.get(`${this.url}sesiones`, {params});
    }

    getSesionesSinFiltro(page:any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);
        return this._httpCliente.get(`${this.url}sesiones/all`, {params});
    }

    getSesionesByIdLoad(id: any): Observable<any> {
        return this._httpCliente.get(`${this.url}sesiones/${id}`).pipe(
            tap((response: any) => {
                this._sesion.next(response);
            })
        );
    }

    getSesionById(id: any): Observable<any> {
        return this._httpCliente.get(`${this.url}sesiones/${id}`);
    }

    crearSesion(data: any): Observable<any> {
        return this._httpCliente.post(`${this.url}sesiones`, data);
    }

    editarSesion(data: any, id:any): Observable<any> {
        return this._httpCliente.put(`${this.url}sesiones/${id}`, data);
    }


    iniciarSesion(id: any): Observable<any> {
        return this._httpCliente.post(`${this.url}sesiones/empezar/${id}`, {});
    }

    terminarSesion(id: any): Observable<any> {
        return this._httpCliente.post(`${this.url}sesiones/finalizar/${id}`, {});
    }

    finRegistroAsistentes(id: any): Observable<any> {
        return this._httpCliente.post(`${this.url}sesiones/fin_registro_asistentes/${id}`, {});
    }

    //-----------------------------------
    // Funciones obs
    //-----------------------------------
    starObs(id:any): Observable<any> {
        return this._httpCliente.get(`${this.url}obs/start/${id}`);
    }

    stopObs(id:any): Observable<any> {
        return this._httpCliente.get(`${this.url}obs/finish/${id}`);
    }

    statisticsObs(): Observable<any> {
        return this._httpCliente.get(`${this.url}obs/estadistics`);
    }

    changeFileNameRecord(id:any): Observable<any> {
        return this._httpCliente.get(`${this.url}obs/change-record-name/${id}`);
    }

    takeScreenShot(sesion:any): Observable<any> {
        return this._httpCliente.get(`${this.url}obs/take-screenshot/${sesion}`);
    }

    getStatusSesion(data:any): Observable<any> {
        return this._httpCliente.post(`${this.url}statussesiones/findOne`, data);
    }
}
