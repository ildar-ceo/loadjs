# Асинхронная загрузка Javascript и CSS файлов

## Пример 1. Загрузка Jquery
```javascript
// Объявляем синонимы
$ldjs.alias('jquery', ['/assets/jquery/jquery.all.js']);
$ldjs.alias('jquery_inputmask', ['/assets/jquery/jquery.inputmask.js',]);
$ldjs.alias('mfp', ['/assets/mfp/magnific-popup.css','/assets/mfp/jquery.magnific-popup.js',]);

// Загружаем основные скрипты
$ldjs.load('jquery', 'jquery_loaded')
.load(['/assets/script1.js'])
.load(['/assets/script2.js'])
.success(function(){
    $ldjs.deliver('scripts_loaded');
});

// Загружаем inputmask
$ldjs.sload('jquery_loaded', 'jquery_inputmask', 'jquery_inputmask_loaded');

// Загружаем magnific-popup
$ldjs.sload('jquery_loaded', 'mfp', 'mfp_loaded');

// Подписываемся на событие scripts_loaded
$ldjs.subscribe(['scripts_loaded', 'mfp_loaded', 'jquery_inputmask_loaded'], function(){
	
	$ldjs.load('/assets/all.js')
	.success(function(){
		console.log('All init!');
	});
	
});
```

## Пример 2. Асинхронная загрузка Angular
```html
<html>
<head>

<!-- Можно исходный код скриптов loadjs прописать прямо на странице -->
<script src='/assets/load.min.js'></script>
<script src='/assets/angular.load.min.js'></script>

<script>
	$ldjs.alias('jquery', ['/assets/jquery/jquery.all.js']);
	$ldjs.alias('noty', '/assets/noty/jquery.noty.packaged.min.js');
	$ldjs.alias('angular-resource', ['/assets/angular-resource/angular-resource.min.js']);
	$ldjs.alias('angular-app', ['/assets/myCtrl.css', '/assets/myCtrl.js']);
	$ldjs_ng.min = '/assets/angular/angular.min.js';
	
	// Загрузка JQuery Noty
	$ldjs.sload('jquery_loaded', 'noty', 'noty_loaded');

	// Определяем зависимости angular
	angular_subscribe([
		'noty_loaded',
	]);
	angular_require([
		// Скрипты для angular приложения
		'angular-app',

		// Подключаем сторонние библиотеки Angular
		[ 'ngResource', 'angular-resource' ],
	]);
	// Загружаем angularJs
	angular_load();

</script>

</head>
<body>

	<div ng-controller='myCtrl'>
	</div>

</body>
</html>
```

# Описание функций

## $ldjs.load(arr, message, deftype)

Загружает асинхронно ресурсы. 

- arr - ресурсы js и css, которые должны быть загружены. Можно использовать синонимы.
- message (необязательно) - сообщение, которое будет послано, когда ресурсы загружены
- deftype (необязательно) - ресурсы, у которых нельзя определить тип, будут считаться типом deftype. Если deftype не определен система берет значение из переменной $ldjs.deftype

Функция возвращает объект, в котором объявлены функции success и load. т.е. можно выполнить следующую цепочку действий:

```javascript
$ldjs.load('/assets/jquery/jquery.all.js')
.success(function(){
    console.log('Jquery загрузили');
})

// Паралельно загружаем три ресурса
.load([
    '/assets/jquery/jquery.form.js',
    '/assets/jquery-ui/jquery-ui.min.js',
    '/assets/jquery-ui/jquery-ui.min.css'
])

// Скрипт main.js загрузиться после загрузки трех ресурсов
.load('/assets/main.js') 

// Вызываем функцию после успешной загрузки всех ресурсов
.success(function(){
    console.log('Все ресурсы загружен');
})
```

## $ldjs.onLoad(arr)

Выполнить цепочку функций, после загрузки определенного списка ресурсов из arr. После onLoad можно указывать функции load и success как для $ldjs.load().

Важный момент! Функция onLoad отслеживает загрузку ресурсов без учета GET параметров. Не важно будет ли загружаться jquery.all.js?_=100
или jquery.all.js?_=200 
если подписаться на jquery.all.js, то цепочка функции выполниться. Это полезно для отладки своих скриптов, которые браузер будет случайно кэшировать.

Пример:

