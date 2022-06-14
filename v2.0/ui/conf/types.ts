import {extend} from "../../util.js";

import {RecordType} from "../views/record.js";
import {ListType} from "../views/list.js";
import {TextType} from "../views/text.js";

export default Object.freeze(extend(null, {
	text: TextType,
	markup: TextType,
	list: ListType,
	tree: ListType,
	record: RecordType
}));