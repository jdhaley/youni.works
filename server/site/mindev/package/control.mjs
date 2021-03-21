Symbol.observers = Symbol("observers");

export default {
	package$: "youni.works/control",
	package$util: "youni.works/util",
	Control: {
		super$: "Object",
		to: Object.freeze([]),
		start: function() {
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
				let observers = on.model && on.model[Symbol.observers];
				if (!observers) return;
				signal = prepareSignal(signal);
				for (let ctl of observers) {
					//Set the following for each iteration in case of a bad behaving control.
					signal.source = on;
					signal.model = on.model;
					ctl.receive(signal);
				}
			}
		}
	},
	Owner: {
		super$: "Control",
		components: {
		},
		forName: function(name) {
			return name && name.indexOf("/") < 0 ? this.components[name] : this.sys.forName(name);
		},
		create: function(type) {
			if (typeof type != "object") type = this.forName(type);
			let control = this.sys.extend(type, {
				owner: this
			});
			control.start();
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