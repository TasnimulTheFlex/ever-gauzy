import { isTrustedSource } from './security-config';

jest.mock('../environments/environment', () => ({
	environment: { production: true, baseUrl: 'https://api.example.test' }
}));

describe('MCP trusted origins', () => {
	it('accepts the configured API and Base360 API, and rejects upstream and lookalike origins', () => {
		for (const origin of ['https://api.example.test', 'https://time-api.base360.ai']) {
			expect(isTrustedSource('MCP client', origin)).toBe(true);
		}
		for (const origin of [
			'https://api.gauzy.co',
			'https://apidemo.gauzy.co',
			'https://apistage.gauzy.co',
			'https://app.gauzy.co',
			'https://stage.gauzy.co',
			'https://demo.gauzy.co',
			'https://time-api.base360.ai.evil.test',
			'http://time-api.base360.ai'
		]) {
			expect(isTrustedSource('MCP client', origin)).toBe(false);
		}
	});
});
