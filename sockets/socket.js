const formatMessage = require("./utils/messages");
const {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers,
	getRooms,
	notSupportUser,
} = require("./utils/users");

const botName = "Chatcord Bot";

function getSocket(socket, io) {
	socket.emit("roomList", getRooms());
	socket.on(
		"joinRoom",
		({ userId, room, name, email, userImage, isSupport }) => {
			const user = userJoin(
				socket.id,
				userId,
				room,
				name,
				email,
				userImage,
				isSupport,
			);
			socket.join(user.room);
			// console.log(getRooms());
			//socket.emit() single client
			//Welcome current user
			socket.emit("message", formatMessage(botName, "welcome chat app"));

			//Broadcast when a user connects
			// socket.broadcast.emit() - all the clinets who is connected but not who emits
			//io.emit() - all the client in general

			socket.broadcast.to(user.room).emit(
				"botMessage",
				formatMessage(
					botName,
					{
						text: `${user.name} has joined the chat`,
						roomId: user.room,
					},
					user.userImage,
				),
			);

			socket.on("startWriting", (controller) => {
				socket.broadcast
					.to(user.room)
					.emit("startWriting", { controller: controller, roomId: user.room });
			});
			//Send users and room info
			io.to(user.room).emit("roomUsers", {
				room: user.room,
				users: getRoomUsers(user.room),
			});

			//broadcast list of rooms
			socket.broadcast.emit("roomList", getRooms());
		},
	);

	socket.on("chatMessage", (message) => {
		const user = getCurrentUser(socket.id);
		// console.log(socket.id);
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
			socket
				.to(user.room)
				.emit(
					"message",
					formatMessage(botName, `${user.name} has left the chat.`),
				);
			//  socket.emit("roomList", getRooms());
			// Send users and room info
			io.to(user.room).emit("roomUsers", {
				room: user.room,
				users: getRoomUsers(user.room),
			});
		}
	});

	socket.on("userCompleteChat", (id) => {
		const user = userLeave(socket.id);
		if (user) {
			socket
				.to(user.room)
				.emit(
					"message",
					formatMessage(botName, `${user.name} has left the chat.`),
				);
			notSupportUser(id);
			//Send users and room info
		}
		console.log(getRooms());
		socket.emit("roomList", getRooms());
	});
}

module.exports = getSocket;
