import { IDesktopUpdate } from '../../interfaces/i-desktop-update';
import DesktopNotification from '../../desktop-notifier';
import { autoUpdater, UpdateInfo, CancellationToken } from 'electron-updater';
import { app } from 'electron';
import { TranslateService } from '../../translation';
import { isBase360App, isSelfUpdatingBase360App } from '../../base360-update';

export abstract class UpdateStrategy implements IDesktopUpdate {
	protected _cancellationToken: CancellationToken;
	protected _url: string;
	private _notifier: DesktopNotification;
	private _isUpdateTriggered: boolean;

	constructor() {
		this._notifier = new DesktopNotification();
		try {
			this._cancellationToken = new CancellationToken();
		} catch (error) { }
	}

	public update(): void {
		if (isBase360App() && !isSelfUpdatingBase360App()) return;
		autoUpdater.autoDownload = !this._isUpdateTriggered;
		if (this.url) {
			autoUpdater.setFeedURL({
				channel: ['win32', 'linux'].includes(process.platform) ? `latest-${process.arch}` : 'latest',
				provider: 'generic',
				url: this.url,
			});
			autoUpdater
				.checkForUpdatesAndNotify()
				.then((downloadPromise) => {
					if (this._cancellationToken) {
						this._cancellationToken =
							downloadPromise.cancellationToken;
					} else {
						this._isUpdateTriggered = true;
					}
				})
				.catch((e) => {
					console.log('Error occurred', e);
				});
		}
	}

	public async checkUpdate() {
		if (isBase360App() && !isSelfUpdatingBase360App()) {
			throw new Error('Base360 updates must be installed manually: https://time.base360.ai/downloads');
		}
		try {
			// The timer downloads in the background and asks to restart once ready, like Sparkle apps (ChatGPT, Slack)
			autoUpdater.autoDownload = isSelfUpdatingBase360App();
			autoUpdater.setFeedURL({
				channel: ['linux', 'win32'].includes(process.platform) ? `latest-${process.arch}` : 'latest',
				provider: 'generic',
				url: this.url,
			});
			await autoUpdater.checkForUpdates();
		} catch (e) {
			console.log('Error on checking update: ', e);
		}
	}

	public notify(info: UpdateInfo): void {
		this._notifier.customNotification(
			TranslateService.instant(
				'TIMER_TRACKER.NATIVE_NOTIFICATION.NEW_VERSION_AVAILABLE',
				{ name: this._appName, version: info.version }
			),
			this._appName
		);
	}

	public cancel(): void {
		if (this._cancellationToken) {
			this._cancellationToken.cancel();
		}
	}

	private get _appName(): string {
		return app
			.getName()
			.split('-')
			.join(' ')
			.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
	}

	public abstract get url(): string;
	public abstract set url(value: string);
}
