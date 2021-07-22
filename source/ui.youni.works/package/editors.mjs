const pkg = {
	type$: "/record",
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
			this.peer.textContent = value;
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
				this.receive("navigate");
			},
			keydown(event) {
				if (event.key == "Enter" || event.key == " ") this.receive("navigate");
			},
			navigate(event) {
				if (!this.pane) {
					let type = this.owner.origin.types[this.conf.objectType];
					let model = this.owner.origin.data[this.conf.dataset][this.of.model];

					this.pane = this.owner.create(this.conf.linkControl, type);	
					this.pane.view(model);
					this.owner.send(this.pane, "view");
				}
				if (!this.pane.peer.parentNode) {
					this.owner.append(this.pane);
				}
				let b = this.bounds;
				this.pane.bounds = {
					left: b.left,
					top: b.bottom
				};
			}
		}
	},
	Link: {
		type$: "Editor",
		extend$conf: {
			type$linkNavControl: "LinkNav",
			linkControl: {
				type$: "/shape/Pane",
			//	contentType: "/grid/PropertySheet"
				contentType: "/panel/Panel"
			},
			type$editorControl: "String"
		},
		view(data) {
			this.super(view, data);
			this.value = this.owner.create(this.conf.editorControl, this.conf);
			this.peer.tabIndex = 1;
			this.append(this.value);
			this.icon = this.owner.create(this.conf.linkNavControl, this.conf);
			this.append(this.icon);
		},
	}
}
export default pkg;