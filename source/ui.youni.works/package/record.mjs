export default {
    type$: "/display",
	/**
	 * A Record supports an object model view.
	 */
	Record: {
		type$: ["Display", "Observer"],
		type$typing: "/util/Typing",
		isDynamic: false,
		extend$conf: {
			memberKeyProperty: "name",
			members: []
		},
		//TODO - work in logic with the extend$ facet (it can accept arrays containing element.name objects)
		//TOOD - re above - more generally - thinking about converting arrays based on key/id value.
		once$members() {
			let conf = this.conf.data.types[this.conf.data.objectType].members;
			let members = Object.create(null);
			for (let key in conf) {
				members[key] = this.owner.create("/ui/record/Property", conf[key]);
			}
			return members;
		},
		view(model) {
			this.super(view, model);
			if (this.isDynamic) this.bindDynamic();
		},
		bindDynamic() {
			let props = Object.create(null);
			for (let name in this.model) {
				if (!this.members[name]) {
					props[name] = this.typing.propertyOf(name, this.model[name]);
				}
			}
			this.properties = props;
			this.forEach(props, this.createContent);
		}
	},
	/**
	 * A member can support the following types:
	 * string, number, boolean, date, values, record, link
	 * All types are composite parts of a record except link.
	 */
	Member: {
		type$: "Display",
		type$textUtil: "/base/util/Text",
		get$name() {
			return this.conf.name;
		},
		getCaption() {
			return this.conf.caption || this.textUtil.captionize(this.conf.name || "");
		},
	},
	Property: {
		type$: "Member",
		type$textUtil: "/base/util/Text",
		getCaption() {
			return this.conf.caption || this.textUtil.captionize(this.conf.name || "");
		},
		get$contentType() {
			return this.owner.editors[this.conf.inputType || this.conf.dataType] || this.owner.editors.string;
		},
		view(model) {
			this.super(view, model);
			let editor = this.owner.create(this.contentType, this.conf);
			this.append(editor);
		},
		modelFor(key) {
			return this.model && this.model[this.conf.name] || "";
		}
	},
}