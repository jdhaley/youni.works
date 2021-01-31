export default {
	package$: "youni.works/property",
	use: {
		package$base: "youni.works/base",
		package$view: "youni.works/view"
	},
	Input: {
		super$: "use.view.Property",
		nodeName: "input",
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
		draw: function(view) {
			view.type = this.inputType;
		},
		display: function(view) {
			view.value = view.model || "";		
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
		nodeName: function(data) {
			//TODO sniff the media type from the data.
			switch (this.conf.mediaType) {
				case "video" : return "video";
				case "audio" : return "audio";
				case "image" : return "img";
			}
			return "object";
		},
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
	},
	Link: {
		super$: "use.view.Property",
		draw: function(view) {
			view.className = this.conf.name;
		},
		display: function(view) {
			view.textContent = "...";
			let type = this.app.components[this.conf.objectType];
			switch (this.conf.dataType) {
				case "array":
					for (let value of view.model) {
						let content = type.create(view.owner, value);
						view.append(content);
					}
					return;
				case "list":
				
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
