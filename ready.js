/*!
* Load JS
* https://github.com/vistoyn/loadjs
* Copyright (c) 2015 - 2017 Ildar Bikmamatov
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 3.0
*/

ObjectAssign( $load, {
	
	_rw : [],
	
	
	/**
	 * Регистрация наблюдателя
	 * @param {string} selector - селектор
	 * @param {callable} f - функция
	 */
	onReady: function(s, f){
		this._rw.push({
			's': s,
			'f': f,
		});
		
		var l = document.querySelectorAll(s);
		for (var j=0, sz=l.length; j < sz; j++){
			f(l[j]);
		}
	},
	
	
	/**
	 * Запуск наблюдателей на DOM элементе
	 * @param {dom} dom - DOM объект, который мониторим
	 */
	runReady: function(dom){
		
		for (var i=0, sz1=this._rw.length; i < sz1; i++){
			var o = this._rw[i];
			
			var l = dom.querySelectorAll(o.s);
			for (var j=0, sz2=l.length; j < sz2; j++){
				o.f(l[j]);
			}
			
		}
		
	},	
	
});