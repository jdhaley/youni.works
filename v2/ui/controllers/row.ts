import { Change } from "../../base/view.js";
import { extend } from "../../base/util.js";
import { Editor } from "../../base/editor.js";
import { RecordEditor } from "../../editor/controls/record.js";
import { RowEditor } from "../../editor/controls/row.js";
import { getHeader, getView } from "../../editor/util.js";
import { UserEvent } from "../ui.js";
import editable from "./editor.js";

export default extend(editable, {
	dblclick(this: RecordEditor, event: UserEvent) {
		event.subject = "";
		if (event.target == this.header) {
			event.subject = "";
			if (this.node.classList.contains("collapsed")) {
				this.header.textContent = this.type.conf.title;
				this.node.classList.remove("collapsed");
			} else {
				let title = this.at.title.content.textContent || "";
				this.header.innerHTML += ": " + `<b>${title}</b>`;
				this.node.classList.add("collapsed");
			}
		}
	},
	click(event: UserEvent) {
		event.subject = "";
		if (event.altKey && getHeader(event.on, event.target as Node)) {
			let range = event.on.ownerDocument.createRange();
			range.selectNode(event.on);
			event.frame.selectionRange = range;
		}
	},
	change(this: RowEditor, event: Change) {
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
		if (this instanceof RowEditor && this == this.rowHeader) {
				event.subject = "";
				addCol(this, getView(range));
		}
	}
});

function addCol(editor: RowEditor, col: Editor) {
	let content = editor.content.children;
	for (let i = 0; i < content.length; i++) {
		if (content[i] == col.node) {
			addColumn(editor, i);
			editor.type; //trigger the new type.
			for (let row = editor.node.nextElementSibling; row; row = row.nextElementSibling) {
				let type = getView(row);
				if (type instanceof RowEditor) {
					addColumn(type, i);
				}
			}			
		}
	}
}
function addColumn(row: RowEditor, index: number) {
	let column = getView(row.content.children[index]);
	let newcol = column.type.view("") as Editor;
	row.content.insertBefore(newcol.node, column.node.nextElementSibling);
}