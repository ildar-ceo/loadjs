/*!
* load.js
* https://github.com/vistoyn/loadjs
* Copyright (c) 2015 - 2016 Ildar Bikmamatov
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 1.0
*/
var $ldjs={
	
	debug: false,
	
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
		Функция срабатывает, когда файл загружен
	*/
	onLdd: function(url){
		if ($ldjs.debug) console.log('[load] ' + url);
		
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
				if (typeof $ldjs.st[url2] == 'undefined'){
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
				obj.onAllLoaded();
			}
		}
	}
};
function onLoad(arr){return load(arr, 2);}
function load(arr, runExecute){
	/*
		runExecute
		0 - не запускать, подождать вызова функции next
		1 - сразу запустить
		2 - отслеживать загрухку файлов и когда они загружены запустить success
	*/
	if (typeof runExecute == 'undefined') runExecute = 1;
	
	var obj={
		arr:arr,
		f:[],
		head:document.getElementsByTagName('head')[0] || document.documentElement,
		count:0,
		
		success:null,
		load:null,
		execute: null,
		
		next:null, // следующая load функция на запуск
		callbackSuccess:null, // callback функция успешной загрзуки всех файлов
		onAllLoaded:null,
	};
	
	var arr2=[];
	
	function bindFuncSuccess(obj){
		return function(func){
			obj.callbackSuccess = func;
			return obj;
		}
	}
	obj.success=bindFuncSuccess(obj);
	function bindFuncLoad(obj){
		return function(arr){
			obj.next = load(arr,0);
			return obj.next;
		}
	}		
	obj.load=bindFuncLoad(obj);
	
	function bindFuncExecute(obj){
		return function(){
			if (obj.count > 0){
				for(var i in obj.f){
					obj.head.appendChild(obj.f[i]);
				}
			}
			else{
				obj.onAllLoaded();
			}
		}
	}		
	obj.execute=bindFuncExecute(obj);
	
	function bindonLdd(url,status){
		return function(){
			if (status == 'success'){
				$ldjs.onLdd(url);
			}
		};
	}
	function bindOnAllLoaded(obj){
		return function(){
			/* 
				Эта функция вызовется, когда весь arr будет загружен.
				Она должна запустить следующий load
			*/
			if (obj.callbackSuccess != null) obj.callbackSuccess();
			if (obj.next != null) if(obj.next.execute != null) obj.next.execute(); // Запустить следующую цепочку
		}
	}
	obj.onAllLoaded = bindOnAllLoaded(obj);
	
	if (runExecute == 2){
		var flag = true;
		for (var i in arr){
			var url = arr[i];
			var url2 = url.split('?').shift();
			arr2.push(url2);
			if (typeof $ldjs.st[url2] != 'undefined'){
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
			function bindExec(obj){
				return function(){
					obj.onAllLoaded();
				}
			}
			setTimeout(bindExec(obj), 1);
		}
		return obj;
	}
	
	for (var i in arr){
		var url = arr[i];
		var url2 = url.split('?').shift()
		
		if (typeof $ldjs.st[url2] != 'undefined'){
			continue;
		}
		
		var ext = url.split('.').pop();
		ext = ext.split('?').shift();
		var f=null;
		if (ext == 'js'){
			f = document.createElement('script');
			f.type = 'text/javascript';
			f.src = url;	
			obj.count++;
		}
		else if (ext == 'css'){
			f=document.createElement("link");
			f.setAttribute("rel", "stylesheet");
			f.setAttribute("type", "text/css");
			f.setAttribute("href", url);			
			obj.count++;
		}
		if (f){
			f.onload = bindonLdd(url,'success');
			f.onerror = bindonLdd(url,'error');
			obj.f.push(f);
			
			$ldjs.st[url2]=1;
			arr2.push(url2);
		}
	}
	
	if (obj.count > 0){
		$ldjs.cl.unshift({
			obj:obj,
			arr:arr2,
		});
	}
	if (runExecute == 1){
		function bindExec(obj){
			return function(){
				obj.execute();
			}
		}
		setTimeout(bindExec(obj), 1);
	}
	
	return obj;
}