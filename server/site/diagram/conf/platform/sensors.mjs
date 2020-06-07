export default {
	event: function(control, signal) {
		control.view.addEventListener(signal.toLowerCase(), event => {
			event.action = signal;
			control.owner.transmit.up(event.target, event);
			if (!event.signal) event.preventDefault();
		});
	},
	//Propagate from the selection container rather than the event target:
	selection: function(target, signal) {
		const owner = target.owner;
		target.addEventListener(signal.toLowerCase(), event => {
			event[Symbol.Signal] = "Event";
			event.action = signal;
			event.owner = owner;
			event.source = owner.selection.container
			owner.transmit.up(event);
			if (!event.signal) event.preventDefault();
		});
	}
}
