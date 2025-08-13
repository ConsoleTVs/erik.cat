---
title: "Deep dive into Laravel's service container"
description: "On its core, a Laravel application is a service container. Laravel does make heavy
use of those services during the execution of a request. In this article
we'll explore what a service container is, and how dependency injection works."
pubDate: "Dec 29 2021"
---

# Services

Laravel is built by abstracting away core functionalities into what's called a _service_.

A service is able to perform some singular autonomous job. By adding up those services, Laravel
is able to stand out as a solid framework. Some core services of Laravel include
the cache, database, mailing, file systems, authentication or even more trivial services like
cookies or sessions, even the router is isolated in its own service!

# Service Providers

It's important to understand how Laravel knows what services are available
to the application, and more importantly, how to resolve them (more on that later!).

Laravel does have a way to register those services to the application using Service Providers.

Those Providers are very simple classes that a `register` method and a `boot` method.

```php
use Illuminate\Support\ServiceProvider;

class ExampleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        //
    }
}
```

## The Register Method

Perhaps the most important part of those providers is telling the application how the service
is supposed to be resolved. Resolving a service means returning its value. Remember that a service
can be as simple as a function or some complex class. In the case of a function, we could understand
this registration as just running that function (the _service_) and returning its result, while for
classes, we could argue this could mean how we would initialize them, usually meaning how to _construct_ them.

Some services might be trivial to resolve, some others not so many... Services often rely on other services
to run. That's why we **cannot** resolve the services when we're registering them, this allows us to make sure
that the framework first registers all services before attempting to resolve any of them. Of course, circular dependencies
are not allowed, that means that if service `A` depends on `B`, `B` can't depend on `A`.
Think of registering services as a way to tell the application how to resolve them, without actually resolving them.

## The Boot Method

The boot methods run _after_ all the services have been registered and therefore, have access and can resolve
any other access. The boot method is called on each service provider upon the framework boot up.
This means it can be used if your service provider needs to perform additional operations before the
application starts. This method is called with dependency injection by the framework, meaning you could inject its
dependencies if needed directly in the method, as seen later in this article.

# Service Container

Laravel's application extends the service container that's provided by the framework. The service container
is responsible for storing the registered services,

## Registering values

In Laravel, we can register a service in different ways, and we can also tell the framework how
to resolve them. This important because some services might only need to be resolved once.

In general, we can tell a Laravel application to register a service given its name and a resolution function.
To register it, we have to use the `bind` method on the application, that's available in the service provider's instance
in the `app` property.

```php
use Illuminate\Support\ServiceProvider;

class ExampleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind('example-service', fn () => 10);
    }
}
```

In the code above, we have registered a new service `example-service` that, will eventually resolve
to the value `10`.

Let's define an example service class now:

```php
namespace App\Services;

class FirstService {
    //
}
```

Laravel provides shortcuts to register those services in a more convenient way, take those 2 examples below that
will register the same service in 2 different ways.

```php
use App\Services\FirstService;

// Service name: 'App\Services\FirstService'
$this->app->bind(FirstService::class, function () {
    return new FirstService();
});
// Service name: 'App\Services\FirstService'
$this->app->bind(FirstService::class);
```

It's very common to use the class's full name spaced path as the service name, although you can use any.

You might be surprised the last binding works, but it's more than that. Not only it does work but also allows
injecting its dependencies to its constructor if it had any. In our `FirstService` we don't have any constructor arguments
so that won't matter, but we'll later see the same example in a more advanced service.

Turns out that the resolution function does have access to the application on its parameters. You should always use the
parameter to access the application in case it's needed. To illustrate an example, if we wanted to manually register
a service and also inject its dependencies to create it, we'll do as follows:

```php
use App\Services\FirstService;
use Illuminate\Foundation\Application;

$this->app->bind(FirstService::class);
// This is the same as above but more verbose.
$this->app->bind(FirstService::class, function (Application $app) {
    return $app->call(FirstService::class);
});
```

Those two examples register exactly the same class with exactly the same resolution logic. To understand what
the `call` method does on the app, please read the `Dependency Injection` part.

### Singletons

A singleton is essentially a way to ensure that a service is only resolved once, and it's then reused when
it's attempted to be resolved again. They can be registered the same way as the application but using the `singleton`
method instead of `bind`.

```php
use App\Services\FirstService;

$this->app->singleton(FirstService::class);
```

That way, even if the application needs to resolve this service 5 times, all 5 will be the same instance and will only
be resolved / constructed the first time it's needed.

### Interface Binding

Perhaps the most important addition here is that not only you can bind classes to the container but
also interfaces! That means that all we would need to resolve the value from the container would be a
common interface. This is impressive since it gives us the ability to chose what implementation to use.

For example, imagine we want to create a `Cache` service. Let's first design the API of it using an interface:

```php
namespace App\Contracts;

interface CacheContract
{
    public function get(string $key): mixed;
    public function set(string $key, mixed $value): void;
    public function has(string $key): bool;
}
```

Given this contract, we could already tell Laravel to resolve this from the container as explained below, all we
would need would be this interface, and the guarantee that the returned value implements it.

That said, we can then choose what implementation we wanted to bind to the application.
Caches can have multiple implementations, for instance:

- File-based Cache
- In-Memory Cache
- Redis
- Database Cache

We could even implement them all and then just bind to the app, the "default" implementation of that interface.

