export default {
	Save: {
		group: "File",
		title: "Save",
		shortcut: "Control+S",
		icon: "<i class='material-icons'>cloud_upload</i>",
		instruction: Save
	}
}

function Save(on, event) {
	event.action = ""; //Stop Control+S to save on client.
	this.fs.save(
		this.owner.location.search + this.part.article.media.extension,
		on.parts.article.outerHTML,
		this.owner
	);
}

