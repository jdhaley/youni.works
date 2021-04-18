export default {
	package$: "youni.works/base/ui",
	use: {
		package$control: "youni.works/base/control",
		package$view: "youni.works/base/view"
	},
	Frame: {
		super$: "use.control.Controller",
		type$owner: "use.view.ViewOwner",
		context: null,
		conf: null,
		/*
		 * We make the view a getter in case the document changes (e.g. setting window.location)
		 * Not sure that actually how it works but logically it makes sense.
		 */
		get$view: function() {
			return this.context.document.body;
		},
		control: function(window, conf) {
			window.frame = this.sys.extend(this, {
				conf: conf,
				context: window
			});
			this.owner.control(window, window.frame);
			
			window.document.addEventListener("selectionstart", SELECTION_EVENT);
			window.document.addEventListener("selectionchange", SELECTION_EVENT);
			return window.frame;
		},
		extend$events: {
			resize: DOWN,
			input: UP,
			cut: UP,
			copy: UP,
			paste: UP,

			keydown: UP,
			mousedown: UP,
			mouseup: UP,
			mousemove: UP,
			mouseleave: UP,
			click: UP,
			dragstart: UP,
			dragover: UP,
			drop: UP,
			contextmenu: function(event) {
				if (event.ctrlKey) {
					event.preventDefault();
					UP(event);
				}
			}
		},
		extend$actions: {
			keydown: function(on, event) {
				let active = on.document.querySelector(".active");
				if (active && active.controller) {
					/*
					 * This handles the case where the browser window has the focus rather than
					 * the active element.
					 */
					this.owner.transmit.up(active, event);
				}
			}
		}
	}
}

function SELECTION_EVENT(event) {
	let selection = event.target.defaultView.getSelection();
	if (selection && selection.rangeCount) {
		event.range = selection.getRangeAt(0);
		let node = event.range.commonAncestorContainer;
		if (node.controller) node.controller.owner.transmit.up(node, event);
//		console.log(node);
	}
}
function UP(event) {
	let controller = event.currentTarget.controller;
	controller && controller.owner.transmit.up(event.target, event);
}

function DOWN(event) {
	let controller = event.currentTarget.controller;
	controller && controller.owner.transmit.down(event.target, event);
}