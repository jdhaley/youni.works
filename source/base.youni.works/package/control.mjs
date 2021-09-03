export default {
	type$: "/system/core",
	Receiver: {
		type$: "Instance",
		start(conf) {
		},
		receive(signal) {
			if (!signal) return;
			let msg = signal;
			if (typeof msg != "object") {
				msg = Object.create(null);
				msg.subject = signal;
			}
			let subject = msg.subject;
			while (subject) {
				let action = this.actions[subject];
				try {
					action && action.call(this, msg);
					subject = (subject != msg.subject ? msg.subject : "");	
				} catch (error) {
					console.error(error);
//					subject = "";
				}
			}
		},
		extend$actions: {
		}
	},
	Sensor: {
		type$from: "Iterable",
		sense(signal) {
			if (!signal) return;
			let message = signal;
			if (typeof message != "object") {
				message = Object.create(null);
				message.subject = signal;
			}
			
			this.receive(message);
			//Promise.resolve(message).then(message => from(this, message));
			from(this, message);

			function from(receiver, message) {
				if (receiver.from) for (receiver of receiver.from) {
					message.subject && receiver.receive(message);
					message.subject && from(receiver, message);
					if (!message.subject) return;
				}
			}
		},
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
			Promise.resolve(message).then(message => to(this, message));

			function to(receiver, message) {
				if (receiver.to) for (receiver of receiver.to) {
					message.subject && receiver.receive(message);
					message.subject && to(receiver, message);
					if (!message.subject) return;
				}
			}
		}
	},
	Controller: {
		type$: ["Receiver", "Sender", "Sensor"]
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