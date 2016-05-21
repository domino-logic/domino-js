'use strict';

import amqp from 'amqplib';
import objectAssign from 'object-assign';


const defaultConfig = {
  messengerURL: 'amqp://localhost',
  broadcastQueue: 'domino_broadcast'
};


/** Messaging Queue Driver for RabbitMQ */
class RabbitmqDriver {
  /**
   * Initialize the driver with its config
   * @param {object} config - The application config
   */
  constructor (config) {
    this.config = objectAssign({}, defaultConfig, config);
  }


  /**
   * Connects the driver to its service with the provided
   * config.
   * @return {promise}
   */
  start () {
    return amqp.connect(this.messengerURL)
    .then( conn => conn.createChannel() )
    .then( channel => this.channel = channel )
    .then( this.createBroadcastQueue.bind(this) )
  }

  /**
   * Creates an exchange queue to receive broadcast
   * information from watchers
   * @return {promise} The created exchange Queue
   */
  createBroadcastQueue () {
    return this.channel.assertExchange(
      this.config.broadcastQueue,
      'topic',
      {durable: false}
    )
    .then( assertedExchange => assertedExchange.queue )
  }

  /**
   * Broadcast a message to the broadcastQueue
   * @param {object} message - A JSON message to be broadcasted
   * @param {string} topic - the topic of the message
   * @return {promise} the broadcast promise
   */
  broadcast (message, topic) {
    this.channel.publish(
      this.config.broadcastQueue,
      topic,
      new Buffer(JSON.stringify(message))
    )
  }

  /**
   * Send a message to a given queue
   * @param {object} message - A JSON message to be broadcasted
   * @param {string} queue - the destination queue for the message
   * @return {promise} the send promise
   */
  send (message, queue, config) {
    return this.channel.sendToQueue(
      queue,
      new Buffer(JSON.stringify(message)),
      config
    )
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
    return this.send(message, queue, {replyTo, correlationId})
  }

  /**
   * Creates a named queue
   * @param {string} queue - The name of the queue
   * @param {object} config - (optional) additional creation config
   * @return {promise} the created messaging queue name
   */
  createQueue (queue, config) {
    return this.channel.assertQueue(queue, config)
    .then( assertedQueue => assertedQueue.queue )
  }

  /**
   * Creates a randomly named private queue
   * @param {object} config - (optional) additional creation config
   * @return {promise} the created messaging queue name
   */
  createPrivateQueue (config) {
    return this.createQueue(
      '',
      objectAssign({exclusive: true}, config)
    )
  }

  /**
   * Subscribe a queue to a given broadcasted topic
   * @param {string} queue - The subscribed queue
   * @param {string} topic - The topic subscribed to
   * @return {promise}
   */
  subscribe (queue, topic) {
    return this.channel.bindQueue(
      queue,
      this.config.broadcastQueue,
      topic
    )
  }

  /**
   * Unsubscribe a queue from a given broadcasted topic
   * @param {string} queue - The subscribed queue
   * @param {string} topic - The topic subscribed to
   * @return {promise}
   */
  unsubscribe (queue, topic) {
    return this.channel.unbindQueue(
      queue,
      this.config.broadcastQueue,
      topic
    )
  }

  /**
   * Acknoledge the reception of a message
   * @param {object} message - The message to acknoledge
   */
  ack (message) {
    return this.channel.ack(message);
  }

  /**
   * Listens to a queue
   * @param {string} queue - The queue to listen to
   * @param {function} callback - The callback triggered on queue event
   */
  listen (queue, callback, options) {
    return this.channel.consume(queue, callback, options);
  }

}


export default RabbitmqDriver;
