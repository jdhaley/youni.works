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
//					let action = "Response";
//					if (xhr.status != 200) {
//						action = "Error";
//						if (xhr.status == 341 && xhr.responseText == "AUTHENTICATE") {
//							action = "Authenticate";
//						}
//					}
					xhr.message.status = xhr.status;
					xhr.message.response = xhr.responseText;
					this.respond(xhr.receiver, xhr.message);
			}
		},
		respond: function(receiver, message) {
			receiver.receive(message.subject, message);
		},
		createMessage: function(receiver, subject, request) {
			let message = this.sys.extend();
			message.subject = subject;
			message.request = this.getRequest(receiver, subject, request);
			message.url = this.getUrl(receiver, subject, request);
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