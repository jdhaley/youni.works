export default {
	tasks: {
		type: "list",
		title: "Tasks",
		body: "",
		types: {
			task: "task"
		},
		styles: {
			this: {
				border_radius: "3px",
				border: "1px solid lightsteelblue",
			},
			".dialog>.content": {
				display: "block",
			}
		},
	},
	task: {
		type: "record",
		body: "",
		title: "Task",
		types: {
			activity: {
				type: "text",
				title: "Activity",
				style: {
					flex: "1 1 25%"
				}
			},
			title: {
				type: "text",
				title: "Title",
				style: {
					flex: "1 1 60%"
				}
			},
			status: {
				type: "text",
				title: "Status",
				style: {
					flex: "1 1 15%"				}
				},
			// tasks: {
			// 	type: "list",
			// 	header: "label",
			// 	title: "Sub Tasks",
			// 	types: {
			// 		task: "task"
			// 	}
			// }
		},
		styles: {
			content: {
				display: "flex",
			}
		}
	}
}
