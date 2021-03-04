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
let EDIT;
export default {
	package$: "youni.works/diagram",
	use: {
		package$app: "youni.works/app"
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
			mousedown: function(on, event) {
				if (on == event.target && EDIT) {
					EDIT.blur();
					EDIT.contentEditable = false;
					EDIT.style.overflow = "hidden";
					EDIT.style.cursor = "";
					EDIT = null;
				}
			}
		}
	},
	Shape: {
		super$: "use.app.View",
		border: 5,
		type$defaultContent: "Text",
		bind: function(view, data) {
			view.model = data;
		},
		extend$actions: {
			view: function(on, event) {
				on.classList.add("shape");
				on.style.width = (on.model.width || on.of.border * 3) + "px";
				on.style.height = (on.model.height || on.of.border * 3) + "px";
				on.style.top = on.model.y + "px";
				on.style.left = on.model.x + "px";
				on.style.overflow = "hidden";
				this.viewContent(on, event);
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
			tracking: function(on, event) {
				if (EDIT) return;
				TRACK.moved = true;
				if (TRACK.vert == "C" && TRACK.horiz == "C") {
					this.move(on, event);
				} else {
					this.size(on, event);
				}
			},
			move: function(on, event) {
				let diag = on.parentNode.getBoundingClientRect();
				let diagX = event.clientX - diag.left + on.parentNode.scrollLeft;
				let diagY = event.clientY - diag.top + on.parentNode.scrollTop;

				let top = diagY - TRACK.shapeY;
				let left = diagX - TRACK.shapeX;
				
				on.style.top = top + "px";
				on.style.left = left + "px";
			},
			size: function(on, event) {
				let diag = on.parentNode.getBoundingClientRect();
				let diagX = event.clientX - diag.left + on.parentNode.scrollLeft;
				let diagY = event.clientY - diag.top + on.parentNode.scrollTop;

				let top = diagY - TRACK.shapeY;
				let left = diagX - TRACK.shapeX;
				
				let shape = on.getBoundingClientRect();

				let shapeX = shape.left - diag.left;
				let shapeY = shape.top - diag.top;
				
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
						on.style.left =  left + "px";
						break;
				}
				switch (TRACK.vert) {
					case "T":
						on.style.height = TRACK.rect.bottom - event.clientY - TRACK.shapeY + "px"
						on.style.top =  top + "px";
						break;
					case "B":
						height = diagY - shapeY;
						if (height < on.of.border * 3) height = on.of.border * 3;
						on.style.height = height + "px";
						break;
				}
				
			},
			mousemove: function(on, event) {
				if (EDIT) return;
				setZone(on, event);
				if (event.altKey) {
					if (event.vert == "C" && event.horiz == "C") {
						on.style.cursor = "text";
					} else {
						on.style.cursor = "crosshair";
					}
					return;
				}
				on.style.cursor = zoneCursor[event.vert + event.horiz];
			},
			mousedown: function(on, event) {
				if (EDIT) return;
				setZone(on, event);
				on.style.cursor = zoneCursor[event.vert + event.horiz];
				event.track = on;
				event.rect = on.getBoundingClientRect();
				event.shapeX = event.clientX - event.rect.left;
				event.shapeY = event.clientY - event.rect.top;
				TRACK = event;
			},
			mouseup: function(on, event) {
//				if (TRACK && TRACK.moved) return;
				TRACK = null;
//				EDIT = on;
//				on.focus();
//				on.style.cursor = "text";
//				on.style.overflow = "auto";
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
				on.classList.add("shape-text");
				on.textContent = "";
				on.textContent = "" + on.model;
			},
			mouseup: function(on, event) {
				if (EDIT || TRACK && TRACK.moved) return;

				on.contentEditable = true;
				on.style.overflow = "auto";
				on.style.cursor = "text";
				on.focus();
				EDIT = on;
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
