# HOF Example App

Currently a work in progress. The Home Office Forms (HOF) Example app will be used by developers to learn and understand more about the HOF framework. Developers will be able to learn and test out different components in the framework and build their own app using the framework. There will be forms built using the framework available for demoing. 

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

Move into the example folder 

```bash
cd example
```

Install any example app specific dependencies 

```bash
yarn
```

Run in development mode 

```bash
yarn start:dev
```

go to http://localhost:8080/
