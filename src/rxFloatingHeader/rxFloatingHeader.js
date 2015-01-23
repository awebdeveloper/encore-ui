/**
 * @ngdoc directive
 * @name encore.ui.rxFloatingHeader:rxFloatingHeader
 * @description
 * Turns a tableheader into a floating persistent header
 */
angular.module('encore.ui.rxFloatingHeader', [])
.directive('rxFloatingHeader', function ($compile, rxDOMHelper) {
    return {
        restrict: 'A',
        link: function (scope, table) {
            var state, seenFirstScroll, trs, ths, clones, inputs, maxHeight, header;

            var setup = function () {

                if (clones && clones.length) {
                    _.each(clones, function (clone) {
                        var scope = clone.scope();
                        clone.remove();
                        if (scope) {
                            scope.$destroy();
                        }
                    });
                }
                state = 'fixed',
                seenFirstScroll = false,

                // The original <tr> elements
                trs = [],

                // The original <th> elements
                ths = [],

                // Clones of the <tr> elements
                clones = [],

                // any <input> elements in the <thead>
                inputs = [],
                maxHeight,
                header = angular.element(table.find('thead'));
                
                // Grab all the original `tr` elements from the `thead`,
                _.each(header.find('tr'), function (tr) {
                    tr = angular.element(tr);

                    // We are going to clone all the <tr> elements in the <thead>, and insert them
                    // into the DOM whenever the original <tr> elements need to float. This keeps the
                    // height of the table correct, and prevents it from jumping up when we put
                    // the <tr> elements into a floating state.
                    // We have to $compile() against the *parent* scope, not the scope of this directive,
                    // in case there are any bindings in the original <tr> elements. For instance, say we had
                    // <tr ng-show="foo">Hi</tr>. In this case, the `foo` variable will not be on the scope
                    // of this directive, but instead on the scope of whatever controller this table lives in.
                    var clone = tr.clone();
                    clones.push(clone);
                    trs.push(tr);
                    ths = ths.concat(_.map(tr.find('th'), angular.element));
                });

                // Apply .filter-header to any <input> elements
                _.each(ths, function (th) {
                    var input = th.find('input');
                    if (input.length) {
                        var type = input.attr('type');
                        if (!type || type === 'text') {
                            th.addClass('filter-header');
                            input.addClass('filter-box');
                            inputs.push(input);
                        }
                    }
                });
            };

            setup();

            var updateHeaders = function () {
                if (_.isUndefined(maxHeight)) {
                    maxHeight = table[0].offsetHeight;
                }

                maxHeight = _.max([maxHeight, table[0].offsetHeight]);

                if (rxDOMHelper.shouldFloat(table, maxHeight)) {
                    if (state === 'fixed') {
                        state = 'float';
                        var thWidths = [],
                            trHeights = [];

                        // Get the current height of each `tr` that we want to float
                        _.each(trs, function (tr) {
                            trHeights.push(parseInt(rxDOMHelper.height(tr).replace('px', '')));
                        });

                        // Grab the current widths of each `th` that we want to float
                        thWidths = _.map(ths, rxDOMHelper.width);

                        // Put the cloned `tr` elements back into the DOM
                        _.each(clones, function (clone) {
                            header.append(clone);
                            $compile(clone)(scope.$new());
                        });

                        // Apply the rx-floating-header class to each `tr` and
                        // set a correct `top` for each, to make sure they stack
                        // properly
                        // We previously did tr.css({ 'width': rxDOMHelper.width(tr) })
                        // but it *seems* that setting the widths of the `th` is enough
                        var topOffset = 0;
                        _.each(trs, function (tr, index) {
                            tr.addClass('rx-floating-header');
                            tr.css({ 'top': topOffset + 'px' });
                            topOffset += trHeights[index];
                        });

                        // Explicitly set the widths of each `th` element that we floated
                        _.each(_.zip(ths, thWidths), function (pair) {
                            var th = pair[0];
                            var width = pair[1];
                            th.css({ 'width': width });
                        });
                    }

                } else {
                    if (state === 'float' || !seenFirstScroll) {
                        state = 'fixed';
                        seenFirstScroll = true;

                        // Make sure that an input filter doesn't have focus when
                        // we re-dock the header, otherwise the browser will scroll
                        // the screen back up ot the input
                        _.each(inputs, function (input) {
                            if (rxDOMHelper.scrollTop() > rxDOMHelper.offset(input).top) {
                                input[0].blur();
                            }
                        });

                        _.each(trs, function (tr) {
                            tr.removeClass('rx-floating-header');
                        });

                        // Detach each cloaned `tr` from the DOM,
                        // but don't destroy it
                        _.each(clones, function (clone) {
                            clone.remove();
                        });
                    }
                }

            };

            rxDOMHelper.onscroll(function () {
                updateHeaders();
            });

            scope.$watch(
                function () {
                    return header.find('th').length;
                },
                function () {
                    setup();
                });

        },
    };
})

