import { Injectable } from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	type HttpEvent,
	HttpInterceptor,
	HttpErrorResponse,
	HttpStatusCode
} from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler.service';
import { Store } from '../services';
import { ElectronService } from '../electron/services';
import { SIGN_IN_ENDPOINTS } from '../constants';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
	constructor(
		private readonly _errorHandlerService: ErrorHandlerService,
		private readonly _electronService: ElectronService,
		private readonly _store: Store
	) {}
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(request).pipe(
			retry(1),
			catchError((error: HttpErrorResponse) =>
				throwError(() => {
					if (!this._store.isOffline) {
						if (
							error.status >= HttpStatusCode.InternalServerError ||
							error.status < HttpStatusCode.Continue
						) {
							this._store.isOffline = true;
							this._store.serverConnection = 0;
							this._electronService.ipcRenderer.send('server-down');
						}
						// A 401 outside sign-in is a stale session: RefreshTokenInterceptor refreshes it or sends the user to login, so no red toast
						if (error.status !== HttpStatusCode.Unauthorized || this.isSignInRequest(request.url)) {
							this._errorHandlerService.handleError(error);
						}
					}
					return error;
				})
			)
		);
	}

	/** Sign-in calls keep their 401 toast so a wrong password is still reported */
	private isSignInRequest(url: string): boolean {
		return SIGN_IN_ENDPOINTS.some((endpoint) => url.includes(endpoint));
	}
}
