import { Tray, nativeImage } from 'electron';
import * as path from 'node:path';

export class IconManager {
	constructor(
		private readonly tray: Tray,
		private readonly iconPath: string
	) { };

	updateIcon(iconState: 'start' | 'stop'): void {
		const iconDir = path.dirname(this.iconPath);
		let iconPathFull: string;
		if (process.platform === 'darwin') {
			iconPathFull = path.join(iconDir, 'iconTemplate.png');
		} else if (iconState === 'start') {
			iconPathFull = path.join(iconDir, 'icon.png');
		} else {
			iconPathFull = path.join(iconDir, 'icon_gray.png');
		}
		const nativeIcon = nativeImage.createFromPath(iconPathFull);
		const resizedIcon = nativeIcon.resize({ width: 16, height: 16 });
		resizedIcon.setTemplateImage(process.platform === 'darwin');
		this.tray.setImage(resizedIcon);
	}
}
