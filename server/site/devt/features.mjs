export default {
	editable: {
		cut: function(on, event) {
			event.preventDefault();
			if (this.owner.setClipboard(event.clipboardData, on)) {
				let app = this.owner.getViewContext(on, "application");
				app.commands.cut(on, this.getSelectedIndices(on));					
			}
		},
		copy: function(on, event) {
			event.preventDefault();
			on.controller.owner.setClipboard(event.clipboardData, on);
		},
		paste: function(on, event) {
			event.preventDefault();
			let data = this.owner.getClipboard(event.clipboardData);
			if (typeof data == "object" && data.length) {
				let element = this.findElement(event.target);
				let index = element ? this.indexOf(element) : on.childNodes.length;
				let app = this.owner.getViewContext(on, "application");
				app.commands.paste(on, index, data);
			}
		},
	},
	saveable: {
		save: function(on, event) {
			event.preventDefault();
			this.save(on.path, on.model);
			console.log("saved", Date.now());
		},
		submit: function(on, event) {
			if (!event.ctrlKey) return;
			event.preventDefault();
			this.save(on.confPath, on.conf);
		}
	},
	window: {
		extend$events: {
			mousedown: function(event) {
				MOUSE_TARGET = event.target;
				event.mouseTarget = MOUSE_TARGET;
				UP(event, MOUSE_TARGET);
			},
			mouseup: function(event) {
				if (MOUSE_TARGET) {
					event.mouseTarget = MOUSE_TARGET;
					UP(event, MOUSE_TARGET);
					MOUSE_TARGET = null;
				}
			},
			mousemove: function(event) {
				if (MOUSE_TARGET) {
					event.mouseTarget = MOUSE_TARGET;
					UP(event, MOUSE_TARGET);
				}
			},
			mouseleave: function(event) {
				if (MOUSE_TARGET) {
					event.mouseTarget = MOUSE_TARGET;
					UP(event, MOUSE_TARGET);
					MOUSE_TARGET = null;
				}					
			}
		},
		extend$actions: {
			undo: function(on, event) {
				if (!event.ctrlKey) return;
				event.preventDefault();
				on.commands.undo();
			},
			redo: function(on, event) {
				if (!event.ctrlKey) return;
				event.preventDefault();
				on.commands.redo();
			}
		}
	}
	sizeable: {
		mousedown: function(on, event) {
			this.setZone(on, event);
		},
		mousemove: {
		},
		setZone: function(on, event) {
			let border = 3;
			let x = event.x - on.x;
			let y = event.y - on.height - on.y;
			
			if (y < border) {
				event.zone = "T";
			} else if (y > on.height - border) {
				event.zone = "B";
			} else {
				event.zone = "C";
			}
			
			if (x < border) {;
				event.zone += "L"
			} else if (x > on.width - border) {
				event.zone += "R"
			} else {
				event.zone += "C"
			}
		}
	}
	movable: {
		startMove: function(view) {
			return false;
		},
		extend$actions: {
			mousedown: function(on, event) {
				if (this.startMove(on, event.mouseTarget)) {
					let box = on.getBoundingClientRect();
					on.MOVE = {
						x: event.pageX - box.x,
						y: event.pageY - box.y,
					}
					event.preventDefault();
				}
				this.activate(on);
			},
			mousemove: function(on, event) {
				if (on.MOVE) {
					this.moveTo(on, event.pageX - on.MOVE.x, event.pageY  - on.MOVE.y);
				}
			},
			mouseup: function(on, event) {
				delete on.MOVE;
			},
			mouseleave: function(on, event) {
			//	delete on.MOVE;
			}
		}
	}
}