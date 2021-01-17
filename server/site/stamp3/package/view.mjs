export default {
	package$: "youni.works/view",
	Controller: {
		super$: "Object",
		create: function(ctx, data) {
			//Return an object that will conform to the framework's interfaces.
		},
		control: function(control) {
			control.controller = this;
			control.receive = receive;
		},
		bind: function(view, data) {
		},
		extend$actions: {
		}
	},
	Viewer: {
		super$: "Controller",
		nodeName: "div",
		create: function(ctx, data) {
			let view = ctx.ownerDocument.createElement(this.nodeName);
			for (let name in this.events) {
				let listener = this.events[name];
				view.addEventListener(name, listener);
			}
			this.control(view);
			this.bind(view, data);
			return view;
		},
		draw: function(view) {
			//This is where the style & non-model elements get rendered.
		},
		extend$actions: {
			view: function(view, event) {
				this.draw(view);
			}
		},
		extend$events: {
		}
	},
	Property: {
		super$: "Viewer",
		conf: {
			propertyName: "",
			dataType: "",
			objectType: "",
			title: "",
			size: 4 //width, height
		},
		bind: function(view, data) {
			unobserve(view, view.model);
			//View model will be undefined if there is no property, null if there is no object to obtain property.
			view.model = data ? data[this.conf.propertyName] : null;
			observe(view, view.model);
		},
		extend$actions: {
			view: function(view, event) {
				this.draw(view);
				let action = this.actions["view" + this.conf.dataType];
				action && action.call(this, view, event);
			},
			viewString: function(view, event) {
				view.textContent = view.model;
			},
			viewObject: function(view, event) {
				let type = view.ownerDocument.objectTypes[this.conf.objectType];
				if (type) for (let prop of type.parts) {
					let content = prop.create(view);
					view.append(content);					
				}
			},
			viewArray: function(view, event) {
				let type = view.ownerDocument.objectTypes[this.conf.objectType];
				for (let value of view.model) {
					let content = prop.create(view);
					view.append(content);					
				}
			}
		}
	},
	Shaper: {
		super$: "Viewer",
		size: function(view, shape) {
			let w = shape.width + shape.uom;
			view.style.minWidth = w;
			view.style.maxWidth = w;
			let h = shape.height + shape.uom;
			view.style.minHeight = h;
			view.style.maxHeight = h;
		}
	},
	Collection: {
		super$: "Viewer",
		forValue: function(value) {
			return this.type;
		},
		extend$actions: {
			draw: function(on, event) {
				for (let value of on.model) {
					let controller = this.forValue(value);
					let view = controller.create(on, value);
				}
			}
		}
	},
	Context: {
		super$: "Object",
		controllers: null,
		view: function(container, viewName, data) {
			let controller = this.controllers[viewName];
			let view = controller.create(container, data);
			container.append(view);
			let message = this.sys.extend(null, {
				topic: "view"
			});
			send(view, message);
		},
		type$remote: "Remote",
		open: function(pathname, receiver) {
			this.remote.service(receiver, "opened", {
				url: pathname,
				method: "GET"
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
	for (let i = 0, len = list.length; i < len; i++) {
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

function send(on, message) {
	if (!message || !message.topic) return;
	let context = message.context;
	on.receive && on.receive(message);
	message.context = on;
	for (on of on.childNodes) {
		send(on, message);
	}
	message.context = context;
}

function receive(signal) {
	if (this.controller) {
		let action = signal && signal.topic || "";
		if (action) action = this.controller.actions[action];
		if (action) action.call(this.controller, this, signal);
	}
}