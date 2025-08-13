---
title: 'Dealing with error wrapping in Go'
description: "In this article, we'll take a closer look at how we can use the power of go errors to enhance our day to day debugging and make sense of error values. We'll also take a look at how errors are wrapped and unwrapped. Learn how to build meaningful stack traces and boost your debugging abilities."
pubDate: 'Dec 27 2023'
---

# Boolean errors

Sometimes, errors can be seen as Boolean. Those are quite common when
a given operation can only fail for a single reason, or at least, a single
reason is often enough to know whether something succeeded or not, and because
the reason is often obvious. This is the case, for example, when trying to
know if a key exists in some map.

There are cases, however, that require more context about what exactly went
wrong. For example, let's say you design a login system and need to know
whether a given set of credentials are allowed in. You might be tempted to
use Boolean to indicate if the operation succeeded.

This code allows checking if the given credentials match within a hard-coded list.
If the user is not found or the password does not match, it will return false.

```go
import "errors"

var credentials = map[string]string {
    "john.doe": "secret-password",
    "foo.bar": "super-secret-password",
}

func Login(username, password string) bool {
    pass, ok := credentials[username]

    return ok && password == pass
}
```

However, this quickly poses a problem upfront. What happens if the operation failed
and the credentials weren't allowed. Is it the username that's wrong, or is it the
password that's invalid? This information might be interesting to be known (even
if that's just for internal logging).

# Sentinel errors

One of the most basic errors we can return is a sentinel error.
Sentinels are pre-defined errors that contain no specific information
but serve a similar purpose as Exceptions in other languages. They allow
knowing when certain types of error happen in your code.

The equivalent code as the one above using Boolean is as follows.

```go
import "errors"

var (
    ErrInvalidCredentials = errors.New("invalid credentials")
)

var credentials = map[string]string {
    "john.doe": "secret-password",
    "foo.bar": "super-secret-password",
}

func Login(username, password string) error {
    pass, ok := credentials[username]

    if !ok || password != pass {
        return ErrInvalidCredentials
    }

    return nil
}
```

This still has the same problems as using Boolean, but we can now use multiple
sentinels to differentiate the two kinds of errors that can happen when trying
to log in: Invalid username or invalid password.

```go
import "errors"

var (
    ErrUsernameNotFound     = errors.New("username not found")
    ErrPasswordMissmatch    = errors.New("password missmatch")
)

var credentials = map[string]string {
    "john.doe": "secret-password",
    "foo.bar": "super-secret-password",
}

func Login(username, password string) error {
    pass, ok := credentials[username]

    if !ok {
        return ErrUsernameNotFound
    }

    if password != pass {
        return ErrPasswordMissmatch
    }

    return nil
}
```

Now this code allows knowing why exactly the function failed and gives clear purpose
at the different paths. Let's now add additional context information to the error.
Let's see if we can also know what username or password failed.

# Wrapping errors: adding context to errors

Adding additional context to the errors allows to quickly identify why exactly went
wrong when performing the operation. In our case for example, we can quickly add
the username that failed or the password that failed to the error.

```go
import (
    "errors"
    "fmt"
)

var (
    ErrUsernameNotFound     = errors.New("username not found")
    ErrPasswordMissmatch    = errors.New("password missmatch")
)

var credentials = map[string]string {
    "john.doe": "secret-password",
    "foo.bar": "super-secret-password",
}

func Login(username, password string) error {
    pass, ok := credentials[username]

    if !ok {
        return fmt.Errorf("%w: %s", ErrUsernameNotFound, username)
    }

    if password != pass {
        return fmt.Errorf("%w: %s", ErrPasswordMissmatch, password)
    }

    return nil
}
```

This already exposes more information to the error, that is, the specific information
needed to quickly identify why the operation failed. Notice the `%w`.
This is a special directive on the `fmt` package that allow wrapping errors.
This means that we can later still know if the error was `ErrUsernameNotFound`
or `ErrPasswordMissmatch` while also allowing us to create that new error
with context.

# Joining errors: adding even more context

In our first single sentinel example, it allowed for additional
use case; that is, knowing when the operation failed because a login failed down the
line, regardless of either username or password error.

To maintain this feature, we can make use of the join feature of the errors package.

```go
import (
    "errors"
    "fmt"
)

var (
    ErrInvalidCredentials   = errors.New("invalid credentials")
    ErrUsernameNotFound     = errors.New("username not found")
    ErrPasswordMissmatch    = errors.New("password missmatch")
)

var credentials = map[string]string {
    "john.doe": "secret-password",
    "foo.bar": "super-secret-password",
}

func Login(username, password string) error {
    pass, ok := credentials[username]

    if !ok {
        return errors.Join(
            ErrInvalidCredentials,
            fmt.Errorf("%w: %s", ErrUsernameNotFound, username),
        )
    }

    if password != pass {
        return errors.Join(
            ErrInvalidCredentials,
            fmt.Errorf("%w: %s", ErrPasswordMissmatch, password),
        )
    }

    return nil
}
```

This example is amazing as it also allows errors that don't really come from you
to be in a position where you understand that the operation that's failing is due
a credentials issue.

For example, let's say that upon login, the system would need to verify some
additional information to know if your account is verified and this operation
could potentially fail.

