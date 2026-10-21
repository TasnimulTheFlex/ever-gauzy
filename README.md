# Base360 Time Tracker

Base360 Time Tracker helps teams track working time, manage timesheets and projects, and review activity. It includes a web app, an API, an MCP server, and the Base360 Timer desktop app.

- Web app: https://time.base360.ai
- API: https://time-api.base360.ai
- Website and support: https://base360.ai · support@base360.ai

## Run locally

Use Node.js 26 (see `.nvmrc`) and Yarn Classic 1.22 or later. Configure `.env` from `.env.sample`, including database settings and your own secrets, then run:

```sh
cp .env.sample .env
yarn bootstrap
yarn start
```

The API runs at `http://localhost:3000` and the web app at `http://localhost:4200`. To run either separately, use `yarn start:api` or `yarn start:gauzy`. The internal workspace command names remain unchanged.

Optional platform connections and usage statistics require an operator-configured endpoint through `EVER_PLATFORM_API_URL` or `EVER_STATS_API_URL`.

Source: [TasnimulTheFlex/ever-gauzy](https://github.com/TasnimulTheFlex/ever-gauzy). Licensed under [AGPL-3.0](LICENSE); see also [third-party licenses](LICENSES.md) and [credits](CREDITS.md).
