import {Actions} from "../../base/control.js";
import { ELE, nodeOf, RANGE, TREENODE } from "../../base/dom.js";
import {Frame, UserEvent} from "../ui.js";

export default {
    mousedown: trackEvent,    
    mousemove: trackEvent,
    mouseup: trackEvent,
    mouseout: trackEvent,
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

let TRACK: ELE;

function trackEvent(event: UserEvent) {
    event.track = TRACK;
    sense(event);
    TRACK = event.track;
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
        event.frame.sense(event, event.track || source);
        if (!event.subject) event.preventDefault();    
    }
}

export function viewOf(loc: TREENODE | RANGE): ELE {
 	for (let node  = nodeOf(loc) as TREENODE; node; node = node.parentNode) {
		if (node["$control"]) return node as ELE;
	}
}

export function ownerOf(loc: TREENODE | RANGE): Frame  {
	if (loc instanceof Document) return loc["$owner"];
	return nodeOf(loc).ownerDocument["$owner"];
}
