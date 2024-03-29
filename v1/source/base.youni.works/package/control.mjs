export default {
	type$: "/system/core",
	Receiver: {
		receive(signal) {
			if (!signal) return;
			let msg = signal;
			if (typeof msg != "object") {
				msg = Object.create(null);
				msg.subject = signal;
			}
			let subject = msg.subject;
			while (subject) {
				try {
					let action = this.getReaction(msg);
					action && action.call(this, msg);
					subject = (subject != msg.subject ? msg.subject : "");	
				} catch (error) {
					console.error(error);
					//Stop all propagation - esp. important is the enclosing while loop
					subject = "";
				}
			}
		},
		getReaction(message) {
			let actions = this.actions || this.controller;
			return actions && actions[message.subject];
		}
	},
	Sender: {
		type$to: "Iterable",
		send(signal) {
			if (!signal) return;
			let message = signal;
			if (typeof message != "object") {
				message = Object.create(null);
				message.subject = signal;
			}

			this.receive(message);
			if (!message.subject) return;

			Promise.resolve(message).then(message => to(this, message));

			function to(sender, message) {
				if (sender.to) for (let receiver of sender.to) {
					message.from = sender;
					receiver.receive(message);
					if (!message.subject) return;
					to(receiver, message);
				}
			}
		}
	},
	Sensor: {
		type$from: "Iterable",
		sense(signal) {
			if (!signal) return;
			let event = signal;
			if (typeof event != "object") {
				event = Object.create(null);
				event.subject = signal;
			}

			this.receive(event);
			if (event.subject) {
				from(this, event);
			}

			function from(sensor, message) {
				if (sensor.from) for (let receiver of sensor.from) {
					if (!message.subject) return;
					message.sensor = sensor;
					receiver.receive(message);
					from(receiver, message);
				}
			}
		},
	},
	Startable: {
		extend$conf: {
		},
		start(conf) {
			if (conf) this.let("conf", conf, "extend");
		},
	},
	Publisher: {
		//io: socket.io.Server
        publish(/* (subject [, data] | event) */) {
            if (!this.io) {
                console.error("No socket");
            }
            let event = arguments[0];
            //agruments can be a string, string/object, or an event with a subject.
            let subject = event && typeof event == "object" ? event.subject : event;
            if (!subject) {
                console.error("No subject.", arguments);
            }
            if (arguments.length > 1) {
                event = arguments[1];
            }
            this.io.emit(subject, event);
        }
    },
	Observer: {
		observe(object) {
			const OBSERVERS = Symbol.for("observers");
			if (typeof object != "object" || object == null) return; //Only observe objects.
			let observers = object[OBSERVERS];
			if (observers) {
				for (let observer of observers) {
					if (observer == this) return; //Already observing
				}
			} else {
				observers = [];
				object[OBSERVERS] = observers;
			}
			observers.push(this);
		},
		unobserve(control, object) {
			const OBSERVERS = Symbol.for("observers");
			let list = object ? object[OBSERVERS] : null;
			if (list) for (let i = 0, len = list.length; i < len; i++) {
				if (this == list[i]) {
					list.splice(i, 1);
					break;
				}
			}
		}
	},
	Notifier: {
		notify(on, signal) {
			if (typeof signal == "string") signal = {
				subject: signal
			}
			let model = signal.model || on.model;
			let observers = model && model[Symbol.for("observers")];
			if (!observers) return;
			signal = this.prepareSignal(signal);
			for (let ctl of observers) {
				//Set the following for each iteration in case of a bad behaving control.
				signal.source = on;
				signal.model = model;
				ctl.receive(signal);
			}
		}
	}
}