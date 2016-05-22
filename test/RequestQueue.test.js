'use strict';


import {Messenger, RabbitmqDriver} from '../src/domino'
import {expect} from 'chai'

describe('RequestQueue', function(){
  let messenger, requestQueue;

  before(function(done){
    messenger = new Messenger()
    messenger.start().then(done)
  })

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
        expect(payload).to.eql({a: 'b'});
        done();
      })
    })
  })
})
