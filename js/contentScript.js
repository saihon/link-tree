(() => {
    let result    = [];
    const anchors = document.getElementsByTagName('a');
    for (const a of anchors) {
        if (/^https?:\/\//.test(a.href)) {
            result.push(a.href);
        }
    }
    return result;
})();