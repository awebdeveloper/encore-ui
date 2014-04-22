module.exports = {
    options: {
        configFile: 'karma.conf.js',
    },
    dev: {
        singleRun: false
    },
    watch: {
        background:true
    },
    single: {
        singleRun: true
    },
    full: {
        singleRun: true,
        browsers: ['PhantomJS', 'Chrome', 'ChromeCanary', 'Firefox', 'Safari']
    }
};