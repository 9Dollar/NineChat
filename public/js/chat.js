"use strict";

const socket = io();

var nickname = "익명";
const chatlist = document.querySelector(".chat-list");
const chatInput = document.querySelector(".chatting-input");
const sendButton = document.querySelector(".send-button");
const displayContainer = document.querySelector(".display-container");
function ChangeName() {
  Swal.fire({
    heightAuto: false,
    title: "닉네임을 입력해주세요!",
    input: "text",
    inputValue: "익명"
  }).then((result) => {
    console.log(result.value.length);
    if (result.value.length == 0) {
      Swal.fire({
       heightAuto: false,
        icon: "error",
        title: "Oops...",
        text: "닉네임이 비어있습니다!",
        footer: "재입력 해주세요!",
        confirmButtonText: "Yes!",
      }).then((result) => {
        if (result.isConfirmed) {
          ChangeName();
        }
      });
      return;
    }
    nickname = result.value;
    displayContainer.scrollTo(0, displayContainer.scrollHeight);
  });
}
ChangeName();

chatInput.addEventListener("keypress", (event) => {
  if (event.keyCode === 13) {
    Send();
  }
});
sendButton.addEventListener("click", () => {
  Send();
});

function Send() {
  const param = {
    name: nickname,
    msg: chatInput.value,
  };
  if (param.name == "" || param.msg == "") {
    Swal.fire("메시지가 비어있습니다", {
      
  heightAuto: false,
    });
    return;
  }
  socket.emit("chatting", param);
  chatInput.value = null;
}

socket.emit("chatting", "from front");

socket.on("chatting", (data) => {
  const li = document.createElement("li");
  console.log(data);

  const { name, msg, time } = data;
  if (name == undefined && msg == undefined) {
    for (var i = 0; i < data.length; i++) {
      const li = document.createElement("li");
      if (data[i].name == undefined && data[i].msg == undefined) {
        li.innerText = "새로운 유저가 접속했습니다";
        chatlist.appendChild(li);
        continue;
      }
      LiModel(data[i].name, data[i].msg, data[i].time);
    }
    li.innerText = "새로운 유저가 접속했습니다";
    displayContainer.scrollTo(0, displayContainer.scrollHeight);
    chatlist.appendChild(li);
    return;
  }
  LiModel(name, msg, time);
  displayContainer.scrollTo(0, displayContainer.scrollHeight);
  console.log(data);
});

function LiModel(name, msg, time) {
  const li = document.createElement("li");
  li.classList.add(nickname === name ? "sent" : "received");
  const dom = `<span class="profile">
      <span class="user">${name}</span>
      <img class ="image"src="data:image/png;base64,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" alt="">
      </span>
      <span class="message">${msg}</span>
      <span class="time">${time}</span>`;
  li.innerHTML = dom;
  chatlist.appendChild(li);
}
