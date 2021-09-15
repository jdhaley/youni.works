export default {
	type$Display: "/display/Display",
    Zoned: {
		border: {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		},
		edges: {
		},
        getEdge(x, y) {
			let rect = this.peer.getBoundingClientRect();
			x -= rect.x;
			y -= rect.y;

			let border = this.border;
			let zone;

			if (y <= border.top) {
				zone = "T";
			} else if (y >= rect.height - border.bottom) {
				zone = "B";
			} else {
				zone = "C";
			}
			if (x <= border.left) {
				zone += "L";
			} else if (x >= rect.width - border.right) {
				zone += "R";
			} else {
				zone += "C";
			}
			return zone;
		}
    },
	Shape: {
		type$: "Zoned",
		extend$conf: {
			minWidth: 16,
			minHeight: 16	
		},
		virtual$bounds() {
			if (arguments.length) {
				let rect = arguments[0];
				if (rect.width !== undefined) {
					this.style.width = Math.max(rect.width, this.conf.minWidth) + "px";
					this.style.minWidth = this.style.width;
				}
				if (rect.height !== undefined) {
					this.style.height = Math.max(rect.height, this.conf.minHeight) + "px";
					this.style.minHeight = this.style.height;
				} 	
				if (rect.left !== undefined || rect.top !== undefined) this.style.position = "absolute";
				if (rect.left !== undefined) this.style.left = rect.left + "px";
				if (rect.top !== undefined) this.style.top = rect.top + "px";
			} else {
				return this.peer.getBoundingClientRect();
			}
		},
		get$shape(){
			return this;
		},
		extend$actions: {
			touch(event) {
				if (event.track && event.track != this) return;
				let edge = this.getEdge(event.x, event.y);
				let zone = this.edges[edge];
				let subject = zone && zone.subject;
				if (!subject) return;

				if (zone.cursor) this.style.cursor = zone.cursor;
				let box = this.box;
				this.peer.$tracking = {
					subject: subject,
					cursor: this.style.cursor,
					insideX: event.x - box.left,
					insideY: event.y - box.top
				}
				event.track = this;
				event.subject = "";
			},
			drag(event) {
				event.subject = this.peer.$tracking.subject;
				this.receive(event)
			},
			release(event) {
				delete this.peer.$tracking;
                this.owner.style.removeProperty("cursor");
			},
			position(event) {
				if (event.track == this) {
					this.moveTo(
						event.x - this.peer.$tracking.insideX,
						event.y - this.peer.$tracking.insideY
					);
				}
			},
			size(event) {
				let box = this.shape.box;
                if (!this.peer.$tracking.fromRight) {
                    this.peer.$tracking.fromRight = this.box.width - this.peer.$tracking.insideX;
                }
                this.shape.size(
                    event.x - box.left + this.peer.$tracking.fromRight,
                    box.height
                );
			},
			moveover(event) {
				event.zone = this.getEdge(event.x, event.y);
				let zone = this.edges[event.zone];
				if (zone && zone.cursor != this.style.cursor) {
					this.style.cursor = zone.cursor;
				}
			},
			moveout(event) {
				this.style.removeProperty("cursor");
			}
		}
	},
	/**
	 * Supports sizing the width from the right side of the shape.
	 */
	Columnar: {
        type$: ["Display", "Shape"],
		border: {
			right: 6,
		},
        edges: {
			CR: {
				subject: "size",
				cursor: "ew-resize"
			}
        },
		size(width) {
			this.style.flex = "0 0 " + width + "px",
			this.style.minWidth = width + "px";
		},
        extend$actions: {
            size(event) {
                let box = this.box;
                if (!this.peer.$tracking.fromRight) {
                    this.peer.$tracking.fromRight = this.box.width - this.peer.$tracking.insideX;
                }
                this.size(
                    event.x - box.left + this.peer.$tracking.fromRight,
                    box.height
                );
                event.subject = "moveover";
			},
            moveover(event) {
                this.super(moveover, event);
                if (this.style.backgroundColor) {
                    this.style.removeProperty("background-color");
                }
                if (event.zone == "CR") {
                    this.style.backgroundColor = "gainsboro";
                }
            },
            moveout(event) {
                if (this.style.backgroundColor) {
                    this.style.removeProperty("background-color");
                }
            }
        }
    }
}