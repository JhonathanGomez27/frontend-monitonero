import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { SesionesComponent } from './sesiones/sesiones.component';

export default [
    {
        path     : '',
        component: HomeComponent,
    },
    {
        path     : ':comision',
        component: SesionesComponent
    }
] as Routes;
