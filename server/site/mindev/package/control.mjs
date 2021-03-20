export default {
	package$: "youni.works/control",
	package$util: "youni.works/util",
	Control: {
		super$: "Object",
		to: Object.freeze([]),
		start: function() {
		},
		//Re-think unobserve.
		observe: function(object) {
			observe(this, object);
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
			notify: notify
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

Symbol.observers = Symbol("observers");

function notify(control, signal) {
	let observers = control.model && control.model[Symbol.observers];
	if (!observers) return;
	signal = prepareSignal(signal);
	for (let on of observers) {
		//Set the following for each iteration in case of a bad behaving control.
		signal.source = control;
		signal.model = control.model;
		on.receive(signal);			
	}
}

function unobserve(control, model) {
	let list = model ? model[Symbol.observers] : null;
	if (list) for (let i = 0, len = list.length; i < len; i++) {
		if (control == list[i]) {
			list.splice(i, 1);
			break;
		}
	}
	//Caller is now responsible to:
	//delete control.model or re-assign, etc.
}

function observe(control, model) {
	if (typeof model != "object" || model == null) return; //Only observe objects.
	let observers = model[Symbol.observers];
	if (observers) {
		for (let observer of observers) {
			if (observer == control) return; //Already observing
		}					
	} else {
		observers = [];
		model[Symbol.observers] = observers;
	}
	observers.push(control);
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