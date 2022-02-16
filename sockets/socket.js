const formatMessage = require("./utils/messages");
const {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers,
	getRooms,
} = require("./utils/users");

const botName = "Chatcord Bot";

function getSocket(socket, io) {
	socket.on("joinRoom", ({ userId, room, name, email, userImage }) => {
		const user = userJoin(socket.id, userId, room, name, email, userImage);
		socket.join(user.room);
		console.log(getRooms());
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
				formatMessage(botName, `${user.name} has joined the chat`),
			);

		//Send users and room info
		io.to(user.room).emit("roomUsers", {
			room: user.room,
			users: getRoomUsers(user.room),
		});

		//broadcast list of rooms
		socket.broadcast.emit("roomList", getRooms());
	});

	socket.on("chatMessage", (message) => {
		const user = getCurrentUser(socket.id);
		console.log(socket.id);
		socket
			.to(user.room)
			.emit("message", formatMessage(user.userId, message, user.userImage));
	});

	// socket.on("chatMessage", (message) => {
	// 	const user = getCurrentUser(socket.id);
	// 	console.log(user, message);
	// 	socket.broadcast.emit("message", formatMessage(user.userId, message));
	// });

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
