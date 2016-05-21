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
    this.driver.createPrivateQueue()
    .then(this.init.bind(this))
  }

  /**
   * Initialize the response queue
   * @param {string} queue - The name of the response queue (usually random)
   * @return {Promise}
   */
  init(queue) {
    this.queue = queue;
    this.keys.forEach(this._subscribe.bind(this));
    return this.driver.listen(
      this.queue,
      this.trigger.bind(this)
    );
  }

  /**
   * Trigger all the registered callback with the event message
   * @param {object} message - the response message
   */
  trigger (msg){
    this.callbacks.forEach( (callback) => {
      callback({
        key: msg.fields.routingKey,
        content: JSON.parse(msg.content)
      });
    })
  }

  /**
   * Private subscribe to a given topic to allow subscribing
   * to a topic while queue has yet to be created.
   * @param {string} key - The topic key to subscribe to
   * @return {promise}
   */
  _subscribe (key) {
    return this.driver.subscribe(this.queue, key);
  }

  /**
   * Register a callback for this event queue
   * @param {function} callback - The function to call on response
   * @return {function} a deregistration function
   */
  onEvent(callback) {
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
    if(this.queue){
      this._subscribe(key);
    } else {
      this.keys.push(key);
    }
  }

  /**
   * Unsubscribe from a given topic.
   * @param {string} key - The topic key to unsubscribe from
   */
  unsubscribe(key) {
    if(this.queue){
      this.driver.unsubscribe(this.queue, key);
    } else {
      this.keys.slice(this.keys.indexOf(key), 1);
    }
  }
}

export default EventQueue;
