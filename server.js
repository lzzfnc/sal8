const { WebSocket, WebSocketServer } = require("ws");
const express = require("express");

const PORT = process.env.PORT || 3000;
const index = "index.html";

const server = express()
	.use(express.static("public"))
	.use((req, res) => res.sendFile(index, { root: __dirname }))
	.listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new WebSocketServer({ server, clientTracking: true });

let VVVV = null;
let USERS = new Set();
var theme = "";

const messageProcessor = {
	default: (ws, msg) => unknownMsg(msg),
	hello_v4: (ws, msg) => registerV4(ws, msg),
	drawings: (ws, msg) => toV4(msg),
	theme: (ws, msg) => ((theme = msg.theme), broadcast(msg)),
};

const unknownMsg = (msg) => {
	console.log("❔ Unknown message type...");
	console.log(msg);
};

const registerV4 = (ws, msg) => {
	if (VVVV == null) console.log("⬛ vvvv client connected");
	VVVV = ws;
	VVVV.on("close", () => {
		VVVV = null;
	});
};

const toV4 = (msg) => {
	if (VVVV?.readyState === WebSocket.OPEN) {
		VVVV.send(JSON.stringify(msg));
	}
};

const broadcast = (msg) => {
	let message = JSON.stringify(msg);
	for (const user of USERS.values()) {
		if (user?.readyState === WebSocket.OPEN && user != VVVV) {
			user.send(message);
		}
	}
};

wss.on("connection", (ws) => {
	USERS.add(ws);
	ws.send(JSON.stringify({ type: "theme", theme: theme }));

	ws.on("message", (data) => {
		let message;
		try {
			message = JSON.parse(data);
		} catch (e) {}

		if (message) {
			(messageProcessor[message.type] || messageProcessor.default)(ws, message);
		}
	});

	ws.on("close", () => {
		USERS.delete(ws);
	});
});
