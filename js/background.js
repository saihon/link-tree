
const re = new RegExp('^https?://');

const isValidURL = rawurl => {
    return re.test(rawurl);
};

chrome.browserAction.setBadgeBackgroundColor({color : '#FFFF00'});

const onClicked = tab => {
    if (!isValidURL(tab.url)) {
        chrome.browserAction.setBadgeText({text : '!', tabId : tab.id}, () => {
            setTimeout(() => {
                chrome.browserAction.setBadgeText({text : '', tabId : tab.id});
            }, 1000);
        });
        return;
    }

    const props = {
        active : true,
        index : tab.index + 1,
        url : 'index.html?id=' + (tab.id + ''),
    };
    chrome.tabs.create(props);
};

chrome.browserAction.onClicked.addListener(onClicked);
