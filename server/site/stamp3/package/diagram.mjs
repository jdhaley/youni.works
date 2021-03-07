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
let TRACK;
export default {
	package$: "youni.works/diagram",
	use: {
		package$app: "youni.works/app"
	},
	MoveCommand: {
		super$: "Object",
		title: "Move Shape",
		model: null,
		before: null,
		after: null,
		exec: function() {
			model.x = after.x;
			model.y = after.y;
		},
		undo: function() {
			model.x = before.x;
			model.y = before.y;
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
				on.classList.add("diagram");
				for (let model of on.model.shapes) {
					let shape = on.owner.create(model, on.of.shape);
					on.append(shape);			
				}
			},
		}
	},
	Shape: {
		super$: "use.app.View",
		border: 6,
		type$defaultContent: "Text",
		bind: function(view, data) {
			view.owner.app.observe(view, data);
			view.model = data;
		},
		extend$actions: {
			view: function(on, event) {
				on.textContent = "";
				on.classList.add("shape");
				this.position(on, event);
				this.viewContent(on, event);
			},
			position: function(on, event) {
				on.style.width = (on.model.width || on.of.border * 3) + "px";
				on.style.height = (on.model.height || on.of.border * 3) + "px";
				on.style.top = on.model.y + "px";
				on.style.left = on.model.x + "px";
			},
			viewContent: function(on, event) {
				switch (typeof on.model.content) {
					case "string":
					case "number":
						let content = on.owner.create(on.model.content, on.of.defaultContent);
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
				let diag = on.parentNode.getBoundingClientRect();
				on.model.x = event.clientX - TRACK.shapeX - diag.x + on.parentNode.scrollLeft;
				on.model.y = event.clientY - TRACK.shapeY - diag.y + on.parentNode.scrollTop;
				this.notify(on, "position");
			},
			size: function(on, event) {
				let diag = on.parentNode.getBoundingClientRect();
				let diagX = event.clientX - diag.x + on.parentNode.scrollLeft;
				let diagY = event.clientY - diag.y + on.parentNode.scrollTop;

				let x = diagX - TRACK.shapeX;
				let y = diagY - TRACK.shapeY;
				
				let shape = on.getBoundingClientRect();

				let shapeX = shape.x - diag.x;
				let shapeY = shape.y - diag.y;
				
				let width;
				let height;
				switch (TRACK.horiz) {
					case "R":
						width = diagX - shapeX;
						if (width < on.of.border * 3) width = on.of.border * 3;
						on.style.width = width + "px";
						break;
					case "L":
						on.style.width = TRACK.rect.right - event.clientX - TRACK.shapeX + "px"
						on.style.left =  x + "px";
						break;
				}
				switch (TRACK.vert) {
					case "T":
						on.style.height = TRACK.rect.bottom - event.clientY - TRACK.shapeY + "px"
						on.style.top =  y + "px";
						break;
					case "B":
						height = diagY - shapeY;
						if (height < on.of.border * 3) height = on.of.border * 3;
						on.style.height = height + "px";
						break;
				}
				
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
			},
			mousedown: function(on, event) {
				if (on.owner.activeElement.parentNode == on) return;
				if (on.owner.activeElement) on.owner.activeElement.blur();
				setZone(on, event);
				on.style.cursor = zoneCursor[event.vert + event.horiz];
				event.track = on;
				event.rect = on.getBoundingClientRect();
				event.shapeX = event.clientX - event.rect.x;
				event.shapeY = event.clientY - event.rect.y;
				TRACK = event;
			},
			mouseup: function(on, event) {
				if (TRACK && !TRACK.moved) on.firstChild.focus();
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
	let border = on.of.border;
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

function getPoint(offset, length) {
	for (let i = 1; i < 4; i++) {
		let p = length / 4 * i;
		if (offset >= p - 2.5 && offset <= p + 2.5) return i;
	}
	return 0;
}
