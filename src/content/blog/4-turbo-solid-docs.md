---
title: "Turbo Solid Documentation"
description: "This post is used as documentation for `turbo-solid`. Turbo Solid is a library
created to manage asynchronous data on your Solid applications.
This is generally used when you have to fetch data asynchronously for a given resource.
Turbo Solid allows you to manage this data by using an internal cache.
It is very similar to how vercel's `swr` work. Turbo Solid is also build
to support arbitrary cache and event system, making it possible to create your
own implementations."
pubDate: "Mar 29 2022"
---

To know more about the project, please checkout the [Github repository](https://github.com/StudioLambda/TurboSolid). You might find some valuable information there that is not covered in this documentation. If you have any questions, feel free to open an issue on the repository.

**Important**: Turbo Solid uses [Turbo Query](https://github.com/StudioLambda/TurboQuery)
to power all the async operations and therefore, this library focuses on handling Solid's reactivity system and provides a familiar API.

# Installation

To install Turbo Solid just install the `turbo-solid` NPM package:

```sh
npm i turbo-solid
```

Turbo Solid is packed at around 2KB (compressed) with a single dependency (`turbo-query`).

# Getting started

Turbo Solid embraces the APIs provided by Solid to handle async dependencies on your
components, this means it uses `createResource` under the hood, providing support for
`Suspense` out of the box.

Turbo Solid provies an API that's very similar to `createResource` called
`createTurboResource`. This function will create a resource that's handled
internally by `turbo-query`. The first parameter will always be a `function`
that returns the `key` used by `turbo-query`. This key will often be passed
to the fetcher to determine what to fetch. It's also possible to detmine a
specific fetching function in the options.

```jsx
import { createTurboResource, TurboContext } from 'turbo-solid'

// Example post component.
const Post = (props) => {
  const [post] = createTurboResource(
    // A function that returns the key. Automatically re-fetches if it changes.
    () => `https://jsonplaceholder.typicode.com/posts/${props.id}`,
    // Overwrite some configuration if needed.
    {}
  )

  return (
    <Show when={post()}>
      <div>
        <h1>{post().title}</h1>
        <p>{post().body}</p>
      </div>
    </Show>
  )
}

