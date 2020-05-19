let LAST_PART_NUMBER = 0;
const NIL = () => undefined;
Symbol.Signal = Symbol("signal");

export default {
	package$: "youni.works/component",
	Event: {
		super$: "Object",
		var$action: ""
	},
	Receiver: {
		super$: "Object",
		receive: function(event) {
		}
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
		receive: function(event) {
			if (typeof this[event.action] == "function") this[event.action](event);
			for (let name in this.part) {
				if (!event.action) return;
				this.part[name].receive(event);
			}
		}
	},
	Owner: {
		super$: "Part",
		of: null,
		get$owner: function() {
			return this;
		},
		log: console,
		content: null,
		receive: function(signal) {
			if (signal.selector) {
				this.propagate.broadcast(this.content, signal);
			} else {
				this.propagate.down(this.content, signal);
			}
		},
		propagate: {
			up: (on, event) => undefined,
			down: (on, message) => undefined,
			broadcast: (on, signal) => undefined
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

//Content: {
//	super$: "Object",
//	type: "",	
//	content: null
//	//label
//},
//Article: {
//	super$: "Content",
//	id: "",
//	title: "",
//	revision: Date.prototype,
//	editor: ""
//},
//Link: {
//	/*
//	 * A Link is an Article reference that can appear within Content.  A Link's content is simply a cache/embed
//	 * of the Article.
//	 */
//	super$: "Article"
//},
//Receiver:{
//	super$: "Object",
//	receive: function(action, message) {
//		if (arguments.length === 1) message = [];
//		if (typeof this[action] != "function" || message.length === undefined) {
//			throw new Error("Invalid message");
//		}
//		return this[action].apply(this, message);
//	}
//},
