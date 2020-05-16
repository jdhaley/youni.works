let PART_NUMBER = 0;
const NIL = () => undefined;
Symbol.Signal = Symbol("signal");

export default {
	package$: "youniworks.com/component",
	Content: {
		super$: "Object",
		type: "",	
		content: null
		//label
	},
	Article: {
		super$: "Content",
		id: "",
		title: "",
		revision: Date.prototype,
		editor: ""
	},
	Link: {
		/*
		 * A Link is an Article reference that can appear within Content.  A Link's content is simply a cache/embed
		 * of the Article.
		 */
		super$: "Article"
	},
	Receiver:{
		super$: "Object",
		receive: function(action, message) {
			if (arguments.length === 1) message = [];
			if (typeof this[action] != "function" || message.length === undefined) {
				throw new Error("Invalid message");
			}
			return this[action].apply(this, message);
		}
	},
	Part: {
		super$: "Object",
		type$of: "Part",
		name: "",
		get$owner: function() {
			return this.of && this.of != this && this.of.owner;
		},
		get$pathname: function() {
			if (this.name) {
				let path = this.of && this.of.pathname || "";
				return path + "/" + this.name;
			}
			return "";
		},
		initialize: function(config) {
			this.sys.define(this, "initialize", NIL);
			this.sys.define(this, "id", ++PART_NUMBER, "const");
			this.sys.define(this, "of", config.component, "const");
			this.sys.define(this, "name", config.name, "const");
			config.component = this;
			for (let name in this.part) {
				config.name = name;
				this.part[name].initialize(config);
			}
		}
	},
	Component: {
		super$: "Part",
		part: {
		},
//		super: function(type) {
//			let value = this;
//			while (value) {
//				value = this.sys.interfaceOf(value);
//				if (value) {
//					if (type == "" + value) return value;
//					value = this.sys.prototypeOf(value);				
//				}
//			}
//		}
	},
	Owner: {
		super$: "Component",
		of: null,
		get$owner: function() {
			return this;
		},
		content: null,
		receive: function(action, message) {
			if (!(message && message[Symbol.Signal])) {
				message = this.sys.extend(null, {
					content: message
				});
				message[Symbol.Signal] = "Message";
			}
			if (message.selector) {
				this.propagate.broadcast(this.content, action, message);
			} else {
				this.propagate.down(this.content, action, message);
			}
		},
		propagate: {
			up: up,
			down: down,
			broadcast: broadcast
		}
	},
	Controller: {
		super$: "Component",
		control: function(control) {
			control.controller = this;
		},
		process: function(on, action, message) {
			if (message == undefined) message = this.sys.extend();
			message.action = action;
			while (action && this.action[action]) try {
				message.on = on;
				message.action = action;
				this.action[action].call(this, message);
				action = message.action == action ? "" : message.action;
			} catch (error) {
				error.message = `Error processing action "${action}": ` + error.message;
				error.source = message;
				if (message instanceof Error) {
					console.error(error);
					return;
				}
				return this.process(on, "error", error);
			}
			return message.action;
		},
		exception: function(on, error) {
			console.error(on, error);
		},
		action: {
			error: function(signal) {
				console.error(signal);
			}
		}
	}
}

function up(on, action, message) {
	while (action && on) {
		if (on.controller) action = on.controller.process(on, action, message);
		on = on.parentNode;
	}
	return action;
}

function down(on, action, message) {
	if (on && on.controller && action) {
		action = on.controller.process(on, action, message);
	}
	if (action) for (on of on.childNodes) {
		action = down(on, action, message);
		if (!action) break;
	}
	return action;
}

function broadcast(on, action, signal) {
	let list = [];
	if (action) try {
		list = on.querySelectorAll(signal.selector);
	} catch (e) {
		console.err(e);
	}
	for (let on of list) if (action) {
		if (on.controller) action = on.controller.process(on, action, signal);
		if (!action) break;
	}
	return action;
}



//processException: function(on, error) {
////If an exception occurs processing exceptions, throw
////as we don't want exception cycles to occur.
//if (error.action == "error") throw error;
//error.sourceAction = error.action;
//error = new CustomEvent("error", {
//	bubbles: true,
//	detail: error
//});
//on.dispatchEvent(e);
//},


