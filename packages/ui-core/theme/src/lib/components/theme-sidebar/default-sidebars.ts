import { ISidebarConfig } from '@gauzy/ui-core/core';
import { ThemeSettingsComponent } from './theme-settings/theme-settings.component';

export const DEFAULT_SIDEBARS: { [id: string]: ISidebarConfig } = {
	settings_sidebar: {
		loadComponent: () => ThemeSettingsComponent,
		class: 'settings-sidebar',
		actionItem: {
			id: 'settings_sidebar',
			label: 'settings sidebar',
			icon: 'settings-2-outline',
			class: 'toggle-layout'
		}
	}
};
