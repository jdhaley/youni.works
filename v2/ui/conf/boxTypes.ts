import { bundle } from "../../base/util.js";
import { Label, Display, DisplayType } from "../display.js";
import shortcuts from "./shortcuts.js";

const conf: bundle<Display> = {
	panel: {
		type: "display",
		header: "label",
		body: "display"
	}
}

export default conf;