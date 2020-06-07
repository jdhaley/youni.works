export default {
	event: function(control, signal) {
		control.view.addEventListener(signal.toLowerCase(), event => {
			event.action = signal;
			control.owner.sense(event.target.control, event);
			if (!event.signal) event.preventDefault();
		});
	},
	//Propagate from the selection container rather than the event target:
	selection: function(control, signal) {
		const owner = control.owner;
		control.addEventListener(signal.toLowerCase(), event => {
			event.action = signal;
			control.owner.sense(control.owner.selection.container.control, event);
			if (!event.signal) event.preventDefault();
		});
	}
}
