import system from "./system.youni.works-2.1.mjs";
const module = {
	"name": "base.youni.works",
	"version": "1.2",
	"moduleType": "library"
};
module.use = {
	system: system
}
module.package = {
	command: command(),
	control: control(),
	data: data(),
	dom: dom(),
	origin: origin(),
	util: util(),
	view: view()
}
const conf = undefined;
const main = function main_loadModule(module) {
			return module.use.system.load(module);
		};
export default main(module, conf);
function command() {
	const pkg = {
	"type$": "/util",
	"Command": {
		"type$": "/command/Factory",
		"type$prior": "/command/Command",
		"type$next": "/command/Command",
		"exec": function exec() {
		},
		"undo": function undo() {
		},
		"instance": function instance() {
			return this.create(this, {
				prior: null,
				next: null
			});
		}
	},
	"Commands": {
		"type$": "/command/Factory",
		"type$lastCommand": "/command/Command",
		"undo": function undo() {
			let command = this.lastCommand;
			if (!command.prior) return;
			command.undo();
			this.lastCommand = command.prior;
		},
		"redo": function redo() {
			let command = this.lastCommand;
			if (!command.next) return;
			command = command.next;
			command.exec();
			this.lastCommand = command;
		},
		"addCommand": function addCommand(command) {
			this.lastCommand.next = command;
			command.prior = this.lastCommand;
			this.lastCommand = command;
			return command;
		},
		"instance": function instance() {
			return this.create(this, {
				lastCommand: this.lastCommand.instance()
			});
		}
	},
	"BatchCommand": {
		"type$": "/command/Command",
		"commands": null,
		"undo": function undo() {
			//To undo a batch, each command must be done in reverse order.
			for (let i = this.commands.length - 1; i >= 0; i--) {
				this.commands[i].undo();
			}
		},
		"exec": function exec() {
			for (let cmd of this.commands) {
				cmd.exec();
			}
		}
	}
}
return pkg;
}

