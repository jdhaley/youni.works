const pkg = {
	$name: "/ui.youni.works/diagram",
	$public: {
		type$: "/ui.youni.works/view",
		use: {
			type$command: "/base.youni.works/command"
		},
		DrawCommand: {
			type$: "use/command/Command",
			title: "Move/Size Shape",
			control: null,
			before: null,
			after: null,
			exec: function() {
				let control = this.control;
				control.set(control.model, this.after);
				control.owner.notify(control, "drawShape");
			},
			undo: function() {
				let control = this.control;
				control.set(control.model, this.before);
				control.owner.notify(control, "drawShape");
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
			type$: ["View", "Observer"],
			//DOC why use.Commands & type$commands.
			//TODO rationalize the use vs. type. Come up with a better pattern.
			use: {
				type$Shape: "Shape",
				type$Commands: "use/command/Commands"
			},
			type$commands: "use/command/Commands",
			start: function(conf) {
				if (conf) this.sys.define(this, "conf", conf);
				this.sys.define(this, "commands", this.use.Commands.instance());			
			},
			draw: function draw() {
				this.peer.textContent = "";
				this.super(draw);
				this.peer.tabIndex = 0;
			},
			bind: function(diagram) {
				this.unobserve(this.model);
				this.observe(diagram);
				this.model = diagram;
				let shapes = diagram.shapes;
				for (let i = 0; i < shapes.length; i++) {
					let model = shapes[i];
					let shape = this.owner.create(model.type || this.use.Shape);
					shape.diagram = this;
					shape.key = i;
					this.append(shape);
				}
			},
			extend$actions: {
				keydown: function(event) {
					if (event.key == "Escape") {
						this.peer.focus();
					}
					if (event.key == "s" && event.ctrlKey) {
						event.preventDefault();
						throw new Error("fix save");
						this.owner.save(this.file, this.model);
					}
					if (event.key == "z" && event.ctrlKey) {
						event.preventDefault();
						this.peer.focus();
						this.commands.undo();
					}
					if (event.key == "y" && event.ctrlKey) {
						event.preventDefault();
						this.peer.focus();
						this.commands.redo();
					}
				}
			}
		},
		Shape: {
			type$: ["View", "Observer"],
			use: {
				type$DrawCommand: "DrawCommand"
			},
			border: 6,
			minWidth: 48,
			minHeight: 24,
			type$defaultContent: "Text",
			draw: function draw() {
				this.super(draw);
			},
			bind: function(model) {
				let shape = model.shapes[this.key];
				this.unobserve(this.model);
				this.observe(shape);
				this.model = shape;
				this.drawShape();
				this.viewContent(this.model.content);
			},
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
			viewContent: function(content) {
				switch (typeof content) {
					case "string":
					case "number":
						let ctl = this.owner.create(this.defaultContent);
						this.append(ctl);
						ctl.bind(content);
						break;
					case "boolean":
					case "undefined":
					case "function":
					case "symbol":
					case "bigint":
					case "object":
					default:
						this.peer.textContent = content;
						break;
				}
			},
			drawShape: function() {
				this.style.width = (this.model.width || this.minWidth) + "px";
				this.style.height = (this.model.height || this.minHeight) + "px";
				this.style.top = this.model.y + "px";
				this.style.left = this.model.x + "px";
				this.peer.scrollIntoView();
			},
			extend$actions: {
				drawShape: function(event) {
					this.drawShape();
				},
				move: function(event) {
					this.moveTo(this.model.x + event.moveX, this.model.y + event.moveY);
				},
				size: function(event) {
					let model = this.model;
					switch (this.horiz) {
						case "L":
	//						if (cmd.before.width - event.trackX < this.minWidth) break;
							this.moveTo(model.x + event.moveX, model.y);
							this.sizeTo(model.width - event.moveX, model.height);
							break;
						case "R":
							this.sizeTo(model.width + event.moveX, model.height);
							break;
					}
					switch (this.vert) {
						case "T":
	//						if (cmd.before.height - event.trackY < this.minHeight) break;
							this.moveTo(model.x, model.y + event.moveY);
							this.sizeTo(model.width, model.height - event.moveY);
							break;
						case "B":
							this.sizeTo(model.width, model.height + event.moveY);
							break;
					}
				},
				connect: function(event) {
				},
				mousedown: function(event) {
					if (this.owner.activeElement.parentNode == this.peer) return;
					event.preventDefault();
					event.track = this; // Tell the listener what to track.
					pkg.setZone(this, event);
					this.style.outline = "3px solid rgba(64, 128, 64, .3)";
					this.style.zIndex = "1";
					this.diagram.peer.focus();
					if (this.diagram.command) console.log("no mouse up");
				},
				track: function(event) {
					let cmd = this.diagram.command;
					if (!cmd) {
						cmd = this.use.DrawCommand.instance(this);
						this.diagram.command = cmd;
					}
					if (this.vert == "C" && this.horiz == "C") {
						event.subject = "move";
						this.receive(event);
					} else if (event.altKey) {
						event.subject = "connect";
						this.receive(event);
					} else {
						event.subject = "size";
						this.receive(event);
					}
					this.owner.notify(this, "drawShape");
				},
				trackEnd: function(event) {
					event.subject = "";
					this.style.outline = "";
					this.style.cursor = "";
					this.style.zIndex = "";
					if (this.diagram.command) {
						this.set(this.diagram.command.after, this.model);
						this.diagram.commands.addCommand(this.diagram.command);
						this.diagram.command = null;
					} else if (this.peer.firstChild) {
						this.peer.firstChild.focus();
					}
				},
				contextmenu: function(event) {
					console.log("context menu here");
				},
				mousemove: function(event) {
					//Don't alter the cursor when a textShape has the focus.
					//if (this.owner.activeElement.parentNode == this) return;
					if (!this.diagram.command) {
						pkg.setZone(this, event);		
					}
	//				if (event.altKey) {
	//					if (event.vert == "C" && event.horiz == "C") {
	//						this.style.cursor = "move";
	//					} else {
	//						this.style.cursor = "crosshair";
	//					}
	//					return;
	//				}
				},
	//			mouseover: function(event) {
	//				this.style.outline = "3px solid rgba(64, 128, 64, .3)";				
	//			},
	//			mouseout: function(event) {
	//				let cmd = this.diagram.command
	//				if (cmd && cmd.control != this) this.style.outline = "";
	//			},
			}
		},
		Text: {
			type$: "View",
			bind: function(model) {
				this.model = model.content;
			},
			extend$actions: {
				view: function(event) {
					let peer = this.peer;
					peer.classList.add("text");
					peer.textContent = "";
					peer.innerHTML = "<p>" + this.model + "</p>";
					peer.contentEditable = true;
				},
				focusin: function(event) {
					this.peer.parentNode.style.zIndex = "8";
				},
				focusout: function(event) {
					this.peer.parentNode.style.zIndex = "";
				},
				dblclick: function(event) {
					
				}
			}
		},
		Connector: {
			type$: "View"
		}
	},
	ZONE_CURSOR: {
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
		on.style.cursor = pkg.ZONE_CURSOR[on.vert + on.horiz];
	}
}
export default pkg;