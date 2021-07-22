export default {
	type$: "/record",
	type$Section: "/panel/Section",
	type$Shape: "/shape/Shape",
	Caption: {
		type$: ["Member", "Shape"],
		zones: {
			border: {
				right: 6
			},
			cursor: {
				"CR": "ew-resize"
			},
			subject: {
				"CR": "size",
			}
		},
		display() {
			this.super(display);
			if (!this.rule) this.createRule();
			this.peer.innerText = this.getCaption();
			if (this.conf.dynamic) this.peer.classList.add("dynamic");
		},
		createRule() {
			let flex = +(this.conf.columnSize);
			let selector = "#" + getParentId(this.peer) + " ." + this.conf.name;
			this.rule = this.owner.createStyle(selector, {
				"flex": (this.conf.flex === false ? "0 0 " : "1 1 ") + flex + "cm",
				"min-width": flex / 4 + "cm"
			});
			console.log(this.rule);
			function getParentId(node) {
				for (; node; node = node.parentNode) {
					if (node.id) return node.id;
				}
			}
		},
		extend$actions: {
			size(event) {
				if (event.track == this) {
					let r = this.bounds;
					this.rule.style.minWidth = (event.clientX - r.left) + "px";
				}
			}	
		}
	},
	Key: {
		type$: ["Display", "Shape"],
		display() {
			this.super(display);
			let key = this.of.key || "";
			this.peer.textContent = key;
		}
	},
	Row: {
		type$: "Structure",
		direction: "horizontal",
		members: {
			type$key: "Key",
			type$value: "Display"
		}
	},
	Sheet: {
		type$: "Section",
		members: {
			type$header: "Display",
			type$body: "Rows",
			type$footer: "Display"
		}
	},
	Rows: {
		type$: "Collection",
		type$contentType: "Row",
		direction: "vertical"
	},
	PropertySheet: {
		type$: "Sheet",
		members: {
			body: {
				type$: "Record",
				contentType: {
					type$: "Row",
					members: {
						type$key: "Caption",
						type$value: "Property"
					}
				}
			}
		}
	},
	Table: {
		type$: "Section",
		members: {
			header: {
				type$: "Row",
				members: {
					type$key: "Key",
					value: {
						type$: "Record",
						type$contentType: "Caption"
					}
				}
			},
			body: {
				type$: "Rows",
				contentType: {
					type$: "Row",
					members: {
						type$key: "Key",
						value: {
							type$: "Record",
							type$contentType: "Property"
						}
					}
				}
			},
			footer: {
				type$: "Row",
				members: {
					type$key: "Key",
					value: {
						type$: "Record",
						contentType: {
							type$: "Caption",
							getCaption() {
								return "";
							}
						}
					}
				}
			}
		},
		get$id() {
			return this.peer.id;
		},
		start(conf) {
			this.super(start, conf);
			this.peer.id = "I" + this.owner.createId();
		},
	}
}