function control() {
	const pkg = {
	"type$": "/system/core",
	"Receiver": {
		"receive": function receive(signal) {
			if (!signal) return;
			let msg = signal;
			if (typeof msg != "object") {
				msg = Object.create(null);
				msg.subject = signal;
			}
			let subject = msg.subject;
			while (subject) {
				let action = this.actions[subject];
				try {
					action && action.call(this, msg);
					subject = (subject != msg.subject ? msg.subject : "");	
				} catch (error) {
					console.error(error);
					//Stop all propagation - esp. important is the enclosing while loop
					subject = "";
				}
			}
		},
		"extend$actions": {
		}
	},
	"Sender": {
		"type$to": "/control/Iterable",
		"send": function send(signal) {
			if (!signal) return;
			let message = signal;
			if (typeof message != "object") {
				message = Object.create(null);
				message.subject = signal;
			}

			this.receive(message);
			if (!message.subject) return;

			Promise.resolve(message).then(message => to(this, message));

			function to(sender, message) {
				if (sender.to) for (let receiver of sender.to) {
					message.from = sender;
					receiver.receive(message);
					if (!message.subject) return;
					to(receiver, message);
				}
			}
		}
	},
	"Sensor": {
		"type$from": "/control/Iterable",
		"sense": function sense(signal) {
			if (!signal) return;
			let event = signal;
			if (typeof event != "object") {
				event = Object.create(null);
				event.subject = signal;
			}

			this.receive(event);
			if (event.subject) {
				from(this, event);
			}

			function from(sensor, message) {
				if (sensor.from) for (let receiver of sensor.from) {
					if (!message.subject) return;
					message.sensor = sensor;
					receiver.receive(message);
					from(receiver, message);
				}
			}
		}
	},
	"Startable": {
		"extend$conf": {
		},
		"start": function start(conf) {
			if (conf) this.let("conf", conf, "extend");
		}
	},
	"Viewer": {
		"view": function view(model, response) {
		},
		"modelFor": function modelFor(key) {
		},
		"extend$actions": {
			"view": function view(message) {
				let model = message.from.modelFor(this.key);
				this.view(model, message.response);
			}
		}
	},
	"Publisher": {
		"publish": function publish(/* (subject [, data] | event) */) {
            if (!this.io) {
                console.error("No socket");
            }
            let event = arguments[0];
            //agruments can be a string, string/object, or an event with a subject.
            let subject = event && typeof event == "object" ? event.subject : event;
            if (!subject) {
                console.error("No subject.", arguments);
            }
            if (arguments.length > 1) {
                event = arguments[1];
            }
            this.io.emit(subject, event);
        }
	},
	"Observer": {
		"observe": function observe(object) {
			const OBSERVERS = Symbol.for("observers");
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
		"unobserve": function unobserve(control, object) {
			const OBSERVERS = Symbol.for("observers");
			let list = object ? object[OBSERVERS] : null;
			if (list) for (let i = 0, len = list.length; i < len; i++) {
				if (this == list[i]) {
					list.splice(i, 1);
					break;
				}
			}
		}
	},
	"Notifier": {
		"notify": function notify(on, signal) {
			if (typeof signal == "string") signal = {
				subject: signal
			}
			let model = signal.model || on.model;
			let observers = model && model[Symbol.for("observers")];
			if (!observers) return;
			signal = this.prepareSignal(signal);
			for (let ctl of observers) {
				//Set the following for each iteration in case of a bad behaving control.
				signal.source = on;
				signal.model = model;
				ctl.receive(signal);
			}
		}
	}
}
return pkg;
}

function data() {
	const pkg = {
	"DevtMember": {
		"type$": "/view/View",
		"extend$conf": {
			"caption": "",
			"icon": ""
		},
		"key": "",
		"title": "",
		"icon": ""
	},
	"DataSource": {
		"type$textUtil": "/util/Text",
		"type$viewType": "/view/View",
		"types": {
		},
		"data": {
		},
		"once$views": function once$views() {
			let views = Object.create(null);
			for (let typeName in this.types) {
				let type = this.types[typeName];
				let members = Object.create(null);
				for (let name in type.members) {
					let conf = type.members[name];
					if (!conf.caption) {
						conf.caption = this.textUtil.captionize(name);
					}
					let view = this.owner.create(conf.viewType || this.viewType);
					this.owner.extend(view, {
						extend$conf: conf,
						dataSource: this,
					});
					members[name] = view;
				}
				views[typeName] = members;
			}
			return views;
		},
		"once$owner": function once$owner() {
			return this[Symbol.for("owner")];
		}
	},
	"DataSet": {
		"objectType": null
	}
}
return pkg;
}

function dom() {
	const pkg = {
	"type$": "/control",
	"Node": {
		"type$": ["/dom/Receiver", "/dom/Sender", "/dom/Sensor"],
		"peer": null,
		"once$from": function once$from() {
			let of = this.peer.parentNode.$peer;
			let from = Object.create(null);
			from[Symbol.iterator] = function*() {
				if (of) yield of;
			}
			return from;
		},
		"once$to": function once$to() {
			const nodes = this.peer.childNodes;
			let to = Object.create(null);
			to[Symbol.iterator] = function*() {
				for (let i = 0, len = nodes.length; i < len; i++) {
					let node = nodes[i];
					if (node.$peer) yield node.$peer;
				}
			}
			return to;
		},
		"at": function at(key) {
			if (typeof key == "string" && key.charAt(0) == "@") {
				return this.peer.getAttribute(key.substring(1));
			}
			for (let part of this.to) {
				if (part.key == key) return part;
			}
		},
		"put": function put(key, value) {
			if (typeof key == "string" && key.charAt(0) == "@") {
				this.peer.setAttribute(key.substring(1), value);
				return;
			}
			value.key = key;
			this.peer.append(value.peer);
		}
	},
	"Document": {
		"type$": "/dom/Node",
		"document": null,
		"type$from": "/dom/Iterable",
		"get$peer": function get$peer() {
			return this.document.body;
		},
		"get$location": function get$location() {
			return this.document.location;
		},
		"createElement": function createElement(name, namespace) {
			if (namespace) {
				return this.document.createElementNS(namespace, name);
			} else {
				return this.document.createElement(name);
			}
		},
		"createId": function createId() {
			let id = this.document.$lastId || 0;
			this.document.$lastId = ++id;
			return id;
		}
	},
	"Element": {
		"type$": "/dom/Node",
		"type$owner": "/dom/Document",
		"namespace": "",
		"once$nodeName": function once$nodeName() {
			return this.className;
		},
		"once$peer": function once$peer() {
			let peer = this.owner.createElement(this.nodeName, this.namespace);
			peer.$peer = this;
			return peer;
		},
		"once$className": function once$className() {
			return this[Symbol.toStringTag].charAt(0).toLowerCase() + this[Symbol.toStringTag].substring(1);
		},
		"virtual$markup": function virtual$markup() {
			if (arguments.length) {
				this.peer.innerHTML = arguments[0];
			} else {
				return this.peer.innerHTML;
			}
		},
		"get": function get(name) {
			return this.peer.getAttribute(name);
		},
		"set": function set(name, value) {
			this.peer.setAttribute(name, value);
		},
		"get$of": function get$of() {
			return this.peer.parentNode.$peer;
		},
		"append": function append(control) {
			this.peer.append(control.peer);
		}
	},
	"View": {
		"type$": ["/dom/Element", "/view/View"],
		"extend$conf": {
		},
		"display": "",
		"get$style": function get$style() {
			return this.peer.style;
		},
		"get$styles": function get$styles() {
			return this.peer.classList;
		},
		"createPart": function createPart(key, type) {
			let part = this.owner.create(type, this.conf);
			this.put(key, part);
			if (this.members) part.styles.add(key);
			return part;
		},
		"start": function start(conf) {
			if (conf) this.let("conf", conf, "extend");
			if (this.display) this.styles.add(this.display);
			this.styles.add(this.className);
		}
	},
	"type$Pane": "/view/Pane"
}
return pkg;
}

function origin() {
	const pkg = {
	"Origin": {
		"type$remote": "/origin/Remote",
		"origin": "",
		"open": function open(pathname, subject) {
			let message = this.remote.process(this, subject || "opened", {
				url: this.origin + pathname,
				method: "GET"
			});
		},
		"save": function save(pathname, content, subject) {
			let message = this.remote.process(this, subject || "saved", {
				url: this.origin + pathname,
				method: "PUT",
				content: content
			});
		}
	},
	"Remote": {
		"process": function process(receiver, subject, request) {
			let xhr = this.createHttpRequest(receiver, subject, request);
			this.prepare(xhr);
			let content = request.content;
			if (typeof content != "string") content = JSON.stringify(content);
			xhr.send(content);
		},
		"prepare": function prepare(xhr) {
			let req = xhr.request;
			xhr.open(req.method || "HEAD", req.url || "");
			req.headers && this.setHeaders(xhr, req.headers)
		},
		"setHeaders": function setHeaders(xhr, headers) {
			for (let name in headers) {
				let value = headers[name];
				value && xhr.setRequestHeader(name, value);
			}
		},
		"monitor": function monitor(xhr) {
			switch (xhr.readyState) {
				case 0: // UNSENT Client has been created. open() not called yet.
				case 1: // OPENED open() has been called.
				case 2: // HEADERS_RECEIVED send() has been called, and headers and status are available.
				case 3:	// LOADING Downloading; responseText holds partial data.
					break;
				case 4: // DONE The operation is complete.
					let message = this.createMessage(xhr);
					if (typeof xhr.receiver == "function") {
						xhr.receiver(message);
					} else if (xhr.receiver) {
						xhr.receiver.receive(message);
					} else {
						this.receive(message);
					}
			}
		},
		"createHttpRequest": function createHttpRequest(receiver, subject, request) {
			let xhr = new XMLHttpRequest();
			xhr.receiver = receiver;
			xhr.subject = subject;
			xhr.request = request;
			xhr.onreadystatechange = () => this.monitor(xhr);
			return xhr;
		},
		"createMessage": function createMessage(xhr) {
			return this[Symbol.for("owner")].create({
				subject: xhr.subject,
				request: xhr.request,
				response: xhr.responseText,
				status: xhr.status
			});
		}
	}
}
return pkg;
}

function util() {
	const pkg = {
	"type$": "/system/core",
	"Factory": {
		"create": function create(from) {
            return this[Symbol.for("owner")].create(from);
        }
	},
	"Text": {
		"isUpperCase": function isUpperCase(str) {
			return str == str.toUpperCase() && str != str.toLowerCase();
		},
		"isLowerCase": function isLowerCase(str) {
			return str == str.toLowerCase() && str != str.toUpperCase();
		},
		"captionize": function captionize(name) {
			let caption = "";
			
			if (name.indexOf("_") > 0) {
				name =  name.replace("_", " ");
				for (let i = 0; i < name.length; i++) {
					let char = name.charAt(i);
					if (char == " " && (caption == "" || caption.endsWith(" "))) {
						char = "";
					} else if (this.isLowerCase(char) && (caption == "" | caption.endsWith(" "))) {
						char = char.toUpperCase();
					}
					caption += char;
				}
				return caption;
			}
			
			caption = name.substring(0, 1).toUpperCase();
			for (let i = 1; i < name.length; i++) {
				let char = name.charAt(i);
				if (this.isUpperCase(char)) {
					if (this.isLowerCase(name.charAt(i - 1))) caption += " ";
					if (this.isUpperCase(name.charAt(i - 1)) && this.isLowerCase(name.charAt(i + 1))) caption += " ";
				}
				caption += char;
			}
			return caption;
		}
	},
	"Typing": {
		"type$": ["/util/Factory", "/util/Text"],
		"datatypes": ["void", "boolean", "number", "date", "string", "array", "object"],
		"objecttypes": ["instance", "source", "record", "map", "function", "symbol", "other"],
		"typeSuffixes": {
			"link": ["Id", "_id"],
			"hyperlink": ["Loc", "_loc", "Url", "_url"],
			"enum": ["Code", "Cd", "_code", "_cd"],
			"type": ["Type", "_type"],
			"date": ["Date", "_date"],
			"color": ["Color", "_color"],
			"boolean": ["Ind", "_ind", "Flag", "_flag"]
		},
		"propertyOf": function propertyOf(name, value) {
			let dataType = this.propertyType(name, value);
			let objectType = (dataType == "object" ? this.objectType(value) : "");
		
			let property = this.create({
				dynamic: true,
				name: name,
				dataType: dataType,
				caption: this.captionize(name)
			});
			if (objectType) property.objectType = objectType;
			return property;
		},
		"datatypeOf": function datatypeOf(value) {
			if (value === undefined ||
				value === null ||
				typeof value == "number" && isNaN(value)) return "void";
			
			switch (typeof value) {
				case "string":
				case "number":
				case "boolean":
					return typeof value;
				case "bigint":
					return "number";
				case "symbol":
				case "function":
				case "object":
				default:
					return "object";
			}
		},
		"propertyType": function propertyType(name, value) {
			for (let type in this.typeSuffixes) {
				for (let suffix of this.typeSuffixes[type]) {
					if (name.endsWith(suffix)) return type;
				}
			}
			if (name.startsWith("is_") || name.startsWith("is") 
					&& util.isUpperCase(name, name.substring(2, 1))) return "boolean";
			let type = this.datatypeOf(value);
			return type == "object" ? this.objectType(value) : type;
		},
		"kindOf": function kindOf(name) {
			let kinds = ["link", "enum", "type"];
			for (let type of kinds) {
				for (let suffix of typeSuffixes[type]) {
					if (name.endsWith(suffix)) return name.substring(0, name.length - suffix.length);
				}
			}
		},
		"objectType": function objectType(value) {
			if (value instanceof Date) return "date";
			if (value[Symbol.iterable] && typeof value.length == "number") return "array";
			if (value[Symbol.for("owner")]) return "instance";
			let proto = Object.getPrototypeOf(value);
			if (!proto) return "object";
			return proto == Object.prototype ? "source" : "other";	
		}
	}
}
return pkg;
}

function view() {
	const pkg = {
	"type$": "/control",
	"View": {
		"type$": "/view/Viewer",
		"require$createPart": function require$createPart(key, type) {
		},
		"var$model": undefined,
		"view": function view(model) {
			this.model = model;
			this.observe && this.observe(model);
			if (this.members && !this.markup) {
				for (let name in this.members) {
					let member = this.members[name];
					member && this.createPart(name, member);
				}
			} else if (this.contentType) {
				this.markup = "";
				if (!model) {
					return;
				} else if (model[Symbol.iterator]) {
					let key = 0;
					for (let content of model) {
						let type = content && content.type || this.contentType;
						this.createPart(key++, type);
					}
				} else if (typeof model == "object") {
					for (let key in model) {
						let type = model[key] && model[key].type || this.contentType
						this.createPart(key, type);
					}
				}
			}
		},
		"modelFor": function modelFor(key) {
			if (this.contentType) {
				if (this.model) return this.model[key];
			}
			return this.model;
		}
	},
	"Pane": {
		"members": {
			"type$header": "/view/Caption",
			"type$body": "/view/Display"
		}
	}
}
return pkg;
}

