"use strict";

var __ = window.__ || {};


__.lib = {};

__.app = {};

__.app.target = document.body;

/**
 * Добавить новый элемент в коллекцию
 * @param   {string} name  Уникальное имя элемента в коллекции
 * @param   {object} proto описание прототипа объекта
 * @returns {object} __
 */
__.add = function (name, proto) {

	/**
	 * Конструтрор объекта для элемента в коллекции
	 * @param   {string} name  Имя элемента в коллекции
	 * @param   {object} proto прототип объекта
	 * @returns {object} возвращает объект элемент коллекции с методами
	 */
	var block = function (name, proto) {

		var __this__ = this;

		proto.class = proto.class || [];
		proto.class.push(name);
		this.proto = proto;
		this.name = name;

		/**
		 * Ищет и возвращает последний вложенный content в структуре элемента 
		 * @private
		 * @param   {object} [obj=__this__.proto] Прототип элемента. По умолчанию this
		 * @param   {function} callback             в качестве аргумента получает объект элемента
		 * @returns {object} возвращает ссылку на последний вложенный content в структуре элемента
		 */
		this._out = function (obj, callback) {
			var out;
			obj = obj || __this__.proto;

			/**
			 * Рекурсивная функция, ищет последний content в объекте
			 * @param {object} obj Объект коллекции в котором ищется content
			 */
			function getContent(obj) {
				for (var key in obj) {
					if (key !== 'content') continue;

					if (typeof obj[key] === 'object') {

						getContent(obj[key][0]);
					} else {
						out = obj;
					}
				}
			}
			getContent(obj);
			if (callback) callback(__this__);
			return out;
		}

		this.out = this._out();

		/**
		 * Создаёт и возвращает глубокую копию объекта элемента из коллекции
		 * @private
		 * @param   {object} [obj=__this__.proto] Объект для клонирования. По умолчанию this
		 * @param   {function} callback            в качестве аргумента получает объект элемента
		 * @returns {object} Копия элемента из коллекции
		 */
		this._clone = function (obj, callback) {
			obj = obj || __this__.proto;

			/**
			 * Рекурсивная функция, клонирует объект
			 * @param   {[[Type]]} obj Объект коллекции который необходимо склонировать
			 * @returns {object} возвращает дубликат объекта
			 */
			function clone(obj) {
				if (obj == null || typeof (obj) != 'object') return obj;
				var temp = new obj.constructor();
				for (var key in obj) temp[key] = clone(obj[key]);
				return temp;
			}

			var proto = clone(obj);
			var block = {
				proto: proto,
				name: __this__.name,
				out: __this__._out(proto),
				__proto__: __this__
			}
			if (callback) callback(__this__);
			return block;
		}

		this.count = function (num, callback) {
				var arr = [];
				for (var i = 0; i < num; i++) {
					var clone = __this__._clone();
					arr.push(callback(clone, i));
				}

				return arr;
			}
			/**
			 * Удаляет элемент из коллекции
			 * @param   {function} callback в качестве аргумента получает объект элемента
			 * @returns {object} __
			 */
		this.remove = function (callback) {
			if (callback) callback(__this__);
			return __.remove(__this__.name);
		}

		/**
		 * Находит элемент в коллекции
		 * @param   {string} name     Имя элемента в коллекции
		 * @param   {function} callback в качестве аргумента получает объект элемента
		 * @returns {object} __
		 */
		this.find = function (name, callback) {
			if (callback) callback(__this__);
			return __.find(name);
		}

		/**
		 * Определяет потомков элемента, создаётся вложенность в this.out.content
		 * @param   {Array} arr      Массив вложенных элементов
		 * @param   {function} callback в качестве аргумента получает объект элемента
		 * @returns {object} возвращает элемент с вложениями
		 */
		this.child = function () {
			var clone = __this__._clone();
			var out = clone.out;
			out.content = [];
			for (var key = 0; key < arguments.length; key++) {
				if (Object.prototype.toString.call(arguments[key]) === '[object Array]') {
					for (var i = 0; i < arguments[key].length; i++) {
						out.content.push(arguments[key][i].proto);
					}
				} else {
					out.content.push(arguments[key].proto);
				}
			}

			return clone;
		}

		/**
		 * Создаёт строку в this.out.content
		 * @param   {string} str      Строку с text/html
		 * @param   {function} callback в качестве аргумента получает объект элемента
		 * @returns {object} возвращает элемент с строкой в content
		 */
		this.content = function (str, callback) {

			var clone = __this__._clone();
			var out = clone.out;
			out.content = str;
			if (callback) callback(__this__);

			return clone;
		}

		return this;
	};

	this.lib[name] = new block(name, proto);

	return this.lib[name];
}

/**
 * Удаляет элемент из коллекции по имени
 * @param   {string} name имя элемента который следует удалить из коллекции
 * @returns {object} __
 */
