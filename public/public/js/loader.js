function SetActiveLoader(isOn) {
  const loading = document.querySelector(".loader-back");
  if (isOn) {
    loading.style.cssText = "";
  } else if (!isOn) {
    loading.style.cssText = "display: none";
  }
}
