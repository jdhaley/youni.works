export default {
	event: function(target, signal) {
		target.addEventListener(signal.toLowerCase(), event => {
			event.action = signal;
			target.owner.transmit.up(event.target, event);
			if (!event.signal) event.preventDefault();
		});
	},
	//Propagate from the selection container rather than the event target:
	selection: function(target, signal) {
		target.addEventListener(signal.toLowerCase(), event => {
			event.action = signal;
			target.owner.transmit.up(target.owner.selection.container, event);
			if (!event.signal) event.preventDefault();
		});
	}
}