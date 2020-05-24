Symbol.Signal = Symbol("signal");
/*
 * semaphore - a string message identifying the subject.
 * message - a object with a subject property and other data being carried by the signal.
 * 
 * let action = typeof message == "string" ? message : message.action;
 * - however we can't really support this because the processing changes the action.
 * - we would need to return the action on receive().
 */
export default {
	package$: "youni.works/signal",
	Message: {
		super$: "Object",
		var$action: ""
	},
	Receiver: {
		super$: "Object",
		type$controller: "Controller",
		receive: function(message) {
			this.controller && this.controller.process(this, message);		
		}
	},
	Controller: {
		super$: "Object",
		log: console,
		process: function(on, message) {
			let action = typeof message == "string" ? message : message.action;
			while (action) try {
				this.execute(on, message);
				action = (message.action == action ? "" : message.action);
			} catch (error) {
				this.trap(error, on, message);
			}
		},
		execute: function(on, message) {
			let method = on[message.action];
			if (typeof method == "function") {
				method[message.length ? "apply" : "call"](on, message);
			}
		},
		trap: function(error, on, processing) {
			error.message = `Error processing action "${processing.action}": ` + error.message;
			this.log.error(error, on, processing);
			processing.action = "";
//			/* Stop the message if the exception action threw an error */
//			if (message.action == "exception") throw error;
//			message.error = error;
//			message.action = "exception";
//			return this.process(on, message);
		}
	},
	Processor: {
		super$: "Controller",
		execute: function(on, message) {
			let action = this.action[message.action];
			action && action.call(this, on, message);
		},
		action: {
			exception: function(on, message) {
				this.log.error(message.error);
				message.action = "";
			}
		}
	},
	Sender: {
		super$: "Controller",
		after$process: function(on, message) {
			this.send(on, message);
		},
		send: function send(to, message) {
			let signal = message[Symbol.Signal];
			let sender = this.sender[signal];
			if (!sender) throw new TypeError(`Signal "${signal}" cannot be sent.`);
			sender.call(to, to, message);
		},
		sender: {
		}
	}
}