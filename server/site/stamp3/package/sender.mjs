export default {
	Sender: {
		send: function down(on, message) {
			for (on of on.childNodes) {
				if (!message.topic) return;
				on.receive && on.receive(message);
				down(on, message);
			}
		},
		display: function(data) {
			this.controller.control(this.context, data);
			this.send(this.context, {
				topic: "draw"
			});
		}
	}
}