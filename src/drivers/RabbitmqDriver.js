import amqp from 'amqplib'
import objectAssign from 'object-assign'


const defaultConfig = {
  messengerURL: 'amqp://localhost'
  broadcastQueue: 'domino_change'
}


/** Messaging Queue Driver for RabbitMQ */
class RabbitmqDriver {
  /**
   * Initialize the driver with its options
   * @param {object} options - The application options
   */
  constructor (options) {
    this.options = objectAssign(defaultConfig, options)
  }


  /**
   * Connects the driver to its service with the provided
   * options.
   */
  start () {
    amqp.connect(this.messengerURL)
    .then( conn => conn.createChannel() )
    .then( channel => this.channel = channel )
  }

  /**
   * Creates an exchange queue to receive broadcast
   * information from watchers
   * @return {promise} The created exchange Queue
   */
  createBroadcastQueue () {
    return this.channel.assertExchange(
      this.options.broadcastQueue,
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
    return this.channel.publish(
      this.broadcastQueue,
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
  send (message, queue, options) {
    return this.channel.sendToQueue(
      queue,
      new Buffer(JSON.stringify(message)),
      options
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
   * @param {object} options - (optional) additional creation options
   * @return {promise} the created messaging queue name
   */
  createQueue (queue, options) {
    return this.channel.assertQueue(queue, options)
    .then( assertedQueue => assertedQueue.queue )
  }

  /**
   * Creates a randomly named private queue
   * @param {object} options - (optional) additional creation options
   * @return {promise} the created messaging queue name
   */
  createPrivateQueue (options) {
    return this.createQueue(
      '',
      objectAssign({exclusive: true}, options)
    )
  }

  /**
   * Acknoledge the reception of a message
   * @param {object} message - The message to acknoledge
   */
  ack (message) {
    this.channel.ack(message);
  }

  /**
   * Listens to a queue
   * @param {string} queue - The queue to listen to
   * @param {function} callback - The callback triggered on queue event
   */
  listen (queue, callback) {
    return this.channel.consume(queue, callback);
  }

}


module.exports = RabbitMQDriver