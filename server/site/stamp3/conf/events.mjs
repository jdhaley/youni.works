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
				console.log("track");
			}
		},
		mouseup: function(event) {
			UP(event);
			if (TRACK) console.log("untrack");
			TRACK = null;
		},
		mousemove: function(event) {
			UP(event);
			if (TRACK) {
				event.topic = "tracking";
				event.target.owner.app.send(TRACK, event);
			}
		},
		mouseleave: function(event) {
			UP(event);
			if (TRACK) console.log("untrack-leave");
			TRACK = null;
		},
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
	let selection = event.target.defaultView.getSelection();
	if (selection && selection.rangeCount) {
		console.log(event.type);
		event.topic = event.type;
		event.range = selection.getRangeAt(0);
		let node = event.range.commonAncestorContainer;
		node.owner.app.sense(node, event);
	}
}
function UP(event) {
	if (event.type != "mousemove") {
//		if (event.target.nodeName == "HTML") 
//			console.log(event.target);
		console.log(event.type + " " + event.target.nodeName);
		if (event.target.nodeName == undefined) console.log(event.target);
	}
	event.topic = event.type;
	event.target.owner.app.sense(event.target, event);
}

function DOWN(event) {
	console.log(event.type);
	event.topic = event.type;
	event.target.owner.app.send(event.target, event);
}