//The main function.
LOGGER("Background is running");
var fbUrl = '.facebook.com';
var count = 0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    LOGGER('receive: ' + request.count + " from tab : " + sender.tab.id + " content script:" + sender.tab.url);
    if (request.count || request.count == 0) {
        count = request.count;
        var tab = sender.tab;
        if (count == 0) {
            setBadgeText(tab, getDefaultText(tab));
            enableButton(tab);
        } else {
            setBadgeNumber(tab, request.count);
            disableButton(tab);
        }
    }
});

var CONSTANT = {
    "FACEBOOK": {
        "MENUS": {
            "CONFIRM-FRIEND": "confirm-friend-request",
            "REQUEST-FRIEND": "send-friend-request",
            "LIKE-ALL": "like-all",
            "LIKE-POST": "like-post",
            "LIKE-COMMENT": "like-commnet",
            "INVITE-FRIEND-PAGE": "invite-friend-page",
            "INVITE-FRIEND-EVENT": "invite-friend-event",
            "COMMENT": "comment"
        }
    }
}

function genericOnClick(info, tab) {
    LOGGER("Cliked : " + info.menuItemId);
    if (!isFacebook(tab)) {
        LOGGER("Context menus only running on Facebook.");
        return;
    }
    switch (info.menuItemId) {
        case CONSTANT["FACEBOOK"]["MENUS"]["CONFIRM-FRIEND"]:
            executeScripts(null, [
                { file: "libs/jquery.js" },
                { file: "scripts/utils.js" },
                { file: "scripts/confirm-friend.js" }
            ]);
            updateNumberOfUsed();
            break;
        case CONSTANT["FACEBOOK"]["MENUS"]["REQUEST-FRIEND"]:
            executeScripts(null, [
                { file: "libs/jquery.js" },
                { file: "scripts/utils.js" },
                { file: "scripts/request-friend.js" }
            ]);
            updateNumberOfUsed();
            break;
        case CONSTANT["FACEBOOK"]["MENUS"]["INVITE-FRIEND-PAGE"]:
            executeScripts(null, [
                { file: "libs/jquery.js" },
                { file: "scripts/utils.js" },
                { file: "scripts/invite-friend-page.js" }
            ]);
            updateNumberOfUsed();
            break;
        case CONSTANT["FACEBOOK"]["MENUS"]["INVITE-FRIEND-EVENT"]:
            executeScripts(null, [
                { file: "libs/jquery.js" },
                { file: "scripts/utils.js" },
                { file: "scripts/invite-friend-event.js" }
            ]);
            updateNumberOfUsed();
            break;
        case CONSTANT["FACEBOOK"]["MENUS"]["LIKE-ALL"]:
            executeScripts(null, [
                { file: "libs/jquery.js" },
                { file: "scripts/utils.js" },
                { file: "scripts/like-all.js" }
            ]);
            updateNumberOfUsed();
            break;
        case CONSTANT["FACEBOOK"]["MENUS"]["LIKE-POST"]:
            executeScripts(null, [
                { file: "libs/jquery.js" },
                { file: "scripts/utils.js" },
                { file: "scripts/like-post.js" }
            ]);
            updateNumberOfUsed();
            break;
        case CONSTANT["FACEBOOK"]["MENUS"]["LIKE-COMMENT"]:
            executeScripts(null, [
                { file: "libs/jquery.js" },
                { file: "scripts/utils.js" },
                { file: "scripts/like-comment.js" }
            ]);
            updateNumberOfUsed();
            break;
        default:
            break;
    }

}

function createContextMenus() {
    var rootFbMenu = chrome.contextMenus.create({ id: "facebook-auto", "title": "Facebook Auto", "contexts": ["all"]});
    chrome.contextMenus.onClicked.addListener(genericOnClick);

    // Create a parent item and two children.
    chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["CONFIRM-FRIEND"], "title": "Confirm friend requests", "parentId": rootFbMenu });
    chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["REQUEST-FRIEND"], "title": "Send friend requests", "parentId": rootFbMenu  });
    
	chrome.contextMenus.create({ "id": "separator1", type: 'separator', "parentId": rootFbMenu });
    
	chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["INVITE-FRIEND-PAGE"], "title": "Invite friend on Page", "parentId": rootFbMenu  });
    chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["INVITE-FRIEND-EVENT"], "title": "Invite friend on Event", "parentId": rootFbMenu  });
    
	chrome.contextMenus.create({ "id": "separator2", type: 'separator', "parentId": rootFbMenu });
    
	chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["LIKE-ALL"], "title": "Like all", "parentId": rootFbMenu  });
    chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["LIKE-POST"], "title": "Like post", "parentId": rootFbMenu  });
    chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["LIKE-COMMENT"], "title": "Like comment", "parentId": rootFbMenu  });

    chrome.contextMenus.create({ "id": "separator3", type: 'separator', "parentId": rootFbMenu });

    chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["COMMENT"], "title": "Comming soon", "parentId": rootFbMenu  });
}
createContextMenus();


function setBadgeNumber(tab, count) {
    if (checkEnable(tab.url)) {
        if (count > 999) {
            setBadgeText(tab, '99+');
        } else if (count == 0) {
            setBadgeText(tab, '');
        } else {
            setBadgeText(tab, String(count));
        }
    }
}

function setBadgeText(tab, text) {
    chrome.browserAction.setBadgeText({
        text: text,
        'tabId': tab.id
    });
}

function checkEnable(url) {
    return url.indexOf(fbUrl) > -1;
}

function enableButtonIfNoneText(tab) {
    chrome.browserAction.getBadgeText({ "tabId": tab.id }, function(text) {
        LOGGER("enableButtonIfNoneText : " + text);
        if (text == '') {
            enableButton(tab);
            setBadgeText(tab, getDefaultText(tab));
        }
    });
}

function enableButton(tab) {
    chrome.browserAction.enable(tab.id);
}

function disableButton(tab) {
    chrome.browserAction.disable(tab.id);
}

function getDefaultText(tab) {
    return "Like";
}

function isFacebook(tab) {
    var url = tab.url;
    return url.indexOf(fbUrl);
}

function setStorageNumber(key, number, callback) {
    var object = {};
    object[key] = number;
    chrome.storage.local.set(object, function() {
        if (callback) {
            callback();
        }
    });
}

function getStorageNumber(key, callback) {
    var object = {};
    object[key] = 0;
    chrome.storage.local.get(object, function(item) {
        if (callback) {
            callback(item[key]);
        } else {
            console.log("You can't get value without callback.")
        }
    });
}

function executeScripts(tabId, injectDetailsArray) {
    function createCallback(tabId, injectDetails, innerCallback) {
        return function() {
            chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
        };
    }

    var callback = null;

    for (var i = injectDetailsArray.length - 1; i >= 0; --i)
        callback = createCallback(tabId, injectDetailsArray[i], callback);

    if (callback !== null)
        callback(); // execute outermost function
}

function updateNumberOfUsed() {
    var countNumberFieldName = "count_number";
    getStorageNumber(countNumberFieldName, function(numberOfUsed) {
        var times = Number(numberOfUsed);
        times++;
        setStorageNumber(countNumberFieldName, times);
    });
}
