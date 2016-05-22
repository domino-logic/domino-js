'use strict'

import uuid from 'node-uuid';
import when from 'when'


/**
 * Handle RPC messaging request. This is the counterpart of
 * the ResponseQueue object.
 */
class RequestQueue {
  /**
   * Initialize the Response queue
   * @param {object} driver - a messaging queue driver instance
   */
  constructor (driver) {
    this.driver = driver;
    this.registry = {};
  }

  /**
   * initialize the request Queue by creating a unique and
   * private request queue to be replied to.
   * @return {promise}
   */
  start () {
    return this.driver.createPrivateQueue()
    .then(this.init.bind(this))
  }

  /**
   * Initialize the request queue
   * @param {string} queue - The name of the request queue (usually random)
   * @return {Promise}
   */
  init (queue) {
    this.queue = queue;

    return this.driver.listen(
      this.queue,
      this.receivedResponse.bind(this)
    );
  }

  /**
   * Trigger all the registered callback with the request message
   * @param {object} message - the request message
   */
  receivedResponse (message) {
    const content = JSON.parse(message.content);
    const deferred = this.registry[message.properties.correlationId];

    if(deferred) {
      deferred.resolve(message);
      delete this.registry[message.properties.correlationId];
    }

    this.driver.ack(message);
  }


  /**
   * Sends a request to a given queue
   * @param {object} message - JSON request to be sent to the queue
   * @param {string} queue - the destination queue for the message
   * @return {Promise}
   */
  request (message, queue) {
    const correlationId = uuid.v4();
    const deferred = when.defer();

    this.registry[correlationId] = deferred;

    this.driver.send(
      message,
      queue,
      {
        replyTo: this.queue,
        correlationId: correlationId
      }
    );

    return deferred.promise;
  }
}


export default RequestQueue;
