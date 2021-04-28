export default {
	package$: "youni.works/compiler/target",
	use: {
		package$transform: "youni.works/base/transform"
	},
	Slicer: {
		super$: "use.transform.Targeter",
		target: function(target, content, start, end) {
			content = this.sliceContent(content, start, end);
			target.append(content);
			return content.length;
		},
		sliceContent: function(content, start, end) {
			if (!content) content = [];
			if (end === undefined) end = content.length
			start = 1 * start ? start : 0;
			end =  1 * end ? end : 0;
			return content.slice(start, end);			
		}
	},
	Producer: {
		super$: "Slicer",
		nodeName: "",
		target: function(target, content, start, end) {
			content = this.sliceContent(content, start, end);
			let node = target.owner.create(this.nodeName, content);
			target.append(node);
			return content.length;
		}
	}
}