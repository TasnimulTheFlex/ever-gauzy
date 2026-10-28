import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { akitaConfig, enableAkitaProdMode, persistState } from '@datorama/akita';
import { environment } from '@gauzy/ui-config';
import { loadPluginUiConfig } from '@gauzy/plugin-ui';
import { AppBootstrapModule } from './app/bootstrap.module';

console.log('Environment Mode:', environment.production ? 'Production' : 'Development');

if (environment.production) {
	enableProdMode();
	enableAkitaProdMode();
}

// The date filter lives for the visit only: kept in storage it reopened the pages on the day last viewed instead of today
const withoutSavedDates = (storeName: string, state: any) => {
	if (storeName !== 'timesheet-filter' || !state) return state;
	const { startDate, endDate, ...rest } = state;
	return rest;
};

persistState({
	key: '_gauzyStore',
	preStorageUpdate: withoutSavedDates,
	preStoreUpdate: withoutSavedDates
});

akitaConfig({
	resettable: true
});

// Load plugin configuration first, then bootstrap Angular.
loadPluginUiConfig(() => import('./plugin-ui.config'))
	.then(() => platformBrowser().bootstrapModule(AppBootstrapModule))
	.catch((err) => console.error(err));
