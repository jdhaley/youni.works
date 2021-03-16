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
				event.topic = "track";
				event.trackX = event.clientX - TRACK.clientX;
				event.trackY = event.clientY - TRACK.clientY;
				TRACK.track.actions.send(TRACK.track, event);
				return;
			}
		},
		mouseup: function(event) {
			UP(event);
			if (TRACK) {
				event.topic = "trackEnd"
				event.trackX = event.clientX - TRACK.clientX;
				event.trackY = event.clientY - TRACK.clientY;
				TRACK.track.actions.send(TRACK.track, event);
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
			topic: signal
		};
	}
	signal.stopPropagation && signal.stopPropagation();
	if (!signal.topic) signal.topic = signal.type;
	return signal;
}

function UP(event) {
	event = prepareSignal(event);
	log(event.target, event);
	for (let on of event.path) {
		if (!event.topic) return;
		on.$ctl && on.$ctl.receive(event);
	}
	if (!event.topic) event.preventDefault();
}


const DONTLOG = ["receive", "track", "mousemove", "selectionchange"];
function log(on, event) {
	for (let topic of DONTLOG) {
		if (event.topic == topic) return;
	}
	console.debug(event.topic + " " + on.nodeName + " " + on.className);
}