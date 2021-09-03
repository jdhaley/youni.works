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
		"type$": "/control/Instance",
		"start": function start(conf) {
		},
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
//					subject = "";
				}
			}
		},
		"extend$actions": {
		}
	},
	"Sensor": {
		"type$from": "/control/Iterable",
		"sense": function sense(signal) {
			if (!signal) return;
			let message = signal;
			if (typeof message != "object") {
				message = Object.create(null);
				message.subject = signal;
			}
			
			this.receive(message);
			//Promise.resolve(message).then(message => from(this, message));
			from(this, message);

			function from(receiver, message) {
				if (receiver.from) for (receiver of receiver.from) {
					message.subject && receiver.receive(message);
					message.subject && from(receiver, message);
					if (!message.subject) return;
				}
			}
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
			Promise.resolve(message).then(message => to(this, message));

			function to(receiver, message) {
				if (receiver.to) for (receiver of receiver.to) {
					message.subject && receiver.receive(message);
					message.subject && to(receiver, message);
					if (!message.subject) return;
				}
			}
		}
	},
	"Controller": {
		"type$": ["/control/Receiver", "/control/Sender", "/control/Sensor"]
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
	"Dataset": {
		"dataSource": null,
		"dataType": null,
		"create": function create(value) {
		},
		"retrieve": function retrieve(id) {
		},
		"update": function update(id, value) {
		},
		"del": function del(id) {
		}
	},
	"DataSource": {
		"types": {
		},
		"data": {
		},
		"views": {
		},
		"start": function start() {
			this.let("views", Object.create(null));
			for (let typeName in this.types) {
				let type = this.types[typeName];
				let members = Object.create(null);
				for (let memberName in type.members) {
					let member = type.members[memberName];
					member.name = memberName;
					let memberType = member.controlType || "/ui/record/Property";
					members[memberName] = this.owner.create(memberType, member);
				}
				views[typeName] = members;
			}
		}
	}
}
return pkg;
}

function dom() {
	const pkg = {
	"Document": {
		"document": null,
		"get$peer": function get$peer() {
			return this.document.body;
		},
		"get$location": function get$location() {
			return this.document.location;
		},
		"createElement": function createElement(name) {
			if (name.indexOf("/") >= 0) {
				let idx = name.lastIndexOf("/");
				return this.document.createElementNS(name.substring(0, idx), name.substring(idx + 1));
			} else {
				return this.document.createElement(name);
			}
		},
		"createId": function createId() {
			let id = this.document.$lastId || 0;
			this.document.$lastId = ++id;
			return id;
		},
		"link": function link(attrs) {
			let node = this.createElement("link");
			for (let attr in attrs) {
				node.setAttribute(attr, attrs[attr]);
			}
			this.document.head.append(node);
			return node;
		}
	},
	"Element": {
		"type$owner": "/dom/Document",
		"namespace": "",
		"get": function get(name) {
			return this.peer.getAttribute(name);
		},
		"set": function set(name, value) {
			this.peer.setAttribute(name, value);
		},
		"once$nodeName": function once$nodeName() {
			return this.className;
		},
		"once$className": function once$className() {
			return this[Symbol.toStringTag].charAt(0).toLowerCase() + this[Symbol.toStringTag].substring(1);
		},
		"get$to": function get$to() {
			const nodes = this.peer.childNodes;
			if (!nodes.$to) nodes.$to = this[Symbol.for("owner")].create({
				symbol$iterator: function*() {
					for (let i = 0, len = nodes.length; i < len; i++) {
						let node = nodes[i];
						if (node.$peer) yield node.$peer;
					}
				}
			});
			return nodes.$to;
		},
		"get$of": function get$of() {
			return this.peer.parentNode.$peer;
		},
		"once$from": function once$from() {
			let of = this.of;
			return this[Symbol.for("owner")].create({
				symbol$iterator: function*() {
					if (of) yield of;
				}
			});
		},
		"once$peer": function once$peer() {
			let name = (this.namespace ? this.namespace + "/" : "") + this.nodeName;
			let peer = this.owner.createElement(name);
			peer.$peer = this;
			if (typeof this.at == "object") {
				for (let name in this.at) {
					peer.setAttribute(name, this.at[name]);
				}
			}
			return peer;
		},
		"append": function append(control) {
			this.peer.append(control.peer);
		}
	}
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
	"Viewer": {
		"type$": "/view/Controller",
		"view": function view(model) {
		},
		"modelFor": function modelFor(part) {
		},
		"extend$actions": {
			"view": function view(event) {
				for (let part of this.to) {
					part.view(this.modelFor(part));
				}
			}
		}
	},
	"Container": {
		"type$": "/view/Viewer",
		"xxxxforEach": function xxxxforEach(value, method, methodObject) {
            if (!methodObject) methodObject = this;
            if (value && value[Symbol.iterator]) {
                let i = 0;
                for (let datum of value) {
                    method.call(methodObject, datum, i++, value);
                }
            } else if (typeof value == "object") {
                for (let name in value) {
                    method.call(methodObject, value[name], name, value);
                }
            }
            // } else {
            //     method.call(methodObject, value, "", value);
            // }
        },
		"type$forEach": "/view/util/forEach",
		"var$model": undefined,
		"view": function view(model) {
			this.model = model;
			if (!this.parts) {
				this.peer.$parts = Object.create(null);
				if (this.members) {
					this.forEach(this.members, this.createContent);
				}	
			}
			if (!this.members) {
				this.forEach(model, this.createContent);
			}

			if (this.observe) this.observe(model);			
		},
		"modelFor": function modelFor(contentView) {
			return this.members ? this.model : this.model && this.model[contentView.key];
		},
		"part": function part(key) {
			for (let part of this.to) {
				if (part.key == key) return part;
			}
		},
		"get$parts": function get$parts() {
			return this.peer.$parts;
		},
		"createContent": function createContent(value, key) {
			let type = this.typeFor(value, key);
			let conf = this.configurationFor(value, key);
			let control = this.owner.create(type, conf);
			this.control(control, key);
			this.append(control);
			return control;
		},
		"typeFor": function typeFor(value, key) {
			if (this.members) {
				return this.members[key] ? this.members[key] : "";
			}
			return this.contentType ||  "";
		},
		"configurationFor": function configurationFor(value, key) {
			return this.conf;
		},
		"control": function control(part, key) {
			part.key = key;
			this.parts[key] = part;
		}
	}
}
return pkg;
}

