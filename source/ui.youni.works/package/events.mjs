const pkg = {
    $public: {
        //type$input: "sense",
        // type$cut: "sense",
        // type$copy: "sense",
        // type$paste: "sense",

        // type$focusin: "sense",
        // type$focusout: "sense",
        // type$focus: "sense",
        // type$blur: "sense",

        // type$click: "sense",
        // type$dblclick: "sense",
        click(event) {
            pkg.sense(event);
        },
        dblclick(event) {
            pkg.sense(event);
        },
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
            event.subject = "touch";
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
        mouseout(event) {
            event.subject = "moveout";
            pkg.sense(event);
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
	getControl(node) {
		while(node) {
			if (node.$peer) return node.$peer;
			node = node.parentNode;
		}
	},
    sense(event) {
		let ctl = pkg.getControl(event.target);
        if (ctl) {
            event.stopPropagation();
            if (!event.subject) event.subject = event.type;
            ctl.sense(event);
            if (!event.subject) event.preventDefault();    
        }
	}
}
export default pkg;

// function SELECTION_EVENT(event) {
//     let ctl = getControl(event.target);
//     event.range = ctl && ctl.owner.selectionRange;
//     ctl = ctl && event.range.commonAncestorContainer;
//     ctl && ctl.owner.sense(ctl, event);
// }
// select: TARGET_EVENT, //may not exist
// change: TARGET_EVENT, //may not exist

// documentEvents: {
// 	selectionstart: SELECTION_EVENT,
// 	selectionchange: SELECTION_EVENT
// }

    // dragstart: TARGET_EVENT,
    // dragover: TARGET_EVENT,
    // drop: TARGET_EVENT,
    // contextmenu: function(event) {
    //     if (event.ctrlKey) {
    //         event.preventDefault();
    //         TARGET_EVENT(event);
    //     }
    // },
    // resize: function(event) {
    // 	let owner = event.target.document.body.$peer.owner;
    // 	owner.send(owner, event);
    // },
