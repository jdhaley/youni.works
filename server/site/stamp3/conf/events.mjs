let TRACK = null;
export default {
	windowEvents: {
		select: UP, //may not exist
		change: UP, //may not exist
		
		input: UP,
		cut: UP,
		copy: UP,
		paste: UP,

		keydown: UP,
		mousedown: function(event) {
			UP(event);
			if (event.track) {
				event.preventDefault();
				TRACK = event.track;
			}
		},
		mouseup: function(event) {
			UP(event);
			TRACK = null;
		},
		mousemove: function(event) {
			UP(event);
			if (TRACK) {
				event.topic = "tracking";
				event.target.owner.actions.send(TRACK, event);
			}
		},
//		mouseleave: function(event) {
//			UP(event);
//			if (TRACK) console.log("untrack-leave");
//			TRACK = null;
//		},
		click: UP,
		dragstart: UP,
		dragover: UP,
		drop: UP,
		focusin: UP,
		focusout: UP,
		focus: UP,
		blur: UP,
		contextmenu: function(event) {
			if (event.ctrlKey) {
				event.preventDefault();
				UP(event);
			}
		},
		resize: DOWN
	},
	documentEvents: {
		selectionstart: SELECTION_EVENT,
		selectionchange: SELECTION_EVENT
	}
}

function SELECTION_EVENT(event) {
	event.range = event.target.owner.selectionRange;
	event.target.owner.actions.sense(event.range.commonAncestorContainer, event);
}

function UP(event) {
	event.target.owner.actions.sense(event.target, event);
}

function DOWN(event) {
	event.target.owner.actions.send(event.target, event);
}