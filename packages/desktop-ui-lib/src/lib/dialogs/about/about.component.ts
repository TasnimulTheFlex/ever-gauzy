import { Component, Inject, OnInit, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UntilDestroy } from '@ngneat/until-destroy';
import { GAUZY_ENV } from '../../constants';
import { ElectronService } from '../../electron/services';
import { LanguageElectronService } from '../../language/language-electron.service';
import { NbLayoutModule, NbCardModule } from '@nebular/theme';
import { TranslatePipe } from '@ngx-translate/core';
import { IOSInfo } from '@gauzy/contracts';
@UntilDestroy({ checkProperties: true })
@Component({
    selector: 'gauzy-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NbLayoutModule, NbCardModule, TranslatePipe]
})
export class AboutComponent implements OnInit {
	private _application = {
		name: 'Base360 Timer',
		version: 'dev',
		iconPath: null,
		companyName: 'Base360',
		arch: ''
	};
	private platformInfo: Partial<IOSInfo> = {}
	constructor(
		private readonly _electronService: ElectronService,
		private readonly _languageElectronService: LanguageElectronService,
		@Inject(GAUZY_ENV)
		private readonly _environment: any,
		private readonly _domSanitizer: DomSanitizer,
		private _ngZone: NgZone
	) { }

	ngOnInit(): void {
		this._languageElectronService.initialize<void>();
		this.getArch();
	}

	async getArch() {
		this.platformInfo = await this._electronService.ipcRenderer.invoke('GET_PLATFORM');
	}

	public async openLink(link: string) {
		switch (link) {
			case 'EVER':
				await this._electronService.shell.openExternal(this._environment.COMPANY_LINK || 'https://base360.ai');
				break;
			case 'SOURCE':
				await this._electronService.shell.openExternal('https://github.com/TasnimulTheFlex/ever-gauzy');
				break;
			case 'TOS':
				await this._electronService.shell.openExternal(this._environment.PLATFORM_TOS_URL || 'https://base360.ai/legal');
				break;
			case 'PRIVACY':
				await this._electronService.shell.openExternal(this._environment.PLATFORM_PRIVACY_URL || 'https://base360.ai/legal#privacy');
				break;
			default:
				break;
		}
	}

	public get application() {
		this._application = {
			...this._application,
			name: this._environment.DESCRIPTION || this._electronService?.remote?.app.getName(),
			version: this._electronService?.remote?.app?.getVersion(),
			iconPath: this._domSanitizer.bypassSecurityTrustResourceUrl(this._environment.GAUZY_DESKTOP_LOGO_512X512),
			companyName: this._environment.COMPANY_NAME || 'Base360'
		};
		return this._application;
	}

	public get os(): NodeJS.Platform {
		return this.platformInfo.os;
	}

	public get arch(): NodeJS.Architecture {
		return this.platformInfo.arch;
	}

	public get systemVersion(): string {
		return this.platformInfo.version;
	}
}
