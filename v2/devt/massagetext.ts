import { CHAR } from "../base/util";
import { getContent } from "../ui/editor/util";

/*
	edge: start == -1, inside == 0, end == 1
*/
function massageText(range: Range, content: string) {
	let mark = CHAR.STX;
	let ctx = getContent(range);
	range.insertNode(ctx.ownerDocument.createTextNode(mark));
	//txt is the entire text content of the ctx (as a single string) with the range marked.
	let txt = ctx.textContent;
	txt = txt.replace(/[ ][ ]+/g, " ");
	txt = txt.replaceAll(CHAR.NBSP, " ");
	txt = txt.replaceAll(CHAR.ZWSP, "");

	// let target = "";
	// for (let i = 0; i < source.length; i++) {
	// 	switch (source[i]) {
	// 		case CHAR.ZWSP:
			
	// 		case CHAR.NBSP:
	// 		case 
	// 	}
	// }
	let edge = 0;
	if (txt.startsWith(mark)) edge = -1;
	if (txt.endsWith(mark)) edge = 1;
	//if the range was at the start or end, remove the marker so trim, etc. works.
	if (edge) txt = txt.replace(mark, "");

	txt = txt.trim();

	let index = txt.indexOf(mark);
	if (content == " ") {
		if (txt[index - 1] == " " || txt[index + 1] == " ") return;
	}

	//let index = txt.lastIndexOf(mark);
	txt = txt.replace(mark, "");
	if (content == " " &&  index == txt.length - 1) {
		content = CHAR.NBSP;
	}
	console.log(txt);

	//let index = txt.indexOf(mark);
	txt = txt.replace(mark, "");
	ctx.textContent = txt;
	if (txt) {
		range.setStart(ctx.firstChild, index);
	} else {
		range.setStart(ctx, 0);
	}
	range.collapse(true);
}