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
let SHAPE = null;
let ZONE = "";

export default {
	package$: "youni.works/shape",
	use: {
		package$base: "youni.works/base",
		package$view: "youni.works/view"
	},
	Connector: {
	},
	Shape: {
		super$: "use.view.Viewer",
		extend$actions: {
			display: function(on, event) {
				position(on, on.conf);
			},
			mousemove: function(on, event) {
//				if (!SHAPE) {
					setZone(on, event);
					on.style.cursor = zoneCursor[event.zone];
//				}
			},
			mousedown: function(on, event) {
				setZone(on, event);
				SHAPE = this;
				ZONE = event.zone;
			}
		}
	}
}

function position(on, rect) {
	//on.draggable = true;
	//on.style.position = "absolute";
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
	
//	if (event.zone != "CC") {
//		let w = rect.width;
//		if (x > w / 4 - 2 && x < w / 4 + 2)
//	}
	
}
function getPoint(offset, length) {
	for (let i = 1; i < 4; i++) {
		let p = length / 4 * i;
		if (offset >= p - 2.5 && offset <= p + 2.5) return i;
	}
	return 0;
}
//Shaper: {
//super$: "Viewer",
//draw: function(view) {
//	view.style.width = view.model.width + view.model.uom;
//	view.style.height = view.model.height + view.model.uom;
//}
//},
