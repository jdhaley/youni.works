export default {
	package$: "youni.works/base",
	Context: {
		super$: "Object",
		type$remote: "Remote",
		send: down,
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
			/*
			 * 	This default implementation uses the sys package scheme to obtain a class.
			 */
			let cls = null;
			if (name) {
				let idx = name.lastIndexOf("/");
				let pkg = this.sys.packages[name.substring(0, idx)];
				if (pkg) cls = pkg[name.substring(idx + 1)];
				if (!cls) console.warn("Class '" + name + "' does not exist.");
			}
			return cls;			
		}
	},
	Controller: {
		super$: "Object",
		conf: null,
		initialize: function(conf) {
			conf.type = this;
			this.sys.define(this, "conf", conf);
		},
		// A Controller isn't required to be a factory.
		//		create: function(owner, data) {
		//			let control = owner.createNode();
		//			this.control(control);
		//			this.bind(control, data);
		//			return control;
		//		},
		control: function(control) {
			control.conf = this.conf;
			control.receive = receive;
		},
		bind: function(control, data) {
		},
		extend$actions: {
		}
	},
	Owner: {
		super$: "Controller",
		createNode: function(name) {
			this.sys.extend(null, {
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

function receive(signal) {
	if (this.conf) {
		let action = signal && typeof signal == "object" ? signal.topic : "" + signal;
		action = action && this.conf.type.actions[action];
		if (action) action.call(this.conf.type.actions, this, signal);
	}
}