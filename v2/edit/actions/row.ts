import { extend } from "../../base/util.js";
import { Editor } from "../../display/editor.js";
import { RecordBox } from "../../display/controls/record.js";
import { RowBox } from "../../display/controls/row.js";
import { getHeader } from "../../display/util.js";
import { UserEvent } from "../../ui/ui.js";
import editable from "./editor.js";
import { ElementView, getView } from "../../display/view.js";
import { Change } from "../../display/FROMVIEW.js";
import { View } from "../../base/view.js";
export default extend(editable, {
	dblclick(this: RecordBox, event: UserEvent) {
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
	insert(this: Editor, event: UserEvent) {
		let range = event.range;
		if (!range.collapsed) return;
		if (this instanceof RowBox && this == this.rowHeader) {
				event.subject = "";
				addCol(this, getView(range));
		}
	}
});

function addCol(editor: RowBox, col: ElementView) {
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
	let newcol = column.type.create("") as Editor;
	column.node.after(newcol.node);
}