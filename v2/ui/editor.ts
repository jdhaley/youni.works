import { content } from "../base/model.js";
import { CommandBuffer} from "../base/command.js";


export class Editor {
	commandBuffer: CommandBuffer<Range>
	edit(commandName: string, range: Range, content?: content): Range {
		range = getEditRange(range);
		if (range) {
			let view = getView(range.commonAncestorContainer);
			if (view?.$controller["editor"]) {
				let editor = view.$controller["editor"] as editor
				if (editor) return editor(this.commandBuffer, commandName, range, content);
			}
		}
	}
}

type editor = (commands: CommandBuffer<Range>, commandName: string, range: Range, content?: content) => Range;

interface View extends Element {
	$controller?: {
		getContentOf(node: Node): View;
	}
}

function getView(node: Node, parent?: View): View {
	if (parent && node != parent) {
		while (node.parentElement != parent) node = node.parentElement;
		if (node && node["$controller"]) return node as View;
	}
	while (node && !node["$controller"]) {
		node = node.parentElement;
	}
	return node as View;
}

function getEditRange(range: Range): Range {
	range = range.cloneRange();
	let view = getView(range.commonAncestorContainer);
	let content = view?.$controller.getContentOf(view);
	if (!content) return;

	//TODO check elements after each range change?
	if (view != content) {
		let start = getView(range.startContainer, view);
		let end = getView(range.endContainer, view);

		if (isBefore(start, content)) range.setStart(content, 0);
		if (isAfter(start, content)) {
			range.setStart(content, content.childNodes.length);
			range.collapse(true);
		}
		if (isAfter(end, content)) range.setEnd(content, content.childNodes.length);
	}
	return range;
}

function isAfter(node: Node, rel: Node): boolean {
	if (node.parentNode != rel.parentNode) while (node) {
	   if (node.nextSibling == rel) return true;
	   node = node.nextSibling;
   }
   return false;
}
function isBefore(node: Node, rel: Node): boolean {
	if (node.parentNode != rel.parentNode) while (node) {
	   if (node.previousSibling == rel) return true;
	   node = node.previousSibling;
   }
   return false;
}
