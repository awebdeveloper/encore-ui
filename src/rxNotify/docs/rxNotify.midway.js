var _ = require('lodash');

var notifications = require('../rxNotify.page.js').rxNotify;

describe('rxNotify', function () {

    before(function () {
        demoPage.go('#/component/rxNotify');
    });

    describe('auto dismissal', function () {
        var addToCustomStack;

        before(function () {
            addToCustomStack = function (type, timeout) {
                var input = $('input[ng-model="options.timeout"]');
                input.clear();
                input.sendKeys(timeout);
                $('input[value="' + type + '"]').click();
                element(by.buttonText('Add to Custom Stack')).click();
            };

        });

        it('should add a new success message that dismisses itself', function () {
            addToCustomStack('success', '.5');
            expect(notifications.all.byText('My message').type).to.eventually.equal('success');
        });

        it('should remove itself after a little while', function () {
            browser.sleep(1000);
            expect(notifications.byStack('custom').exists('My message', 'success')).to.eventually.false;
        });

        it('should add a new success message indefinitely', function () {
            addToCustomStack('success', -1);
            expect(notifications.all.byText('My message').type).to.eventually.equal('success');
        });

    });

    describe('by stack -- demo', function () {

        it('should have 4 notifications in it', function () {
            expect(notifications.byStack('demo').count()).to.eventually.equal(4);
        });

        describe('info type', function () {
            var info;

            before(function () {
                info = notifications.byStack('demo').byText('Helpful Information');
            });

            it('should be type "info"', function () {
                expect(info.type).to.eventually.equal('info');
            });

            it('should have helpful information', function () {
                expect(info.text).to.eventually.equal('Helpful Information');
            });

            it('should be dismissable', function () {
                expect(info.isDismissable()).to.eventually.be.true;
            });

            it('should not have a spinner', function () {
                expect(info.hasSpinner()).to.eventually.be.false;
            });

            it('should have a second spinner on another notification', function () {
                expect(notifications.byStack('demo').byText('Loading').hasSpinner()).to.eventually.be.true;
            });

        });

    });

    describe('all notifications', function () {

        it('should have 6 notifications in it', function () {
            expect(notifications.all.count()).to.eventually.equal(8);
        });

        describe('by type', function () {
            var success;

            before(function () {
                success = notifications.all.byText('You did it!');
            });

            it('should be type "success"', function () {
                expect(success.type).to.eventually.equal('success');
            });

            it('should have done it', function () {
                expect(success.text).to.eventually.equal('You did it!');
            });

        });
    });

    describe('notifications exist', function () {

        it('should find a notification with no class and a string (all)', function () {
            expect(notifications.all.exists('Under Attack by Aliens')).to.eventually.be.true;
        });

        it('should find a notification with no class and a string (custom stack)', function () {
            expect(notifications.byStack('custom').exists('Under Attack by Aliens')).to.eventually.be.true;
        });

        it('should find a notification with a class and a string', function () {
            expect(notifications.all.exists('Under Attack by Aliens','error')).to.eventually.be.true;
        });

        it('should find a notification with a class and no string', function () {
            expect(notifications.all.exists('','error')).to.eventually.be.true;
        });

        it('should not find a notification with the wrong class and a string', function () {
            expect(notifications.all.exists('Under Attack by Aliens','success')).to.eventually.be.false;
        });

        it('should not find a notification with the wrong class and no string', function () {
            expect(notifications.all.exists('','abject_failure')).to.eventually.be.false;
        });

        it('should not find a notification with no class and a wrong string', function () {
            expect(notifications.all.exists('Under Attack by Alienists')).to.eventually.be.false;
        });

    });

    describe('dismissing notifications', function () {

        it('should dismiss a single notification', function () {
            notifications.all.byText('Careful now...').dismiss();
        });

        it('should have actually dismissed the message', function () {
            expect(notifications.all.count()).to.eventually.equal(7);
        });

        describe('by stack', function () {

            it('should dismiss every notification in a stack', function () {
                notifications.byStack('custom').dismiss();
            });

            it('should have actually dismissed every message', function () {
                expect(notifications.byStack('custom').count()).to.eventually.equal(0);
            });

        });

        describe('all', function () {

            it('should dismiss all notifications', function () {
                notifications.all.dismiss();
            });

            it('should have actually dismissed every message', function () {
                expect(notifications.all.count()).to.eventually.equal(1);
            });

        });

    });

    describe('stackless notifications', function () {
        var notification;

        before(function () {
            notification = notifications.initialize($('rx-notification[type="error"] .rx-notification'));
        });

        it('should have a warning type', function () {
            expect(notification.type).to.eventually.equal('error');
        });

        it('should say hello', function () {
            expect(notification.text).to.eventually.equal('Hello, world!');
        });

        it('should not be dismissable', function () {
            expect(notification.isDismissable()).to.eventually.be.false;
        });

        it('should not have a spinner', function () {
            expect(notification.hasSpinner()).to.eventually.be.false;
        });

    });

});
