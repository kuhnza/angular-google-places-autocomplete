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
		return $window.google;
	}])

	/**
	 * Autocomplete directive. Use like this:
	 *
	 * <input type="text" g-places-autocomplete ng-model="myScopeVar" />
	 */
	.directive('gPlacesAutocomplete', [ '$parse', 'googlePlacesApi', function ($parse, google) {
		function link($scope, element, attrs, ngModelController) {
			var keymap = {
					tab: 9,
					enter: 13,
					downArrow: 40
				},
				input = element[0],
				options, validLocationTypes, autocomplete, onPlaceChanged;

			(function init() {
				initOptions();
				initAutocomplete();
				initValidation();
			}());

			function initOptions() {
				options = {
					types: ($scope.restrictType) ? [ $scope.restrictType ] : [],
					componentRestrictions: ($scope.restrictCountry) ? { country: $scope.restrictCountry } : undefined
				};
				validLocationTypes = ($scope.validLocationTypes) ? $scope.validLocationTypes.replace(/\s/g, '').split(',') : [];
				onPlaceChanged = (attrs.onPlaceChanged) ? $parse(attrs.onPlaceChanged) : angular.noop;
			}

			function initAutocomplete() {
				autocomplete = new google.maps.places.Autocomplete(input, options);

				element.bind('blur', function (event) {
					event.preventDefault();
				});

				element.bind('keydown', function (event) {
					if (event.which == keymap.enter) {
						event.preventDefault();
					}
				});

				if ($scope.forceSelection) {
					initForceSelection();
				}

				google.maps.event.addListener(autocomplete, 'place_changed', function () {
					$scope.$apply(function () {
						ngModelController.$setViewValue(element.val());
						onPlaceChanged($scope.$parent, { $autocomplete: autocomplete, $element: element });
					});
				});
			}

			function initValidation() {
				ngModelController.$formatters.push(function (modelValue) {
					var viewValue = "";

					if (_.isString(modelValue)) {
						viewValue = modelValue;
					} else if (_.isObject(modelValue)) {
						if (_.has(modelValue, 'formatted_address')) {
							viewValue = modelValue.formatted_address;
						} else if (_.has(modelValue, 'name')) {
							viewValue = modelValue.name;
						}
					}

					return viewValue;
				});

				ngModelController.$parsers.push(function (viewValue) {
					var place = autocomplete.getPlace();

					validate(viewValue, place);

					return place;
				});

				ngModelController.$render = function () {
					element.val(ngModelController.$viewValue);
				};
			}

			function initForceSelection() {
				var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;  // store the original event binding function

				// Event listener wrapper that simulates a 'down arrow' keypress on hitting 'return' or 'tab' when no pac suggestion is selected,
				// and then trigger the original listener.
				function addEventListenerWrapper(type, listener) {
					var originalListener;

					if (type == "keydown") {
						originalListener = listener;
						listener = function (event) {
							var suggestionSelected = $('.pac-item-selected').length > 0;
							if ((event.which == keymap.enter || event.which == keymap.tab) && !suggestionSelected) {
								var keydownEvent = angular.element.Event("keydown", {keyCode: keymap.downArrow, which: keymap.downArrow});
								originalListener.apply(input, [keydownEvent]);
							}

							originalListener.apply(input, [event]);
						};
					}

					// add the modified listener
					_addEventListener.apply(input, [type, listener]);
				}

				if (input.addEventListener)
					input.addEventListener = addEventListenerWrapper;
				else if (input.attachEvent)
					input.attachEvent = addEventListenerWrapper;
			}

			function validate(viewValue, place) {
				ngModelController.$setValidity('address', isValidAddressSelection(viewValue, place));
				ngModelController.$setValidity('locationType', isValidLocationType(place));
			}

			function isValidAddressSelection(viewValue, place) {
				if ($scope.forceSelection) {  // force user to choose from drop down.
					if (place == null) return false;
					if (_.isString(place)) return false;
					if (!_.has(place, 'formatted_address')) return false;
				}

				return true;
			}

			function isValidLocationType(place) {
				var valid = true;

				if (!_.isEmpty(validLocationTypes)) {
					valid = (place) ? containsAny(place.types, validLocationTypes) : false;
				}

				return valid;
			}

			function containsAny(array1, array2) {
				var i;

				for (i = 0; i < array2.length; i++) {
					if (_.contains(array1, array2[i])) {
						return true;
					}
				}
				return false;
			}
		}

		return {
			restrict: 'A',
			require: 'ngModel',
			scope: {
				forceSelection: '=?',
				restrictType: '=?',
				restrictCountry: '=?',
				validLocationTypes: '@?'
			},
			link: link
		}
	}]);
