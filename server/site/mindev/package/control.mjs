Symbol.observers = Symbol("observers");

export default {
	package$: "youni.works/control",
	use: {
		package$util: "youni.works/util"		
	},
	Control: {
		super$: "Object",
		conf: Object.freeze(Object.create(null)),
		type$owner: "Owner",
		to: Object.freeze([]),
		append: function(control) {
			this.to.push(control);
		},
		start: function(conf) {
			if (conf) this.sys.define(this, "conf", conf);
		},
		observe: function(object) {
			if (typeof object != "object" || object == null) return; //Only observe objects.
			let observers = object[Symbol.observers];
			if (observers) {
				for (let observer of observers) {
					if (observer == this) return; //Already observing
				}					
			} else {
				observers = [];
				object[Symbol.observers] = observers;
			}
			observers.push(this);
		},
		unobserve: function(control, object) {
			let list = object ? object[Symbol.observers] : null;
			if (list) for (let i = 0, len = list.length; i < len; i++) {
				if (this == list[i]) {
					list.splice(i, 1);
					break;
				}
			}
		},
		receive: function(signal) {
			signal = prepareSignal(signal);
			let action = this.actions[signal.subject];
			action && action.call(this.actions, this, signal);			
		},
		extend$actions: {
			send: function(to, message) {
				message = prepareSignal(message);
				log(to, message);
				message && down(to, message);
			},
			sense: function(on, event) {
				event = prepareSignal(event);
				log(on, event);
				event && up(on, event);
			},
			notify: function(on, signal) {
				let model = signal.model || on.model;
				let observers = model && model[Symbol.observers];
				if (!observers) return;
				signal = prepareSignal(signal);
				for (let ctl of observers) {
					//Set the following for each iteration in case of a bad behaving control.
					signal.source = on;
					signal.model = model;
					ctl.receive(signal);
				}
			}
		}
	},
	Owner: {
		super$: "Control",
		type$remote: "use.util.Remote",
		open: function(pathname, receiver) {
			this.remote.service(receiver, "opened", {
				url: pathname,
				method: "GET"
			});
		},
		save: function(pathname, content, receiver) {
			this.remote.service(receiver, "saved", {
				url: pathname,
				content: content,
				method: "PUT"
			});
		},
		create: function(controlType, conf) {
			if (typeof controlType != "object") {
				controlType = this.sys.forName(controlType);
			}
			let control = this.sys.extend(controlType, {
				owner: this
			});
			control.start(conf);
			return control;
		}
	}
}

function prepareSignal(signal) {
	if (typeof signal != "object") {
		signal = {
			subject: signal
		};
	}
	signal.stopPropagation && signal.stopPropagation();
	if (!signal.subject) signal.subject = signal.type;
	return signal;
}

function down(on, message) {
	if (!message.subject) return;
	on.receive(message);
	if (message.push) message.pushPath(on);
	for (on of on.to) {
		down(on, message);
	}
}

function up(on, event) {
	if (event.path) for (let on of event.path) {
		if (!event.subject) return;
		on.receive(event);
	}
	if (event.preventDefault && !event.subject) event.preventDefault();
}

const DONTLOG = ["receive", "track", "mousemove", "selectionchange"];
function log(on, event) {
	for (let subject of DONTLOG) {
		if (event.subject == subject) return;
	}
	console.debug(event.subject + " " + on.nodeName + " " + on.className);
}