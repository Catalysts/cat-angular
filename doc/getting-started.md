# Getting started

In this guide you'll learn how to create a mini bookstore.

## The model

To keep things simple our model `Book` only contains three properties:
- an auto-generated `id`
- `name`
- `author`

## Server

TODO

## Client
### Templates

To get a basic CRUD (Create, Read, Update and Delete), you need three templates:
- `list.tpl.html` (shows an overview of all your models, with optional searching/filtering and sorting)
- `details-view.tpl.html` (detail page of a specific object)
- `details-edit.tpl.html` (create and edit page of an object)

#### list template

```
<table class="table">
    <thead>
    <tr>
        <th cat-sortable="name">Name</th>
        <th cat-sortable="author">Author</th>
    </tr>
    </thead>
    <tbody>
    <tr ng-repeat="data in listData.collection">
        <td><a ui-sref="Book.detail({id: data.id})">{{::data.name}}</a></td>
        <td>{{::data.author}}</td>
    </tr>
    </tbody>
</table>
```

Save this file as `book-list.tpl.html` in the `src/main/resources/static/book` directory.
This template generates a table with two columns, Name and Author. The attribute `cat-sortable` marks the column sortable
(the attribute value is the model attribute name). All model objects are in the `listData.collection` array.

#### detail view template

```
<form class="form-horizontal">
    <div class="form-group">
        <label class="col-sm-2 control-label">Name</label>
        <div class="col-sm-10">
            <p class="form-control-static">{{::detail.name}}</p>
        </div>
    </div>
    <div class="form-group">
        <label class="col-sm-2 control-label">Author</label>
        <div class="col-sm-10">
            <p class="form-control-static">{{::detail.author}}</p>
        </div>
    </div>
</form>
```

Save this file as `book-details-view.tpl.html` in the `src/main/resources/static/book` directory.
In this template the model is named `detail`. You can access the model attributes of the `Book` model with `detail.name` and `detail.author`.

#### detail edit template

```
<div class="form-horizontal">
    <div cat-input-group label="Name" name="name">
        <input id="name" ng-model="editDetail.name" class="form-control" />
    </div>

    <div cat-input-group label="Author" name="author">
        <input id="author" ng-model="editDetail.author" class="form-control" />
    </div>
</div>
```

Save this file as `book-details-edit.tpl.html` in the `src/main/resources/static/book` directory.
This template is the form for creating and editing models. The angular model is called `editDetail`.