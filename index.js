const express = require("express");
var bodyParser = require("body-parser");
const http = require("http");
const app = express();
const path = require("path");
const server = http.createServer(app);
const socketIO = require("socket.io");
const moment = require("moment");
const fs = require("fs");
const { upload } = require("./lib/multer");
var mongoose = require("mongoose");

const uri = "mongodb://svc.sel3.cloudtype.app:32539/user";
var db = mongoose.connect(uri, (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Succesfully Connected!");
  }
});

var UserSchema = new mongoose.Schema({
  id: String,
  password: String,
});

var Users = mongoose.model("users", UserSchema);

const io = socketIO(server);

var users = {};

var room = {
  "Genesis Room": [
    {
      name: "",
      msg: "Welcome to the Genesis Room!",
      time: moment(new Date()).format("HH:mm"),
    },
  ],
  1: [
    {
      name: "",
      msg: "즐거운 채팅 되십쇼!",
      time: moment(new Date()).format("HH:mm"),
    },
  ],
  2: [
    {
      name: "",
      msg: "즐거운 채팅 되십쇼!",
      time: moment(new Date()).format("HH:mm"),
    },
  ],
  3: [
    {
      name: "",
      msg: "즐거운 채팅 되십쇼!",
      time: moment(new Date()).format("HH:mm"),
    },
  ],
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "1gb", extended: false }));
app.post("/upload", upload.single("chooseFile"), async (req, res) => {
  const imgfile = req.file;
  if (imgfile == undefined) return;
  var name = req.body.name;
  var msg = `<img onclick="Swal.fire({
  imageUrl: this.src,
  imageWidth: '100%',
  showCancelButton: true,
  confirmButtonColor: '#3085D6',
  cancelButtonColor: '#dd3333',
  confirmButtonText: '자세히 보기',
  cancelButtonText: '취소',
  heightAuto: false,
}).then((result) => {
  if (result.isConfirmed) {
    location.href = this.src;
  }
});" id="chat-img" onLoad={() => ScrollDownEnd()} src="/uploads/${imgfile.filename}">`;
  const param = {
    name,
    msg,
    time: moment(new Date()).format("HH:mm"),
  };
  var roomName = req.body.roomName;
  io.to(roomName).emit("on_chat", param);
  Logging(roomName, name, msg, param.time);
  console.log(imgfile);
  res.send("1");
});
app.post("/api/v1/register", async (req, res) => {
  const { id, password, check } = req.body;

  const users = await Users.findOne({ id });
  if (users != null) {
    return res.send("이 id는 이미 사용중입니다");
  }

  if (id.length < 3 || id.length > 9) {
    return res.send("3자리 이하, 10자리 이상의 아이디는 사용할 수 없습니다");
  }
  if (CheckPW(password) != "success") {
    return res.send(CheckPW(password));
  }
  console.log(users);

  if (password != check) {
    return res.send("비밀번호가 일치하지 않았습니다. 다시 시도해 보세요.");
  }

  const form = { id: id, password: password };
  console.log(req.body);
  var new_user = new Users(form);

  new_user.save((err) => {
    if (err) {
      console.log(err);
    } else return res.send("complete");
  });
});

app.post("/api/v1/chatlog", (req, res) => {
  const { room, nickname } = req.body;
  const log = LogToHtml(room, nickname);
  res.send(log);
});

app.post("/api/v1/room", (req, res) => {
  var html = "";
  for (index = 0; index < Object.keys(room).length; index++) {
    if (["1", "2", "3"].includes(Object.keys(room)[index])) continue;

    html += `<div class="chat-room" onclick="location.href = '/chat/${
      Object.keys(room)[index]
    }'">${Object.keys(room)[index]}</div>`;
  }
  res.send(html);
});

app.post("/api/v1/login", (req, res) => {
  Users.findOne(
    { id: req.body.id, password: req.body.password },
    (err, user) => {
      if (err)
        return res.send("로그인 실패!<br>아이디와 비밀번호를 확인하세요!");
      else if (user) return res.send("complete");
      else return res.send("로그인 실패!<br>아이디와 비밀번호를 확인하세요!");
    }
  );
});