__.remove = function (name) {
	if (name in this.lib) delete this.lib[name];
	return this;
}

/**
 * Возвращает колличество элементов в коллекции
 * @returns {object} __
 */
__.count = function () {
	return Object.keys(this.lib).length;
}

/**
 * Ищет элемент в коллекции по имени
 * @param   {string} name Имя элемента
 * @returns {object} Возвращает объекст элемента из коллекции
 */
__.find = function (name) {
	if (name in this.lib) return this.lib[name];
}

/**
 * Инициализирует построения структуры дерева элементов из коллекции
 * @param   {object} parent   dom элемент родитель в котором нужно построить структуру
 * @param   {Array} arr     массив элементов из коллекции
 * @param   {function} callback в качестве аргумента получает __
 * @returns {object} __
 */
__.build = function () {
	var parent = __.app.target;
	var tree = {
		parent: parent,
		content: []
	};

	for (var key = 0; key < arguments.length; key++) {
		if (Object.prototype.toString.call(arguments[key]) === '[object Array]') {
			for (var i = 0; i < arguments[key].length; i++) {
				tree.content.push(arguments[key][i].proto);
			}
		} else {
			tree.content.push(arguments[key].proto);
		}
	}


	var YA = {};

	/**
	 * Создает Элемент. Если задан proto.parent добавляет объект в массив YA.__elems и создаёт DOM элемент в родителе.
	 * @param   {object}   proto  Объект, прототип элемента
	 * @param   {function} callback В качестве аргумента получает созданный объект
	 * @returns {object} Возвращает объект
	 */
	YA.Element = function (proto, callback) {
		proto.namespace = proto.namespace || 'http://www.w3.org/1999/xhtml';
		proto.tag = proto.tag || 'div';
		this.__proto = proto;
		this.__events = {};
		this.__id = proto.id;
		var _this = this;

		/**
		 * Возвращает пространство имён
		 * @returns {string} 
		 */
		this.namespace = function () {
			return proto.namespace;
		};

		/**
		 * Возвращает DOM элемент
		 * @returns {object}
		 */
		this.elem = function () {
			return proto.elem;
		};

		/**
		 * Возвращает DOM элемент родителя
		 * @returns {object}
		 */
		this.parent = function () {
			return proto.parent;
		};

		/**
		 * Возвращает tag элемента
		 * @returns {string}
		 */
		this.tag = function () {
			return proto.tag;
		};

		/**
		 * С аргументов устанавливает содержимое элемента, без аргумента возвращает содержимое элемента.
		 * @param   {string} value строка, может содержать html символы. 
		 * @returns {string} Содержимое элемента 
		 */
		this.content = function (value) {
			return (value) ? proto.elem.innerHTML = proto.content = value : proto.elem.innerHTML;
		}

		/**
		 * С аргументом функция добавляет новый css class, без аргумента возвращает массив с класами.
		 * @param   {Array} value Массив или строку с именами класов
		 * @returns {Array} Массив с класами.
		 */
		this.class = function (value) {
			if (value) {
				var newClasses = []
				if (__.f.ifExist(value, 'object') && __.f.ifExist(value[0])) {

					for (var _class = 0; _class < value.length; _class++) {
						if (!__.f.ifExist(value[_class])) continue;
						proto.elem.classList.add(value[_class]);
						newClasses.push(value[_class]);
					}
				} else {
					if (value.length > 0) {
						proto.elem.classList.add(value);
						newClasses.push(value);
					}
				}

				proto.class = (__.f.ifExist(proto.class, 'string')) ? [proto.class] : proto.class;

				if (!proto.class) proto.class = [];

				proto.class = function (arr) {
					var obj = {};

					for (var i = 0; i < arr.length; i++) {
						obj[arr[i]] = true;
					}

					return Object.keys(obj);
				}(proto.class.concat(newClasses));
			}

			return proto.class;
		};


		/**
		 * Если задан атрибут value создает новый атрибут для элемента. Если задан только key возвращает значение атрибута.
		 * @param   {string} key Имя атрибута
		 * @param   {object} value Объект или строка со значением атрибута. Объект в случии атрибута style
		 * @returns {object} возвращает список всех атрибутов элемента
		 */
		this.attrs = function (key, value) {

			if (value) {
				switch (key) {

				case 'style':
					if (__.f.ifExist(value, 'object')) {
						for (var _style in value) {
							if (__.f.ifExist(value[_style])) {
								proto.elem.style[_style] = value[_style];
								proto.attrs[key][_style] = value[_style];
							}
						}
					} else {
						proto.elem.setAttribute('style', value);
						proto.attrs[key] = value;
					}
					break;

				default:
					if (__.f.ifExist(value)) {
						proto.elem.setAttribute(key, value);
						proto.attrs[key] = value;
					}
					break;
				}
			}

			return proto.attrs;
		};


		/**
		 * C аргументом устанавливает новое событие, без аргумента возвращает массив с событиями.
		 * @param   {string}   e        название события
		 * @param   {function} f        функция
		 * @param   {function} callback получает в качестве аргумента функцию события
		 * @returns {Array}    Массив с событиями
		 */
		this.events = function (e, f, callback) {
			if (f) {
				proto.elem.addEventListener(e, f);
				_this.__events[e] = f;

			}
			if (callback) callback(f);
			return _this.__events;
		};


		/**
		 * Создаёт элемент. Не доступна из конструктора. 
		 */
		function create() {

			if (__.f.ifMatch(proto.tag, 'text')) {
				proto.elem = document.createTextNode(proto.content || '');
			} else {
				proto.elem = document.createElementNS ? document.createElementNS(proto.namespace, proto.tag) : document.createElement(proto.tag);
				_this.content(proto.content || '');

				for (var _attr in proto.attrs) {
					_this.attrs(_attr, proto.attrs[_attr]);

				}

				_this.class(proto.class);

				for (var _event in proto.events) {
					_this.events(_event, proto.events[_event])
				}
			}

			if (__.f.ifHtml(proto.parent)) {
				proto.parent = (__.f.ifMatch(proto.parent.nodeName, '#text')) ? proto.parent.parentNode : proto.parent;
				proto.parent.appendChild(proto.elem);
			}
		}

		create();
		if (callback) callback(this);
		return this;
	}

	/**
	 * Создает Блок, набор элементов. Если задан proto.parent добавляет объект в массив YA.__blocks и создаёт DOM элементы в родителе.
	 * @param   {object}   proto     Конструкия описывающая блок из набора элементов.
	 * @param   {object} callback Функция в качестве аргумента получает объект с корневым DOM элементом
	 * @returns {object} возвращает объект
	 */
	YA.Block = function (proto, callback) {

		var _this = this;
		this.__proto = proto;
		this.__id = proto.id;
		this.elem = null;

		var elems = [];

		/**
		 * Создаёт блок. Не доступна из конструктора. 
		 * @param {object} ссылка на родителя
		 * @param {object} proto    Объект с описанием свойств элемента
		 */
		function create(parent, proto) {

			for (var _elem = 0; _elem < proto.length; _elem++) {

				var _ifNode = __.f.ifExist(proto[_elem].content, 'object');

				var element = new YA.Element({
					namespace: proto[_elem].namespace || null,
					parent: parent || null,
					id: proto[_elem].id || null,
					tag: proto[_elem].tag || null,
					class: proto[_elem].class || null,
					attrs: proto[_elem].attrs || null,
					events: proto[_elem].events || null,
					content: _ifNode ? null : proto[_elem].content,
					callback: proto[_elem].callback || function () {}
				});

				proto[_elem].elem = element.elem();
				if (!_this.elem) {
					_this.elem = element.elem;
				}

				if (_ifNode) create(element.elem(), proto[_elem].content);

				elems.push(element);
			}

		}

		create(proto.parent, proto.content);


		for (var i = 0; i < elems.length; i++) {
			if (elems[i].__proto.callback) elems[i].__proto.callback(elems[i]);
		}

		if (callback) callback(this);
		return this;

	}
	YA.Block(tree);

	return this;
};

