let LAST_ID = 0;
export default {
	package$: "youni.works/base/control",
	Control: {
		super$: "Object",
		type$controller: "Controller",
		"@iterator": function* iterate() {
		},
		receive: function(message) {
			this.controller.process(this, message);
		}
	},
	Controller: {
		super$: "Part",
		process: function(on, message) {
			let action = message.action;
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
		action: {
		},
		execute: function(on, message) {
			let op = this.action[message.action];
			op && op.call(this, on, message);
		}
	},
	Service: {
		super$: "Object",
		service: function(receiver, subject, request) {
			let message = this.createMessage(receiver, subject, request);
			this.process(receiver, message);
		},
		createMessage(receiver, subject, request) {
			let message = this.sys.extend();
			message.action = subject;
			message.request = request;
			message.status = 0;
			return message;
		}
	},
	Transmitter: {
		super$: null,
		up: function(on, signal) {
			signal = messageFor.call(this, signal);
			while (signal.action && on) {
				on.receive && on.receive(signal);
				on = on.of;
			}
		},
		down: function down(on, signal) {
			if (!signal.action) signal = messageFor.call(this, signal);
				
			signal.action && on.receive && on.receive(signal);
			if (signal.action && on[Symbol.iterator]) for (on of on) {
				down(on, signal);
				if (!signal.action) return;
			}
		}
	},
	Node: {
		super$: "Control",
		"@iterator": function* iterate() {
			for (let i = 0; i < this.length; i++) yield this[i];
		}
	},
	Record: {
		super$: "Control",
		"@iterator": function* iterate() {
			for (let name in this) yield this[name];
		}
	},
	Part: {
		super$: "Control",
		"@iterator": function* iterate() {
			for (let name in this.part) yield this.part[name];
		},
		initialize: function(conf) {
			this.sys.define(this, "controller", conf.controller, "const");
		}
	}
}

function messageFor(signal) {
	let message = signal;
	if (typeof message == "string") {
		message = this.sys.extend();
		message.action = signal;
	}
	return message;
}
