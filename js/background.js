
const re = new RegExp('^(https?|file)://');

const isInvalidURL = rawurl => {
    return !re.test(rawurl);
};

browser.browserAction.setBadgeBackgroundColor({color : '#FFFF00'});

const resetBadgeText = tabId => {
    return () => setTimeout(() => {
               browser.browserAction.setBadgeText({text : '', tabId : tabId});
           }, 1000);
};

const onClicked = tab => {
    if (isInvalidURL(tab.url)) {
        browser.browserAction.setBadgeText({text : '!', tabId : tab.id},
                                           resetBadgeText(tab.id));
        return;
    }

    const props = {
        active : true,
        index : tab.index + 1,
        url : 'index.html?id=' + (tab.id + ''),
    };
    browser.tabs.create(props);
};

browser.browserAction.onClicked.addListener(onClicked);
