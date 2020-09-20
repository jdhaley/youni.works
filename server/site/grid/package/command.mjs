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
			return command;
		}
	},
	ObjectCommand: {
		super$: "Command",
		type: "",
		source: null,
		object: null,
		index: "",
		oldValue: undefined,
		value: undefined,
		undo: function() {
			let type = "";
			let index = this.index;
			let value = this.value;
			console.debug("before undo", this);
			switch (this.type) {
				case "create":
					if (this.object.splice) {
						this.object.splice(this.index, 1);
					} else {
						delete this.object[this.index];
					}
					type = "deleted";
					break;
				case "update":
					value = this.oldValue;
					this.object[this.index] = value;
					type = "updated";
					break;
				case "delete":
					this.object.splice(this.index, 0, value);
					type = "created";
					break;
				case "move":
					if (this.object.splice) {
						let ele = this.object[this.value];
						this.object.splice(this.value, 1);
						this.object.splice(this.index, 0, ele);
						index = this.value;
						value = this.index;
					}					
					type = "moved";
					break;
			}
			console.debug("after undo", this);
			this.transmit(type, index, value);
		},
		redo: function() {
			let type = "";
			let value = this.value;
			switch (this.type) {
				case "create":
					if (this.object.splice) {
						this.object.splice(this.index, 0, value);
					} else {
						this.object[this.index] = value;
					}
					type = "created";
					break;
				case "update":
					this.object[this.index] = value;
					type = "updated";
					break;
				case "delete":
					if (this.object.splice) {
						this.object.splice(this.index, 1);
					} else {
						if (this.object[this.index] != value) {
							console.error("delete problem?");
						}
						delete this.object[this.index];
					}
					type = "deleted";
					break;
				case "move":
					if (this.object.splice) {
						let ele = this.object[this.index];
						this.object.splice(this.index, 1);
						this.object.splice(this.value, 0, ele);
					}
					type = "moved";
					break;
			}
			this.transmit(type, this.index, value);
		},
		transmit: function(type, index, value) {
			let event = {
				type: type,
				source: this.source,
				object: this.object,
				index: index,
				value: value
			}
			if (this.object[Symbol.observers]) {
				//The observers might bind() or unbind() so copy the array...
				for (let on of this.object[Symbol.observers].slice()) {
					on.receive(event);
				}
			}
		}
	},
	ObjectCommands: {
		super$: "Commander",
		use: {
			type$ObjectCommand: "ObjectCommand"
		},
		newCommand: function(type, source, object, index, value, oldValue) {
			let cmd = this.sys.extend(this.use.ObjectCommand, {
				type: type,
				source: source,
				object: object,
				index: index,
				oldValue: oldValue,
				value: value,
				next: null,
				prior: null
			});
			return this.addCommand(cmd);
		},
		create: function(source, index) {
			let cmd = this.newCommand("create", source, source.model, index, this.sys.extend());
			cmd.execute();
		},
		update: function(source, index, value) {
			let object = source.model;
			let cmd = this.lastCommand;
			if (cmd && cmd.value !== value && cmd.object == object && cmd.index == index) {
				cmd.value = value;
			} else if (object[index] !== value) {
				cmd = this.newCommand("update", source, source.model, index, value, object[index]);
			}
			cmd.execute();
		},
		delete: function(source, index, value) {
			let cmd = this.newCommand("delete", source, source.model, index, value);
			cmd.execute();
		},
		move: function(source, index, value) {
			let cmd = this.newCommand("move", source, source.model, index, value);
			cmd.execute();
		}
	},
}