export default {
	package$: "youni.works/property",
	use: {
		package$base: "youni.works/base",
		package$view: "youni.works/view"
	},
	Input: {
		super$: "use.view.Property",
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
			draw: function(view) {
				view.className = view.conf.type.name;
			},
			display: function(view) {
				view.type = view.conf.type.inputType;
				view.value = view.model || "";		
			}
		}
	},
	Text: {
		super$: "use.view.Property",
		draw: function(view) {
			view.textContent = "";
			view.className = this.conf.name;
			view.contentEditable = true;
		},
		display: function(view) {
			let data = view.model;
			if (typeof data == "object") data = "[object]";
			view.textContent = data
		}
	},
	Media: {
		super$: "use.view.Property",
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
			draw: function(view) {
				view.className = this.conf.name;
			},
			display: function(view) {
				view.src = "";
				view.textContent = "";
				let data = view.model;
				if (typeof data == "object") data = "";
				view.src = data;
			}			
		}
	},
	Link: {
		super$: "use.view.Property",
		extend$actions: {
			click: function(on, event) {
				console.log(event);
			},
			draw: function(view) {
				view.className = view.conf.type.name;
				view.textContent = "...";
			},
			display: function(view) {
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

//Shaper: {
//	super$: "Viewer",
//	draw: function(view) {
//		view.style.width = view.model.width + view.model.uom;
//		view.style.height = view.model.height + view.model.uom;
//	}
//},


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
