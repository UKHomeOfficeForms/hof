# HOF Sandbox App

The Home Office Forms (HOF) Sandbox app is used by developers to test out different components in the framework. 

This branch mounts the config-driven selection navigation demo at `/config-driven-navigation`.

That demo covers:

- selector-led navigation with ordered selected items
- a surname aggregator loop using `/surname` and `/surname-summary`
- add-more flow through `/change-anything-else`
- a final summary that only shows the currently selected updates, including aggregated previous surnames

#### How to run the app locally 

Install [Homebrew](https://brew.sh/), if it is not installed 

Once Homebrew is installed run 

```bash
brew install nvm
```
```bash
source ~/.bash_profile
```

Install the correct version of node

```bash
nvm install 14.15.0
```

Set the node version

```bash
nvm use 14.15.0
```

Clone the service locally

```bash
git clone ... 
```

Install yarn 

```bash
npm i yarn -g 
```

Install the dependencies 

```bash
yarn
```

Move into the sandbox folder 

```bash
cd sandbox
```

Install any example app specific dependencies 

```bash
yarn
```

Run in development mode 

```bash
yarn start:dev
```

go to http://localhost:8082/
