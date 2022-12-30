import { implement } from "../../../base/util.js";
import article from "./article.js";
import types from "./types.js";
import baseTypes from "../../conf/baseTypes.js";
export default {
	sources: "/stamp/data",
	actions: article,

	types: implement(null, types, baseTypes),
}
