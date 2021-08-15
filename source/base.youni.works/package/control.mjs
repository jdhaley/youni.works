export default {
	type$: "/system/core",
	Iterable: {
		symbol$iterator: function *iterator() {
		}
	},
	Receiver: {
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
				action && action.call(this, msg);
				subject = (subject != msg.subject ? msg.subject : "");
			}
		},
		extend$actions: {
		}
	},
	Control: {
		type$from: "Iterable",
		type$to: "Iterable",
		// get$for() {
		// 	return this
		// },
		send(signal) {
			if (!signal) return;
			let message = signal;
			if (typeof message != "object") {
				message = Object.create(null);
				message.subject = signal;
			}
			Promise.resolve(message).then(message => to(this, message));

			function to(receiver, message) {
				if (receiver.to) for (receiver of receiver.to) {
					message.subject && receiver.receive(messsage);
					message.subject && to(receiver, message);
					if (!message.subject) return;
				}
			}
		},
		sense(signal) {
			if (!signal) return;
			let message = signal;
			if (typeof message != "object") {
				message = Object.create(null);
				message.subject = signal;
			}
			Promise.resolve(message).then(message => from(this, message));

			function from(receiver, message) {
				if (receiver.from) for (receiver of receiver.from) {
					message.subject && receiver.receive(messsage);
					message.subject && from(receiver, message);
					if (!message.subject) return;
				}
			}
		}
	},
	Sender: {
		send(to, message) {
			if (!message) return;
			if (typeof message == "string") message = {
				subject: message
			}
			
			Promise.resolve(message).then(message => down(to, message));

			function down(on, message) {
				if (!message.subject) return;
				on.receive(message);
				if (on.to) for (on of on.to) {
					down(on, message);
				}
			}
		}
	},
	Sensor: {
		sense(on, event) {
			if (on.owner != this) console.warn("sensing on a node not owned by this.");
			event = this.prepareSignal(event);
			this.log(on, event);
			//can't use event.path - it is chrome-specific.
			while (on) {
				if (!event.subject) return;
				on.receive(event);
				on = on.of;
			}
		},
	},
	Publisher: {
		//io: socket.io.Server
        publish(/* (subject | event) [, data]*/) {
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
	}
}