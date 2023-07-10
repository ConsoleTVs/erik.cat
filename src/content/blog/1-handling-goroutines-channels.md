---
title: "Handling goroutines with channels"
description: "It's common for different goroutines to send or await values.
For example, you might want a goroutine to perform some calculus and return
back the result to the main routine. However, a goroutine handler can't return
back the result with a return statement. This article explains how to use
channels to return values from goroutines."
pubDate: "Dec 20 2021"
---

# Introducing Channels

A channel is essentially a pipe where you can send or receive values from.
Channels are the main way to communicate different goroutines to avoid race
conditions on shared memory.

Channels can only send or receive a single value type and must be specified
when the channel is created.

There are two kinds of channels:

- **Unbuffered Channels**:
  Only accept sending values to it if there's somebody awaiting to recieve it.

  ```go
  unbuffered := make(chan string)
  ```

- **Buffered Channels**:
  A Buffered channel allows sending up to _n_ values, being _n_ the channel capacity (buffer size).
  When the buffer is full, sending data will be a blocking call until some other goroutine reads a
  value from the channel. In the same fashion, reading a value will be a blocking call if there's no
  value in the buffer.

  ```go
  buffered := make(chan string, n)
  ```

Go uses an inverse arrow `<-` to read and write to a buffer as follows.

```go
buffer := make(chan string, 1)
buffer <- "hello" // Send a value
value := <- buffer // Read a value
```

When passing around channels, you can also determine how the channel is expected to be used.

- Read only: `<-chan T`
- Write only: `chan<- T`
- Read-Write: `chan T`

# A Practical Example

Let's illustrate a practical example of a simple list permutation.
Let's imagine a situation where we want to calculate the double of each
integer in a list. Althought it's a simple case, it's a process that can
be be done concurrently in different goroutines. To do this, we'll first create
the handler that will perform this operation and then send the result to the
buffered channel.

```go
func double(res chan<- int, num int) {
	res <- num * 2
}
```

We can then create a list and a buffered channel, since we know how many items we'll have.

```go
nums := []int{1, 2, 3, 4, 5}
res := make(chan int, len(nums))
```

We can then iterate over the original array to dispatch a new goroutine
to calculate the double of each number concurrently. The catch is that
that since this happens cuncurrently there's no guarantee that the order
of completion is the same as the one we dispatch the goroutines. To complete
this simple example, let's see how we would dispatch those goroutines first:

```go
for _, num := range nums {
    go double(res, num)
}
```

And now we need to read the results from the buffer (`cap()` returns the capacity of a buffered channel).
We can also close the channel afterwards since it's no longer needed.

```go
doubled := []int{}
for i := 0; i < cap(res); i++ {
    doubled = append(doubled, <-res)
}
close(res)
```

Understandably, the expected result is not guaranteed to be ordered. To do this we'll need more
context passed around in the buffer as shown in the next example.

```go
package main

import "fmt"

func double(res chan<- int, num int) {
	res <- num * 2
}

func main() {
	nums := []int{1, 2, 3, 4, 5}
	res := make(chan int, len(nums))

	for _, num := range nums {
		go double(res, num)
	}

	doubled := []int{}
	for i := 0; i < cap(res); i++ {
		doubled = append(doubled, <-res)
	}
	close(res)

	fmt.Println(doubled)
}
```

# Sending more information on channels

After checking out the previous example, it's clear that sometimes a primitive value isn't enough.
Sometimes we need more context to know where to place that value. Taking the example above, let's
say we were interested in placing the results in the same list index as their original ones. That
will require is to know what index the original value comes from when we read the channel's value.

To do this, we'll first create a `Result` type, that we'll use to read and write to a channel.

```go
type Result struct {
    Value int
    Index int
}
```

Afterwards, when creating the channel, we'll use that type instead of a primitive `int`.

```go
res := make(chan Result, 5)
```

Now, we need to tell our handler more information about the number. Looking at our result
it's clear we'll need to know the index where the original `int` is located.

```go
func double(res chan<- Result, num int, i int) {
	res <- Result{Value: num * 2, Index: i}
}
```

Because of that, when we iterate and dispatch those goroutines, we'll need to supply the
index to them, modifying the for loop to be the following.

```go
for i, num := range nums {
    go double(res, num, i)
}
```

Having done that, the only thing left to do is to read the results from the channel and
add them to the right position. We we'll first modify our doubled list to be created with
the exact number of elements we have. We'll then proceed to read from the channel and assign
the value it's right index on that list.

```go
doubled := make([]int, len(nums))
for i := 0; i < cap(res); i++ {
    result := <-res
    doubled[result.Index] = result.Value
}
close(res)
```

And with this, the result will always be ordered!

```go
package main

import "fmt"

type Result struct {
	Value int
	Index int
}

func double(res chan<- Result, num int, i int) {
	res <- Result{Value: num * 2, Index: i}
}

func main() {
	nums := []int{1, 2, 3, 4, 5}
	res := make(chan Result, len(nums))

	for i, num := range nums {
		go double(res, num, i)
	}

	doubled := make([]int, len(nums))
	for i := 0; i < cap(res); i++ {
		result := <-res
		doubled[result.Index] = result.Value
	}
	close(res)

	fmt.Println(doubled)
}
```
