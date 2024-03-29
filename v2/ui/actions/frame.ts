import { Actions } from "../../base/controller.js";
import { ELE, NODE, RANGE } from "../../base/dom.js";

import { Frame, UserEvent } from "../../control/frame.js";

export default {
    pointerdown: sense,    
    pointermove: sense,
    pointerup: sense,
    pointerout: sense,
    click: sense,
    dblclick: sense,
    contextmenu:sense,
    input: sense,

    selectionchange: rangeEvent,
    keydown: rangeEvent,
    beforeinput: rangeEvent,
    cut: rangeEvent,
    copy: rangeEvent,
    paste: rangeEvent
} as Actions;

function rangeEvent(event: UserEvent) {
    event.range = ownerOf(event.target as Node).selectionRange;
    sense(event);
}

function sense(event: UserEvent) {
    let source = viewOf(event.range ? event.range.commonAncestorContainer : event.target);
    if (source) {
        event.frame = ownerOf(source);
        event.source = source;
        event.from = event.frame;
        event.direction = "up";
        if (!event.subject) event.subject = event.type;
 
        event.stopPropagation();
        event.frame.sense(event, source);
        if (!event.subject) event.preventDefault();    
    }
}

function viewOf(loc: NODE | RANGE): ELE {
 	for (let node  = nodeOf(loc); node; node = node.parentNode) {
		if (node["$control"]) return node as ELE;
	}
}

function ownerOf(loc: NODE | RANGE): Frame  {
	if (loc instanceof Document) return loc["$owner"];
	return nodeOf(loc).ownerDocument["$owner"];
}

function nodeOf(loc: NODE | RANGE): NODE {
	if (loc instanceof Range) loc = loc.commonAncestorContainer;
	return loc instanceof Node ? loc : null;
}
