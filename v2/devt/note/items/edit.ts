import items from "./items.js";

export {ItemRange, Edit, startEdit, replace, edit, mark, unmark};

interface ItemRange {
	name: string;
	timestamp: number;
	startId: string;
	endId: string;
}

interface Edit extends ItemRange {
	before: string;
	after: string;
}

function replace(article: Element, markup: string, split: boolean) {
	let owner = items.getOwner(article);
	let endNodes = split ? [] : extractLineNodes(article, "end");

	let startEdit = owner.document.getElementById("start-edit");
	let endEdit = owner.document.getElementById("end-edit");

	let startLine = items.getItem(startEdit);
	let endLine = items.getItem(endEdit);

	//Clear the range.
	let range = owner.document.createRange();
	range.setStartAfter(startEdit);
	range.setEndAfter(split ? endEdit : endLine);
	range.deleteContents();

	//Set the range back to after the start tag
	range.setStartAfter(startEdit);
	range.collapse(true);

	//Insert the replacement content.
	endLine = startLine;
	let nodes = markup ? owner.createNodes(markup) : [];
	if (nodes.length) {
		//Insert into first line.
		for (let part of nodes[0].childNodes) {
			range.insertNode(part);
			range.collapse();
		}
		range.setStartAfter(range.startContainer);
		for (let i = 1; i < nodes.length; i++) {
			endLine = nodes[i] as Element;
			
			//Problems with id disappearing.
			owner.getId(endLine);
		
			range.insertNode(endLine);
			range.collapse();
		}
	}
	endLine.append(endEdit);
	for (let node of endNodes) {
		endLine.append(node);
	}

	//Capture the after image for redo
	range.setStartBefore(startLine);
	range.setEndAfter(endLine);
	return owner.markup(range);
}

function startEdit(name: string, range: Range): Edit {
	let article = items.getItems(range);
	if (!article) throw new Error("Range outside Article.");
	if (!article.firstChild) {
		article.innerHTML = "<P> </P>";
		range.selectNodeContents(article.firstChild.firstChild);
	}

	mark(range, "edit");

	let owner = items.getOwner(range);
	let doc = owner.document;

	//Get the line range (start & end lines - can be same line).
	let start = items.getItem(doc.getElementById("start-edit"));
	let end = items.getItem(doc.getElementById("end-edit"));
	if (!start || !end) {
		//TODO find the start/end instead.
		throw new Error("Range not within lines");
	}
	//Having problems with id's disappearing...
	owner.getId(start);
	owner.getId(end);
	
	//Extend the range to whole lines.
	range = range.cloneRange();
	range.setStartBefore(start);
	range.setEndAfter(end);
	let before = owner.markup(range);

	start = start.previousElementSibling;
	end = end.nextElementSibling;
	return {
		name: name,
		timestamp: Date.now(),
		startId: start ? owner.getId(start) : "",
		endId: end ? owner.getId(end) : "",
		before: before,
		after: ""
	}
}

function extractLineNodes(article: Element, point: "start" | "end") {
	let owner = items.getOwner(article);
	let edit = owner.document.getElementById(point + "-edit");
	let line = items.getItem(edit);
	let range = owner.document.createRange();
	range.selectNodeContents(line);
	point == "start" ? range.setEndBefore(edit) : range.setStartAfter(edit);
	console.log(point + " markup", owner.markup(range));
	return owner.createNodes(range);
}

function mark(range: Range, suffix: string) {
	insertMarker(range, "end", suffix);
	insertMarker(range, "start", suffix);
}
/**
 * Removes the start or end point, joining two adjacent text nodes if needed.
 */
 function unmark(range: Range, suffix: string) {
	let doc = range.commonAncestorContainer.ownerDocument;
	//Patch the replacement points.
	let pt = patchPoint(doc.getElementById("start-" + suffix));
	range.setStart(pt.startContainer, pt.startOffset);
	pt = patchPoint(doc.getElementById("end-" + suffix));
	range.setEnd(pt.startContainer, pt.startOffset);
	return range;
}

function patchPoint(point: ChildNode) {
	let range = point.ownerDocument.createRange();
	if (point.previousSibling && point.previousSibling.nodeType == Node.TEXT_NODE &&
		point.nextSibling && point.nextSibling.nodeType == Node.TEXT_NODE
	) {
		let offset = point.previousSibling.textContent.length;
		point.previousSibling.textContent += point.nextSibling.textContent;
		range.setStart(point.previousSibling, offset);
		range.collapse(true);
		point.nextSibling.remove();
	} else {
		range.setStartBefore(point);
		range.collapse(true);
	}
	point.remove();
	return range;
}

function insertMarker(range: Range, point: "start" | "end", suffix: string) {
	let marker = range.commonAncestorContainer.ownerDocument.createElement("I");
	marker.id = point + "-" + suffix;
	range = range.cloneRange();
	range.collapse(point == "start" ? true : false);
	range.insertNode(marker);
	return marker;
}


interface Munged {
	text: string,
	offset: number
}

function mungeText(text: string, offset: number): Munged {
	let out = "";
	for (let i = 0; i < text.length; i++) {
		let ch = text.charAt(i);
		switch (ch) {
			case "\t":
			case "\n":
	
			case " ":
			case "\xa0":
				if (out.length && out.charAt(out.length - 1) != " ") {
					out += " ";
				} else {
					if (i < offset) offset--;
				}
				break;
			case "\r":
				if (i <= offset) offset--;
				break;
			default:
				out += ch;
				break;
		}
	}
	if (out.endsWith(" ")) out = out.substring(0, out.length - 1) + "\xa0";
	return {
		text: out,
		offset: offset
	};
}
function edit(range: Range, replacement: string, offset: number): string {
	let munged = mungeText(replacement, offset);
	let txt = range.commonAncestorContainer;
	txt.textContent = munged.text;
	range.setEnd(txt, munged.offset);
	range.collapse();
	mark(range, "edit");
	let after = items.getItem(txt).outerHTML;
	unmark(range, "edit");
	range.collapse();
	return after;
}