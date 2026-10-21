/** @jest-environment-options {"url":"https://time.base360.ai"} */
import { getCookie } from './cookie-helper';

jest.mock('@gauzy/ui-config', () => ({ environment: { COOKIE_DOMAIN: 'base360.ai' } }));

describe('Base360 sign-in cookies', () => {
	it('reads an encoded sign-in cookie on the deployed web domain', () => {
		document.cookie = 'token=base360%20session; path=/';
		expect(getCookie('token')).toBe('base360 session');
		document.cookie = 'token=; max-age=0; path=/';
	});
});
