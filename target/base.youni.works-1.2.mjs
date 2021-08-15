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
	graph: graph(),
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
				action && action.call(this, msg);
				subject = (subject != msg.subject ? msg.subject : "");
			}
		},
		"extend$actions": {
		}
	},
	"Control": {
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
		},
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
	"Publisher": {
		"publish": function publish(/* (subject | event) [, data]*/) {
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
	}
}
return pkg;
}

function graph() {
	const pkg = {
	"type$": "/control",
	"Graph": {
		"type$": "/graph/Component",
		"send": function send(to, signal) {
			if (typeof signal == "string") signal = {
				subject: signal
			}
			to.receive(signal);
			to.send(signal);
		},
		"sense": function sense(from, signal) {
			if (typeof signal == "string") signal = {
				subject: signal
			}
			from.receive(signal);
			from.sense(signal);
			// if (on.owner != this) console.warn("sensing on a node not owned by this.");
			// event = this.prepareSignal(event);
			// this.log(on, event);
			// //can't use event.path - it is chrome-specific.
			// while (on) {
			// 	if (!event.subject) return;
			// 	on.receive(event);
			// 	on = on.of;
			// }
		},
		"notify": function notify(on, signal) {
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
		},
		"prepareSignal": function prepareSignal(signal) {
			if (typeof signal != "object") return {
				subject: signal
			}
			return signal;
		},
		"log": function log(on, event) {
			// const DONTLOG = ["receive", "track", "mousemove", "selectionchange"];
			// for (let subject of DONTLOG) {
			// 	if (event.subject == subject) return;
			// }
			// console.debug(event.subject + " " + on.nodeName + " " + on.className);
		}
	},
	"Node": {
		"type$": ["/graph/Receiver", "/graph/Control"],
		"type$owner": "/graph/Graph",
		"type$to": "/graph/Array",
		"append": function append(node) {
			Array.prototype.push.call(this.to, node);
		},
		"forEach": function forEach(data, method) {
			if (data && data[Symbol.iterator]) {
				let i = 0;
				for (let datum of data) {
					method.call(this, datum, i++, data);
				}
			} else {
				for (let name in data) {
					method.call(this, data[name], name, data);
				}
			}
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
	"View": {
		"var$model": undefined,
		"view": function view(data) {
			this.model = data;
		},
		"modelFor": function modelFor(contentView) {
			return this.model;
		},
		"extend$actions": {
			"view": function view(event) {
				for (let view of this.to) {
					view.view(this.modelFor(view));
				}
			}
		}
	},
	"Container": {
		"type$": "/view/View",
		"createContent": function createContent(value, key, object) {
			let type = this.typeFor(value, key);
			let conf = this.configurationFor(value, key);
			let control = this.owner.create(type, conf);
			this.control(control, key);
			this.append(control);
			return control;
		},
		"control": function control(control, key) {
			control.key = key;
		},
		"typeFor": function typeFor(value, key) {
		},
		"configurationFor": function configurationFor(value, key) {
			return this.conf;
		}
	},
	"Collection": {
		"type$": "/view/Container",
		"type$contentType": "/view/View",
		"view": function view(model) {
			this.super(view, model);
			this.forEach(model, this.createContent);
		},
		"modelFor": function modelFor(contentView) {
			return this.model[contentView.key];
		},
		"typeFor": function typeFor(value, key) {
			return this.contentType;
		}
	},
	"Structure": {
		"type$": "/view/Container",
		"members": {
		},
		"parts": null,
		"view": function view(model) {
			if (!this.parts) {
				this.let("parts", Object.create(null));
				this.forEach(this.members, this.createContent);
			}
			this.model = model;
		},
		"control": function control(part, key) {
			this.super(control, part, key);
			this.parts[key] = part;
		},
		"typeFor": function typeFor(value, key) {
			if (value && typeof value == "object") {
				return value.receive ? value : value.contentType || this.contentType;
			}
			return this[Symbol.for("owner")].forName("" + value) || this.contentType;
		},
		"configurationFor": function configurationFor(value, key) {
			return value && typeof value == "object" && !value.receive ? value : this.conf;
		}
	}
}
return pkg;
}
