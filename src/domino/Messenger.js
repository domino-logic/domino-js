'use strict';

import objectAssign from 'object-assign';
import RabbitmqDriver from './drivers/RabbitmqDriver';
import EventQueue from './EventQueue';
import ResponseQueue from './ResponseQueue';


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
  start (callback) {
    return this.driver.start();
  }

  /**
   * Acknoledge the reception of a message
   * @param {object} message - The message to acknoledge
   */
  ack (msg) {
    this.driver.ack(msg);
  }

  /**
   * Listens to a queue
   * @param {string} queue - The queue to listen to
   * @param {function} callback - The callback triggered on queue event
   */
  listen (queue, callback) {
    this.driver.listen(queue, callback);
  }

  /**
   * Broadcast a message to a given topic
   * @param {object} message - A JSON message to be broadcasted
   * @param {string} topic - the topic of the message
   * @return {promise} the broadcast promise
   */
  broadcast (topic, message) {
    this.driver.broadcast(topic, message);
  }

  /**
   * Creates a new eventQueue handler
   * @return {ResponseQueue} a responseQueue handler
   */
  responseQueue () {
    return new ResponseQueue(this.driver);
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
  send (queue, message) {
    return this.send(queue, message);
  }

  /**
   * Send a message to a given queue and expects a response
   * @param {object} message - a JSON message to be broadcasted
   * @param {string} queue - the destination queue for the message
   * @param {string} replyTo - the queue to send the response to
   * @param {string} correlationId - A unique identifier for this request
   * @return {promise} the request promise
   */
  request (message, queue, replyTo, correlationId) {
    return this.request(message, queue, {replyTo, correlationId});
  }

}


export default Messenger;
