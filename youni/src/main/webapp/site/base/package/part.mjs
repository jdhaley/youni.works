let LAST_ID = 0;

export default {
	package$: "youni.works/part",
	Part: {
		super$: "Object",
		once$id: () => ++LAST_ID,
		type$of: "Part",
		part: {
		},
		once$owner: function() {
			if (this.of) return this.of != this && this.of.owner;
			return this;
		},
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
		get$log: function() {
			return this.owner ? this.owner.log : console;
		},
		initialize: function(conf) {
			console.debug("init", this, conf.of);
			if (this.of != this.sys.interfaceOf(this, "Part")) {
				throw new Error("Component is already initialized.");
			}
			this.sys.define(this, "of", conf.of, "const");
		}
	},
	Service: {
		super$: "Object",
		service: function(receiver, subject, request) {
			let message = this.createMessage(receiver, subject, request);
			message.status = 204;
			on.receive(message);
		},
		createMessage(receiver, subject, request) {
			let message = this.sys.extend();
			message[Symbol.Signal] = "Message";
			message.action = subject;
			message.request = request;
			message.status = 0;
			return message;
		}
	}
}