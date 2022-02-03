# Tiny-Vite-SSR

WIP. Be forewarned.

## Necessary changes to your Vite-Vute project:

In your `index.html`, add an appropriate div tag with a placeholder for the SSR content:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Remix-Vue</title>
  </head>
  <body>
    <div id="app"><!--ssr-outlet--></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

In your `main.ts`, build your app inside a `createApp` exported function, and only mount it when running in the browser:
```ts
import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() { // Will be called both by the server renderer and by the code below in client-side mode
    const app = createSSRApp(App)
    const router = initRouter()
    app.use(router)
    return { app, router } // Return these as the server renderer expects them
}

// On client side, start the app, and mount it only when the router is ready to ensure hydration match
if (!import.meta.env.SSR) {
    const x = createApp()
    x.router.isReady().then(() => x.app.mount("#app"))
}

function initRouter() {
  // Create and return an instance of vue-router here
}
```
Example code for configuring vue-router for filesystem routing:
```ts
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

function initRouter() {
    // Simple filesystem routing, using vite's glob feature: https://vitejs.dev/guide/features.html#glob-import
    const pages = import.meta.glob('./pages/*.vue')
    
    const routes = Object.keys(pages).map((path) => {
        const name = path.match(/\.\/pages(.*)\.vue$/)[1].toLowerCase()
        return {
            path: name === '/home' ? '/' : name,
            component: pages[path] // () => import('./pages/*.vue')
        }
    })

    return createRouter({
        history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(), // use appropriate history implementation for server/client
        routes
    })
  }
```

That's all! Your project should still work just fine with Vite, but it is now compatible with the SSR server you will create below.

## Sample SSR-enabled Server in Express
```shell
$ npm install bandleader/bandlibs
```
```js
import * as Express from 'express'
import * as TVS from 'bandlibs/tiny-vite-ssr'

async function init() {
  const app = Express()
  const port = 3000
  console.log("Starting server...")
  app.use(await TVS.devMiddleware({
    pathToIndexHtml: "./index.html",
    pathToMainJsEntrypoint: "./src/main.ts",
  }))
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
  })
}
init()
```

## Remix Data Loader
In your Vue component:
```html
<script setup>
import { ref } from 'vue'
async function loader() {
  // This will only run on the server,
  // and the data will be passed to the client,
  // so that the same call to loader() works there as well
  return {
    hello: "world"
  }
}
  
const loaderData = ref(null)
loader().then(x => loaderData.value = x)
</script>

<template>
<p v-if="loaderData">Hello, {{loaderData.hello}}!</p>
</template>
```

In your `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import remixDataLoaderVitePlugin from 'bandlibs/tiny-vite-ssr/remixDataLoaderVitePlugin'

export default defineConfig({
  plugins: [remixDataLoaderVitePlugin(), vue()] // put remixDataLoaderVitePlugin first
})
```
