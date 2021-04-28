export default {
	/*
	status:
		- DELETED
		- NEW
		- MODIFIED
		- ACTIVE
		- PUBLISHED
	 */
	Article: {
		id: "uuid",
		type: "",	
		title: "",
		content: null,
		revision: "2000-01-01T00:00.000",
		status: "",
		editor: ""
	},
	Database: {
		type$service: "Remote",
		schema: {
		},
		objects: {
			"path/to/file": {
				type: "Name",
				content: null
			}
		},
		open: function(pathname, receiver) {
			this.fs.service(receiver, "opened", {
				url: pathname,
				method: "GET"
			});
		},
		save: function(pathname, content, receiver) {
			this.fs.service(receiver, "saved", {
				url: pathname,
				content: content,
				method: "PUT"
			});
		}

	}
}