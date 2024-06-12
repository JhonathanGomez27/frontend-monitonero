import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UsuariosService {
    // variables url
    private url: string = environment.url;
    private limit: any = environment.pagination;

    private _httpCliente = inject(HttpClient);

    // variables datos
    private _usuarios: BehaviorSubject<any | null> = new BehaviorSubject(null);

    //-----------------------------------
    // Metodos set
    //-----------------------------------

    set usuarios(data: any) {
        this._usuarios.next(data);
    }

    //-----------------------------------
    // Metodos get
    //-----------------------------------

    get usuarios$(): Observable<any | null> {
        return this._usuarios.asObservable();
    }

    //-----------------------------------
    // Metodos Usuarios
    //-----------------------------------
    getAllUsuarios(page: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('page', page);
        params = params.append('limit', this.limit);

        return this._httpCliente.get(`${this.url}usuarios/all`, {params}).pipe(
            tap((response: any) => {
                this._usuarios.next(response);
            })
        );
    }

    getUsuariosPaginated(page: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('page', page);
        params = params.append('limit', this.limit);

        return this._httpCliente.get(`${this.url}usuarios/all`, { params });
    }

    createUsuario(data: any): Observable<any> {
        return this._httpCliente.post(`${this.url}usuarios/create`, data);
    }

    updateUsuario(data: any, id: any): Observable<any> {
        return this._httpCliente.patch(`${this.url}usuarios/editar/${id}`, data);
    }
}
