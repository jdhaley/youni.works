export default {
	package$: "youni.works/web/view",
	use: {
		package$control: "youni.works/base/control"
	},
	Viewer: {
		super$: "use.control.Processor",
		type$owner: "Frame",
		get$controller: function() {
			return this.owner;
		},
		viewName: "div",
		viewType: "text",
		view: function(model) {
			let view = this.owner.view(this.viewName);
			this.control(view, model);
			return view;
		},
		control: function(view, model) {
			this.sys.define(view, "controller", this, "const");
			view.model = model;
		},
		action: {
			draw: function(on, signal) {
				let render = this.owner.render;
				render = render && render[this.viewType];
				render && render.call(this, on);
			}
		},
		before$initialize: function(conf) {
			this.sys.define(this, "owner", conf.owner, "const");
		}
	},
	Frame: {
		super$: "use.control.Owner",
		render: {
		},
		once$window: function() {
			return this.content.ownerDocument.defaultView;
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
		view: function(name) {
			let doc = this.content.ownerDocument;
			return arguments.length ? doc.createElement("" + name) : doc.createDocumentFragment();
		},
		control: function(view) {
			let viewer = this.part[view.nodeName.toLowerCase()] || this.part["view"];
			viewer.control(view);
		},
		before$initialize: function(conf) {
			conf.document.owner = this;
			this.sys.define(this, "content", conf.document.body);
			this.sys.implement(this.window.Element.prototype, conf.platform.view);
			this.sys.implement(this.window.Range.prototype, conf.platform.range);
			this.device = this.sys.extend(null, conf.platform.devices);
			createStyleSheet(this);
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

function createStyleSheet(owner) {
	let ele = owner.window.document.createElement("style");
	ele.type = "text/css";
	owner.window.document.head.appendChild(ele);
	owner.sheet = ele.sheet;
}

function defineRule(viewer) {
	let out = `[data-view=I${viewer.id}] {`;
	for (let name in viewer.style) {
		out += name + ":" + viewer.style[name] + ";"
	}
	out += "}";
	let index = viewer.owner.sheet.insertRule(out);
	viewer.style = viewer.owner.sheet.cssRules[index];
}
/*
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
		this.owner.sensor[sensorType](this, signal);
	}
},
*/
