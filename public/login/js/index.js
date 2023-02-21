"use strict";
const socket = io();
const formData = new FormData();
function Login() {
  SetActiveLoader(true);
  const id = document.getElementById("ipt_id").value;
  const pass = document.getElementById("ipt_pass").value;
  $.post("/api/v1/login", { id: id, password: pass }, function (data) {
    if (data != "complete") {
      Swal.fire({
        heightAuto: false,
        icon: "error",
        title: "Oops...",
        html: data,
        confirmButtonText: "OK",
      });
    } else {
      setCookie("id", id, 1);
      setCookie("pass", pass, 1);
      location.href = "/main";
    }
  });
}
function setCookie(cookieName, value, exdays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var cookieValue =
    escape(value) +
    "; path=/; " +
    (exdays == null ? "" : "; expires=" + exdate.toGMTString());
  document.cookie = `${cookieName}=${cookieValue}`;
}

// 쿠키 삭제
function deleteCookie(cookieName) {
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() - 1);
  document.cookie = cookieName + "= " + "; expires=" + expireDate.toGMTString();
}

// 쿠키 가져오기
function getCookie(cookieName) {
  cookieName = cookieName + "=";
  var cookieData = document.cookie;
  var start = cookieData.indexOf(cookieName);
  var cookieValue = "";
  if (start != -1) {
    // 쿠키가 존재하면
    start += cookieName.length;
    var end = cookieData.indexOf(";", start);
    if (end == -1)
      // 쿠키 값의 마지막 위치 인덱스 번호 설정
      end = cookieData.length;
    cookieValue = cookieData.substring(start, end);
  } else {
    return false;
  }
  return unescape(cookieValue);
}
