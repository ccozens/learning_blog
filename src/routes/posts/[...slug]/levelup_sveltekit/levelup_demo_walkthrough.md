---
title: 'sveltekit files basics'
date: '2023-07-02'
description: Basics walkthrough of sveltekit files
tags:
  - levelup
  - sveltekit
---

ES Lint
Lints!
.eslintignore
Files eslint ignores
.eslint.cjs
ES Lint rues

.gitignore
Files/folders Git ignores
.npmrc
NPM config

.prettierignore
Files Prettier ignores
.prettierrc
Prettier config

jsconfig.json
Config to help VS Code understand project

package-lock.json
Locked packages

package.json
Packages etc installed

Next two are the ones likely to be used:
svelte.config.js
Here svelte-specific configs are set for sveltekit.
Can specify:
- aliases
- output adaptor (node app, static site, etc)
- app directory
- protection against XSS
- tell sveltekit where to find files
- output dirs
- prerendering options
- service workers
- preprocess options

vite.config.js
Initially, just loads up svelte config. Separate file so you can access vite config options, eg build plugins or or build-specific options.

Dirs
/.svelte-kit -> hidden file with generated code. Can delete and it will regenerate! Never need it most likely

/static
static files for site. Publically available.

/src
Where code for app lives!
app.html is entry point for app
2 dynamic files:
- sveltekit.head replaces metadata
- sveltekit.body sets all body data. eg if add style="bgcolor: black" to <body> tag, whole app will have black bg.

/lib
For misc things! Only thing in demo project is /images.
Note has auto alias: $lib.
Any component used for multiple things is best defined here.

/routes
- folder for each route. Basic route is: folder with route name and +page.svelte file.
- general rule is if you have a component used for only a specific route, define it within the specific route folder
-
