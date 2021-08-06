const pkg = {
    $public: {
        keydown(event) {
            let shortcut = pkg.getShortcut(event);
            if (shortcut) {
                console.log(shortcut);
                event.subject = "command";
                event.shortcut = shortcut;
            } else {
                console.log(event.key);
                event.subject = "charpress";
            }
            pkg.sense(event);
        },
        mousedown(event) {
            event.subject = "grab";
            pkg.sense(event);
            if (event.track) {
//                event.preventDefault();
                pkg.TRACK = event;
            } else {
                pkg.TRACK = null;
            }
        },    
        mousemove(event) {
            let priorEvent = pkg.TRACK;
            if (priorEvent) {
                event.preventDefault();
                event.subject = "drag";
                event.track = priorEvent.track;
                event.moveX = event.x - priorEvent.x;
                event.moveY = event.y - priorEvent.y;
                event.track.owner.send(event.track, event);
                pkg.TRACK = event;
                return;
            } else {
                event.subject = "moveover";
                pkg.sense(event);
            }
        },
        mouseup(event) {
            let priorEvent = pkg.TRACK;
            if (priorEvent) {
                event.preventDefault();
                event.subject = "release"
                event.track = priorEvent.track;
                event.moveX = 0;
                event.moveY = 0;
                event.track.owner.send(event.track, event);
                pkg.TRACK = null;
                return;
            }
        }
    },
    TRACK: null,
    getShortcut(event) {
        let command = event.key;
        if (command == " ") command = "Space";
        if (command == "Meta") command = "Control";
        // switch (command) {
        //     case "Control":
        //     case "Alt":
        //     case "Shift":
        //     case "Meta":
        //         return;
        //     case " ":
        //         command = "Space";
        // }
        if (event.shiftKey && command.indexOf("Shift") < 0) command = "Shift+" + command;
        if (event.altKey && command.indexOf("Alt") < 0) command = "Alt+" + command;
        if ((event.ctrlKey || event.metaKey) && command.indexOf("Control") < 0) command = "Control+" + command;
        return command.length > 1 ? command : "";
    },    
    sense(event) {
		let ctl = pkg.getControl(event.target);
		ctl && ctl.owner.sense(ctl, event);
	},
	getControl(node) {
		while(node) {
			if (node.$peer) return node.$peer;
			node = node.parentNode;
		}
	}
}
export default pkg;