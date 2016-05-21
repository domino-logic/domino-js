import {RabbitmqDriver} from '../src/domino'
import {expect} from 'chai'


describe('RabbitmqDriver', function(){
  describe('default config values', function(){
    let config, rabbitmqDriver = null;

    before(function(){
      rabbitmqDriver = new RabbitmqDriver();
      config = rabbitmqDriver.config;
    })

    it('should default URL to localhost', function(){
      expect(config.messengerURL).to.equal('amqp://localhost');
    })

    it('should default broadcast to domino_broadcast', function(){
      expect(config.broadcastQueue).to.equal('domino_broadcast');
    })
  })

  describe('custom config values', function(){
    let config, rabbitmqDriver = null;

    before(function(){
      rabbitmqDriver = new RabbitmqDriver({
        messengerURL: 'my URL',
        broadcastQueue: 'my broadcast queue'
      });
      config = rabbitmqDriver.config;
    })

    it('should default URL to the custom URL', function(){
      expect(config.messengerURL).to.equal('my URL');
    })

    it('should default broadcast to custom queue', function(){
      expect(config.broadcastQueue).to.equal('my broadcast queue');
    })
  })


})
