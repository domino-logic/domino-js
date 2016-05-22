'use strict';


import {Messenger, RabbitmqDriver} from '../src/domino'
import {expect} from 'chai'

describe('ResponseQueue', function(){
  let messenger, responseQueue;

  before(function(done){
    messenger = new Messenger()
    messenger.start().then(done)
  })

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