app.post("/api/v1/create", (req, res) => {
  const { roomName } = req.body;
  if (room[roomName] != undefined) {
    return res.send("fail");
  }
  if (
    roomName.includes("/") ||
    roomName.includes("%") ||
    roomName.includes("<") ||
    roomName.includes(">") ||
    roomName == ""
  ) {
    return res.send("fail");
  }

  room[roomName] = [
    {
      name: "",
      msg: `Welcome to ${roomName}!`,
      time: moment(new Date()).format("HH:mm"),
    },
  ];
  res.send("complete");
});

app.use("/chat/:roomName", express.static(path.join(__dirname, "/src/chat")));
app.use("/", express.static(path.join(__dirname, "/src")));
app.use("/node_modules", express.static(path.join(__dirname, "/node_modules")));
app.use(function (req, res, next) {
  res.status(404);
  res.send(
    `<!DOCTYPE html><html lang="ko"> <head> <meta charset="UTF-8" /> <link rel="shortcut icon" href="./img/icon.ico" type="image/x-icon" /> <title>NineChat</title> </head> <style> @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap"); * { font-family: "Noto Sans KR", sans-serif; font-weight: 700; margin: 0; padding: 0; } html, body { max-width: 100%; height: 100%; min-width: 100px; } select { width: 100px; /* 원하는 너비설정 */ padding: 0.8em 0.5em; /* 여백으로 높이 설정 */ font-family: inherit; /* 폰트 상속 */ background: url("img/caret-down-outline.png") no-repeat 95% 50%; /* 네이티브 화살표 대체 */ background-size: 20px; border: 1px solid #999; border-radius: 7px; -webkit-appearance: none; /* 네이티브 외형 감추기 */ -moz-appearance: none; appearance: none; color: white; } input { -webkit-appearance: none; /* 네이티브 외형 감추기 */ -moz-appearance: none; appearance: none; background: rgb(255, 255, 255); /* 네이티브 화살표 대체 */ filter: grayscale(100%); border: 1px solid black; color: rgb(0, 0, 0); border-radius: 7px; padding: 0.8em 0.8em; /* 여백으로 높이 설정 */ } button { -webkit-appearance: none; /* 네이티브 외형 감추기 */ -moz-appearance: none; appearance: none; background: rgba(0, 0, 0, 0); /* 네이티브 화살표 대체 */ filter: grayscale(100%); border: 1px solid black; color: black; border-radius: 7px; padding: 0.5em 0.5em; /* 여백으로 높이 설정 */ } .header-bar { position: fixed; top: 0; left: 0; right: 0; font-size: smaller; background-color: rgba(59, 130, 246, 0.01); backdrop-filter: blur(15px); height: 55px; padding: 1rem; color: white; font-weight: bold; display: flex; justify-content: space-between; align-items: center; } #title { padding-bottom: 0.25rem; color: white; } .display-container { padding: 8rem 4rem 50% 4rem; background: linear-gradient(to bottom, #a18cd1, #fbc2eb); background-repeat: no-repeat; background-size: cover; } .chat-room { text-overflow: ellipsis; overflow: hidden; border: white solid 1px; text-align: center; line-height: 90px; background-color: white; font-size: 24px; border-radius: 7px; padding: 4rem; margin: 3rem; } </style> <body> <div class="wrapper"> <div class="header-bar"> <h1 id="title">NineChat</h1> <button id="header-home" onClick="location.href='/'" > 홈으로 </button> </div> <div class="display-container"> <h1 style="font-size:700%">오류가 발생했습니다!</h1> <h3 style="font-size: 300%">404 Page Not Found!</h3> </div> </div> </body></html>`
  );
});
const PORT = process.env.PORT || 8000;

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);

  res.send(
    `<!DOCTYPE html><html lang="ko"> <head> <meta charset="UTF-8" /> <link rel="shortcut icon" href="./img/icon.ico" type="image/x-icon" /> <title>NineChat</title> </head> <style> @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap"); * { font-family: "Noto Sans KR", sans-serif; font-weight: 700; margin: 0; padding: 0; } html, body { max-width: 100%; height: 100%; min-width: 100px; } select { width: 100px; /* 원하는 너비설정 */ padding: 0.8em 0.5em; /* 여백으로 높이 설정 */ font-family: inherit; /* 폰트 상속 */ background: url("img/caret-down-outline.png") no-repeat 95% 50%; /* 네이티브 화살표 대체 */ background-size: 20px; border: 1px solid #999; border-radius: 7px; -webkit-appearance: none; /* 네이티브 외형 감추기 */ -moz-appearance: none; appearance: none; color: white; } input { -webkit-appearance: none; /* 네이티브 외형 감추기 */ -moz-appearance: none; appearance: none; background: rgb(255, 255, 255); /* 네이티브 화살표 대체 */ filter: grayscale(100%); border: 1px solid black; color: rgb(0, 0, 0); border-radius: 7px; padding: 0.8em 0.8em; /* 여백으로 높이 설정 */ } button { -webkit-appearance: none; /* 네이티브 외형 감추기 */ -moz-appearance: none; appearance: none; background: rgba(0, 0, 0, 0); /* 네이티브 화살표 대체 */ filter: grayscale(100%); border: 1px solid black; color: black; border-radius: 7px; padding: 0.5em 0.5em; /* 여백으로 높이 설정 */ } .header-bar { position: fixed; top: 0; left: 0; right: 0; font-size: smaller; background-color: rgba(59, 130, 246, 0.01); backdrop-filter: blur(15px); height: 55px; padding: 1rem; color: white; font-weight: bold; display: flex; justify-content: space-between; align-items: center; } #title { padding-bottom: 0.25rem; color: white; } .display-container { padding: 8rem 4rem 50% 4rem; background: linear-gradient(to bottom, #a18cd1, #fbc2eb); background-repeat: no-repeat; background-size: cover; } .chat-room { text-overflow: ellipsis; overflow: hidden; border: white solid 1px; text-align: center; line-height: 90px; background-color: white; font-size: 24px; border-radius: 7px; padding: 4rem; margin: 3rem; } </style> <body> <div class="wrapper"> <div class="header-bar"> <h1 id="title">NineChat</h1> <button id="header-home" onClick="location.href='/'" > 홈으로 </button> </div> <div class="display-container"> <h1 style="font-size:700%">오류가 발생했습니다!</h1> <h3 style="font-size: 300%">500 Something broke!</h3> </div> </div> </body></html>`
  );
});

