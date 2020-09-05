
export default {
	package$: "youni.works/base/control",
	NodeContent: {
		ele: null,
		get$length: function() {
			this.ele.childNodes.length;
		}
		at: function(index) {
			this.ele.childNodes[index].proxy;
		}
		iterator: function()
		}
	},
	NodeProxy: {
		name: "",
		type$content: "NodeContent",
		text: "",
		markup: ""
	}
	Ep: {
		content:
	},
}