import { GithubCdn } from './github-cdn';

// Preserve the legacy strategy export while routing it through the fork's GitHub feed.
export class DigitalOceanCdn extends GithubCdn {}
