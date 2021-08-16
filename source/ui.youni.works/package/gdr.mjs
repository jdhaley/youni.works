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
                event.character = event.key;
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
                event.track.send(event);
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
                event.track.send(event);
                pkg.TRACK = null;
                return;
            }
        }
    },
    TRACK: null,
    getShortcut(event) {
        let mod = "";
        let key = event.key;
        if (key == " ") key = "Space";
        if (key == "Meta") key = "Control"; // Apple
        if (event.ctrlKey || event.metaKey) mod += "Control+";
        if (event.altKey) mod += "Alt+";
        if (event.shiftKey && (mod || key.length > 1)) mod += "Shift+";
        if (key == "Control" || key == "Alt" || key == "Shift") return mod.substring(0, mod.length - 1);
        if (!mod && key.length == 1) return;
        return mod + key;
    },    
    sense(event) {
		let ctl = pkg.getControl(event.target);
        if (ctl) {
            event.stopPropagation();
            if (!event.subject) event.subject = event.type;
            ctl.sense(event);
            if (!event.subject) event.preventDefault();    
        }
	},
	getControl(node) {
		while(node) {
			if (node.$peer) return node.$peer;
			node = node.parentNode;
		}
	}
}
export default pkg;