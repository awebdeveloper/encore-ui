angular.module('billingApp')
    /**
    * @ngdoc filter
    * @name encore.filter:TransactionTable
    * @description
    * Filter which refines the collection of transactions based on the criteria provided. If no criteria are selected,
    * the filter will return the entire collection of transactions.  The filter leverages an 'AND' search so as more
    * criteria are selected more results will be filtered out.
    *
    * @param {Array} transactions - collection of transactions to be filtered.
    * @param {Object} filter - Object which includes the criteria for filtering the list of transactions.
    *     - **reference** {String} - Reference id for the transaction.
    *     - **type** {String} - Type of the transaction.
    *     - **status** {String} - Current state of the transaction.
    *     - **date** {Date} - The date the transaction occurred.
    */
    .filter('TransactionTable', function () {
        var getFilterDate = function (start) {
                var filterDate;
                if (!isNaN(start)) {
                    filterDate = new Date();
                    filterDate = new Date(filterDate.getFullYear(), filterDate.getMonth() + parseInt(start),
                        filterDate.getDate());
                } else {
                    filterDate = new Date(start);
                    filterDate = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
                }
                return filterDate;
            },
            tFilter = {
                isRefMatch: function (transaction, filter) {
                    return filter.reference ? _.contains(transaction.reference, filter.reference) : true;
                },
                isType: function (transaction, filter) {
                    return filter.type ? filter.type === transaction.type : true;
                },
                isStatus: function (transaction, filter) {
                    return filter.status ? filter.status === transaction.status : true;
                },
                isInRange: function (transaction, filter) {
                    if (!filter.period) {
                        return true;
                    }
                    var tdate = new Date(transaction.date),
                        filterDate = filter.period.split('|').map(getFilterDate);
                    if (filterDate.length === 1) {
                        filterDate.push(new Date());
                    }
                    // Sort from earliest to latest
                    filterDate = _.sortBy(filterDate);
                    return filterDate[0] <= tdate && tdate <= filterDate[1];
                }
            };

        return function (transactions, filter) {
            filter = filter ? filter : {};
            return _.filter(transactions, function (transaction) {
                return tFilter.isRefMatch(transaction, filter) &&
                    tFilter.isType(transaction, filter) &&
                    tFilter.isStatus(transaction, filter) &&
                    tFilter.isInRange(transaction, filter);
            });
        };
    })
    /**
    * @ngdoc filter
    * @name encore.filter:CurrencySuffix
    * @param {$filter} $filter - Angular filterProvider for getting the currency filter
    * @description
    * Filter that formats a currency value shortened by a metric prefix (thousand/million/billion), if the value is less
    * than 10000 don't attempt to shorten it, this is meant for numbeers too big to display on UI.
    *
    * Ranges based on the shortscale of the metric prefixes
    * Idea from:
    * http://stackoverflow.com/questions/17633462/format-a-javascript-number-with-a-metric-prefix-like-1-5k-1m-1g-etc
    * Information from:
    * http://en.wikipedia.org/wiki/SI_prefix
    *
    * @param {Number} value - number to be formatted
    */
    .filter('CurrencySuffix', function ($filter) {
        var currencyFilter = $filter('currency'),
            units = ['k', 'm', 'b', 't'];

        return function (value) {
            var modulus = (value < 0) ? -1 : 1, unit = false;
            value = Math.abs(value);
            if (value > 9999) {
                unit = Math.floor(Math.log(value) / Math.log(1000));
                value = value / Math.pow(1000, unit);
            }
            return currencyFilter(modulus * value) + (units[unit - 1] || '');
        };

    });