let LAST_ID = 0;
export default {
	package$: "youni.works/base/control",
	Control: {
		super$: "Object",
		type$controller: "Controller",
		type$part: "Part",
		receive: function(message) {
			this.controller.process(this, message);
		},
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
			for (let part of this.part) part.partOf = this;
		},
		super: function(method, ...args) {
			let object = this;
			if (this[method]) while (object = this.sys.prototypeOf(object)) {
				let fn = object[method];
				if (fn != this[method]) {
					return fn ? fn.apply(this, args) : undefined;
				}
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
	Owner: {
		super$: "Controller",
		type$content: "Control",
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
		transmit: {
			up: function(on, signal) {
				while (on) {
					if (!signal.action) return;
					on.receive && on.receive(signal);
					on = on.partOf;
				}
			},
			//NB: down() is explicitly named because it is recursive.
			down: function down(on, signal) {
				if (on.part) for (on of on.part) {
					if (!signal.action) return;
					on.receive && on.receive(signal);
					down(on, signal);
				}
			}
		},
		before$initialize: function(conf) {
			conf.owner = this;
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
		},
		process: function(receiver, message) {
			throw new Error("Abstract Service Call.");
		}
	},
	FileService: {
		super$: "Service",
		open: function(pathname, receiver) {
			this.service(receiver, "opened", {
				url: pathname,
				method: "GET"
			});
		},
		save: function(pathname, content, receiver) {
			this.service(receiver, "saved", {
				url: pathname,
				content: content,
				method: "PUT"
			});
		}
	},
	Part: {
		super$: "Object",
		"@iterator": function* iterate() {
			const length = this.length;
			if (length) {
				for (let i = 0; i < length; i++) yield this[i];				
			} else {
				for (let name in this) yield this[name];				
			}
		}
	},
	Empty: {
		super$: "Object",
		"@iterator": function* iterate() {
		}
	},
	List: {
		super$: "Object",
		"@iterator": function* iterate() {
			for (let i = 0; i < this.length; i++) yield this[i];
		}
	},
	Record: {
		super$: "Object",
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
