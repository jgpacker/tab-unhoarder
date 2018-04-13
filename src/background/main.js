"use strict";

// TODO: add webextensions-Promise-polyfill for Chrome to use Promises
function getCurrentTabPlusNextTab_andThen(f) {
  chrome.tabs.query({currentWindow: true}, function(tabs) {
    const activeTabIndex = tabs.findIndex(tab => tab.active);

    f(tabs[activeTabIndex], tabs[activeTabIndex+1]);
  })
}

function getOrCreateBookmarkFolder_andThen(f) {
  const folderTitle = chrome.i18n.getMessage("default.options.bookmarkFolderName");
  browser.bookmarks.search({
    "title": folderTitle
  }, function(searchResults){
    const bookmarkFolder = searchResults.find(bookmark => bookmark.type == "folder")
    if(bookmarkFolder == undefined) {
      // TODO: silently avoid duplication of bookmarks in the same folder
      browser.bookmarks.create({
        "type": "folder",
        "title": folderTitle,
        "parentId": null // TODO: Allow further configuration
      }, function(newBookmarkFolder){
        f(newBookmarkFolder.id);
      });
    } else {
      f(bookmarkFolder.id);
    }
  });
}

function pinAction(currentTab, nextTab) {
  // TODO: should this option exist if the tab is already pinned?
  chrome.tabs.update(currentTab.id, {
    "pinned": true
  });
  if(nextTab) {
    // a tab changes order when pinned, so if nextTab doesn't exist, maybe the last tab in current window should receive focus?
    chrome.tabs.update(nextTab.id, {
      "active": true
    });
  }
}

function skipAction(currentTab, nextTab) {
  if(nextTab) {
    chrome.tabs.update(nextTab.id, {
      "active": true
    });
  }
}

function bookmarkAction(currentTab, _) {
  getOrCreateBookmarkFolder_andThen(function(bookmarkFolderId){
    browser.bookmarks.create({
      "title": currentTab.title,
      "url": currentTab.url,
      "parentId": bookmarkFolderId
    });
    chrome.tabs.remove(currentTab.id);
  });
}

function closeAction(currentTab, _) {
  chrome.tabs.remove(currentTab.id);
}

const availableActions = {
  "pin": pinAction,
  "skip": skipAction,
  "bookmark": bookmarkAction,
  "close": closeAction
}

browser.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "from-popup");

  port.onMessage.addListener(function(message) {
    getCurrentTabPlusNextTab_andThen(function(currentTab, nextTab) {
      availableActions[message.actionId](currentTab, nextTab);
      if(nextTab == undefined) {
        port.postMessage("exit");
      }
    });
  });
});
