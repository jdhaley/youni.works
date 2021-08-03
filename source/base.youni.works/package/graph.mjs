export default {
	type$: "/control",
	Graph: {
		type$: ["Component", "Sender"],
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
		notify(on, signal) {
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
		},
		prepareSignal(signal) {
			if (typeof signal != "object") return {
				subject: signal
			}
			return signal;
		},
		log(on, event) {
			// const DONTLOG = ["receive", "track", "mousemove", "selectionchange"];
			// for (let subject of DONTLOG) {
			// 	if (event.subject == subject) return;
			// }
			// console.debug(event.subject + " " + on.nodeName + " " + on.className);
		}
	},
	Node: {
		type$: ["Instance", "Receiver"],
		type$owner: "Graph",
		type$to: "Array",	//The arcs. Each arc should be a Node.
		append(component) {
			Array.prototype.push.call(this.to, component);
		},
		forEach(data, method) {
			if (data && data[Symbol.iterator]) {
				let i = 0;
				for (let datum of data) {
					method.call(this, datum, i++, data);
				}
			} else {
				for (let name in data) {
					method.call(this, data[name], name, data);
				}
			}
		}
	}
}