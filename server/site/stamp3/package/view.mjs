export default {
	package$: "youni.works/view",
	Controller: {
		super$: "Object",
		conf: null,
		initialize: function(conf) {
			this.sys.define(this, "conf", conf);
		},
		create: function(container, data) {
			let control = this.sys.extend();
			this.control(control);
			this.bind(control, data);
			return control;
		},
		control: function(control) {
			control.controller = this;
			control.receive = receive;
		},
		bind: function(control, data) {
		},
		extend$actions: {
		}
	},
	Viewer: {
		super$: "Controller",
		type$app: "App",
		nodeName: "div",
		create: function(container, data) {
			let view = container.ownerDocument.createElement(this.nodeName);
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
	Part: {
		super$: "Viewer",
		type$comp: "Composite",
		get$app: function() {
			return this.comp.app;
		},
		conf: {
			name: "",
			dataType: "",
			title: "",
			viewWidth: 4
		},
		bind: function(view, data) {
			if (data) view.model = data[this.conf.name];
		},
		draw: function(view) {
			view.className = this.conf.name;
		},
		extend$actions: {
			view: function(view, event) {
				this.draw(view);
				let action = this.actions["view-" + (this.conf.dataType || "String")];
				action && action.call(this, view, event);
			},
			"view-string": function(view, event) {
				view.textContent = view.model;
			},
			"view-object": function(view, event) {
				let type = this.app.viewers[this.conf.objectType];
				if (type) type.fill(view);
			},
			"view-array": function(view, event) {
				let type = this.app.viewers[this.conf.objectType];
				for (let value of view.model) {
					let content = type.create(view, value);
					view.append(content);					
				}
			}
		}
	},
	Composite: {
		super$: "Viewer",
		use: {
			type$DefaultView: "Part"
		},
		parts: null,
		bind: function(view, data) {
			unobserve(view, view.model);
			view.model = data;
			observe(view, view.model);
		},
		initialize: function(conf) {
			this.sys.define(this, "conf", conf);
			this.sys.define(this, "parts", []);
			for (let part of conf.parts) {
				let viewer = this.app.forName(part.view) || this.use.DefaultView;
				viewer = this.sys.extend(viewer, {
					comp: this
				});
				this.parts.push(viewer);
				viewer.initialize(part);
			}
		},
		draw: function(view) {
			view.className = this.name;
		},
		fill: function(view) {
			view.parts = this.sys.extend();
			for (let part of this.parts) {
				let prop = part.create(view, view.model);
				view.parts[part.name] = prop;
				view.append(prop);			
			}
		},
		extend$actions: {
			view: function(view, event) {
				this.draw(view);
				this.fill(view);
			}
		}
	},
	App: {
		super$: "Object",
		use: {
			type$DefaultView: "Composite"
		},
		type$remote: "Remote",
		viewers: null,
		forName: function(name) {
			/*
			 * 	This default implementation uses the sys package scheme to obtain a class.
			 */
			let cls = null;
			if (name) {
				let idx = name.lastIndexOf("/");
				let pkg = this.sys.packages[name.substring(0, idx)];
				if (pkg) cls = pkg[name.substring(idx + 1)];
				if (!cls) console.log("Class '" + name + "' does not exist.");
			}
			return cls;			
		},
		initialize: function(types) {
			this.conf.types = types;
			this.sys.define(this, "viewers", this.sys.extend());
			for (let name in types) {
				let type = types[name];
				let viewer = this.forName(type.view) || this.use.DefaultView;
				viewer = this.sys.extend(viewer, {
					app: this,
					name: name
				});
				this.viewers[name] = viewer;
				viewer.initialize(type);
			}
		},
		view: function(container, typeName, data) {
			let type = this.viewers[typeName];
			let view = type.create(container, data);
			container.append(view);
			let message = this.sys.extend(null, {
				topic: "view"
			});
			send(view, message);
		},
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
//Shaper: {
//	super$: "Viewer",
//	draw: function(view) {
//		view.style.width = view.model.width + view.model.uom;
//		view.style.height = view.model.height + view.model.uom;
//	}
//},

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
		if (action) try {
			action.call(this.controller, this, signal);
		} catch (error) {
			throw error;
		}
	}
}