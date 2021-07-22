export default {
	type$: "/util",
	Command: {
		type$: "Factory",
		type$prior: "Command",
		type$next: "Command",
		exec() {
		},
		undo() {
		},
		instance() {
			return this.create(this, {
				prior: null,
				next: null
			});
		}
	},
	Commands: {
		type$: "Factory",
		type$lastCommand: "Command",
		undo() {
			let command = this.lastCommand;
			if (!command.prior) return;
			command.undo();
			this.lastCommand = command.prior;
		},
		redo() {
			let command = this.lastCommand;
			if (!command.next) return;
			command = command.next;
			command.exec();
			this.lastCommand = command;
		},
		addCommand(command) {
			this.lastCommand.next = command;
			command.prior = this.lastCommand;
			this.lastCommand = command;
			return command;
		},
		instance() {
			return this.create(this, {
				lastCommand: this.lastCommand.instance()
			});
		}
	},
	BatchCommand: {
		type$: "Command",
		commands: null,
		undo() {
			//To undo a batch, each command must be done in reverse order.
			for (let i = this.commands.length - 1; i >= 0; i--) {
				this.commands[i].undo();
			}
		},
		exec() {
			for (let cmd of this.commands) {
				cmd.exec();
			}
		}
	}
}