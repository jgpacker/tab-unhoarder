"use strict";

const port = chrome.runtime.connect({"name": "from-popup"});

// allow closure request
port.onMessage.addListener(function(message){
  console.assert(message === "exit");
  window.close();
});

function requestAction(event) {
  if (event.target.nodeName == "BUTTON") {
    const clickedButton = event.target;

    // delegating desired action to a process with sufficient permissions
    port.postMessage({"actionId": clickedButton.id});

    event.stopPropagation();
    event.preventDefault();
  }
}

function createButton(id) {
  const button = document.createElement('button');
  button.id = id;
  button.textContent = chrome.i18n.getMessage("button."+id+".label")
  button.addEventListener("click", requestAction);

  return button;
}

[
  "close",
  "bookmark",
  "pin",
  "skip"
].forEach(function(id) {
  const button = createButton(id);
  document.body.appendChild(button);
});

