export default {
	Codec: {
		super$: "Object",
		decodeType: "",
		encodeType: "",
		decode: function(data) {
		},
		encode: function(data) {
		}
	},
	Text_Markup: {
		super$: "Codec",
		decodeType: "text/plain",
		encodeType: "text/html"
	},
	Clipper: {
		super$: "Object",
		getClipboard: function(event) {
			let cb = event.clipboardData;
			let type = event.contentType || "application/json";	
			event.data = cb.getData(type);
			
			switch (type) {
				case "application/json":
					if (event.data) return this.markupJSON(event);
					event.contentType = "text/html";
					event.data = cb.getData("text/html");
					//FALL through
				case "text/html":
					if (event.data) return this.markupHTML(event);
					event.contentType = "text";
					event.data = cb.getData("text");
					//FALL through
				case "text":
					return this.markupText(event);
				default:
					return this.markupOther(event);
			}
		},
		setClipboard: function (event) {
			let cb = event.clipboardData;
			let range = event.on.owner.range;
			let data = range.markup;
			data && cb.setData("text/html", data);	
			data = range.textContent;
			data && cb.setData("text", data);	
			data = event.on.owner.create();
			data.markupContent = range.markup;
			data = this.model(data);
			data = JSON.stringify(data)
			cb.setData("application/json", data);
		},
		replaceSelection: function(event) {
			let range = event.on.owner.range;
			if (range.beforeText == "" && range.afterText == "") {
				range.selectNodeContents(range.container);
				if (!event.markup) event.markup = "<br>";
			}
			range.replace(event.markup);
		},
		markupJSON: function(event) {
			////////////////////add Controller to event ///////////////////////
			let view = this.defineView(event.on);
			let model = JSON.parse(event.data);
			this.render(view, model);
			return view.markupContent;
		},
		markupHTML: function(event) {
			let data = event.data;
			let start = data.indexOf(START_FRAGMENT) + START_FRAGMENT.length;
			let end = data.indexOf(END_FRAGMENT);
			data = data.substring(start, end);
			event.data = event.on.owner.create("div", "hidden", data);
			return this.markupElement(event);
		},
		markupElement: function(event) {
			return event.data.textContent.markup;
		},
		markupText: function(event) {
			return event.data.markup;
		},
		markupOther: function(event) {
			return "";
		}
	}
}