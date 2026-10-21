import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('the release mirror refuses missing or unsafe public URLs before accessing the network', () => {
	for (const url of [undefined, 'http://cdn.example.test', 'https://u:p@cdn.example.test', 'https://cdn.example.test/?x=1', 'https://cdn.example.test/#x']) {
		const result = spawnSync(process.execPath, [fileURLToPath(new URL('./mirror-releases-to-r2.mjs', import.meta.url))], {
			env: {
				R2_S3_ENDPOINT: 'https://r2.example.test',
				R2_BUCKET: 'test',
				R2_ACCESS_KEY_ID: 'test',
				R2_SECRET_ACCESS_KEY: 'test',
				...(url ? { R2_PUBLIC_URL: url } : {})
			},
			encoding: 'utf8',
			timeout: 5000
		});
		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /R2_PUBLIC_URL/);
	}
});
