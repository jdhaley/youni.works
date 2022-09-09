import {Actions} from "../../base/controller.js";
import { rangeIterator } from "../editor/util.js";
import {Frame, UserEvent} from "../ui.js";

let TRACK: UserEvent = null;

// export function selection(range: Range) {
//     let doc = range.commonAncestorContainer.ownerDocument;
//     for (let ele of doc.getElementsByClassName("selected")) {
//         ele.classList.remove("selected");
//     }
//     let it = rangeIterator(range);
// 	for (let node = it.nextNode(); node; node = it.nextNode()) {
// 		if (node.nodeType == Node.TEXT_NODE) {
//             if (range.startContainer == node || range.endContainer == node) {
//                 node.parentElement.classList.remove("selected");
//             }
// 		} else if (node instanceof Element && node.classList.contains("view")) {
//             node.parentElement.classList.add("selected");
//         }
// 	}
// }
let priorView: Element;
export default {
    selectionchange(event: UserEvent) {
        let owner = ownerOf(event.target as Node);
        let range = owner.selectionRange;
        priorView?.classList.remove("active");
        for (let ele = range.commonAncestorContainer as Element; ele; ele = ele.parentElement) {
            if (ele.classList?.contains("view")) {
                ele.classList.add("active");
                priorView = ele;
                return;
            }
        }
    },
    beforeinput: rangeEvent,
    input: sense,
    cut: rangeEvent,
    copy: rangeEvent,
    paste: rangeEvent,
    keydown(event: UserEvent) {
        event.range = ownerOf(event.target as Node).selectionRange;
        event.source = viewOf(event.range.commonAncestorContainer);
        event.shortcut = getShortcut(event);
        sense(event);
    },
    mousedown(event: UserEvent) {
        sense(event);
//         if (event.ctrlKey) {
//             event.subject = "select";
//             sense(event);
//             return;
//         }
//         event.subject = "touch";
//         sense(event);
//         if (event.track) {
// //          event.preventDefault();
//             TRACK = event;
//         } else {
//             TRACK = null;
//         }
    },    
    mousemove(event: UserEvent) {
        sense(event);
        // let priorEvent = TRACK;
        // if (priorEvent) {
        //     event.preventDefault();
        //     event.subject = "drag";
        //     event.track = priorEvent.track;
        //     event.moveX = event.x - priorEvent.x;
        //     event.moveY = event.y - priorEvent.y;
        //     sense(event);
        //   //  ownerOf(event.track).sense(event, event.track);
        //     TRACK = event;
        //     return;
        // } else {
        //     event.subject = "moveover";
        //     sense(event);
        // }
    },
    click(event: UserEvent) {
        sense(event);
    },
    dblclick(event: UserEvent) {
        sense(event);
    },
    contextmenu(event: UserEvent) {
        if (event.ctrlKey) event.preventDefault();
    },
    mouseup(event: UserEvent) {
        sense(event);
        // let priorEvent = TRACK;
        // event.preventDefault();
        // event.subject = "release"
        // if (priorEvent) {
        //     event.track = priorEvent.track;
        //     event.source = event.track;
        //     event.moveX = 0;
        //     event.moveY = 0;
        // }
        // sense(event);
        // TRACK = null;
    },
    mouseout(event: UserEvent) {
        event.subject = "moveout";
        sense(event);
    }
} as Actions;

function  getShortcut(event: UserEvent) {
    let mod = getModifiers(event);
    let key = event.key;
    //If the key being pressed is a modifier, return the modifier combination only.
    if (key == "Control" || key == "Alt" || key == "Shift") return mod;
    //Treat the spacebar as a command key. It can get routed to a charpress later if desired.
    if (key == " ") key = "Space";
    if (mod) return mod + "+" + key;
    return key.length > 1 ? key : "";
}
/**
 * Cross-platform modifier key sensor.
 * TODO: support mouse event (need to sense the buttons rather than key.)
 */
function getModifiers(event: UserEvent) {
    let mod = "";
    let key = event.key as string;
    if (key == " ") key = "Space";
    //We don't differentiate between the Meta Key (apple or windows key) and the Control key.
    if (key == "Meta") key = "Control"; // Apple
    if (event.ctrlKey || event.metaKey) mod += "Control+";
    //Note: The Apple option key is the same as the altKey.
    if (event.altKey) mod += "Alt+";
    //We don't treat the Shift key as a modifier if a character key is pressed.
    //e.g. "Control+a" and "Control+A" are returned.
    //TODO test with Cap Lock for the above. May need to change.
    if (event.shiftKey && (mod || key.length > 1)) mod += "Shift+";
    if (mod.length) mod = mod.substring(0, mod.length - 1);
    return mod;
}

function rangeEvent(event: UserEvent) {
    event.range = ownerOf(event.target as Node).selectionRange;
    event.source = viewOf(event.range.commonAncestorContainer);
    sense(event);
}

function sense(event: UserEvent) {
    let source = viewOf(event.source || event.target as Node);
    if (source) {
        event.frame = ownerOf(source);
        event.source = source;
        event.from = ownerOf(event.target as Node);
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
