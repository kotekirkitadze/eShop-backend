const moment = require("moment");

function formatMessage(username, text, image = "") {
	return {
		username,
		text,
		time: moment().format("h:mm a"),
		image,
	};
}

module.exports = formatMessage;
