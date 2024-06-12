import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  // variables url
  private url: string = environment.url;
  private limit: any = environment.pagination;

  private _httpCliente = inject(HttpClient);

  // variables datos
  private _logs:  BehaviorSubject<any | null> = new BehaviorSubject(null);

  //-----------------------------------
  // Metodos set
  //-----------------------------------

  set logs(data: any) {
      this._logs.next(data);
  }

  //-----------------------------------
  // Metodos get
  //-----------------------------------

  get logs$(): Observable<any | null> {
      return this._logs.asObservable();
  }

  //-----------------------------------
  // Metodos logs
  //-----------------------------------
  getAllLogs(page: any): Observable<any> {
      let params = new HttpParams();
      params = params.append('page', page);
      params = params.append('limit', this.limit);

      return this._httpCliente.post(`${this.url}logs/getLogs`, {}, {params}).pipe(
          tap((response: any) => {
              this._logs.next(response);
          })
      );
  }

  getLogsPaginated(page: any, data:any): Observable<any> {
      let params = new HttpParams();
      params = params.append('page', page);
      params = params.append('limit', this.limit);

      return this._httpCliente.post(`${this.url}logs/getLogs`, data, { params });
  }
}
