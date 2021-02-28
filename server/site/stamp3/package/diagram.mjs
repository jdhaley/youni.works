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
			}
		}
	},
	Shape: {
		super$: "use.app.View",
		border: 5,
		bind: function(view, data) {
			view.model = data;
		},
		extend$actions: {
			view: function(on, event) {
				let rect = on.model;
				on.classList.add("shape");
				on.style.width = rect.width + "px";
				on.style.height = rect.height + "px";
				on.style.top = rect.y + "px";
				on.style.left = rect.x + "px";
				on.innerHTML = "<div>" + on.model.content + "</div>";
			//	on.firstChild.contentEditable = true;
			},
			click: function(on, event) {
				console.log("text click");
			},
			tracking: function(on, event) {
				let diag = on.parentNode.getBoundingClientRect();
				let diagX = event.clientX - diag.left;
				let diagY = event.clientY - diag.top;

				let top = diagY - TRACK.shapeY;
				let left = diagX - TRACK.shapeX;
				
				let shape = on.getBoundingClientRect();

				let shapeX = shape.left - diag.left;
				let shapeY = shape.top - diag.top;
				switch (TRACK.horiz) {
					case "R":
						on.style.width = diagX - shapeX + "px";
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
						on.style.height = diagY - shapeY + "px";
						break;
				}
				if (TRACK.vert + TRACK.horiz == "CC") {
					on.style.top =  top + "px";
					on.style.left =  left + "px";
				}
			},
			mousemove: function(on, event) {
				setZone(on, event);
				if (TRACK) TRACK.moved = true;
				on.style.cursor = EDIT ? "text" : zoneCursor[event.vert + event.horiz];
			},
			mousedown: function(on, event) {
				if (on == EDIT) return;
				EDIT = null;
				setZone(on, event);
				event.track = on;
				event.rect = on.getBoundingClientRect();
				event.shapeX = event.clientX - event.rect.left;
				event.shapeY = event.clientY - event.rect.top;
				TRACK = event;
			},
			mouseup: function(on, event) {
				if (TRACK && TRACK.moved) return;
				on.contentEditable = true;
				on.firstChild.focus();
				on.style.cursor = "default";
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
