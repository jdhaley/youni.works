export default {
	package$: "youni.works/diagram/parts",
	use: {
		package$view: "youni.works/web/view"
	},
	public: {
//		view: {
//			type$: "use.view.Viewer",
//			viewName: "div",
//			viewType: "text",					
//		},
		body: {
			type$: "use.view.Viewer",
			viewName: "body",
			viewType: "composite",
			part: {
				main: {
					type$: "use.view.Viewer",
					viewName: "main",
					viewType: "composite",
					part: {
						ribbon: {
							type$: "use.view.Viewer",
							viewName: "nav"
						},
						article: {
							type$: "use.view.Viewer",
							viewName: "article"
						}
					},
					after$control: function(view) {
						view.sense("event", "Click");
						view.sense("event", "KeyDown");
						view.sense("event", "MouseDown");
						view.sense("event", "MouseUp");
					//	view.ownerDocument.sense("selection", "SelectionChange");
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
	}
}
