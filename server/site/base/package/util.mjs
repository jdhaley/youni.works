const pkg = {
	isUpperCase(str)
	{
		return str == str.toUpperCase() && str != str.toLowerCase();
	},
	isLowerCase(str)
	{
		return str == str.toLowerCase() && str != str.toUpperCase();
	},
	$public: {
		type$: "/base.youni.works/control",
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
						} else if (pkg.isLowerCase(char) && (caption == "" | caption.endsWith(" "))) {
							char = char.toUpperCase();
						}
						caption += char;
					}
					return caption;
				}
				
				caption = name.substring(0, 1).toUpperCase();
				for (let i = 1; i < name.length; i++) {
					let char = name.charAt(i);
					if (pkg.isUpperCase(char)) {
						if (pkg.isLowerCase(name.charAt(i - 1))) caption += " ";
						if (pkg.isUpperCase(name.charAt(i - 1)) && pkg.isLowerCase(name.charAt(i + 1))) caption += " ";
					}
					caption += char;
				}
				return caption;
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
				if (value === undefined ||
					value === null ||
					typeof value == "number" && isNaN(value)) return "void";
				
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
						&& pkg.isUpperCase(name, name.substring(2, 1))) return "boolean";
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
			type$: "",
			type$remote: "Remote",
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
		Remote: {
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
		}
	}
 }
 export default pkg;