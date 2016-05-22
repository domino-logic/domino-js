'use strict';


import {Messenger, RabbitmqDriver} from '../src/domino'
import {expect} from 'chai'
import when from 'when'


describe('Messenger config', function() {
  describe('default', function() {
    let messenger, config;

    before(function(){
      messenger = new Messenger();
      config = messenger.config;
    })

    it('should default to RabbitmqDriver', function() {
      expect(config.Driver).to.equal(RabbitmqDriver)
    });
  });

  describe('custom', function() {
    let messenger, config;
    class CustomDriver {}

    before(function(){
      messenger = new Messenger({Driver: CustomDriver});
      config = messenger.config;
    })

    it('should register the custom Driver', function() {
      expect(config.Driver).to.equal(CustomDriver)
    });
  });
});


describe('Messenger', function(){
  let messenger;

  before(function(done){
    messenger = new Messenger()
    messenger.start().then(done)
  })

  describe('RequestQueue', function(){
    let requestQueue;

    before(function(done){
      requestQueue = messenger.requestQueue();
      requestQueue.start()
        .then( () => done() )
        .catch(done)
    })

    it('create a request queue', function(){
      expect(requestQueue.queue).to.be.a('string')
    })

    describe('request handling', function(){
      let queue;

      function onRequest(message){
        const content = JSON.parse(message.content);
        expect(message.properties.replyTo).to.equal(requestQueue.queue);
        expect(message.properties.correlationId).to.be.a('string');
        messenger.driver.send(
          content,
          message.properties.replyTo,
          {correlationId: message.properties.correlationId}
        );
      }

      // Create a new private queue and attache onRequest to it
      before(function(done){
        messenger.driver.createPrivateQueue()
        .then( (q)  => queue = q)
        .then( () => messenger.listen(queue, onRequest) )
        .then( () => done() )
        .catch(done)
      })

      it('should respond to request', function(done){
        requestQueue.request({a: 'b'}, queue)
        .then( (payload) => {
          done();
        })
      })
    })
  })

  describe('ResponseQueue', function(){
    let responseQueue;

    before(function(done){
      responseQueue = messenger.responseQueue();
      responseQueue.start()
        .then( () => done() )
        .catch(done)
    })

    it('create a response queue', function(){
      expect(responseQueue.queue).to.be.a('string')
    })

    it('shoud call onResponse callback', function(done){
      responseQueue.onResponse( (payload) => {
        expect(payload).to.be.a('object')
        expect(payload).to.eql({bar: 'foo'})
        done();
      })

      messenger.send({bar: 'foo'}, responseQueue.queue)
      expect(responseQueue.queue).to.be.a('string')
    })
  })

  describe('EventQueue', function(){
    let eventQueue;

    before(function(done){
      eventQueue = messenger.eventQueue();
      eventQueue.start()
        .then( () => done() )
        .catch(done)
    })

    it('create an event queue', function(){
      expect(eventQueue.queue).to.be.a('string')
    })

    describe('broadcasting', function(){
      before(function(done){
        eventQueue.subscribe('my_test_event')
        .then( () => done() )
        .catch(done)
      })

      it('should receive a broadcasted event', function(done){
        eventQueue.onEvent((message) => {
          expect(message).to.be.a('object')
          expect(message.content).to.eql({foo: 'bar'})
          expect(message.key).to.equal('my_test_event')
          done();
        });
        messenger.broadcast({foo: 'bar'}, 'my_test_event')
      })
    })
  })
})
