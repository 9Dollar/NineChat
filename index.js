const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const server = http.createServer(app);
const socketIO = require("socket.io");
const moment = require("moment");
const fs = require("fs");

const io = socketIO(server);

var chatLog = JSON.parse(fs.readFileSync("./data/log.json"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "node_modules")));
const PORT = process.env.PORT || 8000;

io.on("connection", (socket) => {
  socket.on("chatting", (data) => {
    if (data.name == undefined && data.msg == undefined) {
      io.emit("chatting", chatLog);
      return;
    }
    const { name, msg } = data;
    const param = {
      name,
      msg,
      time: moment(new Date()).format("HH:mm"),
    };
    io.emit("chatting", param);
    Logging(param.name, param.msg, param.time);
  });
});

function Logging(name, msg, time) {
  const log = { name, msg, time };
  chatLog.push(log);
  fs.writeFileSync("./data/log.json", JSON.stringify(chatLog, null, 2));
}

server.listen(PORT, () => {
  console.log(`server is running ${PORT}`);
});
