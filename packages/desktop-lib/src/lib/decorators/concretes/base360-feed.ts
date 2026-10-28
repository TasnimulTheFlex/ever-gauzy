import { IDesktopGithubUpdate } from '../../interfaces';
import { IDesktopCdnUpdate } from '../../interfaces/i-desktop-cdn-update';
import { BASE360_UPDATE_FEED } from '../../base360-update';
import { BaseCdnDecorator } from '../abstracts/base-cdn-decorator';

/** The timer updates from latest-mac.yml and the zips published next to its installers. */
export class Base360Feed extends BaseCdnDecorator implements IDesktopGithubUpdate {
	constructor(update: IDesktopCdnUpdate) {
		super(update);
		this.url = BASE360_UPDATE_FEED;
	}

	public async initialize(): Promise<void> {
		this.url = BASE360_UPDATE_FEED;
	}
}
