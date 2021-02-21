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
	package$: "youni.works/shape",
	use: {
		package$base: "youni.works/base",
		package$view: "youni.works/view"
	},
	Diagram: {
		super$: "use.view.Viewer",
		type$shape: "Shape",
		bind: function(view, data) {
			view.model = data;
		},
		extend$actions: {
			display: function(on, event) {
				on.classList.add("diagram");
				for (let model of on.model.shapes) {
					let shape = on.of.shape.create(on.owner, model);
					on.append(shape);			
				}
			},
			mousedown: function(on, event) {
				if (event.track) {
					event.preventDefault();
					on.$track = event.track;
					console.log("d-track");
				}
			},
			mouseup: function(on, event) {
				if (on.$track) console.log("d-untrack");
				TRACK = null;
			},
			mousemove: function(on, event) {
				if (on.$track) {
					event.topic = "d-tracking";
					on.owner.app.send(on.$track, event);
				}
			},
			mouseleave: function(on, event) {
				if (on.$track) console.log("d-leave");
				delete on.$track;
			}
		}
	},
	Shape: {
		super$: "use.view.Viewer",
		bind: function(view, data) {
			view.model = data;
		},
		extend$actions: {
			display: function(on, event) {
				position(on, on.model);
				on.classList.add("shape");
				on.innerHTML = "<div>" + on.model.content + "</div>";
				
			//	
//				let viewer = frame.app.createController(conf);
//				let view = viewer.create(frame);
//				view.textContent = "This is a Window";
//				let body = frame.createNode("div");
//				body.textContent = "Hello";
//				view.append(body);
//				diagram.append(view);
//				view.classList.add("shape");
//				viewer.actions.display(view);

			},
			tracking: function(on, event) {
				let rect = on.getBoundingClientRect(on);
				if (on.$zone == "CC") {
					let diag = on.parentNode.getBoundingClientRect();
					let top = event.clientY - diag.top - on.$y;
					top -= top % 5;
					if (top < 0) top = 0;
					let left = event.clientX - diag.left - on.$x;
					left -= left % 5;
					if (left < 0) left = 0;
					on.style.top =  top + "px";
					on.style.left =  left + "px";					
				} else if (on.$zone == "TC") {
					on.style.top = event.clientY + "px";
				}
			},
			mousemove: function(on, event) {
				setZone(on, event);
				on.style.cursor = zoneCursor[event.zone];
			},
			mousedown: function(on, event) {
				setZone(on, event);
			//	if (on == event.target) {
					event.track = on;
					on.$zone = event.zone;
					let rect = on.getBoundingClientRect();
					on.$x = event.clientX - rect.left;
					on.$y = event.clientY - rect.top;
			//	}
			}
		}
	},
	Connector: {
		super$: "use.view.Viewer"
	}
}

function position(on, rect) {
	on.style.width = rect.width + "px";
	on.style.height = rect.height + "px";
	on.style.top = rect.y + "px";
	on.style.left = rect.x + "px";
}

function setZone(on, event) {
	let border = 5;
	let viewportX = event.clientX;
	let viewportY = event.clientY;
	let rect = on.getBoundingClientRect();
	let x = event.clientX - rect.x;
	let y = event.clientY - rect.y;

	if (y < border) {
		event.zone = "T";
	} else if (y > rect.height - border) {
		event.zone = "B";
	} else {
		event.zone = "C";
	}
	
	if (x < border) {
		event.zone += "L"
	} else if (x > rect.width - border) {
		event.zone += "R"
	} else {
		event.zone += "C"
	}
}

function getPoint(offset, length) {
	for (let i = 1; i < 4; i++) {
		let p = length / 4 * i;
		if (offset >= p - 2.5 && offset <= p + 2.5) return i;
	}
	return 0;
}
