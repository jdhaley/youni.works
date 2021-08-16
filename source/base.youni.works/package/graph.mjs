export default {
	type$: "/control",
	Graph: {
		type$: "Component",
		// send(to, signal) {
		// 	console.log("send");
		// 	if (typeof signal == "string") signal = {
		// 		subject: signal
		// 	}
		// //	to.receive(signal);
		// 	to.send(signal);
		// },
		// sense(from, signal) {
		// 	console.log("sense");
		// 	if (typeof signal == "string") signal = {
		// 		subject: signal
		// 	}
		// //	from.receive(signal);
		// 	from.sense(signal);
		// },
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
		},
	},
	Node: {
		type$: "Control",
		type$owner: "Graph",
		type$to: "Array",
		append(node) {
			Array.prototype.push.call(this.to, node);
		}
	}
}