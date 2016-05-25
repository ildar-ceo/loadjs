# Асинхронная загрузка Javascript и CSS файлов

## Пример 1. Загрузка Jquery
```
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

## Пример 2. Загрузка Angular
```
// Загрузка JQuery Noty
$ldjs.sload('jquery_loaded', ['/assets/noty/jquery.noty.packaged.min.js'], 'noty_loaded');

// Определяем зависимости angular
angular_subscribe([
    'noty_loaded',
]);
angular_require([
    // Мои js
    '/assets/style1.css', 
    '/assets/script1.js',
    
    // Подключаем библиотеки Angular
    [ 'ngResource', ['/assets/angular-resource/angular-resource.min.js',] ],
]);
// Загружаем angularJs
angular_load();
```

# Описание функций

## $ldjs.load(arr, message, deftype)

Загружает асинхронно ресурсы

- arr - ресурсы js и css, которые должны быть загружены. Можно использовать синонимы.
- message (необязательно) - сообщение, которое будет послано, когда ресурсы загружены
- deftype (необязательно) - ресурсы, у которых нельзя определить тип, будут считаться типом deftype. Если deftype не определен система берет значение из переменной $ldjs.deftype

## $ldjs.subscribe(event, callback)

Подписаться на событие event и выполнить callback при его возникновении

## $ldjs.sload(event, arr, message, deftype)

Подписаться на событие event, загрузить затем arr и отправит после загрузки arr сообщение message. В arr можно использовать синонимы.

## $ldjs.onLoad(arr, callback)

Выполнить callback, после загрузки определенного списка ресурсов из arr

## $ldjs.deliver(message)

Отправить сообщение message. Повторно сообщение не отправляется

## $ldjs.deliver_forced(message)

Повторно отправить сообщение message

## $ldjs.alias(name, arr, force)

Создает синоним name с ресурсами arr. 
Если force=1 то функция перезаписывает принудительно синонимы

## angular_subscribe(messages)

Определяет набор сообщений, которые должны быть вызываны, чтобы ангуляр приложении инициализировалось

## angular_require

Определяет какие еще ресурсы должны быть загружены, чтобы ангуляр инициализировался. 
Автоматически добавляет в angular_subscribe эти ресурсы

## angular_load

Начать прогрузку всех ресурсов, указаных в angular_require