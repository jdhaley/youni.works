export default {
	dummy: {
		title: "Dummy",
		icon: "/res/icons/moon.svg"
	},
	test: {
		title: "Test",
		icon: "/res/icons/activity.svg",
		body: {
			type$: "/ui/tabs/Tabs",
			extend$conf: {
				views: {
					table: {
						title: "Table",
						icon: "/res/icons/work.svg",
						body: {
							type$: "/ui/views/Table",
							extend$conf: {
								data: {
									source: "test",
									view: "Issue",
									set: "issues"	
								}
							}
						}
					},
					note: {
						title: "Note",
						icon: "/res/icons/book.svg",
						type$body: "/ui/note/Note"
					},
					draw: {
						title: "Draw",
						icon: "/res/icons/photo.svg",
						type$body: "/ui/pen/Canvas"
					},
					tree: {
						title: "Tree",
						icon: "/res/icons/folder-open.svg",
						body: {
							type$: "/ui/tree/Item"
						}
					}
				}
			},
			view() {
				this.super(view, this.conf.views);
				this.activate();
			}
		}	
	}
}