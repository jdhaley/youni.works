export default {
	package$: "youni.works/web/control",
	use: {
		package$control: "youni.works/base/control"
	},
	View: {
		super$: null,
		once$control: function(){
			return this.documentOwner.owner.control(this);
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
		}
	},
	Frame: {
		super$: "use.control.Controller",
		use: {
			type$Transmitter: "use.control.Transmitter"
		},
		window: null,
		get$view: function() {
			return this.window.document.body;
		},
		virtual$selection: function() {
			let selection = this.window.getSelection();
			if (arguments.length) {
					selection.removeAllRanges();
					selection.addRange(arguments[0]);
					return;
			}
			if (selection && selection.rangeCount) {
				return selection.getRangeAt(0);
			} else {
				let range = this.window.document.createRange();
				range.collapse();
				return range;
			}
		},
		createView: function(name) {
			let doc = this.window.document;
			return arguments.length ? doc.createElement("" + name) : doc.createDocumentFragment();
		},
		control: function(view) {
			let viewer = this.part[view.nodeName];
			if (viewer) return viewer.control(view);
		},
		send: function(to, message) {
			this.use.Transmitter.down(to, message);
		},
		initialize: function(conf) {
			this.initializePlatform(conf);
			conf.controller = this;
//			createStyleSheet(this);
//			this.part.main.owner = this;
		},
		initializePlatform: function(conf) {
			this.window.document.owner = this;
			this.sys.implement(this.window.Element.prototype, conf.platform.view);
			this.sys.implement(this.window.Range.prototype, conf.platform.range);
			this.device = this.sys.extend(null, conf.platform.devices);
		},
		activate: function() {
			let main = this.part.main;
			if (!main) this.log.error("No main Viewer");
			this.view.append(main.createView());
		}
	},
	Viewer: {
		super$: "use.control.Processor",
		use: {
			type$Control: "ViewControl",
		},
		viewName: "div",
		viewType: "text",
		get$owner: function() {
			return this.controller;
		},
		get$render: function() {
			return this.owner.render;
		},
		extend$shortcut: {
		},
		extend$action: {
			draw: function(on, signal) {
				this.draw(on, this.view);
			}
		},
		createView: function(model) {
			let view = this.owner.createView(this.viewName);
			view.control = this.control(view);
			view.control.model = model;
			return view;
		},
		control: function(view) {
			if (view.control) console.log("Changing a view control.");
			return this.sys.extend(this.use.Control, {
				view: view,
				controller: this
			});
		},
		draw: function(view, render) {
			render = this.render[render];
			render && render.call(this, view);
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