import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { HomeService } from "./home.service";
import { inject } from "@angular/core";

export const getAllComisionesResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) => {
    // let id = route.paramMap.get('comision');
    return inject(HomeService).getAllComisiones();
}

export const getAllSesionesResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) => {
    // let id = route.paramMap.get('sesion');
    let page:any = '1';

    if(route.queryParamMap.has('page')){
        page = route.queryParamMap.get('page');
    }

    return inject(HomeService).getAllSesiones(page);
}

export const getSesionResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) => {
    let id = route.paramMap.get('sesion');
    return inject(HomeService).getSesionesByIdLoad(id);
}
