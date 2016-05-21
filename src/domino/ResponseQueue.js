'use strict'


/** Handle RPC messaging response */
class ResponseQueue {
  /**
   * Initialize the Response queue
   * @param {object} driver - a messaging queue driver instance
   */
  constructor (driver) {
    this.driver = driver;
    this.callbacks = [];
  }

  start () {
    return this.driver.createPrivateQueue()
    .then(this.init.bind(this))
  }

  /**
   * Initialize the response queue
   * @param {string} queue - The name of the response queue (usually random)
   * @return {Promise}
   */
  init(queue) {
    this.queue = queue
    return this.driver.listen(
      this.queue,
      this.trigger.bind(this)
    )
  }

  /**
   * Trigger all the registered callback with the response message
   * @param {object} message - the response message
   */
  trigger (message){
    const content = JSON.parse(message.content);
    this.callbacks.forEach( (callback) => callback(content) )
    this.driver.ack(message)
  }

  /**
   * Register a callback for this response queue
   * @param {function} callback - The function to call on response
   * @return {function} a deregistration function
   */
  onResponse(callback) {
    this.callbacks.push(callback)
    return () => {
      this.callbacks.slice(this.callbacks.indexOf(callback), 1)
    }
  }
}


export default ResponseQueue;
