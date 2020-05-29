export default {
	package$: "youni.works/base/cmd",
	Command: {
		super$: "Object",
		type$prior: "Command",
		type$next: "Command",
		undo: function() {
		},
		redo: function() {
		}
	},
	Commander: {
		super$: "Object",
		type$lastCommand: "Command",
		undo: function undo() {
			let command = this.lastCommand;
			if (!command.prior) return;
			command.undo();
			this.lastCommand = command.prior;
		},
		redo: function redo() {
			let command = this.lastCommand;
			if (!command.next) return;
			command = command.next;
			command.redo();
			this.lastCommand = command;
		},
		addCommand: function(command) {
			this.lastCommand.next = command;
			command.prior = this.lastCommand;
			this.lastCommand = command;
		}
	}
}