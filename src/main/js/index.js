"use strict";

const socket = io();

const userRoom = document.querySelector(".user-room");

Start();

function Start() {
  SetActiveLoader(true);
  $.post("/api/v1/room", function (data) {
    userRoom.innerHTML = data;
    SetActiveLoader(false);
  });
}

function LogOut() {
  deleteCookie("id");
  deleteCookie("pass");
  location.href = "/login";
}

function deleteCookie(cookieName) {
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() - 1);
  document.cookie =
    cookieName + "= " + "; path=/; expires=" + expireDate.toGMTString();
}
