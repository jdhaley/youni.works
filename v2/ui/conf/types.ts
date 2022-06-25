import {extend} from "../../base/util.js";
import {ListEditor} from "../editors/list.js";
import {RecordEditor} from "../editors/record.js";
import {TextEditor} from "../editors/text.js";


export default Object.freeze(extend(null, {
	text: TextEditor,
	markup: TextEditor,
	list: ListEditor,
	tree: ListEditor,
	record: RecordEditor
}));