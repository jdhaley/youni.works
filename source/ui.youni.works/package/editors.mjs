const pkg = {
	type$: "/agent",
	Editor: {
		type$: "Display",
		dataType: "",
	},
	Input: {
		type$: "Editor",
		nodeName: "input",
		get$inputType() {
			return this.dataType;
		},
		view(data) {
			this.super(view, data);
			this.peer.type = this.inputType;
			this.peer.value = data;
			if (this.conf.readOnly) this.peer.setAttribute("disabled", true);
		}
	},
	Number: {
		type$: "Input",
		dataType: "number"
	},
	Boolean: {
		type$: "Input",
		dataType: "checkbox"
	},
	Date: {
		type$: "Input",
		dataType: "date"
	},
	Datetime: {
		type$: "Date",
		inputType: "datetime"
	},
	Color: {
		type$: "Input",
		dataType: "string",
		inputType: "color"
	},
	Password: {
		type$: "Input",
		dataType: "string",
		inputType: "password"
	},
	String: {
		type$: "Editor",
		dataType: "string",
		view(value) {
			this.super(view, value);
			this.markup = value;
			this.peer.contentEditable = this.conf.readOnly ? false : true;
		}
	},
	//more work needed...
	Collection: {
		type$: "Editor",
		dataType: "object",
		view(value) {
			this.model = data;
			this.textContent = "...";
		}
	},
	Object: {
		type$: "Editor",
		dataType: "object",
		view(value) {
			this.model = data;
			this.textContent = "...";
		}
	},
	LinkNav: {
		type$: "Display",
		nodeName: "img",
		view(data) {
			this.model = data;
			this.peer.src = "/res/link.svg";
			this.peer.tabIndex = 1;
		},
		extend$actions: {
			click(event) {
				event.subject = "navigate";
			},
			keydown(event) {
				if (event.key == "Enter" || event.key == " ") event.subject = "navigate";
			}
		}
	},
	Link: {
		type$: "Editor",
		members: {
			type$editor: "String",
			type$button: "LinkNav",			
		},
		extend$conf: {
			linkControl: {
				type$: ["Display", "Shape"]
			}
		},
		get$link() {
			return this.conf.dataSource.data[this.conf.dataset][this.model];
		},
		extend$actions: {
			navigate(event) {
				if (!this.pane) {
					let members = this.conf.dataSource.views[this.conf.objectType];
					let model = this.link;

					this.pane = this.owner.create(this.conf.linkControl, {
						members: members
					});	
					this.pane.view(model);
					this.owner.send(this.pane, "view");
				}
				if (!this.pane.peer.parentNode) {
					this.owner.append(this.pane);
				}
				let b = this.box;
				this.pane.box = {
					left: b.left,
					top: b.bottom,
					width: 100,
					height: 150
				};
			}
		}
	}
}
export default pkg;