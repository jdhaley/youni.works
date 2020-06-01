export default {
	package$: "youni.works/base/control",
	Control: {
		super$: "Object",
		type$controller: "Controller",
		once$owner: function() {
			if (this.of) return this.of != this && this.of.owner;
			return this;
		},
		"@iterator": function* iterate() {
		},
		receive: function(message) {
			this.controller && this.controller.process(this, message);
		}
	},
	Controller: {
		super$: "Object",
		action: {
		},
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
			let action = this.action[message.action];
			action && action.call(this, on, message);
		},
		trap: function(on, message, fault) {
			fault.message = `Error processing action "${message.action}": ` + fault.message;
			fault.processing = message;
			fault.on = on;
			throw fault;
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
			if (!signal.action) {
				signal = messageFor.call(this, signal);
				if (signal.action) on.receive && on.receive(signal);
			}
			if (signal.action) for (on of on.childNodes) {
				down(on, signal);
				if (!signal.action) return;
			}
		}
	},
	Processor: {
		super$: "Controller",
		execute: function(on, message) {
			let method = on[message.action];
			if (typeof method == "function") {
				method[message.length ? "apply" : "call"](on, message);
			}
		}
	}
	Part: {
		super$: "Control",
		once$id: () => ++LAST_ID,
		once$name: function() {
			if (this.of) for (let name in this.of.part) {
				if (this.part[name] == this) return name;
			}
			return "";
		},
		get$pathname: function() {
			if (this.name) {
				let path = this.of && this.of.pathname || "";
				return path + "/" + this.name;
			}
			return "";
		},
		part: {
		},
		"@iterator": function* iterate() {
			for (let name in this.part) yield this.part[name];
		},
		initialize: function(conf) {
			this.sys.define(this, "of", conf.of, "const");
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
