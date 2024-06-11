import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { map, tap } from 'rxjs';

export const hasRoleGuard: CanActivateFn = (route, state) => {
    const _user = inject(UserService).user$;

    const expectedRouteRoles = route.data.expectedRole;

    return _user.pipe(
        map((user:any) => Boolean(user && expectedRouteRoles.includes(user.rol))),
        tap((hasRole) => hasRole === false && alert('No tienes permisos para acceder a esta ruta'))
    );
};
