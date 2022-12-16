import { bundle } from "../../base/util.js";
import { Display } from "../display.js";

const conf: bundle<Display> = {
	panel: {
		type: "display",
		header: "label",
		body: "display"
	}
}

export default conf;