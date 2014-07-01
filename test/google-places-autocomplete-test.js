/*
 * angular-google-places-autocomplete
 *
 * Copyright (c) 2014 "kuhnza" David Kuhn
 * Licensed under the MIT license.
 * https://github.com/kuhnza/angular-google-places-autocomplete/blob/master/LICENSE
 */

'use strict';

describe('Factory: googlePlacesApi', function () {

    var googlePlacesApi;

    beforeEach(module('google.places'));

    beforeEach(inject(function (_$window_, _googlePlacesApi_) {
        googlePlacesApi = _googlePlacesApi_;
    }));

    it('should load', function () {
        expect(googlePlacesApi).toBeDefined();
    });
});

describe('Directive: gPlacesAutocomplete', function () {

    var $parentScope, $isolatedScope, $compile, googlePlacesApi;

    function compileAndDigest(html) {
        var element = angular.element(html);
        $compile(element)($parentScope);
        $parentScope.$digest();
        $isolatedScope = element.isolateScope();
    }

    beforeEach(module('google.places'));

    beforeEach(inject(function ($rootScope, _$compile_) {
        $parentScope = $rootScope.$new();
        $compile = _$compile_;

        $parentScope.place = null;

        compileAndDigest('<input type="text" g-places-autocomplete ng-model="place" />');
    }));

    // TODO: write more tests!
    it('should initialize model', function () {
    });
});