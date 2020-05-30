export default {
	package$: "youni.works/web/platform",
	use: {
		package$signal: "youni.works/base/signal",
		package$part: "youni.works/base/part"
	},
	Sensor: {
		super$: "use.signal.Sender",
		content: null,
		before$send: function send(to, message) {
			if (!message[Symbol.Signal]) {
				message[Symbol.Signal] = message.selector ? "Broadcast" : "Message";
			}
		},
		extend$sender: {
			Call: function signal(on, message) {
				if (on[Symbol.iterator]) for (let part of on) {
					if (!message.action) return;
					message.of = on;
					part.receive && part.receive(message);
					message.of = on;
					signal(part, message);
				}
			},
			Event: function(on, event) {
				for (on = event.source; on && event.action; on = on.parentNode) {
					on.receive && on.receive(event);
				}
			},
			Message: function signal(on, message) {
				if (on == this) on = this.content;
				if (message.action) on.receive && on.receive(message);
				if (message.action) for (on of on.childNodes) {
					if (!message.action) break;
					signal(on, message);
				}
			},
			//Unicast: capture Event
			Broadcast: function(on, message) {
				if (on == this) on = this.content;
				let list = on.querySelectorAll(signal.selector);
				for (let on of list) {
					if (!message.action) break;
					on.receive && on.receive(message);
				}
			}
		},
		extend$sense: {
			event: function(target, action) {
				const owner = target.owner;
				target.addEventListener(action.toLowerCase(), event => {
					event[Symbol.Signal] = "Event";
					event.action = action;
					event.owner = owner;
					event.source = event.target;
					owner.receive(event);
					if (!event.action) event.preventDefault();
				});
			},
			//Propagate from the selection container rather than the event target:
			selection: function(target, action) {
				const owner = target.owner;
				target.addEventListener(action.toLowerCase(), event => {
					event[Symbol.Signal] = "Event";
					event.action = action;
					event.owner = owner;
					event.source = owner.selection.container
					owner.receive(event);
					if (!event.action) event.preventDefault();
				});
			}
		}
	},
	Remote: {
		super$: "use.part.Service",
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