const users = [];

//list of rooms

function getRooms() {
	return users;
}

// socket.id, userId, room, name, email;
//Join user to chat
function userJoin(id, userId, room, name, email, userImage) {
	const user = { id, userId, room, name, email, userImage };
	users.push(user);
	return user;
}

//Get current user
function getCurrentUser(id) {
	return users.find((user) => user.id == id);
}

// User leaves chat
function userLeave(id) {
	const index = users.findIndex((user) => user.id == id);

	if (index != -1) {
		return users.splice(index, 1)[0];
	}
}

//Get room users
function getRoomUsers(room) {
	return users.filter((user) => user.room == room);
}

module.exports = {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers,
	getRooms,
};
