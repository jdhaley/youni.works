// import { content } from "../base/model.js";
// import { CommandBuffer} from "../base/command.js";
// import { getView } from "./display.js";

// export class Editor {
// 	commandBuffer: CommandBuffer<Range>
// 	edit(commandName: string, range: Range, content?: content): Range {
// 		range = getEditRange(range);
// 		if (range) {
// 			let view = getView(range.commonAncestorContainer);
// 			if (view?.$controller["editor"]) {
// 				let editor = view.$controller["editor"] as editor
// 				if (editor) return editor(this.commandBuffer, commandName, range, content);
// 			}
// 		}
// 	}
// }

// type editor = (commands: CommandBuffer<Range>, commandName: string, range: Range, content?: content) => Range;

// interface View extends Element {
// 	$controller?: {
// 		getContentView(node: Node): View;
// 	}
// }

// function getView(node: Node, parent?: View): View {
// 	if (parent && node != parent) {
// 		while (node.parentElement != parent) node = node.parentElement;
// 		if (node && node["$controller"]) return node as View;
// 	}
// 	while (node && !node["$controller"]) {
// 		node = node.parentElement;
// 	}
// 	return node as View;
// }

