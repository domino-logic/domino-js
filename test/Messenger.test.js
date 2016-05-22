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