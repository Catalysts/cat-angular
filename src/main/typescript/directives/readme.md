cat-select
===

The ```cat-select``` directive is a wrapper around https://github.com/angular-ui/ui-select2 which basically just adds
a few conveient possibilities to link it to the ```catApiService```. As the ui-select2 project is deprecated it will
be replaced by https://github.com/angular-ui/ui-select in the future.

Usage examples:

* cat-select with a named endpoint (endpoint configuration is covered here: https://github.com/Catalysts/cat-angular/tree/master/src/main/javascript/service#cat-api-service)

```html

<cat-select options="{endpoint: 'myNewEndpoint'}" ng-model="mySelectValue"></cat-select>

```

This is the shortest way of using the cat-select directive.
The endpoint is given as a string and resolved via the ```catApiService``` where the 'list' method is called.

* cat-select with a endpoint object

```javascript

angular.module('cat-angular-example', [])
    .controller('catSelectController', function($scope, catApiService) {
        $scope.myEndpoint = catApiService.myNewEndpoint.res(1 /* parentId* */).myNewEndpointChild;
    });

```

```html

<cat-select options="{endpoint: myEndpoint}" ng-model="mySelectValue"></cat-select>

```

This is especially useful if you can't access an endpoint via the name alone (eg. child endpoints).

* cat-select with a static array

```javascript

angular.module('cat-angular-example', [])
    .controller('catSelectController', function($scope) {
        $scope.myArray = [{id:1, text: 'Value 1'}, {id:2, text: 'Value 2'}];
    });

```


```html

<cat-select options="{endpoint: myArray}" ng-model="mySelectValue"></cat-select>

```

Please note that the array is only evaluated once and any modifications after the cat-select is initialized won't be
reflected by it.

* cat-select with a function with synchronous return value

```javascript

angular.module('cat-angular-example', [])
    .controller('catSelectController', function($scope) {
        var myArray = [{id:1, text: 'Value 1'}, {id:2, text: 'Value 2'}];

        $scope.getElements = function(queryParams) {
            return myArray;
        }
    });

```

```html

<cat-select options="{endpoint: getElements}" ng-model="mySelectValue"></cat-select>

```

In this example any changes to the array will be correctly reflected in the select component as well.

* cat-select with a asynchronous return value

```javascript

angular.module('cat-angular-example', [])
    .controller('catSelectController', function($scope, catApiService) {
        $scope.myArray = [{id:1, text: 'Value 1'}, {id:2, text: 'Value 2'}];
        $scope.myParentValue; // used by the first select

        function _getChildEndpoint() {
            return catApiService.myNewEndpoint.res($scope.myParentValue.id).myNewChildEndpoint;
        }

        $scope.getElements = function (queryParams) {
            var searchRequest = new window.cat.SearchRequest(queryParams.data);
            return _getChildEndpoint().list(searchRequest).then(queryParams.success);
        }
    });

```

```html

<cat-select options="{endpoint: myArray}" ng-model="myParentValue"></cat-select>
<cat-select options="{endpoint: getElements}" ng-model="mySelectValue" ng-disabled="!myParentValue"></cat-select>

```

This example shows how to make arbitrary async calls to the backend. Use cases include an backend call which
is not done via an api endpoints list method or eg. a dynamically changing endpoint like in this example.