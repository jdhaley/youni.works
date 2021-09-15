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
			let edge;

			if (y <= border.top) {
				edge = "T";
			} else if (y >= rect.height - border.bottom) {
				edge = "B";
			} else {
				edge = "C";
			}
			if (x <= border.left) {
				edge += "L";
			} else if (x >= rect.width - border.right) {
				edge += "R";
			} else {
				edge += "C";
			}
			return edge;
		}
    },
	Shape: {
		type$: "Zoned",
		extend$conf: {
			minWidth: 16,
			minHeight: 16	
		},
		extend$actions: {
			touch(event) {
				if (event.track && event.track != this) return;
				let edge = this.getEdge(event.x, event.y);
				edge = this.edges[edge];
				let subject = edge && edge.subject;
				if (!subject) return;

				if (edge.cursor) this.style.cursor = edge.cursor;
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
				let box = this.box;
				this.size(event.x - box.left, event.y - box.top);
			},
			moveover(event) {
				event.edge = this.getEdge(event.x, event.y);
				let edge = this.edges[event.edge];
				if (edge && edge.cursor != this.style.cursor) {
					this.style.cursor = edge.cursor;
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
                if (event.edge == "CR") {
                    this.style.backgroundColor = "gainsboro";
                }
            },
            moveout(event) {
				this.super(moveout, event);
                if (this.style.backgroundColor) {
                    this.style.removeProperty("background-color");
                }
            }
        }
    }
}