export default {
	package$: "youni.works/base/command",
	Command: {
		super$: "Object",
		type$prior: "Command",
		type$next: "Command",
		get$execute: function() {
			return this.redo;
		},
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
			if (this.lastCommand) this.lastCommand.next = command;
			command.prior = this.lastCommand;
			this.lastCommand = command;
		}
	},
	ObjectCommand: {
		super$: "Command",
		object: null,
		transmit: function(event) {
			if (this.object[Symbol.observers]) {
				//The observers might bind() or unbind() so copy the array...
				for (let on of this.object[Symbol.observers].slice()) {
					on.receive(event);
				}
			}
		}
	},
	CreateCommand: {
		super$: "ObjectCommand",
		index: "",
		oldValue: undefined,
		newValue: undefined,
		undo: function() {
			this.transmit({
				type: "deleted",
				object: this.object,
			});
		},
		redo: function() {
			this.transmit({
				type: "created",
				object: this.object,
			});
		},
	},
	UpdateCommand: {
		super$: "ObjectCommand",
		index: "",
		oldValue: undefined,
		newValue: undefined,
		undo: function() {
			this.object[this.index] = this.oldValue;
			this.transmit({
				type: "updated",
				object: this.object,
				index: this.index,
				priorValue: this.newValue
			});
		},
		redo: function() {
			this.object[this.index] = this.newValue;			
			this.transmit({
				type: "updated",
				object: this.object,
				index: this.index,
				priorValue: this.oldValue
			});
		}
	},
	ObjectCommands: {
		super$: "Commander",
		createCommand: function(type, object, index, value, oldValue) {
			let cmd = this.sys.extend(this.use.Update, {
				type: type,
				object: null,
				index: index,
				oldValue: null,
				newValue: null,
				next: null,
				prior: null
			});
			cmd.object = object;
			cmd.oldValue = oldValue;
			cmd.newValue = value;
			return cmd;
		},
		use: {
			type$Update: "UpdateCommand"
		},
		create: function(object, index, value) {
			cmd = this.sys.extend(this.use.Update, {
				type: "create",
				object: null,
				index: index,
				oldValue: null,
				newValue: null,
				next: null,
				prior: null
			});
			//TODO if the object is source, it will be converted in the extend above...
			cmd.object = object;
			cmd.redo();
			this.addCommand(cmd);
		},
		update: function(object, index, value) {
			let cmd = this.lastCommand;
			if (cmd && cmd.object == object && cmd.index == index) {
				if (cmd.value !== value) {
					cmd.newValue = value;
					cmd.execute();
				}
			} else if (object[index] !== value) {
				cmd = this.createCommand("update", object, index, value, object[index]);
				cmd.execute();
				this.addCommand(cmd);
			}
		}
	},
}