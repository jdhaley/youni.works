export default {
	type$: "/system.youni.works/core",
	Control: {
		type$: "Instance",
		start: function(conf) {
		},
		receive: function(signal) {
			let action = this.actions[typeof signal == "string" ? signal : signal.subject];
			action && action.call(this, signal);			
		},
		actions: {	
		}
	},
	Node: {
		type$: "Control",
		type$owner: "Owner",	//The graph.
		type$to: "Array",		//The arcs.  Each arc should be a Node.
		append: function(component) {
			Array.prototype.push.call(this.to, component);
		}
	},
	Owner: {
		type$: "",
		create: function(controlType, conf) {
			if (typeof controlType != "object") {
				controlType = this.sys.forName(controlType);
			}
			let control = this.sys.extend(controlType, {
				owner: this
			});
			control.start(conf);
			return control;
		},
		send: function(to, msg) {
			if (to.owner != this) console.warn("sending to a node not owned by this.");
			msg = this.prepareSignal(msg);
			this.log(to, msg);
			msg && down(to, msg);

			function down(on, message) {
				if (!message.subject) return;
				on.receive(message);
				if (message.pushPath) message.pushPath(on);
				if (on.to) for (on of on.to) {
					down(on, message);
				}
			}			
		},
		sense: function(on, event) {
			if (to.owner != this) console.warn("sensing on a node not owned by this.");
			event = this.prepareSignal(event);
			this.log(on, event);
			if (event.path) for (let on of event.path) {
				if (!event.subject) return;
				on.receive(event);
			}
			//DOM-specific .preventDefault() logic moved to Frame.
		},
		notify: function(on, signal) {
			const OBSERVERS = on.sys.symbols.observers;
			let model = signal.model || on.model;
			let observers = model && model[OBSERVERS];
			if (!observers) return;
			signal = this.prepareSignal(signal);
			for (let ctl of observers) {
				//Set the following for each iteration in case of a bad behaving control.
				signal.source = on;
				signal.model = model;
				ctl.receive(signal);
			}
		},
		prepareSignal: function(signal) {
			if (typeof signal != "object") return {
				subject: signal
			};
			return signal;
		},
		log: function(on, event) {
			// const DONTLOG = ["receive", "track", "mousemove", "selectionchange"];
			// for (let subject of DONTLOG) {
			// 	if (event.subject == subject) return;
			// }
			// console.debug(event.subject + " " + on.nodeName + " " + on.className);
		}
	},
	DomOwner: {
		type$: "Owner",
		document: null,
		createNode: function(name) {
			if (name.indexOf("/") >= 0) {
				let idx = name.lastIndexOf("/");
				return this.document.createElementNs(name.substring(0, idx), name.substring(idx + 1));
			} else {
				return this.document.createElement(name);
			}
		},
		sense: function sense(on, event) {
			this.super(sense, on, event);
			if (event.preventDefault && !event.subject) event.preventDefault();
		},
		prepareSignal: function prepareSignal(signal) {
			signal = this.super(prepareSignal, signal);
			signal.stopPropagation && signal.stopPropagation();
			if (!signal.subject) signal.subject = signal.type;
			return signal;
		}
	},
	DomNode: {
		type$: "Node",
		tag: "div",
		get$to: function() {
			const nodes = this.peer.childNodes;
			if (!nodes.$to) nodes.$to = this.sys.extend(null, {
				symbol$iterator: function*() {
					for (let i = 0, len = nodes.length; i < len; i++) {
						let node = nodes[i];
						if (node.$peer) yield node.$peer;
					}
				}
			});
			return nodes.$to;
		},
		once$peer: function() {
			let peer = this.owner.createNode(this.tag);
			peer.$peer = this;
			return peer;
		},
		append: function(control) {
			this.peer.append(control.peer);
		},
	},
	Observer: {
		type$: "",
		observe: function(object) {
			const OBSERVERS = this.sys.symbols.observers;
			if (typeof object != "object" || object == null) return; //Only observe objects.
			let observers = object[OBSERVERS];
			if (observers) {
				for (let observer of observers) {
					if (observer == this) return; //Already observing
				}
			} else {
				observers = [];
				object[OBSERVERS] = observers;
			}
			observers.push(this);
		},
		unobserve: function(control, object) {
			const OBSERVERS = this.sys.symbols.observers;
			let list = object ? object[OBSERVERS] : null;
			if (list) for (let i = 0, len = list.length; i < len; i++) {
				if (this == list[i]) {
					list.splice(i, 1);
					break;
				}
			}
		}
	},
	Composite: {
		type$: "Control",
		use: {
			type$Part: "Control"
		},
		parts: {
		},
		start: function start(conf) {
			this.super(start, conf);
			this.sys.define(this, "parts", this.sys.extend());
			this.createParts(conf.parts);
		},
		createParts: function(parts) {
			if (parts[Symbol.toStringTag] == "Array") {
				for (let i = 0, length = parts.length; i < length; i++) {
					this.createPart(parts[i].name, parts[i]);
				}
			} else {
				for (let name in parts) {
					this.createPart(name, parts[name]);
				}	
			}
		},
		createPart: function(name, value) {
			let part = this.owner.create(this.partTypeOf(value), this.partConfOf(name, value));
			this.sys.define(part, "of", this);
			this.parts[name] = part;
			this.append(part);
		},
		partTypeOf: function(value) {
			if (value && typeof value == "object") {
				return value.receive ? value : value.controlType || this.use.Part;
			}
			return this.sys.forName("" + value) || this.use.Part;
		},
		partConfOf: function(name, value) {
			if (value && typeof value == "object" && !value.receive) return value;
		}
	}
}