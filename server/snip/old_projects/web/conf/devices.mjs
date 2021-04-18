export default {
	keyboard: {
		getShortcut: function(event) {
			let key = event.key;
			if (key == " ") key = "Space";
			let mod = "";
			if (event.ctrlKey && key != "Control") mod += "Control+";
			if (event.altKey && key != "Alt") mod += "Alt+";
			if (event.shiftKey && key != "Shift" 
				&& (key.length != 1 || key.toUpperCase() != key.toLowerCase())
			) mod += "Shift+";
			return mod + (key.length == 1 ? key.toUpperCase() : key);			
		},
		getKey: function(event) {
			return event.key;
		},
		getCharacter: function(event) {
			return event.key.length != 1 || event.ctrlKey || event.altKey || event.metaKey ? undefined: event.key;
		}
	},
	mouse: {
		getShortcut: function(event) {
			let mod = "";
			if (event.ctrlKey) mod += "Control+";
			if (event.altKey) mod += "Alt+";
			if (event.shift) mod += "Shift+";
			return mod + this.getKey(event);				
		},
		getKey: function(event) {
			switch (event.button) {
				case 0: return "Button";
				case 1: return "AuxButton";
				case 2: return "ContextButton";
				case 3: return "Back";
				case 4: return "Forward";
				default: return "Other";
			}
		},
		getCharacter: function(event) {
			return undefined;
		}			
	}
}

