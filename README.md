# DominoJS

This describes the global pattern of Domino.

## Domino Client Service

The client service is the library to be embeded in your front end,
web-browser loaded application. It simplifies the communication
with the front facing web service.

### Action

Action sends a message to an actor. The action returns a promise.

Action accepts a third optional callback argument. This argument is being
triggered when the actor sends back a response.notify

#### Action Callback Signature

```js
function myAction(message, response, dispatch) {
  // ...
}
```

#### Example

```js
// Action creating Foo
function createFoo (foo){
  domino.action('foo.create', foo, progress)
  .then((payload) => toaster.success('Foo has been created'))
  .catch((err) => console.error(err))
}

function progress(payload){
  console.log('some progress...', payload)
}

```

### Subscription

Front end can subscribe to broadcasted messages. wildcard can be used
to replace one word. Subscription also accepts interpolation using context
variables.

Changing context variable will automatically unsubscribe from the previous
channels and subscribe to the new ones.

#### Example

```js
import FooActions from './FooActions'
import domino from '../domino'


function fooEventHandler(payload, type){
  switch(type){
    case 'foo.adCreated':
      FooActions.adCreated(payload)
      break;
    case 'foo.adUpdated':
      FooActions.adUpdated(payload)
      break;
  }
}

domino.register('foo.*', fooEventHandler);

// using string interpolation
domino.register('[account_id].*', accountEventHandler);
domino.setContext({account_id: '123'})
```

### Connection loss

In case of connection loss, the registration should re-establish
subscription upon reconnection.

## Domino Front Service

This is the front facing service, exposing socket.io and rest
API endpoints.

### Rest Endpoint

REST point are being constructed based on desconstruction of the
action.


.ie `'foo.bar'` would become available at `/foo/bar/` as a POST request.


### Socket

Socket allows frontend to receive pushed data from the watchers when
they broadcast information on a given channel.


### Middleware

Global middleware can be defined

```js
function fooMiddleware(message, request){
  const augmentedMessage = Object.assign({}, message, {foo: 'bar'})
  request.resolve(augmentedMessage);
}

domino.use(fooMiddleware)
```

Sub-domain middleware:

```js
function middleware(message, request){
  if(message.foo){
    request.resolve(message);
  } else {
    request.reject(message)
  }
}

domino.domain('foo')
  .use(middleware)
  .actor(...)
```


## Domino Back Service

This handles actors and watchers. Worker can also be created
here. While possible to instanciate a dispatcher, is is not
recommended to dispatch information from a worker but instead
to call other publicly available actors with a payload when requiring
to dispatch an information.

### Actors

Actors are the recipients of actions. They can respond to a request
using their response object. They announce mutation through their
dispatch object. The dispatch is scoped to their domain only to enforce
a more predictive behavior.

* an actor belongs to a domain and has a name

#### Example

```js
// Actor definition
function createBar(message, response, dispatch) {
  myForm.submit(message.content.payload)
    .then(function(record){
      response.ok({message: 'Creation successful'})
      // will dispatch bar.created (bar being the domain)
      dispatch('created', record)
    })
    .catch(function(err){
      response.error(err)
    })
}

// Register the actor on the bar domain, it will be
// triggered by the 'bar.createFoo' action.
domino.domain('bar')
  .actor('create', createBar)
```

### Watchers

Watchers receive dispatched data by the actors:

* a watcher belongs to a domain and has a name
* a watcher listens to one or more channels dispatch

#### Example

```js
// Watcher definition
function barCreateWatcher(message, broadcast) {
  // will broadcast on 'foo.created' (foo being the domain)
  broadcast('created', message.content.payload)
}

// Register the watcher. It will be called when 'bar.created'
// message is being dispacthed by an actor.
domino.domain('foo')
  .watcher('barCreateWatcher', barCreateWatcher, ['bar.created'])
```


## Domino Messenger Service

Act as a wrapper around a given messenging queue service. RabbitMQ will
be the first to be integrated here.
