/*!
* Load JS
* https://github.com/vistoyn/loadjs
* Copyright (c) 2015 - 2018 Ildar Bikmamatov
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 3.1
*/
var ObjectAssign = function(obj){
	for (var i = 1;i<arguments.length; i+=1){
		var arg = arguments[i];
		for (var key in arg){
			obj[key] = arg[key];
		}
	}
	return obj;
};
function $loadEvent(){
	
	ObjectAssign(this, {
		
		/**
		 * Обработчик события 
		 */
		ev: document.createDocumentFragment(),	
		
		
		/**
		 * Начальный тик
		 */
		tk: Date.now(),
		
		
		/**
		 * Выводить сообщения
		 */
		log: true,
		
		
		/**
		 * Статус событий:
		 *  0 - не произошло
		 *  1 - произошло
		 */
		st: {
		},
		
	});
	
}
ObjectAssign( $loadEvent.prototype, {
	
	
	/**
	 * Проверяет произошло ли событие или нет
	 * @param {string} m - события
	 */
	ism: function(m){ 
		return $load.is( this.st[m] ) && this.st[m] == 1;
	},
	
	
	/**
	 * Проверяет произошли ли события m
	 * @param {string|array} m - события
	 */
	ismj: function(m){
		if (typeof m == 'string') m=[m];
		for (var i = 0, sz = m.length; i < sz; i++){
			if (!this.ism(m[i])){
				return false;
			}
		}
		return true;
	},
	
	
	/**
	 * Отправка сообщения о том что событие m произошло
	 */
	_d: function(m, lg){
		if (typeof lg == 'undefined') lg = this.log;
		var db = $load.debug;
		
		if ($load.is(this.st[m]) && this.st[m] == 1)
			return;
		
		this.st[m] = 1;
		
		ms = Date.now() - this.tk;
		
		// Выводим сообщение о доставке, если silent = false
		if(lg && db >= 1)
			console.log('[deliver] ' + ((db == 2) ? (ms + 'ms - '): '') + m);
		
		
		// Вызываем обработчики события
		setTimeout((function(m, o){
			return function(){
				o.ev.dispatchEvent(new Event(m));
			}
		})(m, this), 1);
	},
	
	
	
	/**
	 * Выполнить при возникновении всех событий m выполнить функцию clb
	 * @param {string|array} m - Сообщение, на которое нужно подписаться
	 * @param {callable} clb - Функция
	 */
	_s: function(m, clb){
		if (typeof m == 'string') m=[m];
		var f = true;
		
		// Подписываемся на все события, которые не произошли
		for (var i = 0, sz = m.length; i < sz; i++){
			if ( !this.ism(m[i]) ){
				
				this.ev.addEventListener(m[i], (function(m, clb, obj){
					return function(){
						if (obj.ismj(m)) 
							clb();
					}
				})(m, clb, this));
				
				f = false;
			}
		}
		
		// Если все события произошли, тогда запускаем функцию clb()
		if (f)
			setTimeout(clb, 1);
	},
	
	
});


function $loadObj(){
	
	ObjectAssign(this,{
		
		/**
		 * Массив с загружаемыми ресурсами
		 */
		u1: [],
		u2: [],
		
		
		/**
		 * Сообщение, которое будет послано. Может быть null
		 */
		m: null,
		
		
		/**
		 * Тип по умолчанию
		 */
		dft: null,
		
		
		/**
		 * Отправлять сообщение 
		 */
		log: $load.ev_m.log,
		
		
		/**
		 * Цепочка success callback
		 */
		af: [],
		
		
		/**
		 * Флаг была ли обработана цепочка или нет
		 */
		st: 0,
	});
	
}

