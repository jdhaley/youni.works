import { transformConf } from "../../items/baseTransform";

const conf: transformConf = {
	//The following are the core model tags:
	//"ARTICLE": "???"
	"H1": "section",
	"H2": "section",
	"H3": "section",
	"H4": "section",
	"H5": "section",
	"H6": "section",
	"P": "line",
	"UL": "list",
	"OL": "list",
	"LI": "line",
	"EM": "text",
	"STRONG": "text",
	"CITE": "link",
	"#text": "text",
	//The following are transformed into the model
	"default": "transform", //matches other tags not defined here.
	"DIV": "line", 
	"#comment": "strip",
	"STYLE": "strip",
	"SCRIPT": "strip",
	"SPAN": {
		type: "text",
		to: "#text"
	},
	"A": "link",
	"B": {
		type: "text",
		to: "STRONG"
	},
	"I": {
		type: "text",
		to: "EM"
	},

	//BR, WBR, HR
	// "strip": [
	// 	//Document Metadata
	// 	"BASE", "HEAD", "LINK", "META", "STYLE", "TITLE",
	// 	//Scripting
	// 	"SCRIPT", "NOSCRIPT"
	// ],
	// "media": [
	// 	"CANVAS", "MATH", "SVG", "IMG", "VIDEO", "AUDIO", 
	// 	"OBJECT", "IFRAME"
	// ],
}
export default conf;