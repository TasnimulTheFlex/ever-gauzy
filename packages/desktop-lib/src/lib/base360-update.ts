/** Only the timer has its own update feed; other Base360 apps would install the timer from it, so they stay manual. */
export const BASE360_UPDATE_FEED = 'https://time.base360.ai/downloads/updates';

export const isBase360App = (): boolean => !!process.env.APP_ID?.startsWith('com.base360.');

export const isSelfUpdatingBase360App = (): boolean => process.env.APP_ID === 'com.base360.timetracker';
