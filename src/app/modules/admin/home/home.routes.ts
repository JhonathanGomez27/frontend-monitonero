import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { SesionesComponent } from './sesiones/sesiones.component';
import { InfoSesionComponent } from './info-sesion/info-sesion.component';
import { getAllComisionesResolver, getAllSesionesResolver, getSesionResolver } from './home.resolver';

export default [
    {
        path     : '',
        component: HomeComponent,
        resolve:{
            comisiones: getAllComisionesResolver
        }
    },
    {
        path     : ':comision',
        component: SesionesComponent,
        resolve:{
            sesiones: getAllSesionesResolver
        }
    },
    {
        path     : ':comision/:sesion',
        component: InfoSesionComponent,
        resolve: {
            sesion: getSesionResolver
        }
    }
] as Routes;
