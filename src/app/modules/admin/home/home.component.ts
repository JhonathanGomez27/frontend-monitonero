import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HomeService } from './home.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy{

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    comisiones: any = [];
    total: number = 0;

    constructor(
        private titleService: Title,
        private _homeService: HomeService,
    ) {}

    ngOnInit(): void {
        this.titleService.setTitle('Portal de Monitoreo | Comisiónes');

        this._homeService.comisiones$.pipe(takeUntil(this._unsubscribeAll)).subscribe((comisiones: any) => {
            this.comisiones = comisiones.data;
            this.total = comisiones.total
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
