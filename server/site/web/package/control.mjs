export default {
	View: {
		super$: null,
		once$control: {
			return this.documentOwner.owner.control(this);
		}
	},
	Control: {
		super$: "control.Control",
		get$of: function() {
			return this.view.parentNode && this.view.parentNode.control;
		}
		get$owner: function() {
			return this.view.ownerDocument.owner;
		},
		type$view: "View",
		"@iterator": function* iterate() {
			let length = this.view.children.length;
			for (let i = 0; i < length; i++) yield this.view.children[i].control;
		}
	},
	Owner: {
		super$: "control.Transmitter",
		use: {
			type$Control: "Control"
		},
		var$controller: {
		},
		control: function(view) {
			return this.sys.extend(this.use.Control, {
				view: view,
				controller: this.controller[view.dataset.view]
			});
		}
	}
}