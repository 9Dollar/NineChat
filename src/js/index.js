"use strict";

const socket = io();

const userRoom = document.querySelector(".user-room");

Start();

function Start() {
  socket.emit("on_room");
  socket.on("on_room", (html) => {
    userRoom.innerHTML = html;
  });
}