```go
import (
    "errors"
    "fmt"
)

var (
    ErrInvalidCredentials   = errors.New("invalid credentials")
    ErrUsernameNotFound     = errors.New("username not found")
    ErrPasswordMissmatch    = errors.New("password missmatch")
)

var credentials = map[string]string {
    "john.doe": "secret-password",
    "foo.bar": "super-secret-password",
}

func Login(username, password string) error {
    pass, ok := credentials[username]

    if !ok {
        return errors.Join(
            ErrInvalidCredentials,
            fmt.Errorf("%w: %s", ErrUsernameNotFound, username),
        )
    }

    if password != pass {
        return errors.Join(
            ErrInvalidCredentials,
            fmt.Errorf("%w: %s", ErrPasswordMissmatch, password),
        )
    }

    if err := IsActive(username); err != nil {
        return errors.Join(ErrInvalidCredentials, err)
    }

    return nil
}

func IsActive(username string) error {
    // ...

    return nil
}
```

With the example we provided, it's easy to join the invalid credentials error
with an error that might be happening on a different part of our application
(e.g. Database, serializations, et al.).

This allows to quickly identify that what failed is the login attempt, even if
the error came deep down the line due to other reasons.

# Checking for specific errors

When checking for specific errors, we can take advantage of the `errors.Is` and `errors.As` to know if there's an error deep down the chain of errors we have provided. It does not matter if that error was actually deep down that chain. For example, the following code outputs `true` for all those possibilities:

```go
package main

import (
	"errors"
	"fmt"
)

func main() {
	errFirst := errors.New("first")
	errSecond := errors.New("second")
	errThird := errors.New("third")

	err := errors.Join(
		errFirst,
		errors.Join(
			errSecond,
			fmt.Errorf("%w: last", errThird),
		),
	)

	fmt.Println(
		errors.Is(err, errFirst),   // true
		errors.Is(err, errSecond),  // true
		errors.Is(err, errThird),   // true
	)
}
```

This means that both functions recursively walk our error chain to know if
it contains the one we're looking for.

# Unwrapping errors: getting context back

So, we have managed to wrap errors using either the `fmt` directive and the `errors.Join` method. Let's have some deep understanding about how we can reverse this operation to get the original errors back.

## Unwrapping formatted errors

Wrapping using `fmt` allows wrapping only a single error in another error. Go's standard library quotes:

> An error e wraps another error if e's type has one of the methods
>
> ```
> Unwrap() error
> Unwrap() []error
> ```

In the case of `fmt`, the returned error implements `Unwrap() error`, meaning you can
get back the value of the wrapped error by doing the following operation:

```go
import "errors"

errWrapped := errors.New("wrapped error")
err := fmt.Errorf("%w: something else", errWrapped)

// ...

originalWrapped := err.(interface {
    Unwrap() error
}).Unwrap()
```

This is [precisely what it does](https://cs.opensource.google/go/go/+/refs/tags/go1.21.5:src/errors/wrap.go;l=17) in the `errors.Unwrap` method that comes with the standard library (well, it also handles the case where there is no error wrapped by returning nil), so a more elegant way would be:

```go
import "errors"

errWrapped := errors.New("wrapped error")
err := fmt.Errorf("%w: something else", errWrapped)

// ...

originalWrapped := erorrs.Unwrap(err)
```

## Unwrapping joined errors

However, the `errors.Join` does not come with an operation on the standard library
to unjoin the errors, we can have to manually do this by applying the
same operation we did manually earlier. In this case, when joining errors using `errors.Join` the function's documentation tells us that:

> A non-nil error returned by Join implements the `Unwrap() []error` method.

That means we can unwrap or unjoin the errors by doing the following:

```go
import "errors"

errFirst := errors.New("first error")
errSecond := errors.New("second error")
err := errors.Join(errFirst, errSecond)

// ...

errs := err.(interface {
    Unwrap() []error
}).Unwrap()
```

However, those two methods to unwrap errors pose another challenge. Unwrapping
only unwraps the errors joined by a single `errors.Join` call. It does not do so
recursively.

## Error stack trace

It's usually interesting to get back some sort of stack trace of all the meaningful
errors that occurred down the line. This can be quite easy to do, but we have to keep
in mind, two simple concepts:

- The error resulted from a Join can be ignored.
- Wrapped errors can often be ignored too (although it could be argued against).

A quick way to get a simple stack trace from a resulting error could be done with:

```go
import "errors"

func stackTrace(err error) []error {
	result := make([]error, 0)

	// Unwrap joined errors and ignore the join itself.
	if e, ok := err.(interface {
		Unwrap() []error
	}); ok {
		for _, err := range e.Unwrap() {
			result = append(result, stackTrace(err)...)
		}

		return result
	}

	// We can ignore the wrapped error, as it's contained
	// in the fmt.Errorf string.
	return append(result, err)
}
```

This function will always give you back a list of all the meaningful
errors that occurred in the application, regardless of the wrapping
strategy that happened deep down the tree. Errors resulted from a join
operation are ignored and so do wrapped errors in favor of the resulted
wrap.

As an example, if we were to unwrap the following `err`, the result would be:

```
[first, second, third: last]
```

```go
errFirst := errors.New("first")
errSecond := errors.New("second")
errThird := errors.New("third")

err := errors.Join(
    errFirst,
    errors.Join(
        errSecond,
        fmt.Errorf("%w: last", errThird),
    ),
)

stackTrace(err) // [first, second, third: last]
```

I hope this gives you more overview about how you can take advantage of the go
`errors` package to build a quick and easy way to debug and unwrap errors in
a glance.
