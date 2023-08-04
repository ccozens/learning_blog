---
title: Environment Variables
date: '2023-07-07'
description: Intro to environment variables in SvelteKit
tags:
  - levelup
  - sveltekit
  - envvars
---
## [video](https://levelup.video/tutorials/sveltekit/env-vars)

In dev and preview, SvelteKit will read environment variables from your .env file (or .env.local, or .env.[mode], as determined by Vite.) In production, .env files are not automatically loaded. To do so, install ```dotenv``` in your project.

[SvelteKit allows public and private environment variables](https://kit.svelte.dev/docs/adapter-node#environment-variables). 99% of the time, static variables are probably the ones to go for.




##Private environmental variables
### Create
1. Create env vars: touch ```.env```
2. Create mock API keys:
3. Restart server

```
LUT_API='asdfasdfasdf'
PUBLIC_LUT_PUB_KEY='iampublic'
```

### Can't use client side
1. in ```src/routes/+layout.svelte```: ```import { env } from '$env/dynamic/private';```
2. It tells you off! ```Cannot import $env/dynamic/private into client-side code```

### Can use server side
1. in ```src/routes/show/[num]/+page.server.js```:

```javascript
import { env } from '$env/dynamic/private';
console.log('env', env);
```

Note nothing logged clientside. MUCH on serverside:

```
env {
  LUT_API: 'asdfasdfasdf',
  npm_package_devDependencies_prettier: '^2.8.0',
  TERM_PROGRAM: 'WarpTerminal',
  VIRTUALENVWRAPPER_PROJECT_FILENAME: '.project',
  VIRTUALENVWRAPPER_SCRIPT: '/Library/Frameworks/Python.framework/Versions/3.10/bin/virtualenvwrapper.sh',
  npm_package_devDependencies_eslint_plugin_svelte: '^2.30.0',
  NODE: '/usr/local/bin/node',
  npm_package_devDependencies_prettier_plugin_svelte: '^2.10.1',
  npm_package_devDependencies_typescript: '^5.0.0',
  INIT_CWD: '/Users/learning/Documents/webDevelopment/svelte/blog-levelup',
  SHELL: '/bin/zsh',
  TERM: 'xterm-256color',
  npm_package_devDependencies_vite: '^4.3.6',
  TMPDIR: '/var/folders/hw/c3wpnq1945sbkbtyw3v7rd2h0000gq/T/',
  npm_package_scripts_lint: 'prettier --plugin-search-dir . --check . && eslint .',
  SUDO_ASKPASS: '/usr/local/opt/ssh-askpass/bin/ssh-askpass',
  TERM_PROGRAM_VERSION: 'v0.2023.06.20.08.04.stable_03',
  npm_package_scripts_dev: 'vite dev',
  npm_package_private: 'true',
  npm_package_devDependencies__sveltejs_kit: '^1.20.4',
  npm_config_registry: 'https://registry.npmjs.org/',
  ZSH: '/Users/learning/.oh-my-zsh',
  PNPM_HOME: '/Users/learning/Library/pnpm',
  USER: 'learning',
  LS_COLORS: 'di=1;36:ln=35:so=32:pi=33:ex=31:bd=34;46:cd=34;43:su=30;41:sg=30;46:tw=30;42:ow=30;43',
  npm_package_scripts_check_watch: 'svelte-kit sync && svelte-check --tsconfig ./jsconfig.json --watch',
  COMMAND_MODE: 'unix2003',
  PNPM_SCRIPT_SRC_DIR: '/Users/learning/Documents/webDevelopment/svelte/blog-levelup',
  SSH_AUTH_SOCK: '/private/tmp/com.apple.launchd.Y8kfPYAQFc/Listeners',
  WARP_IS_LOCAL_SHELL_SESSION: '1',
  __CF_USER_TEXT_ENCODING: '0x1F7:0:2',
  npm_package_devDependencies_eslint: '^8.28.0',
  npm_execpath: '/usr/local/Cellar/pnpm/8.6.2/libexec/bin/pnpm.cjs',
  WARP_USE_SSH_WRAPPER: '1',
  PAGER: 'less',
  npm_package_devDependencies_svelte: '^4.0.0',
  WORKON_HOME: '/Users/learning/.virtualenvs',
  LSCOLORS: 'Gxfxcxdxbxegedabagacad',
  PROJECT_HOME: '/Users/learning/Devel',
  VIRTUALENVWRAPPER_PYTHON: '/Library/Frameworks/Python.framework/Versions/3.10/bin/python3',
  PATH: '/Users/learning/Documents/webDevelopment/svelte/blog-levelup/node_modules/.bin:/usr/local/Cellar/pnpm/8.6.2/libexec/dist/node-gyp-bin:/Users/learning/Library/pnpm:/Library/Frameworks/Python.framework/Versions/3.10/bin:/Users/learning/.pyenv/shims:/Library/Frameworks/Python.framework/Versions/3.10/bin:/Library/Frameworks/Python.framework/Versions/3.10/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Users/learning/Library/Python/3.9/bin:/opt/X11/bin:/Library/Apple/usr/bin:/Users/learning/.cargo/bin',
  LaunchInstanceID: 'E43B8D8C-C59A-4333-8A46-3D3A03BD6093',
  VIRTUALENVWRAPPER_HOOK_DIR: '/Users/learning/.virtualenvs',
  npm_config_engine_strict: 'true',
  __CFBundleIdentifier: 'dev.warp.Warp-Stable',
  PWD: '/Users/learning/Documents/webDevelopment/svelte/blog-levelup',
  npm_command: 'run-script',
  npm_package_scripts_preview: 'vite preview',
  npm_lifecycle_event: 'dev',
  LANG: 'en_GB.UTF-8',
  npm_package_name: 'blog-levelup',
  npm_config_resolution_mode: 'highest',
  NODE_PATH: '/Users/learning/Documents/webDevelopment/svelte/blog-levelup/node_modules/.pnpm/vite@4.3.9/node_modules/vite/bin/node_modules:/Users/learning/Documents/webDevelopment/svelte/blog-levelup/node_modules/.pnpm/vite@4.3.9/node_modules/vite/node_modules:/Users/learning/Documents/webDevelopment/svelte/blog-levelup/node_modules/.pnpm/vite@4.3.9/node_modules:/Users/learning/Documents/webDevelopment/svelte/blog-levelup/node_modules/.pnpm/node_modules',
  npm_package_scripts_build: 'vite build',
  XPC_FLAGS: '0x0',
  npm_package_devDependencies_eslint_config_prettier: '^8.5.0',
  npm_config_node_gyp: '/usr/local/Cellar/pnpm/8.6.2/libexec/dist/node_modules/node-gyp/bin/node-gyp.js',
  SSH_ASKPASS: '/usr/local/opt/ssh-askpass/bin/ssh-askpass',
  XPC_SERVICE_NAME: '0',
  npm_package_version: '0.0.1',
  npm_package_devDependencies__sveltejs_adapter_auto: '^2.0.0',
  npm_package_devDependencies_svelte_check: '^3.4.3',
  HOME: '/Users/learning',
  SHLVL: '4',
  PYENV_SHELL: 'zsh',
  npm_package_type: 'module',
  LOGNAME: 'learning',
  LESS: '-R',
  npm_package_scripts_format: 'prettier --plugin-search-dir . --write .',
  npm_lifecycle_script: 'vite dev',
  SSH_SOCKET_DIR: '~/.ssh',
  VIRTUALENVWRAPPER_WORKON_CD: '1',
  npm_config_user_agent: 'pnpm/8.6.2 npm/? node/v16.15.1 darwin x64',
  DISPLAY: '/private/tmp/com.apple.launchd.Q3PWYJg09e/org.macosforge.xquartz:0',
  CONDA_CHANGEPS1: 'false',
  SECURITYSESSIONID: '186a5',
  npm_package_scripts_check: 'svelte-kit sync && svelte-check --tsconfig ./jsconfig.json',
  COLORTERM: 'truecolor',
  npm_node_execpath: '/usr/local/bin/node',
  NODE_ENV: 'development'
}
```

### Easier import as ```static/private```
This means it is resolved statically from vite. It won't log when you visit every page as it doesn't change.

1. in ```src/routes/show/[num]/+page.server.js```:

```javascript
import { LUT_API } from '$env/static/private';
console.log('LUT_API', LUT_API);
```
2. server console logs: ```LUT_API``` 'asdfasdfasdf'


##Public environmental variables
### Why?
Might be needed for eg for a feature flag, or the URL of currently hosted page for cookies.
### How?
Demaracate by prefixing with ```PUBLIC_``` in ```.env```.

###Examples
####Dynamic import
1. in ```src/routes/+layout.svelte``` (key is that its a svelte component):

```javscript
import { env } from '$env/dynamic/public';
console.log('env', env);
```

2. ```PUBLIC_LUT_PUB_KEY': 'iampublic' logged to *browser* console.

####Static import
1. in ```src/routes/+layout.svelte``` (key is that its a svelte component):

```javscript
import { PUBLIC_LUT_PUB_KEY } from '$env/static/public';
console.log('PUBLIC_LUT_PUB_KEY', PUBLIC_LUT_PUB_KEY);
```

2. ```PUBLIC_LUT_PUB_KEY': 'iampublic' logged to *browser* console.
