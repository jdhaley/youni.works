

const methods = {
	strip(source: Node, target: HTMLElement, level: number) {
		return target;
	},
	transform(source: Node, target: HTMLElement, level?: number) {
		for (let node of source.childNodes) {
			let type = this.types[node.nodeName] || this.types.default;
			target = type.transform(node, target, level || 0);
		}
		return target;
	},
	list(source: Node, target: HTMLElement, level: number) {
		return this.types.default.transform(source as HTMLElement, target, level + 1);
	},
	section(source: Node, target: HTMLElement, level: number) {
		let context = target.parentElement;
		if (target.nodeName == "P" && context.nodeName == "ARTICLE") {
		} else {
			console.log("unexpected target state.");
		}
		//Create a new target if the current one has content.
		if (target.childNodes.length) {
			target = context.ownerDocument.createElement("P");
			context.append(target);
		}
		target.setAttribute("role", "heading");
		target.ariaLevel = source.nodeName.substring(1);
		target.textContent = source.textContent;
		target = context.ownerDocument.createElement("P");
		context.append(target);
		return target;
	},
	line(source: Node, target: HTMLElement, level: number) {
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
		} else if (className.startsWith("Mso")) {
			level = 0;
		}
		//DONE.
		let context = target.parentElement;
		if (target.nodeName == "P" && context.nodeName == "ARTICLE") {
		} else {
			console.log("unexpected target state.");
		}
		//Create a new target if the current one has content.
		if (target.childNodes.length) {
			target = context.ownerDocument.createElement("P");
			context.append(target);
		}
		if (level) {
			target.setAttribute("role", "listitem");
			target.ariaLevel = "" + level;
		} else {
			target.removeAttribute("role");
			target.removeAttribute("aria-level");
		}
		return this.types.default.transform(source as HTMLElement, target, level);
	},
	text(source: Node, target: HTMLElement, level: number) {
		//For some stupid reason google docs puts everything in a "b" tag (with an id)
		if (source.nodeName == "B" && (source as Element).id) {
			return this.types.default.transform(source, target, level);
		}
		let text = transformText(source);
		if (!text) return target;
	
		let toName = this.to as string || source.nodeName;
		if (target.lastChild?.nodeName == toName) {
			//Merge adjacent nodes of the same name.
			target.lastChild.textContent += text;
		} else if (toName == "#text") {
			target.append(text);
		} else {
			let node = target.ownerDocument.createElement(toName);
			node.textContent = text;
			target.append(node);
		}
		return target;
	},
	link(source: Node, target: HTMLElement, level: number) {
		let link = target.ownerDocument.createElement("CITE");
		link.textContent = transformText(source);
		link.dataset.url = getLink(source as Element);
		target.append(link);
		return target;

		function getLink(ele: Element) {
			return ele.getAttribute("data-url") || ele.getAttribute("href");
		}
	}
};

function transformText(source: Node) {
	let text = source.textContent;
	let out = "";
	for (let i = 0; i < text.length; i++) {
		let ch = text.charAt(i);
		switch (ch) {
			case " ":
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
	"SPAN": {
		type: methods.text,
		to: "#text"
	},
	"A": methods.link,
	"B": {
		type: methods.text,
		to: "STRONG"
	},
	"I": {
		type: methods.text,
		to: "EM"
	},
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
