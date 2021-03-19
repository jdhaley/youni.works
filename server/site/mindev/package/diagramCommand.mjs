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
		exec: function() {
			let control = this.control;
			control.set(control.model, this.after);
			control.actions.notify(control, "draw");
		},
		undo: function() {
			let control = this.control;
			control.set(control.model, this.before);
			control.actions.notify(control, "draw");
		},
		update: function() {
			let control = this.control;
			control.set(this.after, control.model);
			control.actions.notify(control, "draw");
		},
		instance: function(control) {
			let model = control.model;
			let before = this.sys.extend();
			control.set(before, model);
			let after = this.sys.extend();
			control.set(after, model);
			return this.sys.extend(this, {
				prior: null,
				next: null,
				control: control,
				before: before,
				after: after
			});
		}
	}
}
