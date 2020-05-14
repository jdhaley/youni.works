export default {
	package$: "youniworks.com/service",
	package$component: "youniworks.com/component",
	Service: {
		super$: "component.Component",
		service: function(from, action, content) {
			this.request({
				requestor: from,
				action: action,
				content: content
			});
		},
		request: function(request) {
			let service = this.part[request.action];
			if (service) {
				service.request(request);
			} else {
				this.respond("Error", 400, `Request action "${request.action}" not found.`, request);
			}
		},
		respond: function(action, status, content, request) {
			let response = {
				status: status,
				content: content,
				request: request
			};
			request.requestor.receive(action, response);
		}
	},
	Client: {
		super$: "Service",
		get$origin: function() {
			return this.of && this.of.origin || "";
		},		
		request: function(request) {
			let xhr = new XMLHttpRequest();
			xhr.request = request;
			xhr.onreadystatechange = () => this.monitor(xhr);

			xhr.open(this.method, this.getEndpoint(request));
			
			let header = this.getHeader(request);
			for (let name in header) {
				let value = header[name];
				value && xhr.setRequestHeader(name, value);
			}
			let content = this.getRequestContent(request);

			content ? xhr.send(content) : xhr.send();
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
					this.respond("Response", xhr.status, xhr.responseText, xhr.request);
			}
		},
		getEndpoint: function(request) {
			return this.origin + this.pathname;
		},
		getHeader: function(request) {
			return {
//				"Session-Id": this.session.id
			}
		},
		getRequestContent: function(request) {
			return this.requestType == "text" ? "" + request.content : JSON.stringify(request.content);
		}
	}
}