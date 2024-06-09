import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { SesionesComponent } from './sesiones/sesiones.component';
import { InfoSesionComponent } from './info-sesion/info-sesion.component';

export default [
    {
        path     : '',
        component: HomeComponent,
    },
    {
        path     : ':comision',
        component: SesionesComponent
    },
    {
        path     : ':comision/:sesion',
        component: InfoSesionComponent
    }
] as Routes;
