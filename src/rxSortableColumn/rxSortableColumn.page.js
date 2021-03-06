/*jshint node:true*/
var Page = require('astrolabe').Page;

/*
  This is a shared function for getting one column's sort direction, and all columns' sort directions.
  Ascending sort:  (1)  means the arrow is pointed down. [0-9, a-z]
  Descending sort: (0)  means the arrow is pointed up.   [z-a, 9-0]
  Not sorted:     (-1)  means there is no arrow for this column.
*/
var currentSortDirection = function (columnElement) {
    var imgSortIcon = columnElement.$('.sort-icon');
    return imgSortIcon.getAttribute('style').then(function (style) {
        if (style.indexOf('hidden') > -1) {
            // Sort arrow hidden; not sorted.
            return -1;
        } else {
            return imgSortIcon.getAttribute('class').then(function (className) {
                return className.indexOf('asc') > -1 ? 1 : 0;
            });
        }
    });
};

var rxSortableColumn = {

    btnSort: {
        get: function () {
            return this.rootElement.$('.sort-action');
        }
    },

    name: {
        get: function () {
            return this.rootElement.$('.sort-action .ng-scope').getText();
        }
    },

    sortAscending: {
        value: function () {
            this.sort({ isAscending: true });
        }
    },

    sortDescending: {
        value: function () {
            this.sort({ isAscending: false });
        }
    },

    sort: {
        /*
          Prefer using `sortAscending` and `sortDescending` over using this method directly.
        */
        value: function (namedParams) {
            var page = this;
            return this.currentSortDirection.then(function (sortDirection) {
                /*jshint eqeqeq: false*/
                // Coercing -1 to Boolean results in -1 === true. We don't want that.
                // It's easier to leave as is since -1 != true and -1 != false.
                // Meaning we'll always sort the list at least once if it's currently unsorted.
                if (sortDirection != namedParams.isAscending) {
                    page.btnSort.click();
                    page.sort(namedParams);
                }
            });
        }
    },

    sortProperty: {
        get: function () {
            return this.rootElement.getAttribute('sort-property');
        }
    },

    data: {
        get: function () {
            var defaultFn = function (cellElements) {
                return cellElements.map(function (cellElement) {
                    return cellElement.getText();
                });
            };

            return this.getDataUsing(defaultFn);
        }
    },

    getDataUsing: {
        /*
          Return a list of all cell contents in this column.
          Passes all cell elements to `customFn`.

          The second argument, `allByCssSelectorString` is used when your column's binding
          (which is used by `by.repeater().column`) is for some reason unreachable by protractor.
          A common reason why this wouldn't be the case is because the binding is not used as text
          within a web element, but instead used within the tag's attrs. An example of this is here:

          https://github.com/rackerlabs/encore-ui/blob/c200b7ca5019635724faefff8fbf5a16ccb0c8b7/src/rxStatusColumn/docs/rxStatusColumn.html#L14

          In these cases, you should specify a css selector that will select each element in the column you
          care about, since `by.binding` is not an option.
        */
        value: function (customFn, allByCssSelectorString) {
            if (customFn === undefined) {
                return this.data;
            }

            var page = this;
            return this.sortProperty.then(function (sortProperty) {
                if (page.repeaterString === undefined) {
                    page.CellUndiscoverableError.thro('data');
                }

                if (allByCssSelectorString === undefined) {
                    return customFn(element.all(by.repeater(page.repeaterString).column(sortProperty)));
                } else {
                    var elements = element.all(by.repeater(page.repeaterString));
                    return customFn(elements.$$(allByCssSelectorString));
                }
            });
        }
    },

    currentSortDirection: {
        get: function () {
            return currentSortDirection(this.rootElement);
        }
    },

    CellUndiscoverableError: {
        get: function () { return this.exception('repeaterString required at initialization to use'); }
    }

};

/*
  Functions for manipulating entire column sets of rx-sortable-columns.
*/
var rxSortableColumns = {

    tblColumns: {
        get: function () {
            return this.rootElement.$$('rx-sortable-column');
        }
    },

    /*
      Return all column names in `tableElement`.
      If any special work needs to be done, pass in a custom `mapFn` to `getNamesUsing` instead.
    */
    names: {
        get: function () {
            return this.getNamesUsing(function (columnElement) {
                return columnElement.$('.sort-action .ng-scope').getText();
            });
        }
    },

    getNamesUsing: {
        value: function (mapFn) {
            return this.tblColumns.map(mapFn);
        }
    },

    sorts: {
        get: function () {
            return this.tblColumns.map(currentSortDirection);
        }
    }

};

exports.rxSortableColumn = {

    initialize: function (rxSortableColumnElement, repeaterString) {
        rxSortableColumn.rootElement = {
            get: function () { return rxSortableColumnElement; }
        };

        rxSortableColumn.repeaterString = {
            get: function () { return repeaterString; }
        };

        return Page.create(rxSortableColumn);
    },

    byTable: function (tableElement) {
        rxSortableColumns.rootElement = {
            get: function () { return tableElement; }
        };

        return Page.create(rxSortableColumns);
    },

    sortDirections: {
        ascending: 1,
        descending: 0,
        notSorted: -1,
    }

};
