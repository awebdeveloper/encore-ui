var Page = require('astrolabe').Page;

module.exports = Page.create({
    url: { value: '/login' },

    heading: {
        get: function () {
            return this.find.by.tagName('h1');
        }
    },
    hello: {
        get: function () {
            return this.find.by.binding('hello');
        }
    }
});