export default {
	type$: "/system/core",
	Receiver: {
		start(conf) {
		},
		receive(signal) {
			let action = this.actions[typeof signal == "string" ? signal : signal.subject];
			action && action.call(this, signal);
		},
		extend$actions: {
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