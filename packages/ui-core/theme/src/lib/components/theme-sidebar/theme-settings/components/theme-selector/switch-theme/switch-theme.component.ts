import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ThemeSelectorComponent } from '../theme-selector.component';
import { NbThemeService } from '@nebular/theme';
import { Store } from '@gauzy/ui-core/core';
import { SwitchThemeService } from './switch-theme.service';
import { ActivatedRoute } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
    selector: 'gauzy-switch-theme',
    templateUrl: './switch-theme.component.html',
    styleUrls: ['./switch-theme.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SwitchThemeComponent extends ThemeSelectorComponent {
	@Input() hasText: boolean = true;
	/**
	 *
	 * @param switchService
	 * @param themeService
	 * @param store
	 */
	constructor(
		private readonly switchService: SwitchThemeService,
		readonly themeService: NbThemeService,
		readonly store: Store,
		private readonly activatedRoute: ActivatedRoute
	) {
		super(themeService, store);
		// This part of code should load only one time.
		if (!this.switchService.isAlreadyLoaded) {
			// Light by default; only the user's own choice (kept in the store) changes it, never the OS colour scheme
			this.ngOnInit();
			// lockdown
			this.switchService.isAlreadyLoaded = true;
		}

		this.activatedRoute.queryParams
			.pipe(
				filter((query) => !!query.theme),
				tap(({ theme }) => this.handleThemeChange(theme)),
				untilDestroyed(this)
			)
			.subscribe();
	}
	/**
	 * this method help to switch to opposite current theme
	 */
	public switchTheme() {
		this.reverseTheme();
	}
	// Handle theme on theme change
	private handleThemeChange(theme: string): void {
		const isDarkTheme = this.isDark.state;
		if ((theme === 'dark' && !isDarkTheme) || (theme === 'light' && isDarkTheme)) {
			this.switchTheme();
		}
	}
}
