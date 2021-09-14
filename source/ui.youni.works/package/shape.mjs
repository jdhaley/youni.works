export default {
	type$Display: "/display/Display",
    Zoned: {
		zones: {
			border: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			},
			cursor: {
				"TL": "",
				"TC": "",
				"TR": "",
				"CL": "",
				"CC": "",
				"CR": "",
				"BL": "",
				"BC": "",
				"BR": "",
			},
			subject: {
				"TL": "",
				"TC": "",
				"TR": "",
				"CL": "",
				"CC": "",
				"CR": "",
				"BL": "",
				"BC": "",
				"BR": "",
			}
		},
        getZone(x, y) {
			let rect = this.peer.getBoundingClientRect();
			x -= rect.x;
			y -= rect.y;

			let border = this.zones.border;
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
			grab(event) {
				if (event.track && event.track != this) return;
				let zone = this.getZone(event.x, event.y);
				let subject = this.zones.subject[zone] || "";
				if (!subject) return;

				this.style.cursor = this.zones.cursor[zone];
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
				event.zone = this.getZone(event.x, event.y);
				let cursor = this.zones.cursor[event.zone];
				if (cursor) {
					this.style.cursor = cursor;
				} else {
					this.style.removeProperty("cursor");
				}
			}
		}
	},
	/**
	 * Supports sizing the width from the right side of the shape.
	 */
	Columnar: {
        type$: ["Display", "Shape"],
        zones: {
            border: {
                right: 4,
            },
            cursor: {
                "CR": "ew-resize",
            },
            subject: {
                "CR": "size",
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
    },
	Pane: {
		type$: ["Display", "Shape"],
		var$shape: null,
		extend$conf: {
			zone: {
				border: {
					top: 0,
					right: 8,
					bottom: 12,
					left: 0
				},
				cursor: {
					"BC": "move",
					"BR": "nwse-resize",
				},
				subject: {
					"BC": "position",
					"BR": "size",
				}
			},	
		},
		get$contentType() {
			return this.conf.contentType;
		},
		get$elementConf() {
			return this.conf;
		},
		view(data) {
			this.super(view, data);
			let type = this.contentType;
			let conf = this.elementConf;
			this.shape = this.owner.create(type, conf);
			this.append(this.shape);
		}
	}
}