/**
 * @ngdoc service
 * @name encore.ui.rxFloatingHeader:rxDOMHelper
 * @description
 * A small set of functions to provide some functionality
 * that isn't present in Angular's jQuery-lite, and other
 * DOM-related functions that are useful
 *
 * All methods take jquery-lite wrapped elements as arguments
 */
.factory('rxDOMHelper', function ($document, $window) {

    var scrollTop = function () {
        // Safari and Chrome both use body.scrollTop, but Firefox needs
        // documentElement.scrollTop
        var doc = $document[0];
        var scrolltop = $window.pageYOffset || doc.body.scrollTop || doc.documentElement.scrollTop || 0;
        return scrolltop;
    };

    var offset = function (elm) {
        //http://cvmlrobotics.blogspot.co.at/2013/03/angularjs-get-element-offset-position.html
        var rawDom = elm[0];
        var _x = 0;
        var _y = 0;
        var doc = $document[0];
        var body = doc.documentElement || doc.body;
        var scrollX = $window.pageXOffset || body.scrollLeft;
        var scrollY = scrollTop();
        var rect = rawDom.getBoundingClientRect();
        _x = rect.left + scrollX;
        _y = rect.top + scrollY;
        return { left: _x, top:_y };
    };

    var style = function (elem) {
        if (elem instanceof angular.element) {
            elem = elem[0];
        }
        return $window.getComputedStyle(elem);
    };

    var width = function (elem) {
        return style(elem).width;
    };

    var height = function (elem) {
        return style(elem).height;
    };

    var shouldFloat = function (elem, maxHeight) {
        var elemOffset = offset(elem),
            scrolltop = scrollTop();

        return ((scrolltop > elemOffset.top) && (scrolltop < elemOffset.top + maxHeight));
    };

    // An implementation of wrapAll, based on 
    // http://stackoverflow.com/a/13169465
    // Takes a raw DOM `newParent`, and moves all of `elms` (either
    // a single element or an array of elements) into it. It then places
    // `newParent` in the location that elms[0] was originally in
    var wrapAll = function (newParent, elms) {

        // Figure out if it's one element or an array
        var el = elms.length ? elms[0] : elms;

        // cache the current parent node and sibling 
        // of the first element
        var parentNode = el.parentNode;
        var sibling = el.nextSibling;

        // wrap the first element. This automatically
        // removes it from its parent
        newParent.appendChild(el);

        // If there are other elements, wrap them. Each time
        // it will remove the element from its current parent,
        // and also from the `elms` array
        while (elms.length) {
            newParent.appendChild(elms[0]);
        }

        // If there was a sibling to the first element,
        // insert newParent right before it. Otherwise
        // just add it to parentNode
        if (sibling) {
            parentNode.insertBefore(newParent, sibling);
        } else {
            parentNode.appendChild(newParent);
        }
    };

    // bind `f` to the scroll event
    var onscroll = function (f) {
        angular.element($window).bind('scroll', f);
    };

    var find = function (elem, selector) {
        return angular.element(elem[0].querySelector(selector));
    };

    return {
        offset: offset,
        scrollTop: scrollTop,
        width: width,
        height: height,
        shouldFloat: shouldFloat,
        onscroll: onscroll,
        find: find,
        wrapAll: wrapAll
    };
});
