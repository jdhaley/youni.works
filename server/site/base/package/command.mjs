export default {
	type$: "/system.youni.works/core",
	Command: {
		type$: "Instance",
		type$prior: "Command",
		type$next: "Command",
		exec: function() {
		},
		undo: function() {
		},
		instance: function() {
			return this.sys.extend(this, {
				prior: null,
				next: null
			});
		}
	},
	Commands: {
		type$: "Instance",
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
			this.lastCommand.next = command;
			command.prior = this.lastCommand;
			this.lastCommand = command;
			return command;
		},
		instance: function() {
			return this.sys.extend(this, {
				lastCommand: this.lastCommand.instance()
			});
		}
	},
	BatchCommand: {
		type$: "Command",
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