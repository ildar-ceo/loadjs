/*!
* Load JS
* https://github.com/vistoyn/loadjs
* Copyright (c) 2015 - 2017 Ildar Bikmamatov
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 3.0
*/

function $loadEvent(){
	
	Object.assign(this,{
		
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
Object.assign( $loadEvent.prototype, {
	
	
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
	ismj: function(m, f){
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
		
		// Вызываем обработчики события
		setTimeout((function(m, o){
			return function(){
				o.ev.dispatchEvent(new Event(m));
			}
		})(m, this), 1);
		
		
		ms = Date.now() - this.tk;
		
		// Выводим сообщение о доставке, если silent = false
		if(lg && db >= 1)
			console.log('[deliver] ' + ((db == 2) ? (ms + 'ms - '): '') + m);
	},
	
	
	
	/**
	 * Выполнить при возникновении всех событий m функцию f
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
			clb();
	},
	
	
});


function $loadObj(){
	
	Object.assign(this,{
		
		/**
		 * Массив с загружаемыми ресурсами
		 */
		a: [],
		
		
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
		
	});
	
}

Object.assign( $loadObj.prototype, {
	
	/**
	 * Инициализация
	 */
	init: function(){
		$l = $load;
		
		if (this.m == null){
			this.m = 'msg_' + $l.inc + '_loaded';
			$l.inc++;
			this.log = false;
		}
		
		if (this.a.length > 0)
			$l.ev_u._s(this.a, (function(o){
				return function(){
					o.ld();
				}
			})(this));
	},
	
	
	/**
	 * Если были загружены все url
	 */
	ld: function(){
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
		var o = $load(arr, m, d, 0);
		
		/* Выполняем this.run(), загрузку следующих ресурсов из массива a */
		this.success((function(o){
			return function(){
				o.run();
			}
		})(o));
		
		return o;
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
	 * Запускает загрузку ресурсов, указанных в this.a
	 */
	run: function(){
		var rr=[];
		var $l = $load;
		var dft = this.dft;
		for (var i = 0, sz = this.a.length; i < sz; i++){
			
			// Обрабатываем url
			var u = this.a[i];
			
			// Если url2 уже в списке загружаемых файлов, то пропускаем url
			if ($l.is($load.ev_u.st[u])){
				continue;
			}
			
			// Получаем расширение файла
			var e = u.split('.').pop();
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
			if (e == 'js') f=addJs(u);
			else if (e == 'css') f=addCss(u);
			else if (dft == 'js') f=addJs(u);
			else if (dft == 'css') f=addCss(u);
			
			
			// Если DOM объект был создан
			if (f){
				f.onload = (function(u, o){
					return function(){
						$load.ev_u._d(u);
					};
				})(u, this);
				
				f.onerror = (function(u, o){
					return function(){
					};
				})(u, this);
				
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

Object.assign( $load, {
	
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
		return (typeof x != 'undefined') && (x != null);
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
		obj.init();
		
		if (this.is(f))
			obj.success(f);
		
		/**
		 * Если произойдет событие m, то сразу запустим функцию obj.ld()
		 */
		$load.ev_m._s(
			m, 
			(function(o){
				return function(){
					o.ld();
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
		obj.init();
		
		if (this.is(f))
			obj.success(f);
		
		/**
		 * Если загрузятся все ресурсы u, то сразу запустим функцию obj.ld()
		 */
		$load.ev_u._s(
			u, 
			(function(o){
				return function(){
					o.ld();
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
				u = u.split('?').shift();
				a.push(u);
			}
		}
		
		var o = new $loadObj();
		o.a = a;
		o.m = m;
		o.dft = dft;
		o.init();
		
		if (t == 1)
			o.run();
		
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
function onJQueryLoad(func){$load.subscribe('jquery_loaded', func);}
function onScriptsLoad(func){$load.subscribe('scripts_loaded', func);}
function onDocumentLoad(func){$load.subscribe('document_loaded', func);}
