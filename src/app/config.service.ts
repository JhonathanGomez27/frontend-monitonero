import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

    private config: any;

    constructor(private http: HttpClient) {}

    async loadConfig(): Promise<void> {
      return firstValueFrom(this.http.get('assets/config.json'))
        .then(config => {
          this.config = config;
        });
    }

    get apiUrl(): string {
      return this.config?.url || '';
    }

    get apiAuthtUrl(): string {
        return this.config?.urlAuth || '';
    }
}
