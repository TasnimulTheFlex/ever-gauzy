import { firstValueFrom } from 'rxjs';
import { NavMenuBuilderService } from './nav-menu-builder.service';
import { NavMenuSectionItem } from './nav-builder-types';

const section = (id: string): NavMenuSectionItem => ({ id, title: id, items: [] }) as NavMenuSectionItem;

describe('NavMenuBuilderService (Base360 hidden sections)', () => {
	it('keeps unused sections out of the sidebar, whether core or added by a plugin', async () => {
		const service = new NavMenuBuilderService();
		service.defineNavMenuSections(['dashboards', 'accounting', 'sales', 'tasks', 'employees', 'organization', 'contacts', 'goals', 'reports'].map(section));
		service.addNavMenuSection(section('documents'));
		service.addNavMenuSection(section('jobs'));

		const ids = (await firstValueFrom(service.menuConfig$)).map((s) => s.id);

		expect(ids).toEqual(['dashboards', 'employees', 'organization', 'reports']);
	});
});
