import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject } from 'rxjs';

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


    //-----------------------------------
    // Metodos set
    //-----------------------------------
    set sesiones(value: any) {
        this._sesiones.next(value);
    }

    //-----------------------------------
    // Metodos get
    //-----------------------------------

    get sesiones$() {
        return this._sesiones.asObservable();
    }
}