__.select = function (node) {
	__.app.target = node;
	return this;
}

__.f = {};

/**
 * Удаляет символы !?()., -$ $ из строки
 * @param   {string} str [[Description]]
 * @returns {string} [[Description]]
 */
__.f.replace = function (str) {
	return (__.f.ifExist(str, 'string')) ?
		str.replace(/\-?\$+/gi, '')
		.replace(/\(+/gi, '')
		.replace(/\)+/gi, '')
		.replace(/\.+/gi, '')
		.replace(/\,+/gi, '') : '';
}

__.f.ifHtml = function (obj) {
	return (typeof Node === "object" ? obj instanceof Node : obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string");
};
/**
 * Производит сравнение двух строк не учитывая регистр символов в строке и удалив лишнии символы.
 * Яндекс = яндекс = ЯНДЕКС
 * @param   {string}  a первая строка
 * @param   {string}  b вторая строка
 * @returns {boolean} Возвращает true если есть совпадение и false если нет.
 */
__.f.ifMatch = function (a, b) {
	return (__.f.replace(a).toLowerCase().trim() === __.f.replace(b).toLowerCase().trim());
};
/**
 * Проверяет существует ли переменная и ее тип
 * @param   {function} str  элемент (строка, массив, объект, число)
 * @param   {string} type тип на который нужно проверить
 * @returns {boolean}  true - если существует, false - если нет.
 */
__.f.ifExist = function (str, type) {

	return (str === undefined || str === null) ? false : ((type !== undefined) ? (typeof str === type) : true);
};