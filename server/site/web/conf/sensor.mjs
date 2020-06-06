export default {
	event: function(target, action) {
		const owner = target.owner;
		target.addEventListener(action.toLowerCase(), event => {
			event[Symbol.Signal] = "Event";
			event.action = action;
			event.owner = owner;
			event.source = event.target;
			owner.transmit.up(event);
			if (!event.action) event.preventDefault();
		});
	},
	//Propagate from the selection container rather than the event target:
	selection: function(target, action) {
		const owner = target.owner;
		target.addEventListener(action.toLowerCase(), event => {
			event[Symbol.Signal] = "Event";
			event.action = action;
			event.owner = owner;
			event.source = owner.selection.container
			owner.transmit.up(event);
			if (!event.action) event.preventDefault();
		});
	}
}
