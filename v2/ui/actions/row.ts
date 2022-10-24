import { extend } from "../../base/util.js";
import { Change } from "../../base/view.js";
import { getView } from "../../base/article.js";
import { ele } from "../../base/dom.js";

import { RowBox } from "../controls/row.js";
import { getHeader } from "../util.js";
import { Box } from "../box.js";
import { UserEvent } from "../frame.js";

import editable from "./editor.js";

export default extend(editable, {
	dblclick(this: RowBox, event: UserEvent) {
		event.subject = "";
		if (event.target == this.header) {
			event.subject = "";
			if (this.styles.contains("collapsed")) {
				this.header.textContent = this._type.conf.title;
				this.styles.remove("collapsed");
			} else {
				let title = this.get("title").content.textContent || "";
				this.header.innerHTML += ": " + `<b>${title}</b>`;
				this.styles.add("collapsed");
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
				addCol(this, getView(range) as Box);
		}
	}
});

function addCol(editor: RowBox, col: Box) {
	let contents = editor.content.contents;
	for (let i = 0; i < contents.length; i++) {
		if (contents[i] == col.node) {
			addColumn(editor, i);
			editor.type; //trigger the new type.
			for (let row = editor.node.nextElementSibling; row; row = row.nextElementSibling) {
				let type = getView(row);
				if (type instanceof RowBox) {
					addColumn(type, i);
				}
			}			
		}
	}
}
function addColumn(row: RowBox, index: number) {
	let column = getView(row.content.contents[index]);
	let newcol = column.type.create("") as Box;
	ele(column.node).after(newcol.node);
}