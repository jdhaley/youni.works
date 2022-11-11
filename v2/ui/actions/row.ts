import { extend } from "../../base/util.js";
import { Change } from "../../base/control.js";
import { ele } from "../../base/dom.js";

import { RowBox } from "../controls/row.js";
import { getBox, getHeader } from "../util.js";
import { Viewbox as Box } from "../box.js";
import { UserEvent } from "../frame.js";

import editable from "./editor.js";

export default extend(editable, {
	dblclick(this: RowBox, event: UserEvent) {
		event.subject = "";
		if (event.target == this.header) {
			event.subject = "";
			if (this.kind.contains("collapsed")) {
				this.header.textContent = this._type.conf.title;
				this.kind.remove("collapsed");
			} else {
				let title = this.get("title").content.textContent || "";
				this.header.markupContent += ": " + `<b>${title}</b>`;
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
				addCol(this, getBox(range));
		}
	}
});

function addCol(editor: RowBox, col: Box) {
	let contents = editor.content.contents;
	for (let i = 0; i < contents.length; i++) {
		if (contents[i] == col.view) {
			addColumn(editor, i);
			editor.type; //trigger the new type.
			for (let row = editor.view.nextElementSibling; row; row = row.nextElementSibling) {
				let type = getBox(row);
				if (type instanceof RowBox) {
					addColumn(type, i);
				}
			}			
		}
	}
}
function addColumn(row: RowBox, index: number) {
	let column = getBox(row.content.contents[index]);
	let newcol = column.type.create("") as Box;
	ele(column.view).after(newcol.view);
}