export default {
	text: function(view) {
		view.textContent = view.model;
	},
	markup: function(view) {
		view.innerHTML = view.model;
	},
	composite: function(view) {
		view.parts = this.sys.extend();
		for (let name in this.part) {
			let member = this.part[name].view(view.model);
//			member.classList.add(name + "-part");
//			if (typeof part.width == "number") {
//				item.style.flex = part.width + " 1 " + (part.width * 2) + "cm";
//			}
			view.append(member);
			view.parts[name] = member;
		}
	}
//	collection: function(view, model) {
//		model && model.forEach && model.forEach(data => {
//			let part = this.getPart(view, data);
//			part && part.view(view, data);
//		});
//	},
//	content: function(view, model) {
//		model && model.forEach && viewContent(this, view, model, 0);
//	},
//	parcel: function(view, model) {
//		for (let key in model) {
//			let part = this.getPart(view, model[key]);
//			if (part) {
//				let item = part.view(view, model, key);
//				item.container = view;
//			}
//		}
//	}
}