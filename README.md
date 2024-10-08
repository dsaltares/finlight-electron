![Finlight](screenshots/finlight.png)

Finlight is a simple personal finance app.

## Features

- 🔐 Local and privacy first, you 100% own your data.
- 🏦 Multi-account.
- 💱 Multi-currency support with currency normalisation.
- 💸 Track income, expenses and account transfers (double-entry).
- 📊 Insights.
- 💰 Budgeting.
- 🙌 Cross platform: Linux, Windows and Mac.
- 🧾 Receits and transaction attachments.

## Installation

### MacOS

1. Download the darwin zip file for the [latest release](https://github.com/dsaltares/finlight-electron/releases).
2. Extract the zip file.
3. The app is unsigned, so you have to run `xattr -c ~/Downloads/Finlight.app`.
4. Move the app to the `Applications` folder.

### Windows

1. Download the `Setup.exe` file for the [latest release](https://github.com/dsaltares/finlight-electron/releases).
2. Run it and give it permissions to install.

## Technologies

- 🖥️ [Electron](https://www.electronjs.org/)
- ⚛️ [React](https://react.dev/)
- 🔄 [tRPC](https://trpc.io/)
- 📋 [Material UI](https://mui.com/material-ui/)
- 📚 [SQLite 3](https://www.sqlite.org/)
- 🔍 [Kysely](https://kysely.dev/)
- 📊 [Recharts](https://recharts.org/en-US/)
- 🛣️ [React Router](https://reactrouter.com/en/main)

## Getting started

Clone the repo

```
git clone git@github.com:dsaltares/finlight-electron.git
```

Install dependencies

```
yarn
```

Run the app

```
yarn start
```

## Screenshots

Check your overall balance normalised to a common currency.
![Accounts](screenshots/screenshot_013.png)

Powerful transaction search with detailed filters.
![Transactions](screenshots/screenshot_012.png)
![Transactions](screenshots/screenshot_011.png)

Attach files to transactions to save your receipts.
![Transaction attachments](screenshots/screenshot_014.png)

Visualise where your money goes, where it comes from and track it over time.
![Insights](screenshots/screenshot_007.png)

Manage your budget on a monthly, quarterly or yearly basis.
![Budget](screenshots/screenshot_003.png)

Easily create CSV importer for any bank CSV statement format.
![CSV import](screenshots/screenshot_008.png)

Auto-categorise transactions on CSV import via keywords.
![Categories](screenshots/screenshot_010.png)

Refresh exchange rates via [Polygon.io](https://polygon.io/) with your own API key.
![exchange rates](screenshots/screenshot_001.png)

## License

Finlight is licensed under [MIT](./LICENSE).
