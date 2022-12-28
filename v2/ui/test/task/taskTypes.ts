export default {
	taskTable: {
		type: "tasks",
		tableType: "task"
	},
	tasks: {
		type: "list",
		title: "Tasks",
		types: {
			task: "task"
		}
	},
	task: {
		type: "record",
		body: "",
		title: "Task",
		types: {
			activity: {
				type: "text",
				body: "",
				title: "Activity",
				style: {
					flex: "1 1 25%"
				}
			},
			title: {
				type: "text",
				body: "",
				title: "Title",
				style: {
					flex: "1 1 60%"
				}
			},
			status: {
				type: "text",
				body: "",
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
