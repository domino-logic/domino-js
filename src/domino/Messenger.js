'use strict';

import objectAssign from 'object-assign';
import RabbitmqDriver from './drivers/RabbitmqDriver';
import EventQueue from './EventQueue';
import ResponseQueue from './ResponseQueue';
import RequestQueue from './RequestQueue';


const defaultConfig = {
  Driver: RabbitmqDriver
};


class Messenger {
  /**
   * Initialize the messenger with its config
   * @param {object} config - The application config
   */
  constructor (config) {
    this.config = objectAssign({}, defaultConfig, config);
    this.driver = new this.config.Driver(config);
  }

  /**
   * initialize the driver
   * @return {promise}
   */
  start () {
    return this.driver.start();
  }

  /**
   * Acknoledge the reception of a message
   * @param {object} message - The message to acknoledge
   */
  ack (message) {
    this.driver.ack(message);
  }

  /**
   * Listens to a queue
   * @param {string} queue - The queue to listen to
   * @param {function} callback - The callback triggered on queue event
   * @return {Promise}
   */
  listen (queue, callback) {
    return this.driver.listen(queue, callback);
  }

  /**
   * Broadcast a message to a given topic
   * @param {object} message - A JSON message to be broadcasted
   * @param {string} topic - the topic of the message
   * @return nothing
   */
  broadcast (topic, message) {
    this.driver.broadcast(topic, message);
  }

  /**
   * Creates a new responseQueue handler
   * @return {ResponseQueue} a responseQueue handler
   */
  responseQueue () {
    return new ResponseQueue(this.driver);
  }

  /**
   * Creates a new requestQueue handler
   * @return {RequestQueue} a requestQueue handler
   */
  requestQueue () {
    return new RequestQueue(this.driver);
  }

  /**
   * Creates a new eventQueue manager
   * @return {EventQueue} an eventQueue manager
   */
  eventQueue () {
    return new EventQueue(this.driver);
  }

  /**
   * Send a message to a given queue
   * @param {object} message - A JSON message to be broadcasted
   * @param {string} queue - the destination queue for the message
   * @return {promise} the send promise
   */
  send (message, queue) {
    return this.driver.send(message, queue);
  }
}


export default Messenger;
