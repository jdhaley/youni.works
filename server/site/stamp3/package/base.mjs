export default {
	package$: "youni.works/base",
	Application: {
		super$: "Object",
		components: null,
		type$remote: "Remote",
		send: down,
		sense: up,
		observe: function(observer, object) {
			unobserve(observer, observer.model);
			observe(observer, object);
		},
		open: function(pathname, receiver) {
			this.remote.service(receiver, "opened", {
				url: pathname,
				method: "GET"
			});
		},
		forName: function(name) {
			return name && name.indexOf("/") < 0 ? this.components[name] : this.sys.forName(name);
		}
	},
	Controller: {
		super$: "Object",
		type$app: "Application",
		initialize: function() {
		},
		control: function(object) {
			//TODO rethink the conf vs. controller reference.
	//		object.conf = this.conf;
			object.of = this;
			object.receive = receive;
		},
		bind: function(control, data) {
		},
		extend$actions: {
		}
	},
	Owner: {
		super$: "Controller",
		type$app: "Application",
		create: function(data, type) {
			let controller;
			if (typeof type == "object") {
				controller = type;
			} else {
				type = type || data.type;
				controller = this.app.forName(type);
				if (!controller) {
					console.error(`Control type "${type} does not exist.`);
					return;
				}
			}
			let control = this.createControl(controller, data);
			controller.control(control);
			controller.bind(control, data);
			return control;
		},
		createControl: function(controller, data) {
			return this.sys.extend({
				owner: this
			});
		}
	},
	Remote: {
		super$: "Object",
		method: "HEAD",
		url: "",
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
			let xhr = this.createRequest(receiver, message);

			let method = this.getMethod(receiver, message);
			let url = this.getUrl(receiver, message);
			xhr.open(method, url);
			
			this.prepare(xhr);
			
			let content = this.getContent(receiver, message);
			xhr.send(content);
		},
		createRequest: function(receiver, message) {
			let xhr = new XMLHttpRequest();
			xhr.receiver = receiver;
			xhr.message = message;
			xhr.onreadystatechange = () => this.monitor(xhr);
			return xhr;
		},
		prepare: function(xhr) {
			let header = this.getHeaders(xhr.receiver, xhr.message);
			for (let name in header) {
				let value = header[name];
				value && xhr.setRequestHeader(name, value);
			}
		},
		monitor: function(xhr) {
			switch (xhr.readyState) {
				case 0: // UNSENT Client has been created. open() not called yet.
				case 1: // OPENED open() has been called.
				case 2: // HEADERS_RECEIVED send() has been called, and headers and status are available.
				case 3:	// LOADING Downloading; responseText holds partial data.
					break;
				case 4: // DONE The operation is complete.
					xhr.message.status = xhr.status;
					xhr.message.content = xhr.responseText;
					if (typeof xhr.receiver == "function") {
						xhr.receiver(xhr.message);
					} else if (xhr.receiver) {
						xhr.receiver.receive(xhr.message);
					}
			}
		},
		getMethod: function(on, message) {
			return message.request.method || this.method;
		},
		getUrl: function(on, message) {
			let requestUrl = message.request.url || "";
			return this.url + requestUrl;
		},
		getHeaders: function(on, message) {
			return null;
//			{
//				"Session-Id": this.session.id
//			}
		},
		getContent: function(on, message) {
			let content = message.request.content;
			if (typeof content != "string") content = JSON.stringify(content);
			return content;
		}
	}
}

Symbol.observers = Symbol("observers");

function unobserve(control, model) {
	let list = model ? model[Symbol.observers] : null;
	if (list) for (let i = 0, len = list.length; i < len; i++) {
		if (control == list[i]) {
			list.splice(i, 1);
			break;
		}
	}
	//Caller is now responsible to:
	//delete control.model or re-assign, etc.
}

function observe(control, model) {
	if (typeof model != "object" || model == null) return; //Only observe objects.
	let observers = model[Symbol.observers];
	if (observers) {
		for (let observer in observers) {
			if (observer == control) return; //Already observing
		}					
	} else {
		observers = [];
		model[Symbol.observers] = observers;
	}
	observers.push(control);
}

function down(control, message) {
	if (!message || !message.topic) return;
	let context = message.context;
	control.receive && control.receive(message);
	message.context = control;
	if (control.to) for (control of control.to) {
//		console.debug(control.controller, control.model);
//		debugger;
		down(control, message);
	}
	message.context = context;
}

function up(on, event) {
	event.stopPropagation && event.stopPropagation();
	if (!event.topic) event.topic = event.type;
	//DAG-based events.
//	if (!event.path) return;
//	for (let node of event.path) {
//		if (!event.topic) return;
//		node.receive && node.receive(event);
//	}
//rooted tree events.
	while (on && event.topic) {
		on.receive && on.receive(event);
		on = on.parentNode || on.defaultView;
	}
}

function receive(a) {
	if (this.of.actions) {
		let action = a && typeof a == "object" ? a.topic : "" + a;
		action = action && this.of.actions[action];
		if (action) action.call(this.of.actions, this, a);		
	}
}