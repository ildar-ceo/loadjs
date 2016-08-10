/*!
* Loadjs
* https://github.com/vistoyn/loadjs
* Copyright (c) 2015 - 2016 Ildar Bikmamatov
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 1.2
*/
var $ldjs={
	
	is: function(x){ return typeof x != 'undefined' },
	
	// Если не можем распознать формат загружаемого файла, то считаем что он js
	deftype: 'js',
	
	/*
		Степень отладки
			0 - ничего не выводить
			1 - выводить deliver
			2 - выводить deliver + load
	*/
	debug: 0,
	
	/*
		Объект синонимов.
		Ключи - имена
		Значения - массивы с загружаемыми скриптами
	*/
	alias:{
	},
	
	/*
		Статус загружаемых файлов
		1 - грузится
		2 - загружен
	*/
	st:{
	},
	
	/*
		Массив Callback Функций
		Хранятся объекты вида
		{
			func: function(){},
			arr:[] - массив файлов, которые должны быть загружены, чтобы сработала func
		}
	*/
	cl:[
	],
	
	/*
		Функция срабатывает, когда файл url загружен
	*/
	onLdd: function(url){
		if ($ldjs.debug >= 2) console.log('[load] ' + url);
		
		url = url.split('?').shift();
		$ldjs.st[url]=2;
		
		//console.log($ldjs.st);
		//console.log($ldjs.cl);
		
		// Пройдемся по Callback функциям
		for (var i = $ldjs.cl.length -1; i >= 0 ; i--){
			var cl = $ldjs.cl[i];
			var flag = true;
			for (var j in cl.arr){
				var url2 = cl.arr[j];
				if (!$ldjs.is($ldjs.st[url2])){ //if (typeof $ldjs.st[url2] == 'undefined'){
					flag = false;
					break;
				}
				if ($ldjs.st[url2] != 2){
					flag = false;
					break;
				}
			}
			if (flag){
				var obj = cl.obj;
				$ldjs.cl.splice(i, 1);
				obj.ald();
			}
		}
	},
	
	// Функция асинхронной загрузки
	_load: function (arr0, runExecute, deftype){
		/*
			runExecute
			0 - не запускать загрузку файлов, подождать вызова функции nxt
			1 - сразу запустить загрузку файлов
			2 - отслеживать загрузку файлов и когда они загружены запустить success
		*/
		if (!$ldjs.is(runExecute)) runExecute = 1; //if (typeof runExecute == 'undefined') runExecute = 1;
		if (!$ldjs.is(deftype)) deftype = $ldjs.deftype; 
		
		arr = [];
		if (typeof arr0 == 'string') arr0 = [arr0];
		
		// Проверяем есть ли синонимы в arr0 и если это синоним, то подставляем нужный массив из $ldjs.alias
		for (var i in arr0){
			var url = arr0[i];
			if ($ldjs.is($ldjs.alias[url]))
				arr = arr.concat($ldjs.alias[url])
			else
				arr.push(url);
		}
		
		var obj={
			arr:arr,
			f:[], // Массив с DOM объектами script и link
			head:document.getElementsByTagName('head')[0] || document.documentElement,
			count:0,
			
			success:null,
			load:null,
			execute: null,
			
			nxt:null, // следующий объект obj
			clbs:null, // callback функция успешной загрузки всех файлов, эта функция передается в success
			ald:null, // Функция, которая вызывается, когда весь массив arr загружен. Она запускает следующую цепочку
		};
		
		var arr2=[];
		
		obj.success=(function (obj){
			return function(func){
				obj.nxt = $ldjs._load([],0);
				obj.clbs = func;
				return obj.nxt;
			}
		})(obj);
		
		obj.load=(function (obj){
			return function(arr){
				obj.nxt = $ldjs._load(arr,0);
				return obj.nxt;
			}
		})(obj);
		
		/*
			Запускает загрузку следующих файлов в цепочке
		*/
		obj.execute=(function (obj){
			return function(){
				if (obj.count > 0){
					for(var i in obj.f){
						obj.head.appendChild(obj.f[i]);
					}
				}
				else{
					obj.ald();
				}
			}
		})(obj);
		
		/* 
			Эта функция вызовется, когда весь arr будет загружен.
			Она должна запустить функцию, переданную в success
			Также запустить следующую цепочку obj.nxt
		*/
		obj.ald = (function(obj){
			return function(){
				if (obj.clbs != null) setTimeout(obj.clbs,1);
				if (obj.nxt != null) if(obj.nxt.execute != null) obj.nxt.execute(); // Запустить следующую цепочку
			}
		})(obj);
		
		
		// Отслеживать статус загрузки файлов, и запустить цепочку success когда файлы будут загружены
		// Если все файлы уже запущены, то сразу запустить
		// Запускаеться функция obj.ald
		if (runExecute == 2){
			var flag = true;
			for (var i in arr){
				var url = arr[i];
				var url2 = url.split('?').shift();
				arr2.push(url2);
				if ($ldjs.is($ldjs.st[url2])){ //if (typeof $ldjs.st[url2] != 'undefined'){
					if ($ldjs.st[url2] == 2)
						continue;
				}
				flag = false;
			}
			if (!flag){
				$ldjs.cl.unshift({
					obj:obj,
					arr:arr2,
				});
			}
			else{
				setTimeout(
					(function(obj){
						return function(){
							obj.ald();
						}
					})(obj), 
					1
				);
			}
			return obj;
		}
		
		// Формируем массив obj.f с DOM объектами script и link
		// В head их пока не добавляем
		for (var i in arr){
			var url = arr[i];
			var url2 = url.split('?').shift()
			
			/* 
			Оставил, вдруг пригодиться
			Здесь происходит удаление из url2 только get параметра _
			Сейчас же удаляются все get параметры
			
			var a = url.split('?');
			var url2 = a[0];
			var get_params = a[1];
			
			// Игнорируем get параметр _. Нужен, чтобы дебажить js скрипты
			if ($ldjs.is(get_params)){ // if (typeof get_params != 'undefined'){
				url2 = url2 + '?';
				var get_params_arr = get_params.split('&');
				for (var j in get_params_arr){
					var param = get_params_arr[j];
					var param_arr = param.split('=');
					
					// проверяем get parametr
					if (param_arr[0] != '_' && $ldjs.is(param_arr[1]))
						url2 = url2 + param_arr[0] + "=" + param_arr[1] + '&';
				}
			}
			
			// Удаляет последний символ из строки если он равен ch
			var $del = function(str, ch){
				var sz = str.length;
				if (sz == 0) return str;
				if (str[sz-1] == ch) return str.substring(0, sz - 1);
				return str;
			}
			
			// Удаляем символы & и ? в конце url
			url2 = $del(url2, '&');
			url2 = $del(url2, '?');
			*/
			
			// Если url2 уже в списке загружаемых файлов, то пропускаем url
			if ($ldjs.is($ldjs.st[url2])){ // if (typeof $ldjs.st[url2] != 'undefined'){
				continue;
			}
			
			// Получаем расширение файла
			var ext = url.split('.').pop();
			ext = ext.split('?').shift();
			var f=null;
			
			// Функции создания script
			var addJs = function(obj, url){
				f = document.createElement('script');
				f.type = 'text/javascript';
				f.src = url;	
				obj.count++;
				return f;
			};
			
			// Функции создания link
			var addCss = function(obj, url){
				f=document.createElement("link");
				f.setAttribute("rel", "stylesheet");
				f.setAttribute("type", "text/css");
				f.setAttribute("href", url);			
				obj.count++;
				return f;
			}
			
			// Создаем DOM объект в зависимости от расширения
			if (ext == 'js') f=addJs(obj, url);
			else if (ext == 'css') f=addCss(obj, url);
			else if (deftype == 'js') f=addJs(obj, url);
			else if (deftype == 'css') f=addCss(obj, url);
			
			// Если DOM объект был создан
			if (f){
				f.onload = (function(url,status){
					return function(){
						if (status == 'success'){
							$ldjs.onLdd(url); // Вызываем функцию успешной загрузки скрипта
						}
					};
				})(url,'success');
				
				f.onerror = (function(url,status){
					return function(){
					};
				})(url,'error');
				
				obj.f.push(f);
				
				$ldjs.st[url2]=1;
				arr2.push(url2);
			}
		}
		
		// Добавим в мониторинг объект obj
		if (obj.count > 0){
			$ldjs.cl.unshift({
				obj:obj,
				arr:arr2,
			});
		}
		
		// Стартуем загрузку файлов, если runExecute == 1
		if (runExecute == 1){
			function bindExec(obj){
				return function(){
					obj.execute();
				}
			}
			setTimeout(bindExec(obj), 1);
		}
		
		return obj;
	},
	
	/*
		Функция создания синонимов name <=> arr
		Если вам нужно переопределить значение, то передайте force = 1
	*/
	alias: function(name, arr, force){
	
		if ($ldjs.is($ldjs.alias[name]) && force != 1)
			return;
	
		// Добавляем синоним. Сперва проверяем arr точно массив, если это строка, то делаем массив
		if (typeof arr == 'string') arr = [arr];
		$ldjs.alias[name] = arr;
	},
	
	
	// Возникает, когда загружены ресурсы в arr
	onLoad: function(arr){
		return $ldjs._load(arr, 2);
	},
	
	// Загружаем arr и отправляем событие deliver
	// Также можно вызывать после этого функцию .success(function(){  ...  })
	load: function(arr, deliver, deftype){
		return (function (arr, deliver, deftype){
			
			// Если доставка сообщения не определена, то просто передаем объект load
			if (!$ldjs.is(deliver)) return $ldjs._load(arr, 1, deftype); 
			
			// Создаем callback с доставкой сообщения
			return $ldjs
				._load(arr, 1, deftype)
				.success((function(deliver){
					return function(){ 
						$ldjs.deliver(deliver); 
					}
				})(deliver));
		})(arr, deliver, deftype);
	},
	
	// При возникновении события subscribe загружаем arr и отправляем событие deliver
	sload: function(subscribe, arr, deliver, deftype){
		$ldjs.subscribe(subscribe, (function (arr, deliver, deftype){
			return function(){
				$ldjs.load(arr, deliver, deftype);
			}
		})(arr, deliver, deftype));
	},
	
	
	/* ----------------------------------- */
	/*        subscribe & deliver          */
	/* ----------------------------------- */
	
	/*
		Объект с событиями и callback функциями
		Ключи объекта - события. Если событий много, то они разделенными запятой. Ключ всегда строка
		Значение - массив функций, которые нужно выполнить
	*/
	ev:{},
	
	/*
		Таблица состояний
		Ключ - событие, одно без запятых
		Значение 1 или 0. 
			1 - событие произошло
			0 - еще не произошло
		Если события нет в таблице состояний, то оно не произошло
	*/
	ev_st:{},
	
	/*
		Функция, подписывающее на событие
	*/
	subscribe: function(event, func){
		// Конвертируем массив в строку
		var arr = event;
		if (typeof event == 'string'){
			arr = event.split(',');
		}
		
		// Проверяем, все события, объявленные в event произошли?
		var flag = true;
		for (var i=0;i<arr.length;i++){
			var x = arr[i];
			
			if (!$ldjs.is($ldjs.ev_st[x])){flag = false; break;}
			//if (typeof $ldjs.ev_st[x] == 'undefined'){flag = false; break;}
			
			if ($ldjs.ev_st[x] != 1){flag = false; break;}
		}
		
		// Если все события произошли то запускаем сразу функцию
		if (flag){
			func();
		}
		
		// Иначе добавляем в массив $ldjs.ev
		else{
			if (typeof event == 'array' || typeof event == 'object') event = event.join(',');
			
			if (!$ldjs.is($ldjs.ev[event]))  $ldjs.ev[event] = [];
			//if (typeof $ldjs.ev[event] == 'undefined') $ldjs.ev[event] = [];
			
			$ldjs.ev[event].push(func);
		}
	},
	
	/*
		Функция, callback для события
	*/
	_deliver: function(event, params){
		
		// Проверяем, если событие уже раньше возникало, тогда обработчик не запускаем
		if ($ldjs.is($ldjs.ev_st[event]) && $ldjs.ev_st[event] == 1) // if (typeof $ldjs.ev_st[event] != 'undefined')
			return;
				
		// Устанавливаем флаг, событие произошло
		if ($ldjs.debug >= 1) console.log('[deliver] ' + event);
		$ldjs.ev_st[event] = 1;
		
		// Проходим по всем подпискам на события
		// Подписка хранится ввиде строки, разделенная запятыми
		for (var z in $ldjs.ev){
			var arr = z.split(',');
			
			// Проверяем произошло ли событие
			// Т.е. в таблице состояний ev_st у всех событий должно быть 1
			var flag = true;
			for (var i=0;i<arr.length;i++){
				var x = arr[i];
				
				if (!$ldjs.is($ldjs.ev_st[x]) || $ldjs.ev_st[x] != 1){flag = false; break;}
				//if (typeof $ldjs.ev_st[x] == 'undefined'){flag = false; break;}
				//if ($ldjs.ev_st[x] != 1){flag = false; break;}
			}
			
			// Если все состояния установлены, то выполнить callback
			if (flag && arr.indexOf(event) != -1){
				for (var i in $ldjs.ev[z]){
					$ldjs.ev[z][i](params);
				}
			}
		}
	},
	
	// Отправляем событие
	deliver: function(event, params){
		setTimeout((function(event, params){
			return function(){
				$ldjs._deliver(event, params);
			}
		})(event, params), 1);
	},
	
	// Повторно отправляем событие
	deliver_forced: function(event, params){
		$ldjs.ev_st[event] = 0;
		$ldjs.deliver(event, params);
		$ldjs.ev_st[event] = 0;
	},
	
};
function onJQueryLoad(func){$ldjs.subscribe('jquery_loaded', func);}
function onScriptsLoad(func){$ldjs.subscribe('scripts_loaded', func);}
function onDocumentLoad(func){$ldjs.subscribe('document_loaded', func);}