```php
use App\Services\FileCache;
use App\Services\MemoryCache;
use App\Services\RedisCache;
use App\Services\DatabaseCache;
use App\Contracts\CacheContract;

// Just pick one
// $this->app->singleton(CacheContract::class, FileCache::class);
// $this->app->singleton(CacheContract::class, MemoryCache::class);
// $this->app->singleton(CacheContract::class, RedisCache::class);
// $this->app->singleton(CacheContract::class, DatabaseCache::class);
```

Laravel is even smarted by providing what's known as contextual binding, as explained below!

### Contextual Binding

Given the example above, it would be possible to use a certain implementation of the Cache depending on
the service we'll be resolving. For example, say we have a `FileBasedService` and a `DatabaseBasedService` and assume
that both need the cache on their constructors as follows.

```php
namespace App\Services;

use App\Contracts\CacheContract;

class FileBasedService {
    public function __construct(protected CacheContract $cache) {};
}
```

```php
namespace App\Services;

use App\Contracts\CacheContract;

class DatabaseBasedService {
    public function __construct(protected CacheContract $cache) {};
}
```

Knowing this, we can tell each service to use a specific implementation of our cache using contextual binding:

```php
use App\Services\FileBasedService;
use App\Services\DatabaseBasedService;
use App\Contracts\CacheContract;
use App\Services\FileCache;
use App\Services\DatabaseCache;

$this
    ->app
    ->when(FileBasedService::class)
    ->needs(CacheContract::class)
    ->give(FileCache::class);

$this
    ->app
    ->when(DatabaseBasedService::class)
    ->needs(CacheContract::class)
    ->give(DatabaseCache::class);
```

That way Laravel will inject a specific implementation to each service even if they have the same interface as the
parameter type!

## Resolving Values

Values can be resolved from the container using the `make` method on the Laravel's application class.
For example, we could already resolve our `FirstService` in the `boot` method as follows:

```php
use Illuminate\Support\ServiceProvider;
use App\Services\FirstService;

class ExampleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(FirstService::class);
    }

    public function boot(): void
    {
        $service = $this->app->make(FirstService::class);
        // Do something with the $service...
    }
}
```

A proposed alternative is to use the dependency injection mentioned earlier on the boot method (explained below).

```php
use Illuminate\Support\ServiceProvider;
use App\Services\FirstService;

class ExampleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(FirstService::class);
    }

    public function boot(FirstService $service): void
    {
        // Do something with the $service...
    }
}
```

Since we usually need access to this service inside our application, we can also use the `App` facade:

```php
use Illuminate\Support\App;
use App\Services\FirstService;

$service = App::make(FirstService::class);
// Do something with the $service...
```

# Dependency Injection's IOC

We've already seen the `call` method on the app. These methods allow calling a Closure or a class method and inject its
dependencies. Laravel is smart to understand that if you call a class directly, you're calling the constructor of it.

That said, let's illustrate a usual case where a service makes use of another. In this case, we'll require our service
to access the configuration service of a Laravel application.

```php
namespace App\Services;

use Illuminate\Config\Repository;

class SecondService {
    public function __construct(protected Repository $config) {};
}
```

If we wanted to initialize an instance of this service, we'll have to manually resolve the configuration from
the container:

```php
use App\Services\SecondService;
use Illuminate\Config\Repository;

$this->app->bind(SecondService::class, function (Application $app) {
    // We can also use $app->make('config')
    return new SecondService($app->make(Repository::class));
});
```

We can already see this is a pain to do, given we could accept multiple services, not only a single one.

That's why Laravel makes use of Dependency Injection's IOC (Inversion of Control). IOC essentially uses PHP's [Reflection](https://www.php.net/manual/en/book.reflection.php)
to inspect the method's parameters (in our case, the constructor) and seeks if we have that service registered.
Laravel uses the type of each parameter to check for that service in the app container, it then resolves it and passes
the resolved value to the method.

So in short, if we have a closure or method with some parameters that are type hinted with a class that's registered
in the service container with their class names, we can tell Laravel to resolve them using the container.

There are a lot of places in Laravel where Laravel uses IOC directly. Most notably, all controller methods are called
by the service container. That's why we can automatically resolve services and models there. For example, if we wanted
our services available in a controller (where the injected parameters **must** be first, as route parameters will follow):

```php
namespace App\Http\Controllers;

use App\Services\FirstService;
use App\Services\SecondService;

class ExampleController extends Controller
{
    public function exampleMethod(FirstService $first, SecondService $second)
    {
        // Do something with both services...
    }
}
```

# Additional resolution parameters

Although this is not covered in the official documentation as of today, it's worth noting that there are cases where
you want to provide additional parameters to the resolution function, perhaps to resolve to the right value. Turns out
that the resolution function accepts a 2nd argument that does just this:

```php
use App\Services\FirstService;
use Illuminate\Foundation\Application;

$this->app->bind(FirstService::class, function (Application $app, array $parameters) {
    // $parameters will change depending on the resolution.
    // We can optionally pass it to the call in case those were
    // needed on the constructor of the class.
    return $app->call(FirstService::class, $parameters);
});
```

Even the `call` method accepts the parameters as the 2nd argument if those are needed in the
actual closure or class's method!

Now, when we want to resolve it, we will just pass those parameters to the `make` call:

```php
use App\Services\FirstService;
use Illuminate\Support\Facades\App;

App::make(FirstService::class, [
    'foo' => 'value',
    'bar' => 123,
])
```

# There's even more...

You can find more information on the Laravel's container in the [Documentation](https://laravel.com/docs/8.x/container).

Other cool things you might find there are among:

- Binding Primitive Values
- Binding Typed Variadics
- Tagging
- Extending Bindings
- Container Events
