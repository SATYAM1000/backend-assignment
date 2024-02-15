/** @format */

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());
const httpServer = createServer(app);
const port = 5000;
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
		credentials: true,
	},
});
app.get("/", (req, res) => {
	res.send("Hello from server!");
});
io.on("connection", (socket) => {
	console.log("New user connected: ", socket.id);
	socket.emit("welcome", `Welcome user - ${socket.id}`);

	socket.on("join-room", (roomName, ackCallback) => {
		const success = true;
		socket.join(roomName);
		console.log(`${socket.id} has joined the room`)
		io.to(roomName).emit("userJoined", socket.id);
		ackCallback({ success });
	});

	socket.on("sendMessage", (data) => {
		console.log("New message: ", data);
		const senderID=socket.id;
		const message=data.message
		io.to(data.roomDetails).emit("newMessage", {message, senderID});
	});

	socket.on("disconnecting", () => {
		console.log("user disconnecting ", socket.id);
		const rooms = Object.keys(socket.rooms);
		rooms.forEach((room) => {
			io.to(room).emit("userLeft", `${socket.id} has left the room`);
		});
	});
});

httpServer.listen(port, () => {
	console.log("Server is listening at port 5000");
});
