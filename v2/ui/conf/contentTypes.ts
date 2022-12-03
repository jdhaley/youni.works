import { bundle } from "../../base/util";

type model = "unit" | "list" | "record";

export default {
	// "widget": "unit",
	// "image": "unit",
	// "video": "unit",
	"text": "unit",
	"line": "unit",

	"form": "record",
	"row": "record",

	"list": "list",
	// "table": "list",
	"markup": "list"
} as bundle<model>

