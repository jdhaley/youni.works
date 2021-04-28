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
	package$: "youni.works/base/signal",
	Signal: Symbol.Signal,
	Message: {
		super$: "Object",
		[Symbol.Signal]: "Message",
		var$action: ""
	},
	Receiver: {
		super$: "Object",
		type$controller: "Controller",
		receive: function(message) {
			this.controller && this.controller.process(this, message);		
		}
	},
	Node: {
		super$: "Receiver",
		type$of: "Node",
		once$owner: function() {
			if (this.of) return this.of != this && this.of.owner;
			return this;
		},
		get$log: function() {
			return this.owner ? this.owner.log : console;
		},
		"@iterator": function* iterate() {
			for (let i = 0, len = this.length; i < len; i++) yield this[i];
		}
	},
	Controller: {
		super$: "Object",
//		log: console,
		process: function(on, message) {
			let action = typeof message == "string" ? message : message.action;
			while (action) try {
				this.execute(on, message);
				action = (message.action == action ? "" : message.action);
			} catch (fault) {
				this.trap(on, message, fault);
			}
		},
		execute: function(on, message) {
			let method = on[message.action];
			if (typeof method == "function") {
				method[message.length ? "apply" : "call"](on, message);
			}
		},
		trap: function(on, message, fault) {
			fault.message = `Error processing action "${message.action}": ` + fault.message;
			fault.processing = message;
			fault.on = on;
			throw fault;
		}
	},
	Processor: {
		super$: "Controller",
		instruction: {
		},
		execute: function(on, message) {
			let instruction = this.instruction[message.action];
			instruction && instruction.call(this, on, message);
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
			//The call allows the sender function to handle the first send edge case.
			//See platform Sensor.
			sender.call(to, to, message);
		},
		sender: {
		}
	}
}