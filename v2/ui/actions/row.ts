import { Box } from "../display.js";
import { extend } from "../../base/util.js";
import { ele } from "../../base/dom.js";

import { RowBox } from "../controls/row.js";
import { UserEvent } from "../frame.js";
import { getContentView, getHeader } from "../uiUtil.js";

import editable from "./edit/editor.js";

import { Change } from "../article.js";
import { Viewer } from "../../base/view.js";

export default extend(editable, {
	dblclick(this: RowBox, event: UserEvent) {
		event.subject = "";
		if (event.target == this.header) {
			event.subject = "";
			if (this.kind.contains("collapsed")) {
				this.header.view.textContent = this.type.conf.title;
				this.kind.remove("collapsed");
			} else {
				let title = this.get("title").content.textContent || "";
				this.header.view.innerHTML += ": " + `<b>${title}</b>`;
				this.kind.add("collapsed");
			}
		}
	},
	click(this: RowBox, event: UserEvent) {
		event.subject = "";
		if (event.altKey && getHeader(this, event.target as Node)) {
			let range = event.on.ownerDocument.createRange();
			range.selectNode(event.on);
			event.frame.selectionRange = range;
		}
	},
	change(this: RowBox, event: Change) {
		/* Clears the rowType on change of the header */

		let header = this.rowHeader;
		if (header == this) {
			delete this["_type"];
			console.log(this.type);
		}
	},
	insert(this: RowBox, event: UserEvent) {
		let range = event.range;
		if (!range.collapsed) return;
		if (this instanceof RowBox && this == this.rowHeader) {
				event.subject = "";
				addCol(this, getContentView(range));
		}
	}
});

function addCol(editor: RowBox, col: Viewer) {
	let contents = editor.content.childNodes;
	for (let i = 0; i < contents.length; i++) {
		if (contents[i] == col.view) {
			addColumn(editor, i);
			editor.type; //trigger the new type.
			for (let row = editor.view.nextElementSibling; row; row = row.nextElementSibling) {
				let type = getContentView(row);
				if (type instanceof RowBox) {
					addColumn(type, i);
				}
			}			
		}
	}
}
function addColumn(row: RowBox, index: number) {
	let column = getContentView(row.content.childNodes[index]);
	let newcol = column.type.create("") as Box;
	ele(column.view).after(newcol.view);
}