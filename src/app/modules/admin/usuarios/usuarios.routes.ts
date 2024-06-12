import { Routes } from "@angular/router";
import { UsuariosComponent } from "./usuarios.component";
import { getAllUsuariosResolver } from "./usuarios.resolver";

export default [
    {
        path: '',
        component: UsuariosComponent,
        resolve: {
            usuarios: getAllUsuariosResolver,
            // comisiones: getAllComisionesUsuarioResolver
        }
    }
] as Routes;
