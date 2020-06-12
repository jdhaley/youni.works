let LAST_ID = 0;

export default {
	package$: "youni.works/base/part",
	use: {
		package$signal: "youni.works/base/signal"
	},
	Part: {
		super$: "use.signal.Node",
		once$id: () => ++LAST_ID,
		once$name: function() {
			if (this.of) for (let name in this.of.part) {
				if (this.part[name] == this) return name;
			}
			return "";
		},
		get$pathname: function() {
			if (this.name) {
				let path = this.of && this.of.pathname || "";
				return path + "/" + this.name;
			}
			return "";
		},
		initialize: function(conf) {
			this.sys.define(this, "of", conf.of, "const");
		},
		part: {
		},
		"@iterator": function* iterate() {
			for (let name in this.part) yield this.part[name];
		},
	},
	Component: {
		super$: "Part",
		//TODO add interface-level implement via super$: "Part Receiver Processor"
		type$controller: "use.signal.Receiver.controller",
		type$receive: "use.signal.Receiver.receive",
		//type$log: "use.signal.Controller.log",
		type$process: "use.signal.Processor.process",
		type$execute: "use.signal.Processor.execute",
		type$trap: "use.signal.Processor.trap",
		instruction: {	
		}
	},
	Service: {
		super$: "Component",
		use: {
			type$Message: "use.signal.Message"
		},
		service: function(receiver, subject, request) {
			let message = this.createMessage(receiver, subject, request);
			this.process(receiver, message);
		},
		createMessage(receiver, subject, request) {
			let message = this.sys.extend(this.use.Message);
			message.action = subject;
			message.request = request;
			message.status = 0;
			return message;
		}
	}
}