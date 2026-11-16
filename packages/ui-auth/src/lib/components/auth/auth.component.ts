import { NbAuthComponent, NbAuthService } from '@nebular/auth';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy({ checkProperties: true })
@Component({
    selector: 'ngx-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class NgxAuthComponent extends NbAuthComponent implements OnInit {
	public isRegister: boolean = false;
	public isLogin: boolean = false;

	constructor(
		readonly auth: NbAuthService,
		readonly location: Location,
		private readonly _router: Router
	) {
		super(auth, location);
	}

	ngOnInit() {
		this.updateAuthPageClasses(this._router.url);

		// Listen to router events to update the register class.
		this._router.events
			.pipe(
				filter((event) => event instanceof NavigationStart),
				map((event) => event as NavigationStart),
				tap((event: NavigationStart) => {
					this.updateAuthPageClasses(event.url);
				})
			)
			.subscribe();
	}

	/**
	 * Update the per-page classes based on the current URL.
	 *
	 * @param url
	 */
	updateAuthPageClasses(url: string) {
		// `url` still carries the query string (`/auth/login?returnUrl=...`), so
		// compare against the path alone or the class never lands on a deep link.
		const path = url.split('?')[0];

		this.isRegister = path === '/auth/register';
		this.isLogin = path === '/auth/login';
	}
}
