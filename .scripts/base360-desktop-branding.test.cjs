const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const apps = [
	['desktop-timer', 'Base360 Timer', 'com.base360.timetracker', 'base360-timer'],
	['desktop', 'Base360 Desktop', 'com.base360.desktop', 'base360-desktop'],
	['agent', 'Base360 Agent', 'com.base360.agent', 'base360-agent']
];

const serverPackages = [
	['server', 'Base360 Server', 'com.base360.server', 'base360-server'],
	['server-api', 'Base360 API Server', 'com.base360.apiserver', 'base360-api-server'],
	['server-mcp', 'Base360 MCP Server', 'com.base360.mcpserver', 'base360-mcp-server']
];

test('all desktop packages retain npm identities and ship Base360 OS metadata and fork-only publishing', () => {
	for (const [app, product, appId, executable] of [...apps, ...serverPackages]) {
		const pkg = JSON.parse(read(`apps/${app}/src/package.json`));
		const build = pkg.build;
		assert.equal(pkg.name, ({ 'server-api': 'gauzy-api-server', 'server-mcp': 'gauzy-mcp-server' })[app] || `gauzy-${app}`);
		assert.equal(pkg.productName, product);
		assert.equal(build.productName, product);
		assert.equal(build.appId, appId);
		assert.equal(build.executableName, executable);
		assert.equal(build.linux.executableName, executable);
		assert.equal(build.mac.extendInfo.CFBundleName, product);
		assert.equal(build.mac.extendInfo.CFBundleDisplayName, product);
		assert.equal(build.win.publisherName, 'Base360');
		assert.equal(pkg.author.name, 'Base360');
		assert.equal(pkg.author.email, 'support@base360.ai');
		assert.equal(build.protocols[0].schemes[0], executable);
		for (const entry of build.publish) {
			assert.equal(entry.provider, 'github');
			assert.equal(entry.owner, 'TasnimulTheFlex');
			assert.equal(entry.repo, 'base360-time-tracker');
		}
		for (const config of [build, build.mac, build.dmg, build.nsis, build.linux]) {
			assert.equal(config.artifactName, `${executable}-\${arch}-\${version}.\${ext}`);
		}
	}
});

test('unsigned Base360 apps cannot check, download or install updates from a shared feed', async () => {
	const file = 'packages/desktop-lib/src/lib/strategies/abstracts/update-strategy.ts';
	const source = stripTypeScriptTypes(read(file), { mode: 'strip' })
		.replace(/^import .*;\s*$/gm, '')
		.replace(/export\s+class UpdateStrategy/, 'class UpdateStrategy');
	for (const [, , appId] of apps) {
		let updaterCalls = 0;
		const updater = new Proxy({}, {
			get() { return () => { updaterCalls++; }; },
			set() { updaterCalls++; return true; }
		});
		const Strategy = vm.runInNewContext(`${source}\nUpdateStrategy;`, {
			process: { env: { APP_ID: appId } },
			autoUpdater: updater,
			DesktopNotification: class {},
			CancellationToken: class {}
		});
		const strategy = new Strategy();
		strategy.update();
		await assert.rejects(strategy.checkUpdate(), /time\.base360\.ai\/downloads/);
		assert.equal(updaterCalls, 0);
	}
});

test('persisted automatic-update settings cannot restart polling in Base360 apps', () => {
	const source = stripTypeScriptTypes(read('packages/desktop-lib/src/lib/contexts/automatic-update.ts'), { mode: 'strip' })
		.replace(/^import .*;\s*$/gm, '')
		.replace(/export\s+class AutomaticUpdate/, 'class AutomaticUpdate');
	for (const [, , appId] of apps) {
		const AutomaticUpdate = vm.runInNewContext(`${source}\nAutomaticUpdate;`, {
			process: { env: { APP_ID: appId } },
			LocalStore: { getStore: () => ({ automaticUpdate: true }) }
		});
		assert.equal(new AutomaticUpdate(null, null).isEnabled, false);
	}
});

test('cloud setup and settings use the Base360 API and About exposes the source link', () => {
	for (const file of [
		'packages/desktop-lib/src/lib/desktop-store.ts',
		'packages/desktop-ui-lib/src/lib/setup/setup.component.ts',
		'packages/desktop-ui-lib/src/lib/settings/settings.component.ts'
	]) {
		assert.match(read(file), /https:\/\/time-api\.base360\.ai/);
		assert.doesNotMatch(read(file), /https:\/\/(?:api\.)?gauzy\.co/);
	}
	const setup = read('packages/desktop-ui-lib/src/lib/setup/setup.component.html');
	assert.match(setup, /Base360 Cloud/);
	assert.match(setup, /Base360 Server/);
	assert.match(read('packages/desktop-ui-lib/src/lib/dialogs/about/about.component.html'),
		/href="https:\/\/github\.com\/TasnimulTheFlex\/base360-time-tracker"[^>]*>Source code<\/a>/);
});

test('packaged icon formats and macOS template assets exist for all desktop apps', () => {
	for (const [app] of apps) {
		const dir = path.join(root, 'apps', app, 'src');
		const icns = fs.readFileSync(path.join(root, '.scripts/icon-utils/icons/icon.icns'));
		assert.equal(icns.subarray(0, 4).toString(), 'icns');
		const ico = fs.readFileSync(path.join(root, '.scripts/icon-utils/icons/icon.ico'));
		assert.equal(ico.readUInt16LE(2), 1);
		for (const [filename, size] of [['iconTemplate.png', 16], ['iconTemplate@2x.png', 32]]) {
			const png = fs.readFileSync(path.join(dir, 'assets/icons/tray', filename));
			assert.equal(png.readUInt32BE(16), size);
			assert.equal(png.readUInt32BE(20), size);
			assert.equal(png[25], 6); // RGBA, needed for a transparent macOS template.
		}
	}
});
