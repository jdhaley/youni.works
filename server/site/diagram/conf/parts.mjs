export default {
	package$: "youni.works/diagram/parts",
	use: {
		package$view: "youni.works/web/view",
		package$ui: "youni.works/web/ui",
		package$graphic: "youni.works/web/graphic"
	},
	public: {
		body: {
			type$: "use.view.Viewer",
			viewName: "body",
			viewType: "composite",
			part: {
				main: {
					type$: "use.ui.Main",
					part: {
						ribbon: {
							type$: "use.ui.Ribbon",
							viewName: "nav"
						},
						article: {
							type$: "use.graphic.Graphic",
						}
					},
					extend$shortcut: {
					},
//					extend$action: {
//						Input: DEFAULT,
//						Cut: DEFAULT,
//						Copy: DEFAULT,
//						Paste: DEFAULT,
//						Delete: DEFAULT,
//						Insert: DEFAULT,
//						Erase: DEFAULT,
//						Split: DEFAULT,
//						Join: DEFAULT,
//						Promote: DEFAULT,
//						Demote: DEFAULT,
//						Character: DEFAULT,
//					},
					after$control: function(view) {
						view.sense("event", "Click");
						view.sense("event", "KeyDown");
						view.sense("event", "MouseDown");
						view.sense("event", "MouseUp");
					},
					after$initialize: function(conf) {
					}
				}
			}
		}
	}
}
