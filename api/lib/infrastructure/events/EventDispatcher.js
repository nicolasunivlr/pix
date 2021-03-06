const _ = require('lodash');

class EventDispatcher {
  constructor() {
    this._subscriptions = [];
  }

  subscribe(event, eventHandler) {
    this._preventDuplicateSubscription(event, eventHandler);
    this._subscriptions.push({ event: event.prototype.constructor, eventHandler: eventHandler });
  }

  _preventDuplicateSubscription(event, eventHandler) {
    const foundDuplicateSubscription = _.some(this._subscriptions, _.matches({ event, eventHandler }));
    if (foundDuplicateSubscription) {
      throw new Error('Cannot subscribe twice to a given event with the same handler');
    }
  }

  async dispatch(dispatchedEvent, domainTransaction) {
    const subscriptions = this._subscriptions.filter(({ event }) => dispatchedEvent instanceof event);

    for (const { eventHandler } of subscriptions) {
      const returnedEventOrEvents = await eventHandler({ domainTransaction, event: dispatchedEvent });
      await this._dispatchEventOrEvents(returnedEventOrEvents, domainTransaction);
    }
  }

  async _dispatchEventOrEvents(eventOrEvents, domainTransaction) {
    if (!Array.isArray(eventOrEvents)) {
      await this.dispatch(eventOrEvents, domainTransaction);
    } else {
      for (const event of eventOrEvents) {
        await this.dispatch(event, domainTransaction);
      }
    }
  }
}

module.exports = EventDispatcher;
