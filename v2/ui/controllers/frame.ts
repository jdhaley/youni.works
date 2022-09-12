import {Actions} from "../../base/controller.js";
import {Frame, UserEvent} from "../ui.js";

export default {
    mousedown: sense,    
    mousemove: sense,
    mouseup: sense,
    mouseout: sense,
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
    let source = viewOf(event.range ? event.range.commonAncestorContainer : event.target as Node);
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

export function viewOf(node: Node | Range): HTMLElement {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["$controller"]) return node as HTMLElement;
		node = node.parentElement;
	}
}

export function ownerOf(node: Node | Range): Frame  {
	if (node instanceof Range) node = node.commonAncestorContainer;
	if (node instanceof Document) return node["$owner"];
	return (node as Node).ownerDocument["$owner"];
}
