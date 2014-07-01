angular-google-places-autocomplete
================

Angular directive for the Google Places Autocomplete component.

Installation
------------

Install via bower: `bower install angular-google-places-autocomplete`

Or if you're old skool, copy `src/google-places-autocomplete.js` into your project.

Then add the script to your page (be sure to include the Google Places API as well):

```html
<script src="https://maps.googleapis.com/maps/api/js?libraries=places"></script>
<script src="/bower_components/angular-google-places-autocomplete/google-places-autocomplete.js"></script>
```

Usage
-----

First add the dependency to your app:

```javascript
angular.module('myApp', ['google.places']);
```

Then you can use the directive on text inputs like so:

```html
<input type="text" g-places-autocomplete ng-model="myScopeVar" />
```

The directive also supports the following _optional_ attributes:

* forceSelection &mdash; forces the user to select from the dropdown
* restrictType: &mdash; The types of predictions to be returned. See [google.maps.places.AutocompleteOptions object specification](https://developers.google.com/maps/documentation/javascript/reference#AutocompleteOptions).
* restrictCountry: &mdash; Restrict predictions to a country code (e.g. us, au, gb).
* validLocationTypes: &mdash; a comma separated list of valid location types (e.g. street_address, airport) to trigger ng form validation (e.g. check for form.myAutocompleteField.$error.address)


Issues or feature requests
--------------------------

Create a ticket [here](https://github.com/kuhnza/angular-google-places-autocomplete/issues)

Contributing
------------

Issue a pull request including any relevent testing and updated any documentation if required.
