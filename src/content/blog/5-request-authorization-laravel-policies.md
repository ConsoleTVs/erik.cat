---
title: "Request Authorizing using Laravel's policies"
description: "In this article, we will explore how to authorize custom requests in Laravel. We'll explore
different ways to do it, and we'll see how to use them the `authorize` method
in custom form requests."
pubDate: "Sep 10 2022"
---

# What is a custom form request?

A custom form request is a class that extends the `Illuminate\Foundation\Http\FormRequest`.
They essentially encapsulate the validation and authorization logic of a request, and they are used
in controllers to validate and authorize the specific requests.

To create a custom request, all you need to do is create it using the artisan command:

```bash
php artisan make:request FooBarRequest
```

Those requests are very simple classes that extend the `FormRequest` class, and they have
two methods, the `authorize` and the `rules` methods.

This post will focus on the `authorize` method, and we'll see how to use it to authorize
the specific request.

# What is the authorize method?

The `authorize` method is a method that is called automatically by the `FormRequest` class
when the request is resolved. It is used to authorize the request, and it is where the
authorization logic should be placed.

The `authorize` method returns a boolean value, and if it returns `true`, the request will be
authorized, and if it returns `false`, the request will be unauthorized. Additionally, it can
also return a `Illuminate\Auth\Access\Response` or throw exceptions, like `Illuminate\Auth\Access\AuthorizationException`. That means we can return the gate's `authorize` result to authorize the request.

# How to authorize a custom request

To authorize a request, all you need to do is specify the request in the controller method.

```php
use App\Http\Requests\FooBarRequest;

public function store(FooBarRequest $request)
{
    // ...
}
```

Sometimes, the `$request` parameter is not even used. However, the request is still validated
under the hood as laravel does resolve the request class and calls the `authorize` method.

# Basic authorization

You can quickly return a boolean with the logic of your authorization.

```php
public function authorize()
{
    return $this->user()->id === $this->route('post')->user_id;
}
```

However, this is not the best way to do it, as often, authorization logic is more complex than
just a simple boolean.

# Authorization using policies

You can also use policies to authorize the request. To do so, you need to define the policy and
call it in the `authorize` method.

```php
public function authorize()
{
    return $this->user()->can('update', $this->route('post'));
}
```

This is usually enough for most use cases, but sometimes, you might ocasionally need to
perform certain logic that does not involve authenticated users.

For routes that **do not** have an authenticated user, the example above will throw an exception.

A quick fix would be to conditionally call the `can` method and specify a default value.

```php
public function authorize()
{
    if ($this->user()) {
        return $this->user()->can('update', $this->route('post'));
    }

    return false;
}
```

```php
public function authorize()
{
    return $this->user()?->can('update', $this->route('post')) ?? false;
}
```

Both examples above show the same functionally that will work regardless of whether the user
is authenticated or not.

The issue with those examples is that you're splitting your authorization logic between the policy
and the form request. This is not ideal, as you might forget to update the policy or request when
requirements change.

# Authorization using gates (the right way)

There are different ways to authorize using the policies. The most common way is to use the
`can` method on users directly. However, for cases when users are not authenticated, you must
fallback to traditional gates or helpers.

You might be used to the `authorize` methods on controllers. Those do no require the user to be
authenticated and instead rely on policies to have the correct annotation.

```php
use App\Models\User;

public function store(?User $user)
{
    // ...
}
```

The example above will ensure the policy method can be called without an authenticated user.

However, in custom form requests you do not have access to controller helpers nor middlewares and
as we explored, authorizing via the user model is not ideal. So instead, if we explore how the
controller helpers work, we can see that they rely on the `Illuminate\Contracts\Auth\Access\Gate` class.

```php
use Illuminate\Contracts\Auth\Access\Gate;

public function authorize()
{
    return app(Gate::class)->authorize('update', $this->route('post'));
}
```

Additionally, the authorize method can also inject your dependencies automatically, making
the code even cleaner.

```php
use Illuminate\Contracts\Auth\Access\Gate;

public function authorize(Gate $gate)
{
    return $gate->authorize('update', $this->route('post'));
}
```

This removes all the caveats and allows for a simple, clean and encapsulated
way to authorize your requests while keeping your authorization logic in policies.

Therefore, the only thing that those request authorizations do is call the right policy
with the right data (coming rom the request body or route params).
