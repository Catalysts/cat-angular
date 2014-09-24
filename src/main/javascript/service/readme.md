cat-api-service
===

How to register a new endpoint:

During the configuration phase you have to provide 2 things:
- an endpoint name
- an endpoint model (a constructor function)

Optionally you can provide:
- an endpoint url (defaults to the endpoint name)
- configuration for child endpoints

Please note that the actually called backend url will be constructed as follows:

'/api/' + configured url

This means in our examples below the backend ur

* Using a config object

```javascript

angular.module('cat-angular-example', [])
    .config(function(catApiServiceProvider) {
        catApiServiceProvider.endpoint('myNewEndpoint', {
                url: 'my-backend-endpoint-url',
                model: window.cat.example.Model,
                children: {
                    myNewEndpointChild: {
                        url: 'child',
                        model: window.cat.example.ChildModel
                    }
                }
            });
    });
    
```


*Using the builder syntax

```javascript

angular.module('cat-angular-example', [])
    .config(function(catApiServiceProvider) {
        catApiServiceProvider
            .endpoint('myNewEndpoint', {
                url: 'my-backend-endpoint-url',
                model: window.cat.example.Model, // references a constructor function
            })
            .child('myNewEndpointChild', {
                 url: 'child',
                 model: window.cat.example.ChildModel
            });
    });

```

Note that child endpoints by itself can again contain an arbitrary number of children.
With the object notation this would lead to a large config object with a high level of nesting.
Using the builder syntax allows for a much more structured and readable configuration without the increased indentation.
You can retrieve an endpoint configuration at any given time by calling '''catApiServiceProvider.endpoint''' with just a name.

Here is yet another equivalent example:

```javascript

angular.module('cat-angular-example', [])
    .config(function(catApiServiceProvider) {
        catApiServiceProvider.endpoint('myNewEndpoint', {});

        var myEndpoint = catApiServiceProvider.endpoint('myNewEndpoint');
        myEndpoint.config.url = 'my-backend-endpoint-url';
        myEndpoint.config.model = window.cat.example.Model;
        
        var myChild = myEndpoint.child('myNewEndpointChild', {});
        myChild.config.url = 'child';
        myChild.config.model = window.cat.example.ChildModel;
        
    });

```


How to use an endpoint:

The instantiated ```catApiService``` is an object containing all instantiated root endpoints.

* Using a 'root' endpoint

```javascript

angular.module('cat-angular-example')
    .run(function(catApiService) {
        var myEndpoint = catApiService.myNewEndpoint;
        
        myEndpoint.list(/* optional cat.SearchRequest object */).then(
            function success(response) {
                // handle the list response
            }
        );
        
        myEndpoint.get(1 /* the id of the entity to retrieve */).then(
            function success(response) {
                // handle the get response
            }
        );
        
        myEndpoint.save({id: 1, name: 'myTestName'} /* a object to send to the server */).then(
            function success(response) {
                // handle the save (PUT or POST) response
            }
        );
    }); 

```

* Using a 'child' endpoint

On the parent object:

```javascript

angular.module('cat-angular-example')
    .run(function(catApiService) {
        var myEndpoint = catApiService.myNewEndpoint;
        
        myEndpoint.get(1).then(
            function success(parent) {
                var listPromise = parent.myNewEndpointChild.list();
                var getPromise = parent.myNewEndpointChild.get(1);
                var savePromise = parent.myNewEndpointChild.save({id: 1, text: 'childName'});
            }
        );
    }); 

```

Only with the parent id:

```javascript

angular.module('cat-angular-example')
    .run(function(catApiService) {
        var myChildEndpoint = catApiService.myNewEndpoint.res(1 /* the parent id */);
        
        var listPromise = myChildEndpoint.list();
        var getPromise = myChildEndpoint.get(1);
        var savePromise = myChildEndpoint.save({id: 1, text: 'childName'});
    }); 

```

The parameters:
* 'list' accepts an optional cat.SearchRequest object used for filtering, sorting and paging of the list on the backend
* 'get' accepts an id of the requested entity
* 'save' accepts an object with arbitrary properties which will be sent to the server - all properties which match child endpoints will be removed first
if 'id' is present a PUT will be performed a POST otherwise


The responses:

* 'list' returns either an array of elements (converted to the configured model) or a wrapper object including the properties: totalCount, facets and elements
* 'get' returns a single object converted to the configured model
* 'save' returns a single object converted to the configured model
