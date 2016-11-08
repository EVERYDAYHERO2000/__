"use strict";

var YA = window.YA || {};
YA.__elems = [];
YA.__events = [];
YA.__blocks = [];
YA.__count = 0;

/**
 * Создает Элемент. Если задан proto.parent добавляет объект в массив YA.__elems и создаёт DOM элемент в родителе.
 * @param   {object}   proto  Объект, прототип элемента
 * @param   {function} callback В качестве аргумента получает созданный объект
 * @returns {object} Возвращает объект
 */
YA.Element = function (proto, callback) {
  proto.namespace = proto.namespace || 'http://www.w3.org/1999/xhtml';
  proto.tag = proto.tag || 'div';
  proto.id = proto.id || 'elem_' + ++YA.__count;
  this.__proto = proto;
  this.__events = {};
  this.__id = proto.id;
  var _this = this;

  /**
   * С аргументов устанавливает содержимое элемента, без аргумента возвращает содержимое элемента.
   * @param   {string} value строка, может содержать html символы. 
   * @returns {string} Содержимое элемента 
   */
  this.content = function (value) {
    return (value) ? proto.elem.innerHTML = proto.content = value : proto.elem.innerHTML;
  }

  /**
   * Удаляет контент, содержимое элемента
   * @returns {string} возвращает пустую строку
   */
  this.removeContent = function () {
    return proto.elem.innerHTML = proto.content = '';
  }

  /**
   * С аргументом функция добавляет новый css class, без аргумента возвращает массив с класами.
   * @param   {Array} value Массив или строку с именами класов
   * @returns {Array} Массив с класами.
   */
  this.class = function (value) {
    if (value) {
      var newClasses = []
      if (YA.f.ifExist(value, 'object') && YA.f.ifExist(value[0])) {

        for (var _class = 0; _class < value.length; _class++) {
          if (!YA.f.ifExist(value[_class])) continue;
          proto.elem.classList.add(value[_class]);
          newClasses.push(value[_class]);
        }
      } else {
        if (value.length > 0) {
          proto.elem.classList.add(value);
          newClasses.push(value);
        }
      }

      proto.class = (YA.f.ifExist(proto.class, 'string')) ? [proto.class] : proto.class;

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
   * Удаляет css класс
   * @param {string} value Название класса
   */
  this.removeClass = function (value) {
    proto.elem.classList.remove(value);
    for (var i = 0; i < proto.class.length; i++) {
      if (value === proto.class[i]) proto.class.splice(i, 1);
    }
  }

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
        if (YA.f.ifExist(value, 'object')) {
          for (var _style in value) {
            if (YA.f.ifExist(value[_style])) {
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
        if (YA.f.ifExist(value)) {
          proto.elem.setAttribute(key, value);
          proto.attrs[key] = value;
        }
        break;
      }
    }

    return proto.attrs;
  };

  /**
   * Удаляет атрибут по имени.
   * @param   {string}   key имя атрибута
   * @returns {object} Возвращает объект с атрибутами элемента
   */
  this.removeAttr = function (key) {
    proto.elem.removeAttribute(key);
    delete proto.attrs[key];
    return proto.attrs;
  }

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
      YA.__events.push({
        target: _this.elem(),
        event: e,
        f: f
      });
    }
    if (callback) callback(f);
    return _this.__events;
  };

  /**
   * Удаляет ссылки на соботие из YA.__events и из this.__events. Удаляет событие
   * @param   {string} e Название события которое нужно удалить
   * @returns {Array} this.__events
   */
  this.removeEvent = function (e) {
    for (var i = 0; i < YA.__events.length; i++) {
      if (YA.__events[i].target === _this.elem() && YA.__events[i].f === _this.__events[e]) {
        YA.__events.splice(i, 1);
      }
    }
    _this.elem().removeEventListener(e, _this.__events[e]);
    delete _this.__events[e];
    return _this.__events;
  }

  /**
   * Удаляет элемент из массива YA.__elems и из DOM. 
   */
  this.remove = function () {
    for (var i = 0; i < YA.__elems.length; i++) {
      if (YA.__elems[i].elem() !== _this.elem()) continue;
      YA.__elems[i].elem().parentNode.removeChild(YA.__elems[i].elem());
      YA.__elems.splice(i, 1);
    }
  }

  /**
   * Создаёт элемент. Не доступна из конструктора. 
   */
  function create() {

    if (YA.f.ifMatch(proto.tag, 'text')) {
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

    if (YA.f.ifHtml(proto.parent)) {
      proto.parent = (YA.f.ifMatch(proto.parent.nodeName, '#text')) ? proto.parent.parentNode : proto.parent;
      proto.parent.appendChild(proto.elem);
    }
  }

  create();
  YA.__elems.push(_this);  
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
  proto.id = proto.id || 'block_' + ++YA.__count;

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

      var _ifNode = YA.f.ifExist(proto[_elem].content, 'object');
		
      var element = new YA.Element({
        namespace: proto[_elem].namespace || null,
        parent: parent || null,
		id : proto[_elem].id || null,  
        tag: proto[_elem].tag || null,
        class: proto[_elem].class || null,
        attrs: proto[_elem].attrs || null,
        events: proto[_elem].events || null,
        content: _ifNode ? null : proto[_elem].content,
        callback : proto[_elem].callback || function(){}
      });
		
      proto[_elem].elem = element.elem();
      if (!_this.elem) {
		  _this.elem = element.elem;
	  }

      if (_ifNode) create(element.elem(), proto[_elem].content);
      
      elems.push(element);
    }

  }

  /**
   * Удаляет блок из массива YA.__blocks и из DOM, удаляет все вложенные элементы из YA.__elems 
   */
  this.remove = function () {
    var tempTree;
    for (var i = 0; i < YA.__blocks.length; i++) {
      if (YA.__blocks[i].elem() !== _this.elem()) continue;
      tempTree = YA.__blocks[i].__proto;
      YA.__blocks.splice(i, 1);
    }

    function removeTree(proto) {
      for (var _elem = 0; _elem < proto.length; _elem++) {
        var _ifNode = YA.f.ifExist(proto[_elem].content, 'object');
        for (var i = 0; i < YA.__elems.length; i++) {
          if (proto[_elem].elem !== YA.__elems[i].elem()) continue;
          YA.__elems[i].remove();
        }
        if (_ifNode) removeTree(proto[_elem].content);
      }
    }
    removeTree(tempTree.content);
  }

  create(proto.parent, proto.content);
  YA.__blocks.push(this);
  
  //
  for (var i = 0; i < elems.length; i++){
    if (elems[i].__proto.callback) elems[i].__proto.callback(elems[i]); 
  }
  
  if (callback) callback(this);
  return this;

}


