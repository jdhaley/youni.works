export default {
	package$: "youni.works/diagram",
	use: {
		package$app: "youni.works/app",
		package$command: "youni.works/diagram/command"
	},
	Diagram: {
		super$: "use.app.View",
		use: {
			type$Shape: "Shape",
			type$Command: "use.command.DrawCommand",
			type$Commands: "use.command.Commands"
		},
		start: function() {
			this.commands = this.use.Commands.instance();
			this.view.classList.add("diagram");
			this.view.tabIndex = 0;
		},
		bind: function(data) {
			this.owner.app.observe(this, data);
			this.model = data;
		},
		extend$actions: {
			view: function(on, event) {
				on.view.textContent = "";
				for (let model of on.model.shapes) {
					let shape = on.owner.create(model.type || on.use.Shape);
					shape.diagram = on;
					on.append(shape);
					shape.bind(model);
				}
			},
			keydown: function(on, event) {
				if (event.key == "Escape") {
					on.view.focus();
				}
				if (event.key == "s" && event.ctrlKey) {
					event.preventDefault();
					on.owner.app.save(on.file, on.model);
				}
				if (event.key == "z" && event.ctrlKey) {
					event.preventDefault();
					on.view.focus();
					on.commands.undo();
				}
				if (event.key == "y" && event.ctrlKey) {
					event.preventDefault();
					on.view.focus();
					on.commands.redo();
				}
			}
		}
	},
	Shape: {
		super$: "use.app.View",
		use: {
			type$DrawCommand: "use.command.DrawCommand"
		},
		border: 6,
		minWidth: 48,
		minHeight: 24,
		get$style: function() {
			return this.view.style;
		},
		type$defaultContent: "Text",
		bind: function(data) {
			this.owner.app.observe(this, data);
			this.model = data;
		},
		extend$actions: {
			view: function(on, event) {
				on.view.textContent = "";
				on.view.classList.add("shape");
				this.draw(on, event);
				this.viewContent(on, event);
			},
			draw: function(on, event) {
				on.view.style.width = (on.model.width || on.minWidth) + "px";
				on.view.style.height = (on.model.height || on.minHeight) + "px";
				on.view.style.top = on.model.y + "px";
				on.view.style.left = on.model.x + "px";
				on.view.scrollIntoView();
			},
			move: function(on, event) {
				let cmd = on.diagram.command;
				cmd.moveTo(cmd.before.x + event.trackX, cmd.before.y + event.trackY);
				this.notify(on, "draw");
			},
			size: function(on, event) {
				let cmd = on.diagram.command;
				let model = on.model;
				switch (cmd.horiz) {
					case "L":
						if (cmd.before.width - event.trackX < on.minWidth) break;
						cmd.moveTo(cmd.before.x + event.trackX, model.y);
						cmd.size(cmd.before.width - event.trackX, model.height);
						break;
					case "R":
						cmd.size(cmd.before.width + event.trackX, model.height);
						break;
				}
				switch (cmd.vert) {
					case "T":
						if (cmd.before.height - event.trackY < on.minHeight) break;
						cmd.moveTo(model.x, cmd.before.y + event.trackY);
						cmd.size(model.width, cmd.before.height - event.trackY);
						break;
					case "B":
						cmd.size(model.width, cmd.before.height + event.trackY);
						break;
				}
				this.notify(on, "draw");
				
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
						on.view.textContent = "";
						on.view.textContent = on.model.content;
						break;
				}
			},
			mousedown: function(on, event) {
				if (on.owner.activeElement.parentNode == on) return;
				event.preventDefault();
				event.track = on; // Tell the listener what to track.
				setZone(on, event);
				on.view.style.outline = "3px solid rgba(64, 128, 64, .3)";
				on.view.style.zIndex = "1";
				on.$hzone = event.horiz;
				on.$vzone = event.vert;
				on.diagram.view.focus();
				if (on.diagram.command) console.log("no mouse up");
			},
			track: function(on, event) {
				let cmd = on.diagram.command;
				if (!cmd) {
					cmd = on.use.DrawCommand.instance(on);
					cmd.horiz = on.$hzone;
					cmd.vert = on.$vzone;
					on.diagram.command = cmd;
				}
				if (cmd.vert == "C" && cmd.horiz == "C") {
					this.move(on, event);
				} else if (event.altKey) {
					this.connect(on, event);
				} else {
					this.size(on, event);
				}
			},
			trackEnd: function(on, event) {
				event.topic = "";
				on.style.outline = "";
				on.style.cursor = "";
				on.style.zIndex = "";
				if (on.diagram.command) {
					on.diagram.commands.addCommand(on.diagram.command);
					on.diagram.command = null;
				} else if (on.firstChild) {
					on.firstChild.focus();
				}
			},
			contextmenu: function(on, event) {
				console.log("context menu here");
			},
			mousemove: function(on, event) {
				//Don't alter the cursor when a textShape has the focus.
				//if (on.owner.activeElement.parentNode == on) return;
				if (!on.diagram.command) {
					setZone(on, event);		
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
		super$: "use.app.View",
		bind: function(data) {
			this.model = data;
		},
		extend$actions: {
			view: function(on, event) {
				let view = on.view;
				view.classList.add("text");
				view.textContent = "";
				view.innerHTML = "<p>" + on.model + "</p>";
				view.contentEditable = true;
			},
			focusin: function(on, event) {
				on.view.parentNode.style.zIndex = "8";
			},
			focusout: function(on, event) {
				on.view.parentNode.style.zIndex = "";
			},
			dblclick: function(on, event) {
				
			}
		}
	},
	Connector: {
		super$: "use.app.View"
	}
}

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

function setZone(on, event) {
	let border = on.border;
	let rect = on.view.getBoundingClientRect();

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
	on.view.style.cursor = zoneCursor[event.vert + event.horiz];
}
