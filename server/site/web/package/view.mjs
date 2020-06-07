export default {
	package$: "youni.works/web/view",
	use: {
		package$control: "youni.works/base/control"
	},
	View: {
		super$: null,
		once$control: function(){
			return this.documentOwner.owner.bind(this);
		}
	},
	ViewControl: {
		super$: "use.control.Control",
		get$of: function() {
			return this.view.parentNode && this.view.parentNode.control;
		},
		get$owner: function() {
			return this.view.ownerDocument.owner;
		},
		type$view: "View",
		"@iterator": function* iterate() {
			let length = this.view.children.length;
			for (let i = 0; i < length; i++) yield this.view.children[i].control;
		},
		sense: function(sensorType, signal) {
			this.owner.sense[sensorType](this, signal);
		}
	},
	Viewer: {
		super$: "use.control.Processor",
		use: {
			type$Control: "ViewControl",
		},
		get$owner: function() {
			return this.controller;
		},
		viewName: "div",
		viewType: "text",
		view: function(model) {
			let view = this.owner.view(this.viewName);
			this.control(view, model);
			return view;
		},
		control: function(view, model) {
			let control = this.sys.extend(this.use.Control, {
				model: model,
				view: view,
				controller: this
			});
			this.sys.define(view, "control", control, "const");
		},
		action: {
			draw: function(on, signal) {
				let render = this.owner.render[this.viewType];
				render && render.call(this, on.view);
			}
		}
	},
	Owner: {
		super$: "use.control.Controller",
		type$content: "View",
		extend$render: {
		},
		type$send: "use.control.Transmitter.down",
		type$sense: "use.control.Transmitter.up",
		view: function(name) {
			let doc = this.content.ownerDocument;
			return arguments.length ? doc.createElement("" + name) : doc.createDocumentFragment();
		},
		control: function(view) {
			let viewer = this.part[view.nodeName.toLowerCase()] || this.part["view"];
			viewer.control(view);
		},
		initialize: function(conf) {
			this.sys.define(this, "content", conf.document.body);
			conf.controller = this;
			conf.document.owner = this;
		},
		open: function() {
			this.send(this.content.control, "draw");
		}
	},
	Remote: {
		super$: "use.control.Service",
		method: "HEAD",
		url: "",
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
			let header = this.getHeader(xhr.receiver, xhr.message);
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
					xhr.receiver.receive(xhr.message);
			}
		},
		getMethod: function(on, message) {
			return this.method;
		},
		getUrl: function(on, message) {
			let requestUrl = message.request.url || "";
			return this.url + requestUrl;
		},
		getHeader: function(on, message) {
			return null;
//			{
//				"Session-Id": this.session.id
//			}
		},
		getContent: function(on, message) {
			return message.request.content || null;
		}
	}
}
