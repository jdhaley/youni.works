let LAST_ID = 0;
export default {
	package$: "youni.works/base/control",
	Control: {
		super$: "Object",
		type$controller: "Controller",
		type$part: "Empty",
		receive: function(message) {
			this.controller.process(this, message);
		}
	},
	Controller: {
		super$: "Control",
		use: {
			type$Part: "Record"
		},
		log: console,
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
		},
		initialize: function(conf) {
			if (!this.part[Symbol.iterator]) {
				this.sys.define(this.part, Symbol.iterator, this.use.Part[Symbol.iterator], "const");
			}
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
	Owner: {
		super$: "Controller",
		type$content: "Control",
		type$transmit: "Transmitter",
		receive: function(message) {
			message = messageFor.call(this, message);
			if (message.channel == "self") {
				this.controller.process(this, message);
				this.transmit.down(this, message);				
			} else {
				this.content.controller.process(this.content, message);
				this.transmit.down(this.content, message);
			}
		},
		before$initialize: function(conf) {
			conf.owner = this;
		}
	},
	Transmitter: {
		super$: null,
		up: function(on, signal) {
			while (on) {
				if (!signal.action) return;
				on.receive && on.receive(signal);
				on = on.partOf;
			}
		},
		down: function down(on, signal) {
			if (on.part) for (on of on.part) {
				if (!signal.action) return;
				on.receive && on.receive(signal);
				down(on, signal);
			}
		}
	},
	Empty: {
		"@iterator": function* iterate() {
		}
	},
	List: {
		"@iterator": function* iterate() {
			for (let i = 0; i < this.length; i++) yield this[i];
		}
	},
	Record: {
		"@iterator": function* iterate() {
			for (let name in this) yield this[name];
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