ObjectAssign( $loadObj.prototype, {
	
	
	/**
	 * Формируем массивы u1 и u2
	 */
	a: function(a){
		this.u1 = [];
		this.u2 = [];
		for (var i=0; i<a.length; i++){
			this.u1.push(a[i]);
			this.u2.push(a[i].split('?').shift());
		}
	},
	
	
	/**
	 * Если были загружены все url
	 */
	ld: function(){
		if (this.st) return;
		this.st = 1;
		
		if (this.m != null)
			$load.ev_m._d(this.m, this.log);
		
		for (var i=0; i<this.af.length; i++){
			setTimeout(this.af[i], 1);
		}
	},
	
	
	
	/**
	 * Загрузка следующей партии
	 */
	load: function(arr, m, d){
		var obj = $load(arr, m, d, 0);
		
		/* Выполняем obj.run(), загрузку следующих ресурсов из массива arr */
		this.success((function(obj){
			return function(){
				obj.run();
			}
		})(obj));
		
		return obj;
	},
	
	
	
	/**
	 * Успешная загрузка партии
	 */
	success: function(f){
		this.af.push(f);
		return this;
	},
	
	
	
	/**
	 * Отправляет сообщение после успешной загрузки партии ресурсов
	 * @param {string} m - Сообщение, которое нужно отправить
	 */	
	deliver: function(m){
		
		if (this.m == null)
			this.m = m;
		
		else
			this.success((function(m){
				return function(){
					$load.deliver(m);
				}
			})(m));
			
		return this;
	},
	
	
	
	/**
	 * Запускает загрузку ресурсов, указанных в this.u2
	 */
	run: function(){
		if (this.st) return;
		$l = $load;
		
		if (this.u2.length == 0 || $l.ev_u.ismj(this.u2)){
			this.ld();
			return;
		}
		else{
			$l.ev_u._s(this.u2, (function(obj){
				return function(){
					obj.ld();
				}
			})(this));
		}
		
		var rr=[];
		var dft = this.dft;
		for (var i = 0, sz = this.u2.length; i < sz; i++){
			
			// Обрабатываем url
			var u1 = this.u1[i];
			var u2 = this.u2[i];
			
			// Если url2 уже в списке загружаемых файлов, то пропускаем url
			if ($l.is($load.ev_u.st[u2])){
				continue;
			}
			
			// Говорим что ресурс грузится
			$load.ev_u.st[u2] = 0;
			
			// Получаем расширение файла
			var e = u2.split('.').pop();
			var f = null;
			
			
			// Функции создания script
			var addJs = function(url){
				f = document.createElement('script');
				f.type = 'text/javascript';
				f.src = url;	
				return f;
			};
			
			// Функции создания link
			var addCss = function(url){
				f = document.createElement("link");
				f.rel = "stylesheet";
				f.type = "text/css";
				f.href = url;		
				return f;
			}
			
			
			// Создаем DOM объект в зависимости от расширения
			if (e == 'js') f=addJs(u1);
			else if (e == 'css') f=addCss(u1);
			else if (dft == 'js') f=addJs(u1);
			else if (dft == 'css') f=addCss(u1);
			
			
			// Если DOM объект был создан
			if (f){
				f.onload = (function(u2, o){
					return function(){
						$load.ev_u._d(u2);
					};
				})(u2, this);
				
				f.onerror = (function(u2, o){
					return function(){
					};
				})(u2, this);
				
				rr.push(f);
			}
		}
		
		// Добавляем созданный DOM объекты в заголовок
		for (var i = 0, sz = rr.length; i < sz; i++){
			$l.h.appendChild(rr[i]);
		}
	},
	
});


function $load(a0, m, d, t){
	return $load.load(a0, m, d, t);
}

