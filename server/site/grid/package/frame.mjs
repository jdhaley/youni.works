export default {
	Frame: {
		super$: "use.control.Controller",
		type$owner: "ViewOwner",
		conf: null,
		view: null,
		initialize: function() {
			this.owner.control(this.view, this);
		},
		extend$events: {
			input: UP,
			cut: UP,
			copy: UP,
			paste: UP,
			dragstart: UP,
			dragover: UP,
			drop: UP,

			keydown: UP,
			mousedown: UP,
			mouseup: UP,
			mousemove: UP,
			mouseleave: UP,
			click: UP,
			contextmenu: function(event) {
				if (event.ctrlKey) {
					event.preventDefault();
					UP(event);
				}
			}
		},
		extend$actions: {
			keydown: function(on, event) {
				let shortcut = this.shortcuts[event.key];
				if (shortcut) shortcut.call(this, on, event);
			}
		},
		extend$shortcuts: {
			"Escape": function(on, event) {
				let active = on.document.querySelector(".active");
				if (active) {
					if (active.priorWindow) active.priorWindow.controller.activate(active.priorWindow);
					active.style.display = "none";
				}
			},
			"Control+S": function(on, event) {
				event.preventDefault();
				this.save(on.path, on.model);
			},
			"Control+Shift+S": function(on, event) {
				if (!event.ctrlKey) return;
				event.preventDefault();
				this.save(on.confPath, on.conf);
			},
			"Control+Z": function(on, event) {
				if (!event.ctrlKey) return;
				event.preventDefault();
				on.commands.undo();
			},
			"Control+Y": function(on, event) {
				if (!event.ctrlKey) return;
				event.preventDefault();
				on.commands.redo();
			}
		}
	}
}