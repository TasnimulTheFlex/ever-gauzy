import { Inject, Injectable, Optional } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GAUZY_ENV } from '../constants';
import { NotificationService } from './notification.service';

@Injectable({
	providedIn: 'root'
})
export class ToastrNotificationService extends NotificationService {
	constructor(
		private readonly _toastrService: NbToastrService,
		@Optional()
		@Inject(GAUZY_ENV)
		environment: any
	) {
		super();
		this._notification = {
			title: environment?.DESCRIPTION || 'Base360',
			message: ''
		};
	}

	public success(message: string): void {
		this._toastrService.success(message, this._notification.title, {
			toastClass: 'toast-top-custom-title-bar',
			preventDuplicates: true,
			// Match every toast on screen, not just the last one: alternating errors used to flood the window
			duplicatesBehaviour: 'all'
		});
	}

	public error(message: string): void {
		this._toastrService.danger(message, this._notification.title, {
			preventDuplicates: true,
			duplicatesBehaviour: 'all'
		});
	}

	public warn(message: string): void {
		this._toastrService.warning(message, this._notification.title, {
			preventDuplicates: true,
			duplicatesBehaviour: 'all'
		});
	}

	public info(message: string): void {
		this._toastrService.info(message, this._notification.title, {
			preventDuplicates: true,
			duplicatesBehaviour: 'all'
		});
	}
}
