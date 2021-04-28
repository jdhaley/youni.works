export default {
	package$: "youni.works/base/transform",
	Parser: {
		super$: "Object",		
		parse: function(content, start, target) {
			return 0;
		}
	},
	Targeter: {
		super$: "Object",
		target: function(target, content, start, end) {
			if (end === undefined && content) end = content.length
			start = 1 * start ? start : 0;
			end =  1 * end ? end : 0;
			for (let i = start; i < end; i++) {
				target.append(content.at(i));
			}
		}
	},
	Transformer: {
		super$: "Object",
		type$parser: "Parser",
		type$targeter: "Targeter",
		parse: function(source, start, target) {
			let match = this.parser && this.parser.parse(source, start, target);
			if (match && target) {
				this.target(target, source, start, start + match);
			}
			return match;
		},
		target: function(target, content, start, end) {
			if (this.targeter) {
				return this.targeter.target(target, content, start, end);
			}
		}
	}
}