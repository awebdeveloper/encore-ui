var loginPage = require('../pages/login.page');
var preferencesPage = require('../pages/preferences.page');

var notifications = encore.rxNotify;

describe('preferences page', function () {

    before(function () {
        loginPage.login();
    });

    it('should search for preferences', function () {
        preferencesPage.search(browser.params.accountId);
        expect(encore.rxPage.main.title).to.eventually.equal('Billing - Preferences');
    });

    it('should not show any notifications', function () {
        expect(notifications.all.count()).to.eventually.equal(0);
    });

    it('should list the account name in the subtitle @dev', function () {
        expect(encore.rxPage.main.subtitle).to.eventually.equal('On account Digitas London');
    });

    it('should update the paperless billing preference without saving it', function () {
        preferencesPage.paperlessBilling.invoices.then(function (currentSetting) {
            preferencesPage.paperlessBilling.invoices = !currentSetting;
            expect(preferencesPage.paperlessBilling.invoices).not.to.eventually.equal(currentSetting);
        });
    });

    it('should update the notifications preference without saving it', function () {
        preferencesPage.notifications.successfulPayments.then(function (currentSetting) {
            preferencesPage.notifications.successfulPayments = !currentSetting;
            expect(preferencesPage.notifications.successfulPayments).not.to.eventually.equal(currentSetting);
        });
    });

    it('should update the paperless billing preference and save it @staging', function () {
        preferencesPage.paperlessBilling.invoices.then(function (currentSetting) {
            preferencesPage.paperlessBilling.invoices = !currentSetting;
            preferencesPage.submit();
            expect(preferencesPage.notifications.successfulPayments).not.to.eventually.equal(currentSetting);
        });
    });

    it('should update the notifications preference and save it @staging', function () {
        preferencesPage.notifications.successfulPayments.then(function (currentSetting) {
            preferencesPage.notifications.successfulPayments = !currentSetting;
            preferencesPage.submit();
            expect(preferencesPage.notifications.successfulPayments).not.to.eventually.equal(currentSetting);
        });
    });

    it('should update both the paperless billing and notifications preferences and save it @staging', function () {
        preferencesPage.paperlessBilling.invoices.then(function (paperless) {
            preferencesPage.notifications.successfulPayments.then(function (payments) {
                preferencesPage.paperlessBilling.invoices = !paperless;
                preferencesPage.notifications.successfulPayments = !payments;
                preferencesPage.submit();
                expect(preferencesPage.paperlessBilling.invoices).not.to.eventually.equal(paperless);
                expect(preferencesPage.notifications.successfulPayments).not.to.eventually.equal(payments);
            });
        });
    });

    it('should not save unless the update button is clicked', function () {
        browser.refresh();
        preferencesPage.paperlessBilling.invoices.then(function (paperless) {
            preferencesPage.notifications.successfulPayments.then(function (payments) {
                preferencesPage.paperlessBilling.invoices = !paperless;
                preferencesPage.notifications.successfulPayments = !payments;
                browser.refresh();
                expect(preferencesPage.paperlessBilling.invoices).to.eventually.equal(paperless);
                expect(preferencesPage.notifications.successfulPayments).to.eventually.equal(payments);
            });
        });
    });

    describe('unsuccessful updates @dev', function () {

        before(function () {
            preferencesPage.search('8675309');
        });

        afterEach(function () {
            encore.rxNotify.all.dismiss();
        });

        it('should show an error if changing the paperless billing preference fails', function () {
            preferencesPage.paperlessBilling.invoices.then(function (currentSetting) {
                preferencesPage.paperlessBilling.invoices = !currentSetting;
                preferencesPage.submit();
                encore.rxNotify.all.byType('error').then(function (errors) {
                    expect(errors[0].text).to.eventually.equal('Error Updating Billing Preferences');
                });
            });
        });

        it('should show an error if changing the notifications preference fails', function () {
            preferencesPage.notifications.successfulPayments.then(function (currentSetting) {
                preferencesPage.notifications.successfulPayments = !currentSetting;
                preferencesPage.submit();
                encore.rxNotify.all.byType('error').then(function (errors) {
                    expect(errors[0].text).to.eventually.equal('Error Updating Payment Preferences');
                });
            });
        });

        after(function () {
            preferencesPage.search(browser.params.accountId);
        });

    });

    after(function () {
        loginPage.logout();
    });

});