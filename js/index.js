
class URLIterator {
    constructor(rawurl) {
        this._index    = 0;
        this._url      = new URL(rawurl);
        this._hasQuery = URLIterator.INCLUDE_QUERY && this._url.search != '';
        this._endSlash = !this._hasQuery && this._url.pathname.endsWith('/');
        this._a        = [ this._url.hostname ].concat(
            this._url.pathname.split('/').filter(v => v != ''));

        if (this._hasQuery) {
            this._a.push(this._url.search);
        }
        this._length = this._a.length;
    }

    hasNext() {
        return this._index <= this._length;
    }

    next() {
        const v = this._a[this._index];
        this._index++;
        return v;
    }

    join() {
        let rawurl = this._url.protocol + '//';

        if (this._index >= this._length && this._hasQuery) {
            // If "_length" is 2, a slash is required because the array values
            // are "hostname" and "search".
            let slash = this._length == 2 ? '/' : '';
            return rawurl + this._a.slice(0, this._length - 1).join('/') +
                   slash + this._url.search;
        }

        rawurl += this._a.slice(0, this._index).join('/');
        if (this._index >= this._length && this._endSlash) {
            rawurl += '/';
        }
        return rawurl;
    }
}
URLIterator.INCLUDE_QUERY = true;

class Tree {
    constructor() {
        this.tree           = document.createElement('ul');
        this.tree.className = 'tree';
    }

    _match(element, name) {
        let _element = element;
        if (_element.tagName == 'LI') {
            _element = this._getChildUL(_element);
            if (!_element) return false;
        }

        for (const c of _element.children) {
            if (c.tagName != 'LI') continue;
            if (c.dataset.name == name) {
                this.q.push(c);
                return true;
            }
        }
    }

    _getChildUL(element) {
        if (element.tagName != 'LI') return;
        for (const c of element.children) {
            if (c.tagName == 'UL') return c;
        }
    }

    _createLiElement(name, href) {
        const li        = document.createElement('li');
        const a         = document.createElement('a');
        li.dataset.name = name;
        a.textContent   = name;
        a.href          = href;
        li.appendChild(a);
        this.q[this.q.length - 1].appendChild(li);
        this.q.push(li);
    }

    addURL(rawurl) {
        const iter = new URLIterator(rawurl);
        this.q     = [ this.tree ];

        for (let name = iter.next(); iter.hasNext(); name = iter.next()) {
            const element = this.q[this.q.length - 1];
            if (this._match(element, name, false)) {
                continue;
            }

            if (element.tagName != 'UL') {
                const c = this._getChildUL(element);
                if (c) {
                    this.q.push(c);
                } else {
                    const ul = document.createElement('ul');
                    this.q[this.q.length - 1].appendChild(ul);
                    this.q.push(ul);
                }
            }

            this._createLiElement(name, iter.join());
        }

        this.q.length = 0;
    }

    appendTo(element) {
        (element || document.body).appendChild(this.tree);
    }
}

new (class main {
    constructor() {
        const u     = new URL(location.href);
        const tabId = parseInt(u.searchParams.get('id'), 10);
        if (isNaN(tabId)) return;

        const details   = {file : 'js/contentScript.js'};
        const executing = browser.tabs.executeScript(tabId, details);
        executing.then(this.onExecuted.bind(this), this.onError.bind(this));
    }
    onClicked(e) {
        const li = e.target; // e.target is ul.tree > li
        if (!li.parentNode.classList.contains('tree')) return;
        li.classList.toggle('hide');
    }
    onExecuted(result) {
        if (!Array.isArray(result) || result.length < 1) return;
        const links = result[0];
        const t     = new Tree();
        for (const link of links) {
            t.addURL(link);
        }
        t.appendTo(document.body);

        const a = document.querySelectorAll('ul.tree > li');
        for (const v of a) {
            v.addEventListener('click', this.onClicked, false);
        }
    }
    onError(err) {
        console.error(err);
    }
})();