// Example usage
const App = () => {
  const configuration = {
    // Turbo Query configuration: https://github.com/StudioLambda/TurboQuery
    // + a few extra configuration items described in this page.
  }

  return (
    <div>
      <TurboContext.Provide value={configuration}>
        <Suspense fallback={<div>Loading post...</div>}>
          <Post id={1} />
        </Suspense>
      </TurboContext.Provide>
    </div>
  )
}
```

# Create Turbo Resources

You can use `createTurboResource` to create a Solid's resource managed by `turbo-query`.

The first option is a `function` that returns the fetching key. This key is used as the cache key, it can be any string. Morever, you can usually use the URLs as keys as long
as you have a generic fetching function. An example of such a generic functio can be found
in the [Turbo Query](https://github.com/StudioLambda/TurboQuery) docs page. You can use
any reactive primitive inside as it will re-run the fetching if the resolved key ever changes.

A Turbo Resource returns an [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) containing 2 elements. The first element is
the fetched resource. This resource can be undefined if not using suspense. The second
element is an object containing all the available functions to work and manipulate the
first element.

```js
const [
  posts,
  {
    mutate,
    refetch,
    unsubscribe,
    abort,
    forget,
    expiration,
    isRefetching,
    lastFocus,
    createFocusAvailable,
    expiration,
    createStale,
  },
] = createTurboResource(() => `https://jsonplaceholder.typicode.com/posts`)
```

The actions API are described in the following list.
There's no need to supply the key in any of those functions as they are already scoped to it.

- `mutate`: Performs a local mutation of the data. This also broadcasts it to all other key listeners.

  ```js
  // Mutate the resource with a value.
  mutate([{ title: 'foo', body: 'bar' }])

  // Mutate the resource relative to the old value..
  mutate((old) => [...old, { title: 'foo', body: 'bar' }])
  ```

- `refetch`: Performs a refetching of the resource. This also broadcasts it to all other key listeners. Returns undefined if it's unable to refetch.

  ```js
  // Refetch the resource.
  refetch()
  ```

- `unsubscribe`: Unsibscribes the event listeners. If createResource was used outside of a component, this method will need to be called manually when it's no longer needed. By default, when the component unmounts it will clean up itself.

  ```js
  // Remove the event listeners.
  unsubscribe()
  ```

- `abort`: Aborts the current resource key resolver / fetcher if that's pending.

  ```js
  // Aborts the current resource key.
  abort()
  ```

- `forget`: Forgets the current resource key on the cache.

  ```js
  // Remove the key from the cache.
  forget()
  ```

- `expiration`: A `Function` that returns when the current key expires.

  ```js
  // Get the expiration Date or undefined if no current key.
  expiration()
  ```

- `isRefetching`: An `Accessor<boolean>` that allows you to know if there's a refetching in the background.

  ```jsx
  // This is a reactive value
  isRefetching() // true / false

  // In render functions...
  return (
    <Show when={isRefetching()}>
      <div>Refetching...</div>
    </Show>
  )
  ```

- `lastFocus`: An `Accessor<Date>` that determines the last time the page was focused after the resource was active.

  ```js
  // The last Date when the page was focused.
  lastFocus()

  <p>Last focus: {lastFocus().toString()}</p>
  ```

- `createFocusAvailable`: A `Function` to create reactive variables to watch is focus refetching is available and how many ms till it is. Return value is: `[Accessor<boolean>, Accessor<number>]`, usuualy typed as: `[isAvailable, availableIn]`. The parameter passed to the function determines the precision interval to update the reactive variables.

  ```js
  // Will update the reactive variables every 100ms.
  const [isAvailable, availableIn] = createFocusAvailable(100)

  <Show when={isAvailable()} fallback={<p>Focus available in {availableIn()}ms</p>}>
    <p>Focus refetch available</p>
  </Show>
  ```

- `createStale`: Very similar to the `createFocusAvailable`. It is a `Function` that creates two reactive signals `[isStale, staleIn]`, therefore returning `[Accessor<boolean>, Accessor<number>]`. Those signals determine if the key item is currently stale and if not, how many ms till it is. The function accepts a precision interval as a parameter.

  ```js
  // Will update the reactive variables every 100ms.
  const [isStale, staleIn] = createStale(100)

  <Show when={isStale()} fallback={<p>The value is now stale.</p>}>
    <p>The item is still valid, it will be stale in {staleIn()}ms</p>
  </Show>
  ```

# Configuration

Turbo Resources accept two additional configuration paramenters on the
`createTurboResource` call. Those are:

- `turbo`: In order to use Turbo Resources, those will need to know what [Turbo Query](https://github.com/StudioLambda/TurboQuery) instance to use. You can provide the instance to use by setting it in this property. If this is null, it will use the default Turbo Query instance exported by `turbo-query`.
- `transition`: A boolean indicating if it should use `startTransition` or transition function to use to transition the data.
- `refetchOnFocus`: A boolean indicating if it should refetch the key when the window focus changes.
- `refetchOnConnect`: A boolean indicating if it should refetch the key when the window network connect event.
- `focusInterval`: An number indicating the number of ms to throttle the on focus refetching. This prevents multiple fetching in a given time span by just ignoring it.

The configuration values preference list is as follows:

- Turbo Resource options
- Context
- undefined or defaults on `turbo-query`.

## Context Configuration

You can use Solid's context to provide common configuration options to each Turbo Resource. Any resources found under the context provider will use the configurations if not defined directly on the resource itself. You can provide your application with those configuration options as follows:

```jsx
import { TurboContext } from 'turbo-solid'

const App = () => {
  // Common configuration options
  const configuration = {}

  return (
    <TurboContext.Provider value={configuration}>
      <MyApp />
    </TurboContext.Provider>
  )
}
```

## Reconfigure Turbo Query

You can also re-configure turbo query by using the `configure` options on the default exported instance. Please refer to the documentation of [Turbo Query](https://github.com/StudioLambda/TurboQuery) to know more.

# Resource Actions

You can execute actions on resources in two different ways.

- By using the functions provided by a Turbo Resource's second array element. Those are bound to the resource key and therefore require a resource to exist first.

- By using the functions provided by the [Turbo Query](https://github.com/StudioLambda/TurboQuery) instance you chose to use. Those functions can be used anywhere in your code but will require the key as the first parameter since it's not bound to any key unlike the above functions. **Turbo Solid re-exports all `turbo-query`'s exports, so you can import it directly from `turbo-solid`**. For example, if you're using the default instance, you could use them as:

  ```js
  import { mutate, forget } from 'turbo-solid'

  // Mutate some value.
  mutate('/posts', [{ title: 'foo', body: 'bar' }])

  // Remove an item from the cache.
  forget('/posts')
  ```

You can see the full list of available methods by visiting the [Turbo Query](https://github.com/StudioLambda/TurboQuery) documentation.
