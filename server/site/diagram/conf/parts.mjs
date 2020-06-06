export default {
	package$: "youni.works/diagram/parts",
	use: {
		package$ui: "youni.works/web/control"
	},
	public: {
		main: {
			type$: "use.ui.Viewer",
			part: {
				ribbon: {
					type$: "use.ui.Viewer",
				},
				body: {
					type$: "use.ui.Viewer",
				}
			},
			after$control: function(view) {
				view.sense("event", "Click");
				view.sense("event", "KeyDown");
				view.sense("event", "MouseUp");
				view.sense("event", "Input");
				view.sense("event", "Cut");
				view.sense("event", "Copy");
				view.sense("event", "Paste");
				view.ownerDocument.sense("selection", "SelectionChange");
			},
			after$initialize: function(conf) {
				let doc = this.owner.window.document;
				doc.execCommand("styleWithCSS", false, false);
				doc.execCommand("defaultParagraphSeparator", false, "P");
				//	sys.implement(this, cmd.Commander);
				//this.lastCommand = this.sys.extend();
			}
		}
	}
}
