export default {
	package$: "youni.works/diagram/command",
	use: {
		package$command: "youni.works/command"
	},
	type$Commands: "use.command.Commands",
	DrawCommand: {
		super$: "use.command.Command",
		title: "Move/Size Shape",
		control: null,
		before: null,
		after: null,
		moveTo: function(x, y) {
			x = x < 0 ? 0 : x;
			y = y < 0 ? 0 : y;
			this.after.x = x;
			this.after.y = y;
			this.control.model.x = x;
			this.control.model.y = y;
		},
		size: function(w, h) {
			let control = this.control;
			if (w < control.kind.minWidth) w = control.kind.minWidth;
			if (h < control.kind.minHeight) h = control.kind.minHeight;
			this.after.width = w;
			this.after.height = h;
			control.model.width = w;
			control.model.height = h;
		},
		exec: function() {
			let model = this.control.model;
			let after = this.after;
			model.x = after.x;
			model.y = after.y;
			model.width = after.width;
			model.height = after.height;
			this.control.actions.notify(this.control, "draw");
		},
		undo: function() {
			let model = this.control.model;
			let before = this.before;
			model.x = before.x;
			model.y = before.y;
			model.width = before.width;
			model.height = before.height;
			this.control.actions.notify(this.control, "draw");
		},
		instance: function(control) {
			let model = control.model;
			return this.sys.extend(this, {
				prior: null,
				next: null,
				control: control,
				before: this.sys.extend(null, {
					x: model.x,
					y: model.y,
					width: model.width || control.kind.minWidth,
					height: model.height || control.kind.minHeight
				}),
				after: this.sys.extend(null, {
					x: model.x,
					y: model.y,
					width: model.width || control.kind.minWidth,
					height: model.height || control.kind.minHeight
				})
			});
		}
	}
}
