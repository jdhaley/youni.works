{
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
	},
	dragstart: function(on, event) {
		if (on.draggable) {
			event.topic = "";
			if (on.model) {
				let data = JSON.stringify(on.model);
				event.dataTransfer.effectAllowed = "copyMove";
				event.dataTransfer.setData("text/plain", data);
				console.log("start drag on: ", data);
			}
		}					
	},
	drop: function(on, event) {
		event.preventDefault();
		event.topic = "";
		let data = event.dataTransfer.getData("text/plain");
		try {
			data = JSON.parse(data);
		} catch (error) {
			return;
		}
		let element = this.findElement(event.target);
		let index = element ? this.indexOf(element) : on.childNodes.length;
		let app = this.owner.getViewContext(on, "application");
		app.commands.paste(on, index, [data]);
	}
}