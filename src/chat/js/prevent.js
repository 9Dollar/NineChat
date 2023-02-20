!(function () {
  function a(c) {
    if (isNaN(+c)) {
      c = 100;
    }
    var d = +new Date();
    var b = +new Date();
    if (isNaN(d) || isNaN(b) || b - d > c) {
      alert(
        "금지된 접근입니다. \n개발자 도구를 활용하여 웹사이트 위변조를 시도할시 정보통신망법 제 48조 1항에 의해 처벌될 수 있습니다."
      );
      location.href = "/";
    }
  }
  if (window.attachEvent) {
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      a();
      window.attachEvent("onresize", a);
      window.attachEvent("onmousemove", a);
      window.attachEvent("onfocus", a);
      window.attachEvent("onblur", a);
    } else {
      setTimeout(argument.callee, 0);
    }
  } else {
    window.addEventListener("load", a);
    window.addEventListener("resize", a);
    window.addEventListener("mousemove", a);
    window.addEventListener("focus", a);
    window.addEventListener("blur", a);
  }
})();
