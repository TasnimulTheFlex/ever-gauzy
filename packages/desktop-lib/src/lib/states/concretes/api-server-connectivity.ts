import { fetch, Agent } from 'undici';
import * as dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { INetworkState } from '../../interfaces';
import { LocalStore } from '../../desktop-store';

// One keep-alive agent for every check: a new agent per check paid a full TCP + TLS handshake each time,
// which is most of the delay before a timer starts on a distant server.
const agent = new Agent({
	connect: {
		timeout: 30 * 1000
	}
});

export class ApiServerConnectivity implements INetworkState {
	public async established(): Promise<boolean> {
		try {
			const url = LocalStore.getServerUrl() + '/api';

			console.log('[ApiServerConnectivity]: Checking server connectivity to url: ', url);

			// if more than 30 sec to get response, then we think no connectivity for now to API servers
			const res = await fetch(url, {
				headers: {
					'Cache-Control': 'no-cache'
				},
				dispatcher: agent
			});

			if (res?.ok && res?.status === 200) {
				const data = await res.json();
				console.log('[ApiServerConnectivity]: Server connectivity check response: ', data);

				return true;
			} else {
				console.log('[ApiServerConnectivity]: Server connectivity failed: ', res?.statusText);
			}

			return false;
		} catch (error) {
			console.error('[ApiServerConnectivity]: ', error);
			return false;
		}
	}
}
