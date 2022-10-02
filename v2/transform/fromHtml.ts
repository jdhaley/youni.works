import { bundle } from "../base/util.js";
import { Part } from "./item.js";

export function fromHtml(source: Node): Part[] {
	let items = [];
	methods.transform(source, items);
	let target = [];
	for (let item of items) {
		if (item.content) target.push(item);
	}
	return target;
}
type transform = (source: Node, target: Part[], level?: number) => void;

const methods: bundle<transform> = {
	strip(source: Node, target: Part[], level?: number) {
	},
	transform(source: Node, target: Part[], level?: number) {
		for (let node of source.childNodes) {
			let fn = tags[node.nodeName] || tags.default;
			fn(node, target, level || 0);
		}
	},
	list(source: Node, target: Part[], level: number) {
		return methods.transform(source, target, (level || 0) + 1);
	},
	section(source: Node, target: Part[]) {
		let item = {
			type$: "heading",
			level: Number.parseInt(source.nodeName.substring(1)),
			content: source.textContent
		}
		target.push(item)
	},
	line(source: Node, target: Part[], level: number) {
		//HANDLE OFFICE
		let className = (source as HTMLElement).className;
		if (className.startsWith("MsoListParagraph")) {
			let lvl = source.firstChild?.nextSibling?.textContent?.substring(0, 1);
			switch (lvl) {
				case "·":
					level = 1;
					source.firstChild.nextSibling.remove();
					break;
				case "o":
					level = 2;
					source.firstChild.nextSibling.remove();
					break;
				case "§":
					level = 3;
					source.firstChild.nextSibling.remove();
			}
		}
			//else if (className.startsWith("Mso")) {
			// 	level = 0;
			// }
		//DONE OFFICE

		let item = {
			type$: "para",
			content: "",
			level: level,
		}
		target.push(item);
		methods.transform(source, target, level);
	},
	text(source: Node, target: Part[]) {
		//For some stupid reason google docs puts everything in a "b" tag (with an id)
		if (source.nodeName == "B" && (source as Element).id) {
			return methods.transform(source, target);
		}
		let text = transformText(source);
		if (!text) return target;
	
		let toName = toNames[source.nodeName] || source.nodeName;
		if (toName != "#text") {
			text = `<${toName}>${text}</${toName}>`
		}

		let item = target.at(-1);
		append(item, text);
	},
	link(source: Element, target: Part[], level: number) {
		let text = source.innerHTML;
		text = `<a href="${source.getAttribute("href")}">${source.innerHTML}</a>`
		let item = target.at(-1);
		append(item, text);
	}
};

function append(item: Part, text: string) {
	if (item) {
		let content = "" + item.content || "";
		let ch = text.at(0);
		let needSpace = ch.toLowerCase() != ch.toUpperCase() || ch == "<";
		if (needSpace && !content.endsWith(" ")) text = " " + text;
		content += text;
		item.content = content;
	}
}
function transformText(source: Node) {
	let text = source.textContent;
	let out = "";
	for (let i = 0; i < text.length; i++) {
		let ch = text.charAt(i);
		switch (ch) {
			//case " ":
			case "\xa0":
			case "\t":
			case "\n":
				if (out.charAt(out.length - 1) != " ") {
					out += " ";
				}
				break;
			case "\r":
				break;
			default:
				out += ch;
				break;
		}
	}
	return out == " " ? "" : out;
}

const toNames = {
	"SPAN": "",
	"B": "STRONG",
	"I": "EM"
}
const tags = {
	//The following are the core model tags:
	//"ARTICLE": "???"
	"H1": methods.section,
	"H2": methods.section,
	"H3": methods.section,
	"H4": methods.section,
	"H5": methods.section,
	"H6": methods.section,
	"P": methods.line,
	"UL": methods.list,
	"OL": methods.list,
	"LI": methods.line,
	"EM": methods.text,
	"STRONG": methods.text,
	"CITE": methods.link,
	"#text": methods.text,

	//The following are transformed into the model
	"default": methods.transform, //matches other tags not defined here.
	"DIV": methods.line, 
	"#comment": methods.strip,
	"STYLE": methods.strip,
	"SCRIPT": methods.strip,
	"SPAN": methods.text,
	"A": methods.link,
	"B": methods.text,
	"I": methods.text
	//BR, WBR, HR
	// "strip": [
	// 	//Document Metadata
	// 	"BASE", "HEAD", "LINK", "META", "STYLE", "TITLE",
	// 	//Scripting
	// 	"SCRIPT", "NOSCRIPT"
	// ],
	// "media": [
	// 	"CANVAS", "MATH", "SVG", "IMG", "VIDEO", "AUDIO", 
	// 	"OBJECT", "IFRAME"
	// ],
}
