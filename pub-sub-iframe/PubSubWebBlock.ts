/*	PubSubWebBlock provides PubSubPeer-style functionality based on hosting Web Block.
	This piggybacks on the pub-sub behavior already provided by the host Blocks Spot,
	and has the following advantages:

	* Communicates with Blocks using the same websocket channel, thereby sharing its
	  identity and authorization (i.e., for accessing protected server-side properties
	  based on user log-in credentials or "identified spot" status.

	* Can access local spot parameters as properties under Local.parameter.xxx.

	* Reduces server over head somewhat by running over the same websocket connection
	  as the host, rather than optning a second websocket connection.

 	Copyright (c) 2022 PIXILAB Technologies AB, Sweden (http://pixilab.se). All Rights Reserved.
 */


export default class PubSubWebBlock {
	subscribers: Dictionary<Subscription<any>> = {};

	constructor() {
		window.addEventListener("message", (event) => {
			if (event.data.type === "pubsub-data")
				this.gotData(event.data.path, event.data.value);
		}, false);
	}

	/**
	 * Set the value of property
	 */
	set(
		path: string,	// Property path
		value: any		// value to set (typically number, string, boolean)
	) {
		window.parent.postMessage({
			type: 'pubsub-set',
			path: path,
			value: value
		}, '*');
	}

	/**
	 * Add (number) or append (string) value to property.
	 */
	add(
		path: string,	// Property path
		value: any	// value to add (number) or append (string)
	) {
		window.parent.postMessage(
			{
				type: 'pubsub-add',
				path: path,
				value: value
			}, '*'
		);
	}

	/**
	 * Subscribe to value of property at path, calling dataCallback.dataReceived when value changes.
	 * Returns the current value of propety, if known, else undefined. If synchronousCallback and
	 * the current value is known, then call dataCallback right away (before I return).
	 */
	subscribe(
		path: string,			// Property path
		dataCallback: DataCallback,
		synchronousCallback: boolean // Pass true to get a synchronous dataCallback with any existing value
	) {
		let subscription = this.subscribers[path];
		if (!subscription) {
			window.parent.postMessage({type: 'pubsub-subscribe', path: path}, '*');
			subscription = new Subscription();
			this.subscribers[path] = subscription;
		}
		subscription.handlers.add(dataCallback);

		const knownValue = subscription.lastValue;
		if (knownValue !== undefined && synchronousCallback)
			dataCallback.dataReceived(path, knownValue);
		return knownValue;
	}

	/**
	 * Call to stop dataCallback from receiveing callbacks for changes to property at path.
	 */
	unsubscribe(
		path: string,				// Property path - string
		dataCallback: DataCallback	// The very same object as passed to subscribe
	) {
		let subscription = this.subscribers[path];
		if (subscription) {
			if (subscription.handlers.delete(dataCallback)) {
				if (subscription.handlers.size === 0) {	// All gone
					window.parent.postMessage({type: 'pubsub-unsubscribe', path: path}, '*');
					delete this.subscribers[path];
				}
			} else
				console.warn("pub-sub-iframe not handler for", path, dataCallback);
		} else
			console.warn("pub-sub-iframe not subscribed to", path);
	}

	/**
	 * Private handler called when I receive data.
	 */
	private gotData(path: string, value: any) {
		let subscription = this.subscribers[path];
		if (subscription)
			subscription.update(path, value)
		else
			console.warn("pub-sub-iframe spurious data on path", path, value);
	}
}

/**
 * What I track for each subscription
 */
class Subscription<T> {
	handlers: Set<DataCallback>;	// Set of objects implementing dataReceived(newvalue, path)
	lastValue: T;		// Last received value, if any

	constructor() {
		this.handlers = new Set<DataCallback>();
	}

	update(path: string, value: T) {
		this.lastValue = value;
		this.handlers.forEach(handler => handler.dataReceived(value, path));
	}
}

interface Dictionary<TElem> {
	[id: string]: TElem;
}

interface DataCallback {
	dataReceived(newvalue: any, path: string): void
}