YA.Document = YA.Block;

YA.__ = function (proto, params, inner, callback) {
  var __proto = YA.f.cloner.clone(proto);

  function replace(proto, params) {
    for (var keyA in params){
      for (var keyB in proto){
        if (keyA === keyB){
          if (YA.f.ifExist(params[keyA],'object') && !Array.isArray(params[keyA])){
            replace(proto[keyB], params[keyA]);
          } else {
            proto[keyB] = params[keyA]; 
          }
        }
      }
    }
  };
  replace(__proto, params);

  if (inner) {
    var newContent = [];
    if (__proto.content) newContent.push({ content: __proto.content});
    for (var i = 0; i < inner.length; i++) {
      newContent.push(inner[i]);
    }
    __proto.content = newContent;
  }

  if (callback) callback(__proto);
  return __proto;
}

YA.f = {};

/**
 * Удаляет символы !?()., -$ $ из строки
 * @param   {string} str [[Description]]
 * @returns {string} [[Description]]
 */
YA.f.replace = function (str) {
  return (YA.f.ifExist(str, 'string')) ?
    str.replace(/\-?\$+/gi, '')
    .replace(/\(+/gi, '')
    .replace(/\)+/gi, '')
    .replace(/\.+/gi, '')
    .replace(/\,+/gi, '') : '';
}

YA.f.ifHtml = function (obj) {
  return (typeof Node === "object" ? obj instanceof Node : obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string");
};
/**
 * Производит сравнение двух строк не учитывая регистр символов в строке и удалив лишнии символы.
 * Яндекс = яндекс = ЯНДЕКС
 * @param   {string}  a первая строка
 * @param   {string}  b вторая строка
 * @returns {boolean} Возвращает true если есть совпадение и false если нет.
 */
YA.f.ifMatch = function (a, b) {
  return (YA.f.replace(a).toLowerCase().trim() === YA.f.replace(b).toLowerCase().trim());
};
/**
 * Проверяет существует ли переменная и ее тип
 * @param   {function} str  элемент (строка, массив, объект, число)
 * @param   {string} type тип на который нужно проверить
 * @returns {boolean}  true - если существует, false - если нет.
 */
YA.f.ifExist = function (str, type) {

  return (str === undefined || str === null) ? false : ((type !== undefined) ? (typeof str === type) : true);
};

YA.f.cloner = {
    _clone: function _clone(obj) {
        if (obj instanceof Array) {
            var out = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                var value = obj[i];
                out[i] = (value !== null && typeof value === "object") ? _clone(value) : value;
            }
        } else {
            var out = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var value = obj[key];
                    out[key] = (value !== null && typeof value === "object") ? _clone(value) : value;
                }
            }
        }
        return out;
    },

    clone: function(it) {
        return this._clone({
        it: it
        }).it;
    }
};

YA.loadData = function(url, mimetype, callback) {
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType(mimetype);
	xobj.open('GET', url, true);
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == "200") callback(xobj.responseText);
	};
	xobj.send(null);
}