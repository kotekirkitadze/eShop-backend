const formatMessage = require("./utils/messages");
const {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers,
} = require("./utils/users");

const botName = "Chatcord Bot";

function getSocket(socket) {
	socket.on("joinRoom", ({ userId, room }) => {
		const user = userJoin(socket.id, userId, room);
		socket.join(user.room);

		//socket.emit() single client
		//Welcome current user
		socket.emit("message", formatMessage(botName, "welcome chat app"));

		//Broadcast when a user connects
		// socket.broadcast.emit() - all the clinets who is connected but not who emits
		//io.emit() - all the client in general

		socket.broadcast
			.to(user.room)
			.emit(
				"message",
				formatMessage(botName, `${user.username} has joined the chat`),
			);

		//Send users and room info
		io.to(user.room).emit("roomUsers", {
			room: user.room,
			users: getRoomUsers(user.room),
		});
	});

	//Listen for chat message
	socket.on("chatMessage", (message) => {
		const user = getCurrentUser(socket.id);
		io.to(user.room).emit("message", formatMessage(user.username, message));
	});

	//Runs when client disconnects the chat
	socket.on("disconnect", () => {
		const user = userLeave(socket.id);

		if (user) {
			io.to(user.room).emit(
				"message",
				formatMessage(botName, `${user.username} has left the chat.`),
			);

			//Send users and room info
			io.to(user.room).emit("roomUsers", {
				room: user.room,
				users: getRoomUsers(user.room),
			});
		}
	});
}

module.exports = getSocket;
