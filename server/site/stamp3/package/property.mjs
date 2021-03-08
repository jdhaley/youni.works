export default {
	package$: "youni.works/property",
	use: {
		package$grid: "youni.works/grid"
	},
	Input: {
		super$: "use.grid.Property",
		nodeNameFor: function(data) {
			return "input";
		},
		get$inputType: function() {
			switch (this.conf.dataType) {
				case "number":
					return "number";
				case "date":
					return "date";
				case "boolean":
					return "checkbox";
				case "char":
					if (this.conf.protected) return "password";
				default:
					return "text";
			}			
		},
		extend$actions: {
			view: function(view) {
				view.className = view.kind.conf.name;
				view.type = view.kind.inputType;
				view.value = view.model || "";		
			}
		}
	},
	Text: {
		super$: "use.grid.Property",
		view: function(view) {
			view.textContent = "";
			view.className = view.kind.conf.name;
			view.contentEditable = true;
			let data = view.model;
			if (typeof data == "object") data = "[object]";
			view.textContent = data
		}
	},
	Media: {
		super$: "use.grid.Property",
		nodeNameFor: function(data) {
			//TODO sniff the media type from the data.
			switch (this.conf.mediaType) {
				case "video" : return "video";
				case "audio" : return "audio";
				case "image" : return "img";
			}
			return "object";
		},
		extend$actions: {
			view: function(view) {
				view.className = view.kind.conf.name;
				view.src = "";
				view.textContent = "";
				let data = view.model;
				if (typeof data == "object") data = "";
				view.src = data;
			}			
		}
	},
	Link: {
		super$: "use.grid.Property",
		extend$actions: {
			click: function(on, event) {
				console.log(event);
			},
			view: function(view) {
				view.className = view.kind.conf.name;
				view.textContent = "...";
//				view.textContent = "...";
//				let type = this.app.components[this.conf.objectType];
//				switch (this.conf.dataType) {
//					case "array":
//						for (let value of view.model) {
//							let content = type.create(view.owner, value);
//							view.append(content);
//						}
//						return;
//					case "list":
//				}
			}
		}
	}
}

/*
	Property: {
		super$: "use.view.Property",
		display: function(view) {
			let type = this.app.components[this.conf.objectType];
			if (view.model.length !== undefined) {
				for (let value of view.model) {
					let content = type.create(view.owner, value);
					view.append(content);
				}
			} else {
				for (let prop of type.properties) {
					let prop = prop.create(view.owner, view.model);
					view.properties[prop.name] = prop;
					view.append(prop);			
				}
			}
		}
	},

 */
