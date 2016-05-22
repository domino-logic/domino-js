'use strict';


/** Handle Event subscriptions */
class EventQueue {
  /**
   * Initialize the Response queue
   * @param {object} driver - a messaging queue driver instance
   */
  constructor (driver) {
    this.driver = driver;
    this.callbacks = [];
  }

  start() {
    return this.driver.createPrivateQueue()
    .then(this.init.bind(this))
  }

  /**
   * Initialize the event queue
   * @param {string} queue - The name of the event queue (usually random)
   */
  init (queue) {
    this.queue = queue;

    return this.driver.listen(
      this.queue,
      this.trigger.bind(this)
    );
  }

  /**
   * Trigger all the registered callback with the event message
   * @param {object} message - the event message
   */
  trigger (message){
    this.callbacks.forEach( (callback) => {
      callback({
        key: message.fields.routingKey,
        content: JSON.parse(message.content)
      });
    })
  }

  /**
   * Register a callback for this event queue
   * @param {function} callback - The function to call on event
   * @return {function} a deregistration function
   */
  onEvent (callback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks.slice(this.callbacks.indexOf(callback), 1);
    }
  }

  /**
   * Subscribe to a given topic.
   * @param {string} key - The topic key to subscribe to
   */
  subscribe (key) {
    return this.driver.subscribe(this.queue, key);
  }

  /**
   * Unsubscribe from a given topic.
   * @param {string} key - The topic key to unsubscribe from
   */
  unsubscribe (key) {
    return this.driver.unsubscribe(this.queue, key);
  }
}

export default EventQueue;
