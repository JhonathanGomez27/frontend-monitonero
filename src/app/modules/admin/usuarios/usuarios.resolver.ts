import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { inject } from "@angular/core";
import { UsuariosService } from "./usuarios.service";

export const getAllUsuariosResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let page = route.queryParamMap.get('page') || '1';

    return inject(UsuariosService).getAllUsuarios(page);
}
