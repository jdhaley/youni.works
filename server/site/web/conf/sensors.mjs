export default {
	event: function(target, signal) {
		target.addEventListener(signal.toLowerCase(), function senseEvent(event) {
			event.action = signal;
			target.owner.transmit.up(event.target, event);
			if (!event.action) event.preventDefault();
		});
	},
	//Propagate from the selection container rather than the event target:
	selection: function(target, signal) {
		target.addEventListener(signal.toLowerCase(), function senseSelection(event) {
			event.action = signal;
			target.owner.transmit.up(target.owner.selection.container, event);
			if (!event.action) event.preventDefault();
		});
	}
}