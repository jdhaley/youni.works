export default {
	type$: "/base.youni.works/component",
	Naming: {
		type$: "",
		captionize: function(name) {
			let caption = "";
			
			if (name.indexOf("_") > 0) {
				name =  name.replace("_", " ");
				for (let i = 0; i < name.length; i++) {
					let char = name.charAt(i);
					if (char == " " && (caption == "" || caption.endsWith(" "))) {
						char = "";
					} else if (isLowerCase(char) && (caption == "" | caption.endsWith(" "))) {
						char = char.toUpperCase();
					}
					caption += char;
				}
				return caption;
			}
			
			caption = name.substring(0, 1).toUpperCase();
			for (let i = 1; i < name.length; i++) {
				let char = name.charAt(i);
				if (isUpperCase(char)) {
					if (isLowerCase(name.charAt(i - 1))) caption += " ";
					if (isUpperCase(name.charAt(i - 1)) && isLowerCase(name.charAt(i + 1))) caption += " ";
				}
				caption += char;
			}
			return caption;

			function isUpperCase(str)
			{
				return str == str.toUpperCase() && str != str.toLowerCase();
			}
			function isLowerCase(str)
			{
				return str == str.toLowerCase() && str != str.toUpperCase();
			}
		}
	},
	Typing: {
		type$: "Instance",
		use: {
			type$Naming: "Naming"
		},
		//instances also have an interface. add interface itself?
		datatypes: ["void", "boolean", "number", "date", "string", "array", "object"],
		objecttypes: ["instance", "source", "record", "map", "function", "symbol", "other"],	
		typeSuffixes: {
			link: ["Id", "_id"],
			hyperlink: ["Loc", "_loc", "Url", "_url"],
			enum: ["Code", "Cd", "_code", "_cd"],
			type: ["Type", "_type"],
			date: ["Date", "_date"],
			color: ["Color", "_color"],
			boolean: ["Ind", "_ind", "Flag", "_flag"]
		},
		propertyOf: function(name, value) {
			let dataType = this.propertyType(name, value);
			let objectType = (dataType == "object" ? this.objectType(value) : "");
		
			let property = this.sys.extend(null, {
				dynamic: true,
				name: name,
				dataType: dataType,
				caption: this.use.Naming.captionize(name)
			});
			if (objectType) property.objectType = objectType;
			return property;
		},
		datatypeOf: function(value) {
			if (value === undefined || value === null || isNaN(value)) return "void";
			
			switch (typeof value) {
				case "string":
				case "number":
				case "boolean":
					return typeof value;
				case "bigint":
					return "number";
				case "symbol":
				case "function":
				case "object":
				default:
					return "object";
			}
		},			
		propertyType: function(name, value) {
			for (let type in this.typeSuffixes) {
				for (let suffix of this.typeSuffixes[type]) {
					if (name.endsWith(suffix)) return type;
				}
			}
			if (name.startsWith("is_") || name.startsWith("is") 
					&& isUpperCase(name, name.substring(2, 1))) return "boolean";
			let type = this.datatypeOf(value);
			return type == "object" ? this.objectType(value) : type;
		},
		kindOf: function(name) {
			let kinds = ["link", "enum", "type"];
			for (let type of kinds) {
				for (let suffix of typeSuffixes[type]) {
					if (name.endsWith(suffix)) return name.substring(0, name.length - suffix.length);
				}
			}
		},		
		objectType: function(value) {
			if (value instanceof Date) return "date";
			if (value[Symbol.iterable] && typeof value.length == "number") return "array";
			if (value.sys) return "instance";
			let proto = Object.getPrototypeOf(value);
			if (!proto) return "object";
			return proto == Object.prototype ? "source" : "other";	
		}	
	},
	Origin: {
        type$: "Component",
        type$remote: "Remote2",
        origin: "",
        open: function(pathname, subject) {
            let message = this.remote.process(this, subject || "opened", {
				url: this.origin + pathname,
				method: "GET"
			});
		},
		save: function(pathname, content, subject) {
            let message = this.remote.process(this, subject || "saved", {
				url: this.origin + pathname,
				method: "PUT",
                content: content
			});
		},
    },
	Remote2: {
		type$: "Instance",
		process: function(receiver, subject, request) {
  			let xhr = this.createHttpRequest(receiver, subject, request);
            this.prepare(xhr);
            let content = request.content;
			if (typeof content != "string") content = JSON.stringify(content);
			xhr.send(content);
		},
        prepare: function(xhr) {
            let req = xhr.request;
			xhr.open(req.method || "HEAD", req.url || "");
            req.headers && this.setHeaders(xhr, req.headers)
        },
		setHeaders: function(xhr, headers) {
            for (let name in headers) {
				let value = headers[name];
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
        createHttpRequest: function(receiver, subject, request) {
			let xhr = new XMLHttpRequest();
			xhr.receiver = receiver;
            xhr.subject = subject;
			xhr.request = request;
			xhr.onreadystatechange = () => this.monitor(xhr);
			return xhr;
		},
 		createMessage(xhr) {
            return this.sys.extend(null, {
                subject: xhr.subject,
                request: xhr.request,
                response: xhr.responseText,
                status: xhr.status
            });
		}
	},
	Remote: {
		type$: "Instance",
		method: "HEAD",
		url: "",
		service: function(receiver, subject, request) {
			let message = this.createMessage(receiver, subject, request);
			this.process(receiver, message);
		},
		createMessage(receiver, subject, request) {
			let message = this.sys.extend();
			message.action = subject;
			message.request = request;
			message.status = 0;
			return message;
		},
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
			let header = this.getHeaders(xhr.receiver, xhr.message);
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
					if (typeof xhr.receiver == "function") {
						xhr.receiver(xhr.message);
					} else if (xhr.receiver) {
						xhr.receiver.receive(xhr.message);
					}
			}
		},
		getMethod: function(on, message) {
			return message.request.method || this.method;
		},
		getUrl: function(on, message) {
			let requestUrl = message.request.url || "";
			return this.url + requestUrl;
		},
		getHeaders: function(on, message) {
			return null;
//			{
//				"Session-Id": this.session.id
//			}
		},
		getContent: function(on, message) {
			let content = message.request.content;
			if (typeof content != "string") content = JSON.stringify(content);
			return content;
		}
	}
}