export default {
	test: {
		title: "Test",
		icon: "/res/icons/activity.svg",
		body: {
			type$: "/ui/tabs/Stack",
			extend$conf: {
				views: {
					draw: {
						title: "Draw",
						icon: "/res/icons/photo.svg",
						type$body: "/ui/pen/Canvas"
					},
					note: {
						title: "Note",
						icon: "/res/icons/book.svg",
						type$body: "/ui/note/Note"
					},
					table: {
						title: "Table",
						icon: "/res/icons/work.svg",
						body: {
							type$: "/ui/grid/Table",
							extend$conf: {
								type$types: "/workbench/types",
								type$data: "/workbench/data"
							}
						}
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
	},
	dummy: {
		title: "Dummy",
		icon: "/res/icons/moon.svg"
	}
}