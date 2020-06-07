export default {
	package$: "youni.works/diagram/parts",
	use: {
		package$view: "youni.works/web/view"
	},
	public: {
		body: {
			type$: "use.view.Viewer",
			viewName: "body",
			viewType: "composite",
			part: {
				view: {
					type$: "use.view.Viewer",
					viewName: "div",
					viewType: "text",					
				},
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
						let control = view.control;
						control.sense("event", "Click");
						control.sense("event", "KeyDown");
						control.sense("event", "MouseDown");
						control.sense("event", "MouseUp");
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
