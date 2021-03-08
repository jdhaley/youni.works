export default {
	package$: "youni.works/base/command",
	Command: {
		super$: "Object",
		type$prior: "Command",
		type$next: "Command",
		exec: function() {
		},
		undo: function() {
		}
	},
	Commander: {
		super$: "Object",
		type$lastCommand: "Command",
		undo: function() {
			let command = this.lastCommand;
			if (!command.prior) return;
			command.undo();
			this.lastCommand = command.prior;
		},
		redo: function() {
			let command = this.lastCommand;
			if (!command.next) return;
			command = command.next;
			command.exec();
			this.lastCommand = command;
		},
		addCommand: function(command) {
			if (this.lastCommand) this.lastCommand.next = command;
			command.prior = this.lastCommand;
			this.lastCommand = command;
			return command;
		}
	},
	BatchCommand: {
		super$: "Command",
		commands: null,
		undo: function() {
			//To undo a batch, each command must be done in reverse order.
			for (let i = this.commands.length - 1; i >= 0; i--) {
				this.commands[i].undo();
			}
		},
		exec: function() {
			for (let cmd of this.commands) {
				cmd.exec();
			}
		}
	}
}