const pkg = {
    $public: {
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