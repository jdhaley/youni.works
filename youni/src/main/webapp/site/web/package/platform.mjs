export default {
	package$: "youni.works/platform",
	package$signal: "youni.works/signal",
	package$part: "youni.works/part",
	Sensor: {
		super$: "signal.Sender",
		content: null,
		send: function send(to, message) {
			let signal = message[Symbol.Signal] || (message.selector ? "Broadcast" : "Message");
			this.signal[signal].call(this, to, message);
		},
		extend$signal: {
			Event: function(on, event) {
				while (on && event.action) {
					on.receive && on.receive(event);
					on = on.parentNode;
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
				const signal = owner.signal.Event;
				target.addEventListener(action.toLowerCase(), event => {
					event[Symbol.Signal] = "Event";
					event.owner = owner;
					event.action = action;
					owner.send(event.target, event);
					if (!event.action) event.preventDefault();
				});
			},
			//Propagate from the selection container rather than the event target:
			selection: function(target, action) {
				const owner = target.owner;
				const signal = owner.signal.Event;
				target.addEventListener(action.toLowerCase(), event => {
					event[Symbol.Signal] = "Event";
					event.owner = owner;
					event.action = action;
					owner.send(owner.selection.commonAncestorContainer, event);
					if (!event.action) event.preventDefault();
				});
			}
		}
	},
	Remote: {
		super$: "part.Service",
		method: "HEAD",
		url: "",
		service: function(receiver, subject, request) {
			let xhr = new XMLHttpRequest();
			xhr.message = this.createMessage(receiver, subject, request);
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