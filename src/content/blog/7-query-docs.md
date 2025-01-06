---
title: "Lambda Query Documentation"
description: "This post is used as documentation for `@studiolambda/query`. Lambda Query is a library
created to manage asynchronous data on your code. This is generally used when you
have to fetch data asynchronously for a given resource. Lambda Query allows you to
manage this data by using an internal cache. It is very similar to how vercel's `swr`
work. Lambda Query is also built to support arbitrary cache and event system,
making it possible to create your own implementations."
pubDate: "Jan 04 2025"
---

To know more about the project, please checkout the [Github repository](https://github.com/StudioLambda/Query). You might find some valuable information there that is not covered in this documentation. If you have any questions, feel free to open an issue on the repository.

# Installation

To install Lambda Query just install the `@studiolambda/query` NPM package:

```sh
npm i @studiolambda/query
```

Lambda Query does not have any dependencies and it's packed at around 1.7KB (compressed).

# Lambda Query

This section includes the lower level API that can be used
to interact with Lambda Query. Usually, a higher level API
can be found depending on the UI Library you are using.

## Getting started

Start using Lambda Query by creating an instance of it. Lambda Query accepts a bunch of options
on its constructor, allowing to tune and setup the internal configuration, caches and event system.

```ts
import { createQuery } from '@studiolambda/query'

// Create the Query instsance.
// Destructure it if prefered (works well!)
const instance = createQuery()

// Start querying!
const result = await instance.query('/posts')
```

## Configuration Options

The configuration options available are the following:

| Property          | Type       | Default | Description                                                                                                                                                                                                                                                                        |
| ----------------- | ---------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **expiration**    | `Function` | `2000`  | A `function` that takes in the resolved item and returns the number of `ms` to cache it for.                                                                                                                                                                                       |
| **fetcher**       | `Function` | fetch   | A fetcher `function` that takes in the current cache key and additional options. The additional options is an object that currently have an [abortion signal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) on its property named `signal`.                        |
| **stale**         | `Boolean`  | `true`  | A `boolean` that determines if the a stale value can be returned from a query when a value has already expired. If a stale value is returned, a refetching will be triggered in the background to ensure a fresh data when possible, and an event will be emmited when it happens. |
| **removeOnError** | `Boolean`  | `false` | A `boolean` indicating if the stored cached item should be removed upon a refetching causes an error. The fetching resolver is always removed.                                                                                                                                     |
| **fresh**         | `Boolean`  | `false` | A `boolean` indicating if a query result should always be a fresh fetched instance regardless of any cached value or its expiration time.                                                                                                                                          |

### Additional Instance Configuration

Additionally, the instance itself also accepts the specific configurations found below:

| Property           | Type               | Default                         | Description                                                                                                                                                                                                                                               |
| ------------------ | ------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **itemsCache**     | `Interface`        | `new Map()`                     | A `Cache<ItemsCacheItem>` indicating the cache to use for the items.                                                                                                                                                                                      |
| **resolversCache** | `Interface`        | `new Map()`                     | A `Cache<ResolversCacheItem>` indicating the cache to use for the resolvers.                                                                                                                                                                              |
| **events**         | `EventTarget`      | `new EventTarget()`             | A `EventTarget` indicating the event system to use.                                                                                                                                                                                                       |
| **broadcast**      | `BroadcastChannel` | `new BroadcastChannel('query')` | A `BroadcastChannel` indicating the broadcast channel to use. If not provided, the broadcast feature won't be used as it would require cleanup. If you're using lambda query via a specific library such as React, this is handled automatically for you. |

## Lazy Configuration or Re-Configuration

You can re-configure an Lambda Query instance by calling the `configure` function provided
by the instance and passing it the exact same options as the original constructor, however,
the options will be merged with the current instance options rather than replaced, therefore
there's no need to pass in the whole configuration, you can just give it the options you wish
to replace.

```ts
instance.configure(options)
```

## Query Asynchronous Data

You can use the `query` function provided by the instance to start querying for async data. This method takes in a cache key that will be passed to the fetcher and some specific options that will replace the instance options for that specific call.

The result of a query call will always be a promise that will be resolved to the
acual data.

```ts
// Using the URL as cache key.
const result = await instance.query('/posts')

// Custom cache key and fetcher for this query.
const result2 = await instance.query('my-posts', {
  async fetcher(key, { signal }) {
    if (key === 'my-posts') {
      const response = await fetch('/posts', { signal })

      if (!response.ok) {
        throw new Error('Unable to fetch the data: ' + response.statusText)
      }

      return await response.json()
    }

    throw new Error('whoops!')
  },
})
```

## Subscribe to changes

You can subscribe to different events happening on Lambda Query by using the `subscribe`
function in an instance. The return value of a subscribe is an unsubscriber that can be
called to terminate the subscription.

```ts
const unsubscribe = instance.subscribe('event-name', function (event: Event) {
  // ...
})

// When the subscription is no longer needed...
unsubscribe()
```

The following are the available events that you can subscribe to, and each have a diferent payload available.

| Event          | Description                                                                                                                                                                                                                                                                                                                                    | Event Detail                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **refetching** | Fired when a value is refetched.                                                                                                                                                                                                                                                                                                               | Promise that will resolve to the fetched data. |
| **resolved**   | Fired when a value is resolved, this means it was successfully fetched or refetched.                                                                                                                                                                                                                                                           | The resolved item.                             |
| **mutating**   | Fired when a value is currently being mutated.                                                                                                                                                                                                                                                                                                 | Promise that will resolve to the mutated item. |
| **mutated**    | Fired when a value has been manually mutated. The `event` detail is the mutated item.                                                                                                                                                                                                                                                          | A                                              |
| **aborted**    | Fired when a value has been manually aborted either by calling `abort` or by calling `forget` when a resolver is pending. The `event` detail is the promise's result, usually if the abort signal has been used this means it's either what it returns when it's aborted or in case of throw, what the `.catch` returns (the throwing reason). | A                                              |
| **forgotten**  | Fired when a value has been forgotten from the cache, probably because of a call to `forget`. The `event` detail is the item that has been forgotten from the cache.                                                                                                                                                                           | A                                              |
| **hydrated**   | Fired when a value has been hydrated directly to the cache due to a call to `hydrate`. The `event` detail is the item that has been hydrated to the cache.                                                                                                                                                                                     | A                                              |
| **error**      | Fired when a refetching has failed, this means the promise of the fetcher has been rejected. The `event` detail is the error returned by it.                                                                                                                                                                                                   | A                                              |

## Subscribe to broadcast channel

You can also call the `subscribeBroadcast` function to make Lambda Query
reproduce the channel events to the current event system.
This function returns the unsubscriber that can be called to stop the subscription.

```ts
const unsubscribe = instance.subscribeBroadcast()
// ...
unsubscribe()
```

## Optimistic Mutations

You can perform optimistic mutations of the items in the cache by using the `mutate` function on an instance.
The mutation function also accepts options.
This function should be awaited to ensure it has finished its operations.

```ts
// Mutating a specific item.
await instance.mutate('/user', user)

// Mutating a specific item with a custom expiration.
await instance.mutate('/user', user, {
  expiration(item) {
    return 1000 // Expiration time in ms
  },
})

// Mutating an item based on the previous value.
// For example, appending an item to a list.
await instance.mutate('/posts', function (previous, expiresAt) {
  return [...previous, post]
})

// Mutating an item based on an update promise.
// This is the most efficient way to do it as it will
// respect the events and therefore allow better UI transitions.
await instance.mutate('/posts', async function (previous) {
  const post = await createNewPost()

  return [...previous, post]
})
```

## Aborting pending operations

You can abort any pending async operations by using the `abort` function on an instance.
This will cause all pending fetchers to be aborted using the internal [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), and therefore, the signal passed to the fetcher will be used. Make sure to be using that signal to gracefully
teardown your async operations. After the functions have been aborted, their resolvers will be removed from the cache, therefore never resolving to its value. This function does not return anything.

```ts
// Abort without any reason.
instance.abort('/posts')

// Abort with a specific reason.
instance.abort('/posts', reason)
```

## Invalidate or Forget Cached Items

You can invalidate or forget certain cache items by key using the `forget` function provided on an instance.
This function does not return anything.

```ts
// Forget a single key.
instance.forget('/user')

// Forget multiple keys.
instance.forget(['/user', '/posts'])

// Forget multiple keys using regex.
instance.forget(/^user(.*)/g)
```

## Hydrate data to the cache

In order to hydrate certain data to the cache the `hydrate` function can be used.
This function does not return anything.

```ts
// Hydrate a key into the cache
instance.hydrate('/user', user)

// Hydrate a key into the cache with
// specific expiration.
instance.hydrate('/user', user, {
  expiration(item) {
    return 1000 // Expiration time in ms
  },
})

// Hydrate multiple key into the cache
instance.hydrate(['/post/1', '/post/2'], defaultPost)
```

## Inspect current cached keys.

You can inspect the current cached keys of both, the `resolvers` cache and the `items` cache by using the `keys` function on an instance. This will return an [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) with the given keys.

```ts
// Get the resolver keys.
const resolverKeys = instance.keys('resolvers')

// Get the item keys.
const itemKeys = instance.keys('items')
```

## Check expiration date of items

You can check the expiration date for the given keys by using the `expiration` function.
The return value is undefined if that key is not in the items cache, otherwise, a [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object is returned.

```ts
const expirationDate = expiration('/user')
```

## Get current data from the cache

You can use the `snapshot` function to get the current data
of the items cache, this will return undefined if not found in the
items cache (eg. still resolving).

```ts
const user = instance.snapshot('/user')
```

## Additional getters

You can additionally call the following getters to access specific instances of
Lambda Query:

| Event       | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| **caches**  | Access the current caches.                                   |
| **events**  | Access the current event system.                             |
| **channel** | Access the current broadcast channel (undefined it not set). |

# React

If you're using React you can directly use the `@studiolambda/query/react`
package to use Lambda Query. This package already provides all the primitives
to work with Lambda Query using React, including Hooks, Components and all the
logic around it (Suspense, Transitions, ...).

This implementation has been designed to work first-class with React's Suspense
and Transitions model, and therefore, it requires React 19.

## Getting Started

To get started using the React integration, simply wrap your application
with the `QueryProvider` Component.

Once this is done, a query instance is already provided via context and
is available to any hook call to use.

The main hook is called `useQuery` and accepts the query key and some options.
This hook will make use of all the modern features of React 19, so please make sure
you understand the following concepts:

- Suspense
- Transitions
- Error Boundaries

Components that use the `useQuery` hook will suspend until the data is either resolved
or failed. When this happens, either the Suspension finishes or the Error Boundary
hits.

Any changes to the data (such as mutations) are triggered inside a transition,
meaing there's a pending signal `isPending` that can be used to track an ongoing
transition. Transitions are created on each hook call, but can be scoped on the
context as well by using a `QueryTransition` component. This would allow to use
the `isPending` signal higher in the component tree (parent components of the hook call).

As an example of how Lambda Query can be used in React, here's a simple application:

```tsx
import { useQuery, QueryProvider } from '@studiolambda/query/react'
import { createRoot } from 'react-dom/client'

interface User {
  email: string
}

function App() {
  return (
    <QueryProvider>
      <Component />
    </QueryProvider>
  )
}

function Component() {
  const { data } = useQuery<User>('/user')

  return <div>Email: {data.email}</div>
}

createRoot(document.getElementById('root')!).render(<App />)
```

## Components

The available React components that can be imported and used directly and
abstract away common boilerplate about setting everything up.

### QueryProvider

In order to use Lambda Query, you first need to provide
an instance to your React application. This can be done using
the `QueryProvider` component. This component already takes care
of all the logic around subscribing to a broadcast channel and providing
the query instance using a context, alongside all its options.

You can provide any configuration of Lambda Query instance as props to the provider.

```tsx
import { QueryProvider } from '@studiolambda/query/react'

export function App() {
  return (
    <QueryProvider>
      <MyApp />
    </QueryProvider>
  )
}
```

### QueryTransition

You can use the `QueryTransition` component to indicate the transition function and pending
signal to use by any `useQuery` calls under the hood. Keep in mind that the hook
can also avoid checking this context on-demand via the `ignoreTransitionContext` option.

When not used, each `useQuery` creates its own transition. If used, the context
transition will be used.

```tsx
import { QueryTransition } from '@studiolambda/query/react'
import { useTransition } from 'react'

export function App() {
  const [isPending, startTransition] = useTransition()

  return (
    <QueryTransition isPending={isPending} startTransition={startTransition}>
      <MyApp />
    </QueryTransition>
  )
}
```

## Hooks

The available react hooks allow for quick and easy access to most Lambda Query
features directly on react.

### useQuery

To query data using React, you can use the `useQuery` hook.

```tsx
import { useQuery } from '@studiolambda/query/react'

interface User {
  email: string
}

function App() {
  const { data } = useQuery<User>('/user')

  return <div>{data.email}</div>
}
```

The options that are accepted as the second parameter are the same of the Lambda Query.
Additionally, both the context and the hook accept the following properties:

| Property                    | Type      | Default     | Description                                                                                                                           |
| --------------------------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **query**                   | `Query`   | `undefined` | Overrides the Lambda Query instance to use.                                                                                           |
| **clearOnForget**           | `Boolean` | `false`     | Clears the data upon forgetting, meaning a new query will be triggered when the data is forgotten. Otherwise, stale data will remain. |
| **ignoreTransitionContext** | `Boolean` | `false`     | Tells the hook to ignore the transition context and always create a transition.                                                       |

The return value is an object that contains the following properties:

| Property                    | Type       | Description                                                                                                                                                |
| --------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **data**                    | `T`        | The actual data that has been fetched. It will always be resolved, as the component will suspend until it is ready.                                        |
| **isPending**               | `Boolean`  | A `boolean` indicating the current state of the transition that will handle any mutations or data changes (such as refetching) after the first suspension. |
| **expiresAt**               | `Date`     | The `Date` when the item will be considered expired.                                                                                                       |
| **isExpired**               | `Boolean`  | A `boolean` indicating if the data has been expired.                                                                                                       |
| **isRefetching**            | `Boolean`  | A `boolean` indicating if the data is currently being refetched.                                                                                           |
| **isMutating**              | `Boolean`  | A `boolean` indicating if the data is currently being mutated (only works when a mutation promise has been pased to `mutate`.                              |
| **refetch(options?)**       | `Function` | A `function` to refetch the data using the provided options. The refetching will be triggered under a transition if possible.                              |
| **mutate(value, options?)** | `Function` | A `function` to mutate the data. Use an async function if possible to correctly trigger transitions and `isMutating`.                                      |
| **forget()**                | `Function` | A `function` to forget the data.                                                                                                                           |

### useQueryStatus

The `useQueryStatus` hook returns only the status of the given key without fetching.

```tsx
import { useQueryStatus } from '@studiolambda/query/react'

function App() {
  const { isExpired } = useQueryStatus('/user')

  return <div>{isExpired ? 'expired' : 'not expired'}</div>
}
```

The return value is an object that contains the following properties:

| Property         | Type      | Description                                                                                                                   |
| ---------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **expiresAt**    | `Date`    | The `Date` when the item will be considered expired.                                                                          |
| **isExpired**    | `Boolean` | A `boolean` indicating if the data has been expired.                                                                          |
| **isRefetching** | `Boolean` | A `boolean` indicating if the data is currently being refetched.                                                              |
| **isMutating**   | `Boolean` | A `boolean` indicating if the data is currently being mutated (only works when a mutation promise has been pased to `mutate`. |

### useQueryActions

The `useQueryActions` hook returns only the actions of the given key without fetching.

```tsx
import { useQueryActions } from '@studiolambda/query/react'

function App() {
  const { mutate } = useQueryActions('/user')

  function change() {
    mutate('something else')
  }

  return <button onClick={change}>Change me</div>
}
```

The options that are accepted as the second parameter are the same of the Lambda Query.
Additionally, the hook accept the following properties:

| Property  | Type    | Default     | Description                                 |
| --------- | ------- | ----------- | ------------------------------------------- |
| **query** | `Query` | `undefined` | Overrides the Lambda Query instance to use. |

The return value is an object that contains the following properties:

| Property                    | Type       | Description                                                                                                                   |
| --------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **refetch(options?)**       | `Function` | A `function` to refetch the data using the provided options. The refetching will be triggered under a transition if possible. |
| **mutate(value, options?)** | `Function` | A `function` to mutate the data. Use an async function if possible to correctly trigger transitions and `isMutating`.         |
| **forget()**                | `Function` | A `function` to forget the data.                                                                                              |

### useQueryInstance

The `useQueryInstance` hook returns the `Query` instance that's currently
accessible on the scope, that is, the context query or query passed to it
in the options parameter.

This hook is often used internally to resolve the correct instance to use,
but can be beneficial when accessing raw features on Lambda Query or testing.

```tsx
import { useQueryInstance } from '@studiolambda/query/react'

function App() {
  const { expiration } = useQueryInstance()

  return <div>Expiration date: {expiration('/user').toString()}</div>
}
```

The options that are accepted as the second parameter are:

| Property  | Type    | Default     | Description                                 |
| --------- | ------- | ----------- | ------------------------------------------- |
| **query** | `Query` | `undefined` | Overrides the Lambda Query instance to use. |

The return value is the Lambda Query instance that is eitehr the one passed in
in the options or the one in the context (options has preference).

**This hook throws if no instance is found in neither the context nor the options, make sure you use an error boundary**

### useQueryContext

The `useQueryContext` hook is a shortcut on top of `use()` where a context is passed that is the
actual Lambda Query Context.

### useQueryTransition

The `useQueryTransition` hook is a shortcut on top of `use()` where a context is passed that is the
actual Lambda Query Transition Context.
