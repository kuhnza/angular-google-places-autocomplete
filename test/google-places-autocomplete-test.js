/*
 * angular-google-places-autocomplete
 *
 * Copyright (c) 2014 "kuhnza" David Kuhn
 * Licensed under the MIT license.
 * https://github.com/kuhnza/angular-google-places-autocomplete/blob/master/LICENSE
 */

'use strict';

describe('Provider: $googlePlacesApiProvider', function () {

    var $window, $googlePlacesApi;

    beforeEach(function () {
        // Initialize the service provider by injecting it to a fake module's config block
        angular.module('testApp', []);

        angular.module('google.places').config(function ($googlePlacesApiProvider) {
            $googlePlacesApi = $googlePlacesApiProvider;
        });

        // Initialize myApp injector
        module('testApp', 'google.places');
    });

    beforeEach(inject(function (_$window_) {
        $window = _$window_;
    }));

    it('should load', function () {
        var google = $googlePlacesApi.$get();

        expect(google).toBeDefined();
    });
});