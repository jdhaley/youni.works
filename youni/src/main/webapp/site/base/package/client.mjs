export default {
	package$: "youni.works/client",
	Service: {
		super$: "Object",
		method: "HEAD",
		url: "",
		service: function(receiver, subject, request) {
			let xhr = new XMLHttpRequest();
			xhr.receiver = receiver;
			xhr.message = this.createMessage(receiver, subject, request);
			xhr.onreadystatechange = () => this.monitor(xhr);
			xhr.open(this.method, xhr.message.url);
			let header = this.getHeader(receiver, subject, request);
			for (let name in header) {
				let value = header[name];
				value && xhr.setRequestHeader(name, value);
			}
			xhr.send(xhr.message.request);
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
		createMessage: function(receiver, subject, request) {
			let message = this.sys.extend();
			message.action = subject;
			message.url = this.getUrl(receiver, subject, request);
			message.request = this.getRequest(receiver, subject, request);
			return message;
		},
		getRequest: function(receiver, subject, request) {
			return this.method == "GET" || this.method == "HEAD"
				? null
				: request
		},		
		getUrl: function(receiver, subject, request) {
			return this.method == "GET" || this.method == "HEAD"
				? this.url + "?" + request
				: this.url;
		},
		getHeader: function(receiver, subject, request) {
			return null;
//			{
//				"Session-Id": this.session.id
//			}
		}
	}
}