```javascript
// Загружаем jquery
$ldjs.load('/assets/jquery/jquery.all.js?_=100')
// Паралельно загружаем три ресурса
.load([
    '/assets/jquery/jquery.form.js',
    '/assets/jquery-ui/jquery-ui.min.js',
    '/assets/jquery-ui/jquery-ui.min.css'
])

// После загрузки jquery вызываем функцию
$ldjs.onLoad('/assets/jquery/jquery.all.js').success(function(){
    console.log('Jquery загружен');
});

// После загрузки jquery и jquery-ui вызываем функцию
$ldjs.onLoad([
    '/assets/jquery/jquery.all.js', 
    '/assets/jquery-ui/jquery-ui.min.js'
])
.success(function(){
    console.log('Jquery-ui загружен');
});
```

## $ldjs.subscribe(event, callback)

Подписаться на событие event и выполнить callback при его возникновении

- event - события (строка или массив), на которое мы подписываемся.
- callback - функция, которая будет вызывана, когда будет отправлены все сообщения, указанные в event. 

Примеры:

```javascript
// Загружаем jquery и посылаем событие jquery_loaded
$ldjs.load('/assets/jquery/jquery.all.js', 'jquery_loaded');

// Подписываемся на загрузку jquery
$ldjs.subscribe('jquery_loaded', function(){
    console.log('Jquery загружен');
});

// Подписываемся на несколько событий
$ldjs.subscribe(['jquery_loaded', 'jquery_form_loaded'], function(){
    console.log('Jquery и формы загружены');
});
```

## $ldjs.deliver(message)

Отправить сообщение message (строка). Повторно сообщения не отправляется. Для того чтобы отправить повтороно используйте $ldjs.deliver_forced.

## $ldjs.deliver_forced(message)

Повторно отправить сообщение message. При повторной отправки сообщения будут вызываны все функции, которые были подписаны на это события.

## $ldjs.sload(event, arr, message, deftype)

Подписаться на событие event, загрузить затем arr и отправит после загрузки arr сообщение message. 

- event - событие, на которое мы подписываемся
- arr - Ресурсы, которые нужно загрузить. В arr можно использовать синонимы.
- message (необязательное) - сообщение, которое будет отправлено после загрузки ресурсов
- deftype (необязательное) - ресурсы, у которых нельзя определить тип, будут считаться типом deftype

Пример:

```javascript
$ldjs.sload('jquery_loaded', '/assets/jquery/jquery.form.js', 'jquery_form_loaded');
```

Является короткой записью функции:
```javascript
$ldjs.subscribe('jquery_loaded', function(){
    // Загрузка JQuery Form
    $ldjs.load(['/assets/jquery/jquery.form.js']).success(function(){
        $ldjs.deliver('jquery_form_loaded')
    });
});
```

## $ldjs.alias(name, arr, force)

Создает синоним name с ресурсами arr. 
Если force=1 то функция перезаписывает принудительно синонимы

```javascript

// Определяем alias
$ldjs.alias('jquery', '/assets/jquery/jquery.all.js');
$ldjs.alias('jquery_ui', [
    '/assets/jquery-ui/jquery-ui.min.js',
    '/assets/jquery-ui/jquery-ui.min.css'
]);
$ldjs.alias('jquery_form', '/assets/jquery/jquery.form.js');

// Загружаем jquery
$ldjs.load('jquery', 'jquery_loaded')

// Паралельно загружаем ресурсы, после загрузки jquery
$ldjs.load('jquery_loaded', 'jquery_ui', 'jquery_ui_loaded');
$ldjs.load('jquery_loaded', 'jquery_form', 'jquery_form_loaded');

// Когда все ресурсы загружены, выполняем функцию
$ldjs.subscribe(['jquery_form_loaded', 'jquery_ui_loaded'], function(){
    console.log('jquery form и jquery ui успешно загружены');
})
```
Если на нужно перепределить путь к jquery, то до вызовов $ldjs.load нужно написать:
```javascript
$ldjs.alias('jquery', '/assets/jquery/jquery.js?_=2', true);
```


# Асинхронная загрузка Angular

## angular_subscribe(messages)

Определяет набор сообщений, которые должны быть вызываны, чтобы ангуляр приложении инициализировалось

## angular_require

Определяет какие еще ресурсы должны быть загружены, чтобы ангуляр инициализировался. 
Автоматически добавляет в angular_subscribe эти ресурсы

