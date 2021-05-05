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
				TRACK = event;
			}
		},
		mousemove: function(event) {
			UP(event);
			if (TRACK) {
				event.subject = "track";
				event.track = TRACK.track;
				event.moveX = event.x - TRACK.x;
				event.moveY = event.y - TRACK.y;
				event.track.owner.send(event.track, event);
				TRACK = event;
				return;
			}
		},
		mouseup: function(event) {
			UP(event);
			if (TRACK) {
				event.subject = "trackEnd"
				event.track = TRACK.track;
				event.moveX = 0;
				event.moveY = 0;
				TRACK.track.owner.send(TRACK.track, event);
				TRACK = null;
			}
		},
		click: UP,
		dragstart: UP,
		dragover: UP,
		drop: UP,
//		mouseover: UP,
//		mouseout: UP,
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
//		resize: DOWN
	},
//	documentEvents: {
//		selectionstart: SELECTION_EVENT,
//		selectionchange: SELECTION_EVENT
//	}
}

function SELECTION_EVENT(event) {
	event.range = event.target.owner.selectionRange;
	event.target.owner.actions.sense(event.range.commonAncestorContainer, event);
}

function prepareSignal(signal) {
	if (typeof signal != "object") {
		signal = {
			subject: signal
		};
	}
	signal.stopPropagation && signal.stopPropagation();
	if (!signal.subject) signal.subject = signal.type;
	return signal;
}

function UP(event) {
	event = prepareSignal(event);
	log(event.target, event);
	for (let on of event.path) {
		if (!event.subject) return;
		on.$peer && on.$peer.receive(event);
	}
	if (!event.subject) event.preventDefault();
}


const DONTLOG = ["receive", "track", "mousemove", "selectionchange"];
function log(on, event) {
	for (let subject of DONTLOG) {
		if (event.subject == subject) return;
	}
	console.debug(event.subject + " " + on.nodeName + " " + on.className);
}