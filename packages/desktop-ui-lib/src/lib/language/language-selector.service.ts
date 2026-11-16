import { Injectable } from '@angular/core';
import { NbLayoutDirection, NbLayoutDirectionService } from '@nebular/theme';
import { UntilDestroy } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesEnum } from '@gauzy/contracts';
import { ElectronService } from '../electron/services';

@UntilDestroy({ checkProperties: true })
@Injectable({
	providedIn: 'root',
})
export class LanguageSelectorService {
	private _osLanguage: string;
	constructor(
		private readonly _directionService: NbLayoutDirectionService,
		private readonly _electronService: ElectronService
	) {
		const locale = this._electronService.remote.app.getLocale();
		this._osLanguage =
			locale in LanguagesEnum ? locale : LanguagesEnum.ENGLISH;
	}

	public setLanguage(
		preferredLanguage: LanguagesEnum,
		translateService: TranslateService
	): void {
		const direction =
			preferredLanguage === LanguagesEnum.HEBREW || preferredLanguage === LanguagesEnum.ARABIC
				? NbLayoutDirection.RTL
				: NbLayoutDirection.LTR;
		// Nebular re-applies a direction change to every overlay it ever created, including closed ones
		// (null host → "Cannot read properties of null (reading 'setAttribute')"), so only emit a real change
		if (this._directionService.getDirection() !== direction) {
			this._directionService.setDirection(direction);
		}
		translateService.use(preferredLanguage || this._osLanguage);
	}
}