## angular_load

Начать прогрузку всех ресурсов, указаных в angular_require

# Рекомендации

Рекомендуется использовать для загрузки ресурсов связку alias + load. 
Функции alias и load могут быть находиться вместе, так и в разных частях страницы. Главное сначала должен быть вызов alias, который объявляет синоним, затем load, который осуществляет загрузку. При этом с помощью alias_forced вы можете переопределить alias.

При использовании данного способа библиотеки будут асинхронно загружены с учетом зависимостей. Также можно будет переопределить синонимы на свои.

## Асинхронная загрузка Яндекс карт
```javscript
$ldjs.alias('yamap', 'https://api-maps.yandex.ru/2.1/?lang=ru_RU');
$ldjs.load('yamap', 'yamap_loaded', 'js');
```

## Асинхронная загрузка Bootstrap

```javascript
$ldjs.alias('bootstrapjs', '/assets/bootstrap/js/bootstrap.min.js');
$ldjs.sload('jquery_loaded', 'bootstrapjs', 'bootstrapjs_loaded');
```

## Асинхронная загрузка Bootstrap datepicker с локализацией

```javascript
$ldjs.alias('bootstrap_datepicker', ['/assets/bootstrap-datepicker/js/bootstrap-datepicker.js',
'/assets/bootstrap-datepicker/css/bootstrap-datepicker.css']);
$ldjs.alias('bootstrap_datepicker_lang', '/assets/bootstrap-datepicker/locales/bootstrap-datepicker.ru.min.js');

$ldjs.subscribe('bootstrapjs_loaded', function(){
    // Загрузка Bootstrap datepicker
    $ldjs.load('bootstrap_datepicker').load('bootstrap_datepicker_lang', 'bootstrap_datepicker_loaded');
});
```

## Асинхронная загрузка CKeditor

```javascript
$ldjs.alias('ckeditor', '/assets/ckeditor/ckeditor.js');
$ldjs.sload('jquery_loaded', 'ckeditor', 'ckeditor_loaded');
```

## Асинхронная загрузка Fancytree

```javascript
$ldjs.alias('jquery_fancytree', ['/assets/jquery-fancytree/jquery.fancytree-all.min.js', '/assets/jquery-fancytree/skin-win8/ui.fancytree.min.css']);
$ldjs.sload('jquery_ui_loaded', 'jquery_fancytree', 'jquery_fancytree_loaded');
```

## Асинхронная загрузка JQuery inputmask

```javascript
$ldjs.alias('jquery_inputmask', '/assets/jquery/jquery.inputmask.js');
$ldjs.sload('jquery_loaded', 'jquery_inputmask', 'jquery_inputmask_loaded');
```

## Асинхронная загрузка JQuery Noty

```javascript
$ldjs.alias('noty', '/assets/noty/jquery.noty.packaged.min.js');
$ldjs.sload('jquery_loaded', 'noty', 'noty_loaded');
```

## Асинхронная загрузка Magnific Popup

```javascript
$ldjs.alias('jquery_mfp', ['/assets/mfp/magnific-popup.css','/assets/mfp/jquery.magnific-popup.js',]);
$ldjs.sload('jquery_loaded', 'jquery_mfp', 'jquery_mfp_loaded');
```

## Асинхронная загрузка Sortable

```javascript
$ldjs.alias('sortable', '/assets/sortable/Sortable.min.js');
$ldjs.load('sortable', 'sortable_loaded');
```

## Асинхронная загрузка JQuery Form

```javascript
$ldjs.alias('jquery_form', '/assets/jquery/jquery.form.js');
$ldjs.sload('jquery_loaded', 'jquery_form', 'jquery_form_loaded');
```

## Асинхронная загрузка JQuery UI

```javascript
$ldjs.alias('jquery_ui', ['/assets/jquery-ui/jquery-ui.min.js','/assets/jquery-ui/jquery-ui.min.css',]);
$ldjs.sload('jquery_loaded', 'jquery_ui', 'jquery_ui_loaded');
```

## Асинхронная загрузка JQuery File Upload

```javascript
$ldjs.alias('jquery_file_upload', '/assets/jquery-file-upload/js/jquery.fileupload.js');
$ldjs.sload('jquery_ui_loaded', 'jquery_file_upload', 'jquery_file_upload_loaded');
```