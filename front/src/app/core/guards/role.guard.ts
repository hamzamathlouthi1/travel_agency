import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { Role } from '../auth/models/role.model';

// Factory so each portal boundary (account/b2b/admin) can declare its own
// allowed roles in the route config: canMatch: [roleGuard(['ADMIN', 'SUPER_ADMIN'])].
export function roleGuard(allowedRoles: readonly Role[]): CanMatchFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(allowedRoles)) {
      return true;
    }

    return router.createUrlTree(['/']);
  };
}
