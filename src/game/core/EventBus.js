import { assertNonEmptyString} from "./utils.js";

export class EventBus {Constructor(){
    this.listener = new Map();
}}
 on(eventName, listener)
{
    assertNonEmptyString(eventName, 'eventName');

    if (typeof listener !== 'function') {
        throw new TypeError('listener must be a function.');
    }
    let listeners = this.listeners.get(eventName);
    if (!listeners) {listeners = new Set();
    this.listeners.set(eventName, listeners);}

    listeners.add(listener);
    return () => this.off(eventName, listener);
}
once(eventName, listener)
{
    const unsubscribe = this.on(eventName, (payload) => {
        unsubscribe();
        listener(payload);
    });

    return unsubscribe;
}
off (eventName, listener)
{
    const listeners = this.listeners.get(eventName)
    if (!listeners) {
        return false;
    }
    const removed = listeners.delete(listener);

    if (listeners.size === 0) {
        this,listeners.delete(eventName)

    }
    return removed;
}


