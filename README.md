# Async loader JS and CSS files


# Load Jquery

```javascript

$load(['/assets/jquery/dist/jquery.min.js']).load(['/assets/jquery-migrate/jquery-migrate.min.js'])
.success(function(){	
	$load.deliver('jquery_loaded');
});

```


# Load Jquery Plugins

```javascript
$ldjs.subscribe('jquery_loaded', function(){
	
	// jquery.inputmask
	$load(['/assets/jquery.inputmask/dist/min/inputmask/inputmask.min.js', 'jquery_inputmask_loaded']);
});

```


# Description

## $load(arr, message, deftype)

Async load js and css files from arr

- arr - Array of the css and js files
- message (необязательно) - delivery message after load resource.
- deftype (необязательно) - default type of the resource, if extension does not exists.

The function return object $loadObj

```javascript
$load('/assets/jquery/jquery.all.js', 'jquery_loaded')
.success(function(){
    console.log('Jquery loaded');
})

// Load jquery plugins
.load([
    '/assets/jquery/jquery.form.js',
    '/assets/jquery-ui/jquery-ui.min.js',
    '/assets/jquery-ui/jquery-ui.min.css'
])

// The script main.js loaded after 3 previous resources
.load('/assets/main.js') 

// Call success function after load all resources
.success(function(){
    console.log('All resources have been loaded');
})
```



## $load.onLoad(arr)

Subscribes when all resources in the arr is loaded, then run callback function

- arr - Array of the css and js files
- callback

The function return object $loadObj


```javascript
$load.onLoad([
	'/assets/jquery/jquery.form.js',
])
.deliver('jquery_form_loaded')
.success(function(){
	console.log('Jquery form is loaded');
});
```



## $load.subscribe(messages, callback)


Subscribes when all messages are delivered, then run callback function

- messages - Array of the messages
- callback

The function return object $loadObj

```javascript
$load.subscribe('jquery_form_loaded', function(){
	
	// Create jquery form ...
	
});
```


## $load.deliver(message)

Delivery message


## $load.sload(event, arr, message, deftype)

Subscribe and load. Equivalent:

```javascript
$load.subscribe(event).load(arr, message, deftype);
```


## $load.alias(name, arr, force)

Create synonym for name


```javascript
$load.alias('jquery', '/assets/jquery/jquery.all.js');
$load.alias('jquery_ui', [
    '/assets/jquery-ui/jquery-ui.min.js',
    '/assets/jquery-ui/jquery-ui.min.css'
]);
$load.alias('jquery_form', '/assets/jquery/jquery.form.js');


// Load jquery
$load('jquery', 'jquery_loaded')

// Load jquery plugins after jquery load
$load.sload('jquery_loaded', 'jquery_ui', 'jquery_ui_loaded');
$load.sload('jquery_loaded', 'jquery_form', 'jquery_form_loaded');

```
