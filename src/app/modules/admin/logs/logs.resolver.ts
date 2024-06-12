import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { LogsService } from "./logs.service";
import { inject } from "@angular/core";

export const getAllLogsResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let page = route.queryParamMap.get('page') || '1';

    return inject(LogsService).getAllLogs(page);
}
