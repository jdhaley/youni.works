const pvt = {
	zoneCursor: {
		TL: "nw-resize",
		TC: "n-resize",
		TR: "ne-resize",
		CL: "w-resize",
		CC: "move",
		CR: "e-resize",
		BL: "sw-resize",
		BC: "s-resize",
		BR: "se-resize"
	},
	setZone: function(on, event) {
		let border = on.border;
		let rect = on.peer.getBoundingClientRect();

		let horiz = event.clientX - rect.x;
		let vert = event.clientY - rect.y;

		on.vert = "C";
		if (vert < border) {
			on.vert = "T";
		} else if (vert > rect.height - border) {
			on.vert = "B";
		}
		
		on.horiz = "C"
		if (horiz < border) {
			on.horiz = "L"
		} else if (horiz > rect.width - border) {
			on.horiz = "R"
		}
		on.style.cursor = pvt.zoneCursor[on.vert + on.horiz];
	}
}
export default {
	private: pvt,
	package$: "youni.works/diagram",
	use: {
		package$view: "youni.works/view",
		package$command: "youni.works/command"
	},
	DrawCommand: {
		super$: "use.command.Command",
		title: "Move/Size Shape",
		control: null,
		before: null,
		after: null,
		exec: function() {
			let control = this.control;
			control.set(control.model, this.after);
			control.actions.notify(control, "draw");
		},
		undo: function() {
			let control = this.control;
			control.set(control.model, this.before);
			control.actions.notify(control, "draw");
		},
		instance: function(control) {
			let model = control.model;
			let before = this.sys.extend();
			control.set(before, model);
			let after = this.sys.extend();
			control.set(after, model);
			return this.sys.extend(this, {
				prior: null,
				next: null,
				control: control,
				before: before,
				after: after
			});
		}
	},
	Diagram: {
		super$: "use.view.View",
		use: {
			type$Shape: "Shape",
			type$Commands: "use.command.Commands"
		},
		start: function() {
			this.commands = this.use.Commands.instance();
		},
		extend$actions: {
			view: function(on, event) {
				on.peer.textContent = "";
				on.peer.classList.add("diagram");
				on.peer.tabIndex = 0;
				for (let model of on.model.shapes) {
					let shape = on.owner.create(model.type || on.use.Shape);
					shape.bind(model);
					shape.diagram = on;
					on.append(shape);
				}
			},
			keydown: function(on, event) {
				if (event.key == "Escape") {
					on.peer.focus();
				}
				if (event.key == "s" && event.ctrlKey) {
					event.preventDefault();
					on.owner.save(on.file, on.model);
				}
				if (event.key == "z" && event.ctrlKey) {
					event.preventDefault();
					on.peer.focus();
					on.commands.undo();
				}
				if (event.key == "y" && event.ctrlKey) {
					event.preventDefault();
					on.peer.focus();
					on.commands.redo();
				}
			}
		}
	},
	Shape: {
		super$: "use.view.View",
		use: {
			type$DrawCommand: "DrawCommand"
		},
		border: 6,
		minWidth: 48,
		minHeight: 24,
		type$defaultContent: "Text",
		moveTo: function(x, y) {
			this.model.x = x > 0 ? x : 0;
			this.model.y = y > 0 ? y : 0;
		},
		sizeTo: function(width, height) {
			this.model.width = width > this.minWidth ? width : this.minWidth;
			this.model.height = height > this.minHeight ? height : this.minHeight;
		},
		set: function(dest, source) {
			dest.x = source.x > 0 ? source.x : 0;
			dest.y = source.y > 0 ? source.y : 0;
			dest.width = source.width > this.minWidth ? source.width : this.minWidth;
			dest.height = source.height > this.minHeight ? source.height : this.minHeight;
		},
		extend$actions: {
			view: function(on, event) {
				on.peer.textContent = "";
				on.peer.classList.add("shape");
				this.draw(on, event);
				this.viewContent(on, event);
			},
			draw: function(on, event) {
				on.style.width = (on.model.width || on.minWidth) + "px";
				on.style.height = (on.model.height || on.minHeight) + "px";
				on.style.top = on.model.y + "px";
				on.style.left = on.model.x + "px";
				on.peer.scrollIntoView();
			},
			move: function(on, event) {
				on.moveTo(on.model.x + event.moveX, on.model.y + event.moveY);
			},
			size: function(on, event) {
				let model = on.model;
				switch (on.horiz) {
					case "L":
//						if (cmd.before.width - event.trackX < on.minWidth) break;
						on.moveTo(model.x + event.moveX, model.y);
						on.sizeTo(model.width - event.moveX, model.height);
						break;
					case "R":
						on.sizeTo(model.width + event.moveX, model.height);
						break;
				}
				switch (on.vert) {
					case "T":
//						if (cmd.before.height - event.trackY < on.minHeight) break;
						on.moveTo(model.x, model.y + event.moveY);
						on.sizeTo(model.width, model.height - event.moveY);
						break;
					case "B":
						on.sizeTo(model.width, model.height + event.moveY);
						break;
				}
			},
			connect: function(on, event) {
			},
			viewContent: function(on, event) {
				switch (typeof on.model.content) {
					case "string":
					case "number":
						let content = on.owner.create(on.defaultContent);
						on.append(content);
						content.bind(on.model.content);
						break;
					case "boolean":
					case "undefined":
					case "function":
					case "symbol":
					case "bigint":
					case "object":
					default:
						on.peer.textContent = "";
						on.peer.textContent = on.model.content;
						break;
				}
			},
			mousedown: function(on, event) {
				if (on.owner.activeElement.parentNode == on.peer) return;
				event.preventDefault();
				event.track = on; // Tell the listener what to track.
				pvt.setZone(on, event);
				on.style.outline = "3px solid rgba(64, 128, 64, .3)";
				on.style.zIndex = "1";
				on.diagram.peer.focus();
				if (on.diagram.command) console.log("no mouse up");
			},
			track: function(on, event) {
				let cmd = on.diagram.command;
				if (!cmd) {
					cmd = on.use.DrawCommand.instance(on);
					on.diagram.command = cmd;
				}
				if (on.vert == "C" && on.horiz == "C") {
					this.move(on, event);
				} else if (event.altKey) {
					this.connect(on, event);
				} else {
					this.size(on, event);
				}
				this.notify(on, "draw");
			},
			trackEnd: function(on, event) {
				event.subject = "";
				on.style.outline = "";
				on.style.cursor = "";
				on.style.zIndex = "";
				if (on.diagram.command) {
					on.set(on.diagram.command.after, on.model);
					on.diagram.commands.addCommand(on.diagram.command);
					on.diagram.command = null;
				} else if (on.peer.firstChild) {
					on.peer.firstChild.focus();
				}
			},
			contextmenu: function(on, event) {
				console.log("context menu here");
			},
			mousemove: function(on, event) {
				//Don't alter the cursor when a textShape has the focus.
				//if (on.owner.activeElement.parentNode == on) return;
				if (!on.diagram.command) {
					pvt.setZone(on, event);		
				}
//				if (event.altKey) {
//					if (event.vert == "C" && event.horiz == "C") {
//						on.style.cursor = "move";
//					} else {
//						on.style.cursor = "crosshair";
//					}
//					return;
//				}
			},
//			mouseover: function(on, event) {
//				on.style.outline = "3px solid rgba(64, 128, 64, .3)";				
//			},
//			mouseout: function(on, event) {
//				let cmd = on.diagram.command
//				if (cmd && cmd.control != on) on.style.outline = "";
//			},
		}
	},
	Text: {
		super$: "use.view.View",
		bind: function(data) {
			this.sys.define(this, "model", data);
		},
		extend$actions: {
			view: function(on, event) {
				let peer = on.peer;
				peer.classList.add("text");
				peer.textContent = "";
				peer.innerHTML = "<p>" + on.model + "</p>";
				peer.contentEditable = true;
			},
			focusin: function(on, event) {
				on.peer.parentNode.style.zIndex = "8";
			},
			focusout: function(on, event) {
				on.peer.parentNode.style.zIndex = "";
			},
			dblclick: function(on, event) {
				
			}
		}
	},
	Connector: {
		super$: "use.view.View"
	}
}