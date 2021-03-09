const zoneCursor = {
	TL: "nw-resize",
	TC: "n-resize",
	TR: "ne-resize",
	CL: "w-resize",
	CC: "move",
	CR: "e-resize",
	BL: "sw-resize",
	BC: "s-resize",
	BR: "se-resize"
}
//moved, vert, horiz, before
let TRACK;
export default {
	package$: "youni.works/diagram",
	use: {
		package$app: "youni.works/app"
	},
	ShapeCommand: {
		super$: "Object",
		title: "Move/Size Shape",
		model: null,
		before: null,
		after: null,
		exec: function() {
			model.x = after.x;
			model.y = after.y;
			model.width = after.width;
			model.height = after.height;
		},
		undo: function() {
			model.x = before.x;
			model.y = before.y;
			model.width = before.width;
			model.height = before.height;
		}
	},
	Diagram: {
		super$: "use.app.View",
		type$shape: "Shape",
		bind: function(view, data) {
			view.model = data;
		},
		extend$actions: {
			view: function(on, event) {
				on.textContent = "";
				on.classList.add("diagram");
				for (let model of on.model.shapes) {
					let shape = on.owner.create(model, on.kind.shape);
					on.append(shape);			
				}
			},
		}
	},
	Shape: {
		super$: "use.app.View",
		use: {
			type$ShapeCommand: "ShapeCommand"
		},
		border: 6,
		minWidth: 48,
		minHeight: 24,
		type$defaultContent: "Text",
		bind: function(view, data) {
			view.owner.app.observe(view, data);
			view.model = data;
		},
		extend$actions: {
			view: function(on, event) {
				on.textContent = "";
				on.classList.add("shape");
				this.draw(on, event);
				this.viewContent(on, event);
			},
			draw: function(on, event) {
				on.style.width = (on.model.width || on.kind.border * 3) + "px";
				on.style.height = (on.model.height || on.kind.border * 3) + "px";
				on.style.top = on.model.y + "px";
				on.style.left = on.model.x + "px";
			},
			viewContent: function(on, event) {
				switch (typeof on.model.content) {
					case "string":
					case "number":
						let content = on.owner.create(on.model.content, on.kind.defaultContent);
						on.append(content);
						break;
					case "boolean":
					case "undefined":
					case "function":
					case "symbol":
					case "bigint":
					case "object":
					default:
						on.textContent = "";
						on.textContent = on.model.content;
						break;
				}
			},
			move: function(on, event) {
				let model = on.model;
				let val = TRACK.before.x + event.trackX;
				model.x = val < 0 ? 0 : val;
				val = TRACK.before.y + event.trackY;
				model.y = val < 0 ? 0 : val;
				this.notify(on, "draw");
			},
			size: function(on, event) {
				setWidth(on, event);
				let model = on.model;
				let val;
				switch (TRACK.horiz) {
					case "L":
						if (TRACK.before.width - event.trackX < on.kind.minWidth) break;
						
						val = TRACK.before.x + event.trackX;
						if (val < 0) val = 0;
						model.x = val;
						val = TRACK.before.width - event.trackX;
						if (val < on.kind.minWidth) val = on.kind.minWidth;
						model.width = val;
						break;
					case "R":
						val = TRACK.before.width + event.trackX;
						if (val < on.kind.minWidth) val = on.kind.minWidth;
						model.width = val;
						break;
				}
				switch (TRACK.vert) {
					case "T":
						if (TRACK.before.height - event.trackY < on.kind.minHeight) break;
						val = TRACK.before.y + event.trackY;
						if (val < 0) val = 0;
						model.y = val;
						if (!val) break;
						val = TRACK.before.height - event.trackY;
						if (val < on.kind.minHeight) val = on.kind.minHeight;
						model.height = val;
						break;
					case "B":
						val = TRACK.before.height + event.trackY;
						if (val < on.kind.minHeight) val = on.kind.minHeight;
						model.height = val;
						break;
				}
				this.notify(on, "draw");
				
			},
			connect: function(on, event) {
			},
			tracking: function(on, event) {
				if (on.owner.activeElement.parentNode == on) return;
				on.owner.activeElement.blur();
				TRACK.moved = true;
				if (TRACK.vert == "C" && TRACK.horiz == "C") {
					this.move(on, event);
				} else if (event.altKey) {
					this.connect(on, event);
				} else {
					this.size(on, event);
				}
			},
			mousemove: function(on, event) {
				//Don't alter the cursor when a textShape has the focus.
				if (on.owner.activeElement.parentNode == on) return;
				setZone(on, event);
				if (event.altKey) {
					if (event.vert == "C" && event.horiz == "C") {
						on.style.cursor = "move";
					} else {
						on.style.cursor = "crosshair";
					}
					return;
				}
				on.style.cursor = zoneCursor[event.vert + event.horiz];
				on.style.outline = "3px solid rgba(64, 128, 64, .3)";				
			},
			mouseover: function(on, event) {
				on.style.outline = "3px solid rgba(64, 128, 64, .3)";				
			},
			mouseout: function(on, event) {
				if (on != TRACK) on.style.outline = "";
			},
			mousedown: function(on, event) {
				if (on.owner.activeElement.parentNode == on) return;
				if (on.owner.activeElement) on.owner.activeElement.blur();
				setZone(on, event);
				on.style.outline = "3px solid rgba(64, 128, 64, .3)";
				on.style.zIndex = "1";
				on.style.cursor = zoneCursor[event.vert + event.horiz];
				event.track = on;
				event.before = {
					x: on.model.x,
					y: on.model.y,
					width: on.model.width || on.kind.minWidth,
					height: on.model.height || on.kind.minHeight
				}
				TRACK = event;
			},
			mouseup: function(on, event) {
				
				on.style.outline = "";
				on.style.zIndex = "0";
				if (TRACK && !TRACK.moved && on.firstChild) on.firstChild.focus();
				TRACK = null;
			},
			keydown: function(on, event) {
				if (event.key == "Escape") {
					if (on.owner.activeElement.parentNode == on) {
						event.topic = "";
						on.owner.activeElement.blur();						
					}
				}
				if (event.key == "s" && event.ctrlKey) {
					event.preventDefault();
					on.owner.app.save();
				}
			}

		}
	},
	Text: {
		super$: "use.app.View",
		bind: function(view, data) {
			view.model = data;
		},
		extend$actions: {
			view: function(on, event) {
				on.classList.add("text");
				on.textContent = "";
				on.innerHTML = "<p>" + on.model + "</p>";
				on.contentEditable = true;
			}
		}
	},
	Connector: {
		super$: "use.app.View"
	}
}

function setZone(on, event) {
	let border = on.kind.border;
	let rect = on.getBoundingClientRect();

	let horiz = event.clientX - rect.x;
	let vert = event.clientY - rect.y;

	event.vert = "C";
	if (vert < border) {
		event.vert = "T";
	} else if (vert > rect.height - border) {
		event.vert = "B";
	}
	
	event.horiz = "C"
	if (horiz < border) {
		event.horiz = "L"
	} else if (horiz > rect.width - border) {
		event.horiz = "R"
	}
}


function setWidth(on, event) {
	let model = on.model;
	let val;
	
	switch (TRACK.horiz) {
		case "L":
			let newWidth = TRACK.before.width - event.trackX;
			let newX = TRACK.before.x + event.trackX;
			if (newWidth < on.kind.minWidth || newX < 0) return;
			model.x = newX;
			model.width = newWidth;
			break;
		case "R":
			val = TRACK.before.width + event.trackX;
			if (val < on.kind.minWidth) val = on.kind.minWidth;
			model.width = val;
			break;
	}
}
function getPoint(offset, length) {
	for (let i = 1; i < 4; i++) {
		let p = length / 4 * i;
		if (offset >= p - 2.5 && offset <= p + 2.5) return i;
	}
	return 0;
}