io.on("connection", (socket) => {
  users[socket.id] = {
    room: "",
  };
  socket.emit("user_join", socket.id);
  socket.on("user_join", (roomName) => {
    socket.join(roomName);
    users[socket.id].room = roomName;
    console.log(socket.adapter.rooms);
    io.to(users[socket.id].room).emit("user_join", socket.id);
  });
  socket.on("on_chat", (data) => {
    const { roomName, name, msg } = data;
    const param = {
      name,
      msg,
      time: moment(new Date()).format("HH:mm"),
    };
    io.to(roomName).emit("on_chat", param);
    Logging(roomName, name, msg, param.time);
  });
});

function LogToHtml(_roomName, _nickname) {
  var html = "";
  var _chatLog = room[_roomName];
  if (_chatLog == undefined) {
    return false;
  }
  for (index = 0; index < _chatLog.length; index++) {
    if (_chatLog[index].name == "" && _chatLog[index].msg == "") {
      html += `<div style="text-align: center;">새로운 유저가 접속했습니다</div>`;
      continue;
    }
    html += `<li class=${
      _chatLog[index].name == _nickname ? "sent" : "received"
    }>
    <span class="profile">
    <span class="user">${_chatLog[index].name}</span>
    <img class ="image"src="data:image/png;base64,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" alt="">
    </span>
    <span class="message">${_chatLog[index].msg}</span>
    <span class="time">${_chatLog[index].time}</span>
    </li>`;
  }
  return html;
}

function Logging(roomName, name, msg, time) {
  try {
    const param = { name, msg, time };
    if (room[roomName] == undefined) return;
    room[roomName].push(param);
    console.log(room);
    fs.writeFileSync("./data/log.json", JSON.stringify(room, null, 2));
  } catch (error) {
    console.log(error);
  }
}

function CheckPW(pw) {
  var reg = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  var hangulcheck = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

  if (false === reg.test(pw)) {
    return "비밀번호는 8자 이상이어야 하며,<br>숫자/대문자/소문자/특수문자를<br>모두 포함해야 합니다.<br>특수문자 종류: #, ?, !, @, $, %, ^, &, *, -";
  } else if (pw.search(/\s/) != -1) {
    return "비밀번호는 공백 없이 입력해주세요.";
  } else if (hangulcheck.test(pw)) {
    return "비밀번호에 한글을 사용 할 수 없습니다.";
  } else {
    return "success";
  }
}
server.listen(PORT, () => {
  console.log(`server is running ${PORT}`);
});
