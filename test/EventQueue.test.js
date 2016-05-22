'use strict';


import {Messenger, RabbitmqDriver} from '../src/domino'
import {expect} from 'chai'

describe('EventQueue', function(){
  let messenger, eventQueue;

  before(function(done){
    messenger = new Messenger()
    messenger.start().then(done)
  })

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
