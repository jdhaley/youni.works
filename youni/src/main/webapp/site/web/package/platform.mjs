export default {
	package$: "youni.works/platform",
	package$signal: "youni.works/signal",
	package$part: "youni.works/part",
	Sensor: {
		super$: "signal.Sender",
		content: null,
		before$send: function send(to, message) {
			if (!message[Symbol.Signal]) {
				message[Symbol.Signal] = message.selector ? "Broadcast" : "Message";
			}
		},
		extend$sender: {
			Call: function signal(on, message) {
				for (let name in on.part) {
					if (!message.action) return;
					let part = on.part[name];
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
		super$: "part.Service",
		method: "HEAD",
		url: "",
		process: function(receiver, message) {
			let xhr = new XMLHttpRequest();
			xhr.message = message;
			xhr.receiver = receiver;
			this.prepare(xhr);
			xhr.send(xhr.message.request);
		},
		after$createMessage: function(receiver, subject, request) {
			let message = Function.returned;
			message.url = this.getUrl(receiver, message);
			message.request = this.getRequest(receiver, message);
			return message;
		},
		prepare: function(xhr) {
			xhr.onreadystatechange = () => this.monitor(xhr);
			xhr.open(this.method, xhr.message.url);
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
		getUrl: function(on, message) {
			return this.method == "GET" || this.method == "HEAD"
				? this.url + "?" + message.request
				: this.url;
		},
		getRequest: function(on, message) {
			return this.method == "GET" || this.method == "HEAD"
				? null
				: message.request
		},		
		getHeader: function(on, message) {
			return null;
//			{
//				"Session-Id": this.session.id
//			}
		}
	}
}