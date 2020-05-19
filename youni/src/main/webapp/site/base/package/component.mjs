let LAST_PART_NUMBER = 0;
const NIL = () => undefined;
Symbol.Signal = Symbol("signal");

export default {
	package$: "youni.works/component",
	Message: {
		super$: "Object",
		var$action: ""
	},
	Receiver: {
		super$: "Object",
		receive: function(message) {
			let action;
			switch (message[Symbol.Signal]) {
				case "Apply":
					action = this[message.action];
					return typeof action == "function"? action.apply(this, message) : undefined;
				case "Call":
					action = this[message.action];
					return typeof action == "function" ? action.call(this, message) : undefined;
				default:
					this.controller && this.controller.process(this, message);
					return;
			}
		},
	},
	Part: {
		super$: "Receiver",
		id: 0,
		type$of: "Part",
		part: {
		},
		once$owner: function() {
			return this.of && this.of != this && this.of.owner;
		},
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
		get$log: function() {
			return this.of && this.of.log;
		},
		initialize: function(config) {
			this.sys.define(this, "initialize", NIL);
			this.sys.define(this, "id", ++LAST_PART_NUMBER, "const");
			this.sys.define(this, "of", config.component, "const");
			this.sys.define(this, "name", config.name, "const");
			config.component = this;
			for (let name in this.part) {
				config.name = name;
				this.part[name].initialize(config);
			}
		},
		initialize__action: function(event) {
			this.sys.implement(this, {
				id: ++LAST_PART_NO,
				of: event.component,
				initialize: NIL
			});
			event.component = this;
		},
	},
	Owner: {
		super$: "Part",
		of: null,
		get$owner: function() {
			return this;
		},
		log: console,
		content: null,
		after$receive: function(message) {
			if (!message.action) return;
			let type = message[Symbol.Signal];
			if (!type) type = message.selector ? "Broadcast" : "Message";
			this.signal[type](this.content, message);
			return Function.RETURNED;
		},
		signal: {
			Apply: invoke,
			Call: invoke,
			Message: (on, event) => undefined,
			Event: (on, event) => undefined,
			Broadcast: (on, message) => undefined
		}
	},
	Controller: {
		super$: "Part",
		control: function(control) {
			control.controller = this;
		},
		process: function(on, event) {
			let action = event.action;
			while (action && this.action[action]) try {
				this.action[action].call(this, on, event);
				action = (event.action == action ? "" : event.action);
			} catch (error) {
				error.message = `Error processing action "${event.action}": ` + error.message;
				/* Stop the event if the exception action threw an error */
				if (event.action == "exception") throw error;
				event.error = error;
				event.action = "exception";
				return this.process(on, event);
			}
		},
		action: {
			exception: function(on, event) {
				this.log.error(event.error);
				event.action = "";
			}
		}
	}
}

function invoke(on, message) {
	if (!(on && message.action)) return;
	on.receive && on.receive(message);
	for (let name in on.part) {
		if (!message.action) return;
		invoke(on, message);
	}
}