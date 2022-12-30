export default {
	task: {
		type: "record",
		title: "Task",
		types: {
			title: {
				type: "text",
				body: null,
				title: "Title",
				styles: {
					this: {
						grid_column: "1 / 5"
					}
				}
			},
			owner: {
				type: "text",
				title: "Owner",
				styles: {
					this: {
					}
				}
			},
			type: {
				type: "text",
				title: "Type",
				styles: {
					this: {
					}
				}
			},
			status: {
				type: "text",
				title: "Status",
				styles: {
					this: {
					}
				}
			},
			due: {
				type: "text",
				title: "Due Date",
				styles: {
					this: {
					}
				}
			},
			desc: {
				type: "note",
				body: "display",
				title: "Description",
				styles: {
					this: {
						grid_row: 3,
						grid_column: "1 / 5"
					}
				}
			},
			tasks: {
				type: "list",
				title: "Sub Tasks",
				types: {
					task: "task"
				},
				styles: {
					this: {
						grid_row: 4,
						grid_column: "1 / 5"
					}
				}
			}
		},
		styles: {
			this: {
				max_width: "800px",
				display: "flex",
				flex: 1
			},
			content: {
				flex: 1,
				display: "grid",
				grid_template_columns: "25% 25% 25% 25%"
			}
		}
	},
	unknown: "text",
	person: {
		type: "record",
		title: "Person",
		types: {
			firstName: {
				type: "text",
				title: "Given Name",
			},
			lastName: {
				type: "text",
				title: "Surname",
			},
			email: {
				type: "text",
				title: "E-mail",
			},
			address: {
				type: "address",
				title: "Address"
			}
		}
	},
	address: {
		type: "record",
		title: "Address",
		types: {
			street: {
				type: "text",
				title: "Street"
			},
			city: {
				type: "text",
				title: "City"
			},
			code: {
				type: "text",
				title: "Postal Area Code"
			}
		}
	},
	note: {
		type: "markup",
		body: null,
		types: {
			para: {
				type: "line"
			},
			heading: {
				type: "line"
			},
			//worktask: "worktask"
		}
	},
	// row: "row",
	// cell: {
	// 	type: "text",
	// 	container: false,
	// 	tagName: "ui-cell"
	// },
	// tasks: {
	// 	type: "list",
	// 	title: "Tasks",
	// 	types: {
	// 		task: "task"
	// 	}
	// },
	// //Task model: Category: Title/Short Description: Due Date Time: : Status: Priority (optional): Assigned To (optional)
	// worktask: {
	// 	type: "row",
	// 	title: "Task",
	// 	tableTitle: "Tasks",
	// 	types: {
	// 		category: {
	// 			type: "cell",
	// 			title: "Category"
	// 		},
	// 		title: {
	// 			type: "cell",
	// 			title: "Title",
	// 		},
	// 		due: {
	// 			type: "cell",
	// 			title: "Due"
	// 		},
	// 		status: {
	// 			type: "cell",
	// 			title: "Status"
	// 		},
	// 		priority: {
	// 			type: "cell",
	// 			title: "Priority"
	// 		},
	// 		owner: {
	// 			type: "cell",
	// 			title: "Owner"
	// 		}
	// 	}
	// },
	// //Work log model: Start Date Time to End Date Time: Category: Title/Short Description
	// worklog: {
	// 	type: "row",
	// 	title: "Log",
	// 	types: {
	// 		startDate: {
	// 			type: "text",
	// 			title: "From"
	// 		},
	// 		endDate: {
	// 			type: "text",
	// 			title: "From"
	// 		},
	// 		category: {
	// 			type: "text",
	// 			title: "Category"
	// 		},
	// 		title: {
	// 			type: "text",
	// 			title: "Title",
	// 		}	
	// 	}
	//}
}