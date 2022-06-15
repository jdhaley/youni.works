export default {
	Origin: {
		type$remote: "Remote",
		origin: "",
		open(pathname, subject) {
			let message = this.remote.process(this, subject || "opened", {
				url: this.origin + pathname,
				method: "GET"
			});
		},
		save(pathname, content, subject) {
			let message = this.remote.process(this, subject || "saved", {
				url: this.origin + pathname,
				method: "PUT",
				content: content
			});
		},
	},
	Remote: {
		process(receiver, subject, request) {
			let xhr = this.createHttpRequest(receiver, subject, request);
			this.prepare(xhr);
			let content = request.content;
			if (typeof content != "string") content = JSON.stringify(content);
			xhr.send(content);
		},
		prepare(xhr) {
			let req = xhr.request;
			xhr.open(req.method || "HEAD", req.url || "");
			req.headers && this.setHeaders(xhr, req.headers)
		},
		setHeaders(xhr, headers) {
			for (let name in headers) {
				let value = headers[name];
				value && xhr.setRequestHeader(name, value);
			}
		},
		monitor(xhr) {
			switch (xhr.readyState) {
				case 0: // UNSENT Client has been created. open() not called yet.
				case 1: // OPENED open() has been called.
				case 2: // HEADERS_RECEIVED send() has been called, and headers and status are available.
				case 3:	// LOADING Downloading; responseText holds partial data.
					break;
				case 4: // DONE The operation is complete.
					let message = this.createMessage(xhr);
					if (typeof xhr.receiver == "function") {
						xhr.receiver(message);
					} else if (xhr.receiver) {
						xhr.receiver.receive(message);
					} else {
						this.receive(message);
					}
			}
		},
		createHttpRequest(receiver, subject, request) {
			let xhr = new XMLHttpRequest();
			xhr.receiver = receiver;
			xhr.subject = subject;
			xhr.request = request;
			xhr.onreadystatechange = () => this.monitor(xhr);
			return xhr;
		},
		createMessage(xhr) {
			return this[Symbol.for("owner")].create({
				subject: xhr.subject,
				request: xhr.request,
				response: xhr.responseText,
				status: xhr.status
			});
		}
	}
}