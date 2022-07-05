import {extend} from "../../base/util.js";
import {ListEditor} from "../editor/list.js";
import {RecordEditor} from "../editor/record.js";
import {TextEditor} from "../editor/text.js";


export default Object.freeze(extend(null, {
	text: TextEditor,
	markup: TextEditor,
	list: ListEditor,
	tree: ListEditor,
	record: RecordEditor
}));