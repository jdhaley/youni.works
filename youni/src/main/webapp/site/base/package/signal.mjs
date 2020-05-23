Symbol.Signal = Symbol("signal");

export default {
	package$: "youni.works/signal",
	Message: {
		super$: "Object",
		var$action: ""
	},
	Receiver: {
		super$: "Object",
		receive: function(message) {
			if (message[Symbol.Signal] == "Call") {
				let action = this[message.action];
				if (typeof action == "function") {
					return message.apply
						? action.apply(this, message)
						: action.call(this, message);
				}
			} else {
				this.controller && this.controller.process(this, message);
			}
		}
	},
	Sender: {
		super$: "Receiver",
		after$receive: function(message) {
			this.send(this, message);
			return Function.returned;
		},
		send: function send(to, message) {
			let signal = message[Symbol.Signal] || "Call";
			this.signal[signal].call(this, to, message);
		},
		extend$signal: {
			Call: function signal(on, message) {
				for (let name in on.part) {
					if (!message.action) return;
					let part = on.part[name];
					part.receive && part.receive(message);
					signal(part, message);
				}
			}
		}
	},
	Controller: {
		super$: "Receiver",
		control: function(control) {
			control.controller = this;
		},
		process: function(on, message) {
			let action = message.action;
			while (action && this.action[action]) try {
				this.action[action].call(this, on, message);
				action = (message.action == action ? "" : message.action);
			} catch (error) {
				error.message = `Error processing action "${message.action}": ` + error.message;
				/* Stop the message if the exception action threw an error */
				if (message.action == "exception") throw error;
				message.error = error;
				message.action = "exception";
				return this.process(on, message);
			}
		},
		action: {
			exception: function(on, message) {
				this.log.error(message.error);
				message.action = "";
			}
		}
	}
}