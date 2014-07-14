/*
 * angular-google-places-autocomplete
 *
 * Copyright (c) 2014 "kuhnza" David Kuhn
 * Licensed under the MIT license.
 * https://github.com/kuhnza/angular-google-places-autocomplete/blob/master/LICENSE
 */

 'use strict';

angular.module('google.places', [])
	/**
	 * DI wrapper around global google places library.
	 *
	 * Note: requires the Google Places API to already be loaded on the page.
	 */
	.factory('googlePlacesApi', ['$window', function ($window) {
        if (!$window.google) throw 'Global `google` var missing. Did you forget to include the places API script?';

		return $window.google;
	}])

	/**
	 * Autocomplete directive. Use like this:
	 *
	 * <input type="text" g-places-autocomplete ng-model="myScopeVar" />
	 */
	.directive('gPlacesAutocomplete',
        [ '$parse', '$compile', '$timeout', 'googlePlacesApi',
        function ($parse, $compile, $timeout, google) {

            return {
                restrict: 'A',
                require: '^ngModel',
                scope: {
                    model: '=ngModel',
                    options: '=?',
                    forceSelection: '=?'
                },
                controller: ['$scope', function ($scope) {}],
                link: function ($scope, element, attrs, controller) {
                    var keymap = {
                            tab: 9,
                            enter: 13,
                            esc: 27,
                            up: 38,
                            down: 40
                        },
                        hotkeys = [keymap.tab, keymap.enter, keymap.esc, keymap.up, keymap.down],
                        autocompleteService = new google.maps.places.AutocompleteService(),
                        placesService = new google.maps.places.PlacesService(element[0]);

                    (function init() {
                        $scope.query = '';
                        $scope.predictions = [];
                        $scope.input = element;
                        $scope.options = $scope.options || {};

                        initAutocompleteDrawer();
                        initEvents();
                        initNgModelController();
                    }());

                    function initEvents() {
                        element.bind('keydown', onKeydown);
                        element.bind('blur', onBlur);

                        $scope.$watch('selected', select);
                    }

                    function initAutocompleteDrawer() {
                        // Drawer element used to display predictions
                        var drawerElement = angular.element('<div g-places-autocomplete-drawer></div>');
                        drawerElement.attr({
                            input: 'input',
                            query: 'query',
                            predictions: 'predictions',
                            active: 'active',
                            selected: 'selected'
                        });


                        var $drawer = $compile(drawerElement)($scope);
                        element.after($drawer);  // Append to DOM just underneath input
                    }

                    function initNgModelController() {
                        controller.$parsers.push(parse);
                        controller.$formatters.push(format);
                        controller.$render = render;
                    }

                    function onKeydown(event) {
                        if ($scope.predictions.length === 0 || indexOf(hotkeys, event.which) === -1) {
                            return;
                        }

                        event.preventDefault();

                        if (event.which === keymap.down) {
                            $scope.active = ($scope.active + 1) % $scope.predictions.length;
                            $scope.$digest();
                        } else if (event.which === keymap.up) {
                            $scope.active = ($scope.active ? $scope.active : $scope.predictions.length) - 1;
                            $scope.$digest();
                        } else if (event.which === 13 || event.which === 9) {
                            if ($scope.forceSelection) {
                                $scope.active = ($scope.active === -1) ? 0 : $scope.active;
                            }

                            $scope.$apply(function () {
                                $scope.selected = $scope.active;

                                if ($scope.selected === -1) {
                                    clearPredictions();
                                }
                            });
                        } else if (event.which === 27) {
                            event.stopPropagation();
                            clearPredictions();
                            $scope.$digest();
                        }
                    }

                    function onBlur(event) {
                        if ($scope.predictions.length === 0) {
                            return;
                        }

                        if ($scope.forceSelection) {
                            $scope.selected = ($scope.selected === -1) ? 0 : $scope.selected;
                        }

                        $scope.$digest();

                        $scope.$apply(function () {
                            if ($scope.selected === -1) {
                                clearPredictions();
                            }
                        });
                    }

                    function select() {
                        var prediction;

                        prediction = $scope.predictions[$scope.selected];
                        if (!prediction) return;

                        placesService.getDetails({ reference: prediction.reference }, function (place, status) {
                            if (status == google.maps.places.PlacesServiceStatus.OK) {
                                $scope.$apply(function () {
                                    $scope.model = place;
                                });
                            }
                        });

                        clearPredictions();
                    }

                    function parse(viewValue) {
                        var request;

                        if (!(viewValue && isString(viewValue))) return viewValue;

                        $scope.query = viewValue;

                        request = angular.extend({ input: viewValue }, $scope.options);
                        autocompleteService.getPlacePredictions(request, function (predictions, status) {
                            $scope.$apply(function () {
                                clearPredictions();

                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    $scope.predictions.push.apply($scope.predictions, predictions);
                                }
                            });
                        });

                        return viewValue;
                    }

                    function format(modelValue) {
                        var viewValue = "";

                        if (isString(modelValue)) {
                            viewValue = modelValue;
                        } else if (isObject(modelValue)) {
                            viewValue = modelValue.formatted_address;
                        }

                        return viewValue;
                    }

                    function render() {
                        return element.val(controller.$viewValue);
                    }

                    function clearPredictions() {
                        $scope.active = -1;
                        $scope.selected = -1;
                        $scope.predictions.length = 0;
                    }

                    function isString(val) {
                        return toString.call(val) == '[object String]';
                    }

                    function isObject(val) {
                        return toString.call(val) == '[object Object]';
                    }

                    function indexOf(array, item) {
                        var i, length;

                        if (array == null) return -1;

                        length = array.length;
                        for (i = 0; i < length; i++) {
                            if (array[i] === item) return i;
                        }
                        return -1;
                    };
                }
            }
        }
    ])


    .directive('gPlacesAutocompleteDrawer', ['$window', '$document', function ($window, $document) {
        var TEMPLATE = [
            '<div class="pac-container" ng-if="isOpen()" ng-style="{top: position.top+\'px\', left: position.left+\'px\', width: position.width+\'px\'}" style="display: block;" role="listbox" aria-hidden="{{!isOpen()}}">',
            '  <div class="pac-item" g-places-autocomplete-prediction index="$index" prediction="prediction" query="query"',
            '       ng-repeat="prediction in predictions track by $index" ng-class="{\'pac-item-selected\': isActive($index) }"',
            '       ng-mouseenter="selectActive($index)" ng-click="selectPrediction($index)" role="option" id="{{prediction.id}}">',
            '  </div>',
            '</div>'
        ];

        return {
            restrict: 'A',
            scope:{
                input: '=',
                query: '=',
                predictions: '=',
                active: '=',
                selected: '='
            },
            template: TEMPLATE.join(''),
            link: function ($scope, element) {
                element.bind('mousedown', function (event) {
                    event.preventDefault();  // prevent blur event from firing when clicking selection
                });

                $scope.isOpen = function () {
                    return $scope.predictions.length > 0;
                };

                $scope.isActive = function (index) {
                    return $scope.active === index;
                };

                $scope.selectActive = function (index) {
                    $scope.active = index;
                };

                $scope.selectPrediction = function (index) {
                    $scope.selected = index;
                };

                $scope.$watch('predictions', function () {
                    $scope.position = getDrawerPosition($scope.input);
                });

                function getDrawerPosition(element) {
                    var domEl = element[0],
                        body = $document[0].documentElement,
                        scrollX = $window.pageXOffset || body.scrollLeft,
                        scrollY = $window.pageYOffset || body.scrollTop,
                        rect = domEl.getBoundingClientRect();

                    return {
                        width: rect.width,
                        height: rect.height,
                        top: element.prop('offsetTop') + rect.height + scrollY,
                        left: element.prop('offsetLeft') + scrollX
                    };
                }
            }
        }
    }])

    .directive('gPlacesAutocompletePrediction', [function () {
        var TEMPLATE = [
            '<span class="pac-icon pac-icon-marker"></span>',
            '<span class="pac-item-query" ng-bind-html="prediction | highlightMatched"></span>',
            '<span ng-repeat="term in prediction.terms | unmatchedTermsOnly:prediction">{{term.value | trailingComma:!$last}}&nbsp;</span>'
        ];

        return {
            restrict: 'A',
            scope:{
                index:'=',
                prediction:'=',
                query:'='
            },
            template: TEMPLATE.join('')
        }
    }])

    .filter('highlightMatched', ['$sce', function ($sce) {
        return function (prediction) {
            var matchedPortion = '',
                unmatchedPortion = '',
                matched;

            if (prediction.matched_substrings.length > 0 && prediction.terms.length > 0) {
                matched = prediction.matched_substrings[0];
                matchedPortion = prediction.terms[0].value.substr(matched.offset, matched.length);
                unmatchedPortion = prediction.terms[0].value.substr(matched.offset + matched.length);
            }

            return $sce.trustAsHtml('<span class="pac-matched">' + matchedPortion + '</span>' + unmatchedPortion);
        }
    }])

    .filter('unmatchedTermsOnly', [function () {
        return function (terms, prediction) {
            var i, term, filtered = [];

            for (i = 0; i < terms.length; i++) {
                term = terms[i];
                if (prediction.matched_substrings.length > 0 && term.offset > prediction.matched_substrings[0].length) {
                    filtered.push(term);
                }
            }

            return filtered;
        }
    }])

    .filter('trailingComma', [function () {
        return function (input, condition) {
            return (condition) ? input + ',' : input;
        }
    }]);