ObjectAssign( $load, {
	
	debug: 0,
	h: document.getElementsByTagName('head')[0] || document.documentElement,
	inc: 0,
	
	
	/**
	 * Обработчики событий
	 */
	ev_u: new $loadEvent(),
	ev_m: new $loadEvent(),
	
	
	/**
	 * Проверяет x на существование
	 */
	is: function(x){ 
		return (typeof x != 'undefined') && (x !== null);
	},
	
	
	/**
	 * Объект синонимов.
	 * Ключи - имена
	 * Значения - массивы с загружаемыми скриптами
	 */
	als: {},
	
	
	/**
	 * Устанавливает синоним name
	 *
	 * @param {string} name - Название синонима
	 * @param {array} arr - Массив с загружаемыми ресурсами
	 * @param {boolean} force - Массив с загружаемыми ресурсами
	 */	
	alias: function(name, arr, force){
		if (!this.is(this.als[name]) || this.is(force) && force == 1)
			this.als[name] = arr;
	},
	
	
	/**
	 * Отправляет сообщение
	 * @param {string} m - Сообщение, которое нужно отправить
	 */	
	deliver: function(m){
		this.ev_m._d(m);
	},
	
	
	/**
	 * Подписывается на события
	 * @param {string|array} m - Сообщение, на которое нужно подписаться
	 * @param {callable} f - Функция
	 * @return loadObj
	 */
	subscribe: function(m, f){
		var obj = new $loadObj();
		
		if (this.is(f))
			obj.success(f);
		
		/**
		 * Если произойдет событие m, то сразу запустим функцию obj.ld()
		 */
		$load.ev_m._s(
			m, 
			(function(obj){
				return function(){
					obj.ld();
				}
			})(obj)
		);
		
		return obj;
	},
	
	
	
	/**
	 * Подписывается на загрузку ресурсов
	 * @param {string|array} u - Массив ресурсов, после загрузки которых будет выполнена функция f
	 * @param {callable} f - Функция
	 * @return loadObj
	 */
	onLoad: function(u, f){
		var obj = new $loadObj();
		
		if (this.is(f))
			obj.success(f);
		
		/**
		 * Если загрузятся все ресурсы u, то сразу запустим функцию obj.ld()
		 */
		$load.ev_u._s(
			u, 
			(function(obj){
				return function(){
					obj.ld();
				}
			})(obj)
		);
		
		return obj;
	},
	
	
	
	/**
	 * Загружает массив и отправляет сообщение
	 * @param {array|string} arr - Массив с загружаемыми ресурсами, либо синоним
	 * @param {string} msg - Сообщение, которое будет послано. Может быть null
	 * @param {string} dft - Тип по умолчанию
	 * @param {bool} type - Если 1, то запускает сразу. По умолчанию 1.
	 * @return loadObj
	 */
	load: function(a0, m, dft, t){
		if (!this.is(m)) m = null;
		if (!this.is(dft)) dft = 'js';
		if (!this.is(t)) t = 1;
		
		// Новый массив с загружаемыми ресурсами, преобразованный
		var a = [];
		if (typeof a0 == 'string') a0 = [a0];
		
		// Проверяем есть ли синонимы в a0 и если это синоним, то подставляем нужный массив из alias
		for (var i = 0, sz = a0.length; i < sz; i++){
			var u = a0[i];
			if (this.is(this.als[u])) a = a.concat(this.als[u]);
			else{
				a.push(u);
			}
		}
		
		var o = new $loadObj();
		o.a(a);
		o.m = m;
		o.dft = dft;
		
		if (t == 1){
			o.run();
		}
		
		return o;
	},
	
	
	/**
	 * Подписываемся на сообщение message1, грузим массив arr и генерируем сообщение message2
	 *
	 * @param {array|string} m1 - Сообщение, на которое будем подписываться
	 * @param {array|string} a - Массив с загружаемыми ресурсами, либо синоним
	 * @param {string} m2 - Сообщение, которое будет послано. Может быть null
	 * @param {string} dft - Тип по умолчанию
	 */
	sload: function(m1, a, m2, d){
		return $load.subscribe(m1).load(a, m2, d);
	},
	
});
$load.ev_u.log = false;
document.addEventListener("DOMContentLoaded", function(){ $load.deliver('dom_ready');});
function onJQueryLoaded(func){$load.subscribe('jquery_loaded', func);}
function onScriptsLoaded(func){$load.subscribe('scripts_loaded', func);}
function onDocumentLoaded(func){$load.subscribe('document_loaded', func);}
