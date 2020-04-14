import env from '../config/env';
import moment from 'moment'
let _ = {}
let ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
let
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

let nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

let hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
let nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

let optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
};

let property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
};
let MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
let getLength = property('length');
let isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};

let phone_regs = {
    'ar-DZ': /^(\+?213|0)(5|6|7)\d{8}$/,
    'ar-SY': /^(!?(\+?963)|0)?9\d{8}$/,
    'ar-SA': /^(!?(\+?966)|0)?5\d{8}$/,
    'en-US': /^(\+?1)?[2-9]\d{2}[2-9](?!11)\d{6}$/,
    'cs-CZ': /^(\+?420)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,
    'de-DE': /^(\+?49[ \.\-])?([\(]{1}[0-9]{1,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/,
    'da-DK': /^(\+?45)?(\d{8})$/,
    'el-GR': /^(\+?30)?(69\d{8})$/,
    'en-AU': /^(\+?61|0)4\d{8}$/,
    'en-GB': /^(\+?44|0)7\d{9}$/,
    'en-HK': /^(\+?852\-?)?[569]\d{3}\-?\d{4}$/,
    'en-IN': /^(\+?91|0)?[789]\d{9}$/,
    'en-NZ': /^(\+?64|0)2\d{7,9}$/,
    'en-ZA': /^(\+?27|0)\d{9}$/,
    'en-ZM': /^(\+?26)?09[567]\d{7}$/,
    'es-ES': /^(\+?34)?(6\d{1}|7[1234])\d{7}$/,
    'fi-FI': /^(\+?358|0)\s?(4(0|1|2|4|5)?|50)\s?(\d\s?){4,8}\d$/,
    'fr-FR': /^(\+?33|0)[67]\d{8}$/,
    'he-IL': /^(\+972|0)([23489]|5[0248]|77)[1-9]\d{6}/,
    'hu-HU': /^(\+?36)(20|30|70)\d{7}$/,
    'it-IT': /^(\+?39)?\s?3\d{2} ?\d{6,7}$/,
    'ja-JP': /^(\+?81|0)\d{1,4}[ \-]?\d{1,4}[ \-]?\d{4}$/,
    'ms-MY': /^(\+?6?01){1}(([145]{1}(\-|\s)?\d{7,8})|([236789]{1}(\s|\-)?\d{7}))$/,
    'nb-NO': /^(\+?47)?[49]\d{7}$/,
    'nl-BE': /^(\+?32|0)4?\d{8}$/,
    'nn-NO': /^(\+?47)?[49]\d{7}$/,
    'pl-PL': /^(\+?48)? ?[5-8]\d ?\d{3} ?\d{2} ?\d{2}$/,
    'pt-BR': /^(\+?55|0)\-?[1-9]{2}\-?[2-9]{1}\d{3,4}\-?\d{4}$/,
    'pt-PT': /^(\+?351)?9[1236]\d{7}$/,
    'ru-RU': /^(\+?7|8)?9\d{9}$/,
    'sr-RS': /^(\+3816|06)[- \d]{5,9}$/,
    'tr-TR': /^(\+?90|0)?5\d{9}$/,
    'vi-VN': /^(\+?84|0)?((1(2([0-9])|6([2-9])|88|99))|(9((?!5)[0-9])))([0-9]{7})$/,
    'zh-CN': /^(\+?0?86\-?)?^(1\d{10}|\d{3,4}-?\d{6,8})$/,
    'zh-TW': /^(\+?886\-?|0)?9\d{8}$/
};
function typeOf(d){
    return typeof d
}
function isArray(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};

_.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
};

_.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
};

// Return the results of applying the iteratee to each element.
_.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
};

_.isArray = nativeIsArray || isArray
// Perform a deep comparison to check if two objects are equal.
_.isEqual = function(a, b) {
return eq(a, b);
};

// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
_.isEmpty = function(obj) {
if (obj == null) return true;
if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
return _.keys(obj).length === 0;
};

// Is a given value a DOM element?
_.isElement = function(obj) {
return !!(obj && obj.nodeType === 1);
};

// Is a given variable an object?
_.isObject = function(obj) {
var type = typeof obj;
return type === 'function' || type === 'object' && !!obj;
};

// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
_.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
_['is' + name] = function(obj) {
  return toString.call(obj) === '[object ' + name + ']';
};
});

// Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.
if (!_.isArguments(arguments)) {
_.isArguments = function(obj) {
  return _.has(obj, 'callee');
};
}

// Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
// IE 11 (#1621), and in Safari 8 (#1929).
if (typeof /./ != 'function' && typeof Int8Array != 'object') {
_.isFunction = function(obj) {
  return typeof obj == 'function' || false;
};
}

// Is a given object a finite number?
_.isFinite = function(obj) {
return isFinite(obj) && !isNaN(parseFloat(obj));
};

// Is the given value `NaN`? (NaN is the only number which does not equal itself).
_.isNaN = function(obj) {
return _.isNumber(obj) && obj !== +obj;
};

// Is a given value a boolean?
_.isBoolean = function(obj) {
return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
};

// Is a given value equal to null?
_.isNull = function(obj) {
return obj === null;
};

// Is a given variable undefined?
_.isUndefined = function(obj) {
return obj === void 0;
};

_.isDefined = function(obj){
    return typeof obj !== 'undefined'
};

// Shortcut function for checking if an object has a given property directly
// on itself (in other words, not on a prototype).
_.has = function(obj, key) {
return obj != null && hasOwnProperty.call(obj, key);
};

// Utility Functions
// -----------------

// Run Underscore.js in *noConflict* mode, returning the `_` variable to its
// previous owner. Returns a reference to the Underscore object.
_.noConflict = function() {
root._ = previousUnderscore;
return this;
};

// Keep the identity function around for default iteratees.
_.identity = function(value) {
return value;
};

// Predicate-generating functions. Often useful outside of Underscore.
_.constant = function(value) {
return function() {
  return value;
};
};

_.noop = function(){};

_.property = property;

// Generates a function for a given object that returns a given property.
_.propertyOf = function(obj) {
return obj == null ? function(){} : function(key) {
  return obj[key];
};
};

// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
_.matcher = _.matches = function(attrs) {
attrs = _.extendOwn({}, attrs);
return function(obj) {
  return _.isMatch(obj, attrs);
};
};

// Run a function **n** times.
_.times = function(n, iteratee, context) {
var accum = Array(Math.max(0, n));
iteratee = optimizeCb(iteratee, context, 1);
for (var i = 0; i < n; i++) accum[i] = iteratee(i);
return accum;
};

// Return a random integer between min and max (inclusive).
_.random = function(min, max) {
if (max == null) {
  max = min;
  min = 0;
}
return min + Math.floor(Math.random() * (max - min + 1));
};

// A (possibly faster) way to get the current timestamp as an integer.
_.now = Date.now || function() {
return new Date().getTime();
};

export {_}


export function oneOf (value, validList) {
    for (let i = 0; i < validList.length; i++) {
        if (value === validList[i]) {
            return true;
        }
    }
    return false;
}

function deepCopy(data) {
    const t = typeOf(data);
    let o;
    if (isArray(data)) {
        o = [];
        for(let i=0;i<data.length;i++){
            o.push(deepCopy(data[i]))
        }
    } else if ( t === 'object' && data !== null) {
        o = {};
        for(let i in data){
            o[i] = deepCopy(data[i])
        }
    } else {
        return data;
    }
    return o;
}

export {deepCopy};

function title(title) {
    title = title
    window.document.title = title;
};


function hbutton(h,icon,tooltip,color,callback,per){
	let inner = []
	//根据权限显示操作按钮
	let vPer = per?{name:'per',value:per,expression:'',arg:'display',modifiers:{}}:{}
	inner.push(
		h('Icon', {
            props: {
                type: icon
            }
        })
	)
	return h('Button', {
        props: {
            type: color,
            size: 'small'
        },
        style: {
            marginRight: '5px'
        },
        on: {
            click:callback
        },
        directives: [
            {
              name: 'tooltip',
              value: tooltip,
              expression: '',
              arg: 'top-center',
              modifiers: {
                
              }
            },
            vPer
        ]
    }, inner)
}

function durationLabel(duration,map,split){
    let start = ''
    let end   = ''
    let unit  = ''
    if(typeof split === 'undefined'){
        split = '到'
    }
    if(typeof map === 'string'){
        unit  = map
        start = duration[0].toString()+unit
        end   = duration[1].toString()+unit
    }else{
        if(typeof map === 'object'){   
            try{
                start = map[duration[0]-1]['name']
                end   = map[duration[1]-1]['name']
            }catch(e){
                return '--'
            }
            
        }else{
            return '--'
        }
    }

    if(start == end){
        return start
    }

    return [start,split,end].join(' ')
}

function extend(dest,source){
    let reg_int = /^\d+$/
    let reg_float = /^\d+\.\d+$/
    for(let o in source){
        if(typeOf(source[o]) == 'string'){
            if(reg_int.test(source[o])){
                dest[o] = parseInt(source[o])
            }else if(reg_float.test(source[o])){
                dest[o] = parseFloat(source[o])
            }else{
                dest[o] = source[o]
            }
        }else if(isArray(source[o])){
            dest[o] = []
            for(let i = 0,l=source[o].length;i<l;i++){
                if(typeOf(source[o][i] == 'string')){
                    if(reg_int.test(source[o][i])){
                        dest[o].push(parseInt(source[o][i]))
                    }else if(reg_float.test(source[o])){
                        dest[o].push(parseFloat(source[o][i]))
                    }else{
                        dest[o].push(source[o][i])
                    }
                }else{
                    dest[o].push(source[o][i])
                }
            }  
        }else{
            dest[o] = source[o]
        }
    }
}

function date_to_str(date){
    return moment(date).format('YYYY-MM-DD')
}

function format_int_day(date_str){
    let str = date_str.toString()
    str = str.replace(/[^\d]+/g,'')
    return str
}

function format_int_hour(hour_str){
    let str = hour_str.toString()
    str = str.replace(/[:-]/g,'')
    return str
}

function is_date_range_empty(dr){
    return _.isEmpty(dr[0]) && _.isEmpty(dr[1])
}

function get_sql_arr_query(op,arr){
    return '['+[op].concat(arr).join(',')+']'
}

function get_date_query(dr){
    if(is_date_range_empty(dr)){
        return null
    }
    return get_sql_arr_query('Between',dr)
}

function get_int_day_query(dr){
    let int_day_range = []
    if(is_date_range_empty(dr)){
        return null
    }
    int_day_range[0] = format_int_day(dr[0])
    int_day_range[1] = format_int_day(dr[1])
   
    return get_sql_arr_query('Between',int_day_range)
}

function get_in_query(ids){
    if(ids.length == 0){
        return null
    }
    if(_.isString(ids)){
        ids = ids.split(',')
    }
    return get_sql_arr_query('In',ids)
}

function today_range_time(){
    let start = new Date(),
        end   = new Date()
    return [start,end]
}

function today_range(){
    let start,end
    start = date_to_str(today_range_time()[0])
    end = date_to_str(today_range_time()[1])
    return [start,end]
}

function today_int_day(){
    let now_date = new Date()
    let int_day = int(format_int_day(date_to_str(now_date)));
    return int_day;
}

function week_range_time(startDay){
    let start,end,
    cur_date = new Date(),
    cur_week_day,
    cur_time

    cur_date.setHours(0,0,0,0)
    cur_week_day = cur_date.getDay()
    if(cur_week_day == 0){
        cur_week_day = 7
    }
    
    cur_time = cur_date.getTime()
    start = new Date(cur_time - (cur_week_day-1) * 86400000)
    end   = new Date(start.getTime() + 7 * 86400000)
    return [start,end]
}

function week_range() {
    let start,end
    start = date_to_str(week_range_time()[0])
    end = date_to_str(week_range_time()[1])
    return [start,end]
}

function month_range_time(){
    let start,end,
    month_days = [31,28,31,30,31,30,31,31,30,31,30,31],
    cur_date = new Date(),
    cur_month_day,
    cur_time,
    cur_month = cur_date.getMonth(),
    month_day = month_days[cur_month]

    cur_date.setHours(0,0,0,0)
    cur_month_day = cur_date.getDate()
    cur_time = cur_date.getTime()
    

    start = new Date(cur_time - (cur_month_day-1) * 86400000)
    end = new Date(cur_time + (month_day - cur_month_day) * 86400000)
    return [start,end]
}

function month_range() {
    let start,end
    start = date_to_str(month_range_time()[0])
    end = date_to_str(month_range_time()[1])
    return [start,end]
}

function last_week_range_time(week){
    let w = week||1,
        range = week_range_time(1),
        days = w*7,
        ms   = days*86400000

    range[0] = new Date(range[0].getTime() - ms)
    range[1] = new Date(range[1].getTime() - ms -1)

    return range

}

function last_month_range_time(month){
    let m = month || 1,
        month_days = [31,28,31,30,31,30,31,31,30,31,30,31],
        range = month_range_time(1),
        range_m = range[0].getMonth(),
        last_m = range_m - 1
    if(last_m < 0){
        last_m = 11
    }
    let days = month_days[last_m]
    let ms = days*86400000
    range[0] = new Date(range[0].getTime() - ms)
    range[1] = new Date(range[1].getTime() - ms-1)

    return range
}

function recent_week_range_time(week){
    let end = new Date(),
        start = new Date(),
        w = week || 1
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7 * w)
    return [start, end]
}

function recent_week_range(week) {
    let start,end
    start = date_to_str(recent_week_range_time(week)[0])
    end = date_to_str(recent_week_range_time(week)[1])
    return [start,end]
}

function recent_month_range_time(month){
    let end = new Date(),
        start = new Date(),
        m = month || 1
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30 * m)
    return [start, end]
}

function recent_month_range(month) {
    let start,end
    start = date_to_str(recent_month_range_time(month)[0])
    end = date_to_str(recent_month_range_time(month)[1])
    return [start,end]
}

function random(length) {
    var dics = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        str = '',
        index, dl = dics.length;
    if (!_.isEmpty(length)) {
        length = 6;
    }
    for (var i = 0; i < length; i++) {
        index = parseInt(Math.random() * dl);
        index = index > dl ? dl : index;
        index = index < 0 ? 0 : index;
        str += dics.substr(index, 1);
    }
    return str;
}

function zeroPad(n){
    return String(n < 10 ? '0' + n : n)
}

/* ---------获取2017-08-01日期格式的天数差----------*/
function dateDiff(sDate1, sDate2) {
    let aDate, oDate1, oDate2, iDays
    aDate = sDate1.split('-')
    oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]) //转换为08-01-2017格式
    aDate = sDate2.split('-')
    oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0])
    iDays = parseInt(Math.abs(oDate1  -  oDate2)  /  1000  /  60  /  60  /24)    //把相差的毫秒数转换为天数
    return iDays
}

/*---------判断是否是未来的一天----------*/
function isFuture(sDate) {
    let aDate, oDate, now
    aDate = sDate.split('-')
    oDate = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]) //转换为08-01-2017格式
    now = new Date()
    return now - oDate >= 0 ? false : true
}
function dataPart(srcObj,fields){
    let obj = {}
    if(_.isArray(fields) && !_.isEmpty(fields)){
        for(let o in srcObj){
            if(fields.indexOf(o) !== -1){
                obj[o] = srcObj[o]
            }
        }
    }else{
        for(let o in srcObj){
            if(o.substr(0,1) != '$'){
                obj[o] = srcObj[o]
            }
        }
    }
    return obj
}

function int(number){
    return parseInt(number,10)
}

function float(number) {
	return parseFloat(number)
}

function int_day_to_date(int_day){
    var int_day_str = int_day.toString();
    var y = parseInt(int_day_str.substr(0,4),10),
        m = parseInt(int_day_str.substr(4,2),10)-1,
        d = parseInt(int_day_str.substr(6,2),10),
        dt = new Date(y,m,d);
        dt.setHours(0,0,0,0);
    return dt;
}

function int_hour_to_hour_str(int_hour){
    var int_hour_str = int_hour.toString(10).substr(0,4)
    var len = int_hour_str.length
    var str
    if(len == 4){
        str = int_hour_str.substr(0,2)+':'+int_hour_str.substr(2,2)
    }else if(len == 3){
        str = '0'+int_hour_str.substr(0,1)+':'+int_hour_str.substr(1,2)
    }else if(len == 2){
        str = '00:'+int_hour_str
    }else{
        str = '00:0'+int_hour_str
    }
    return str
}

function int_hour_add_minutes(int_hour,minutes){
    let base_str = format_int_hour(int_hour)
    let h, m,
        base_h = parseInt(base_str.substr(0, 2)),
        base_m = parseInt(base_str.substr(2, 2));

    var add_h = 0,
        add_m = 0,
        target_m = base_m + minutes

    if (target_m > 60) {
        add_h = Math.floor(target_m / 60)
        add_m = target_m % 60
        h = (base_h + add_h) % 24
        m = add_m
    } else if (target_m == 60) {
        m = 0
        h = (base_h + 1) % 24
    } else {
        h = base_h
        m = target_m
    }

    if (h < 10) {
        h = '0' + h.toString()
    } else {
        h = h.toString()
    }

    if (m < 10) {
        m = '0' + m.toString()
    } else {
        m = m.toString()
    }

    if(int_hour.indexOf(':') !== -1){
        return h + ':' + m
    }
    return h+m
    
        
}

//自动根据当前的月份判断季节
function auto_season(){
    let month_season_map = {
        1:'H',
        2:'C',
        3:'C',
        4:'C',
        5:'C',
        6:'S',
        7:'S',
        8:'Q',
        9:'Q',
        10:'Q',
        11:'H',
        12:'H'
    },
    cur_month = (new Date()).getMonth()+1
    return month_season_map[cur_month]
}

function sprintf () {
  //  discuss at: http://locutus.io/php/sprintf/
  // original by: Ash Searle (http://hexmen.com/blog/)
  // improved by: Michael White (http://getsprink.com)
  // improved by: Jack
  // improved by: Kevin van Zonneveld (http://kvz.io)
  // improved by: Kevin van Zonneveld (http://kvz.io)
  // improved by: Kevin van Zonneveld (http://kvz.io)
  // improved by: Dj
  // improved by: Allidylls
  //    input by: Paulo Freitas
  //    input by: Brett Zamir (http://brett-zamir.me)
  //   example 1: sprintf("%01.2f", 123.1)
  //   returns 1: '123.10'
  //   example 2: sprintf("[%10s]", 'monkey')
  //   returns 2: '[    monkey]'
  //   example 3: sprintf("[%'#10s]", 'monkey')
  //   returns 3: '[####monkey]'
  //   example 4: sprintf("%d", 123456789012345)
  //   returns 4: '123456789012345'
  //   example 5: sprintf('%-03s', 'E')
  //   returns 5: 'E00'
  var regex = /%%|%(\d+\$)?([-+'#0 ]*)(\*\d+\$|\*|\d+)?(?:\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g
  var a = arguments
  var i = 0
  var format = a[i++]
  var _pad = function (str, len, chr, leftJustify) {
    if (!chr) {
      chr = ' '
    }
    var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr)
    return leftJustify ? str + padding : padding + str
  }
  var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
    var diff = minWidth - value.length
    if (diff > 0) {
      if (leftJustify || !zeroPad) {
        value = _pad(value, minWidth, customPadChar, leftJustify)
      } else {
        value = [
          value.slice(0, prefix.length),
          _pad('', diff, '0', true),
          value.slice(prefix.length)
        ].join('')
      }
    }
    return value
  }
  var _formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
    // Note: casts negative numbers to positive ones
    var number = value >>> 0
    prefix = (prefix && number && {
      '2': '0b',
      '8': '0',
      '16': '0x'
    }[base]) || ''
    value = prefix + _pad(number.toString(base), precision || 0, '0', false)
    return justify(value, prefix, leftJustify, minWidth, zeroPad)
  }
  // _formatString()
  var _formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
    if (precision !== null && precision !== undefined) {
      value = value.slice(0, precision)
    }
    return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar)
  }
  // doFormat()
  var doFormat = function (substring, valueIndex, flags, minWidth, precision, type) {
    var number, prefix, method, textTransform, value
    if (substring === '%%') {
      return '%'
    }
    // parse flags
    var leftJustify = false
    var positivePrefix = ''
    var zeroPad = false
    var prefixBaseX = false
    var customPadChar = ' '
    var flagsl = flags.length
    var j
    for (j = 0; j < flagsl; j++) {
      switch (flags.charAt(j)) {
        case ' ':
          positivePrefix = ' '
          break
        case '+':
          positivePrefix = '+'
          break
        case '-':
          leftJustify = true
          break
        case "'":
          customPadChar = flags.charAt(j + 1)
          break
        case '0':
          zeroPad = true
          customPadChar = '0'
          break
        case '#':
          prefixBaseX = true
          break
      }
    }
    // parameters may be null, undefined, empty-string or real valued
    // we want to ignore null, undefined and empty-string values
    if (!minWidth) {
      minWidth = 0
    } else if (minWidth === '*') {
      minWidth = +a[i++]
    } else if (minWidth.charAt(0) === '*') {
      minWidth = +a[minWidth.slice(1, -1)]
    } else {
      minWidth = +minWidth
    }
    // Note: undocumented perl feature:
    if (minWidth < 0) {
      minWidth = -minWidth
      leftJustify = true
    }
    if (!isFinite(minWidth)) {
      throw new Error('sprintf: (minimum-)width must be finite')
    }
    if (!precision) {
      precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined
    } else if (precision === '*') {
      precision = +a[i++]
    } else if (precision.charAt(0) === '*') {
      precision = +a[precision.slice(1, -1)]
    } else {
      precision = +precision
    }
    // grab value using valueIndex if required?
    value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++]
    switch (type) {
      case 's':
        return _formatString(value + '', leftJustify, minWidth, precision, zeroPad, customPadChar)
      case 'c':
        return _formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad)
      case 'b':
        return _formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
      case 'o':
        return _formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
      case 'x':
        return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
      case 'X':
        return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
        .toUpperCase()
      case 'u':
        return _formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
      case 'i':
      case 'd':
        number = +value || 0
        // Plain Math.round doesn't just truncate
        number = Math.round(number - number % 1)
        prefix = number < 0 ? '-' : positivePrefix
        value = prefix + _pad(String(Math.abs(number)), precision, '0', false)
        return justify(value, prefix, leftJustify, minWidth, zeroPad)
      case 'e':
      case 'E':
      case 'f': // @todo: Should handle locales (as per setlocale)
      case 'F':
      case 'g':
      case 'G':
        number = +value
        prefix = number < 0 ? '-' : positivePrefix
        method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())]
        textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2]
        value = prefix + Math.abs(number)[method](precision)
        return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]()
      default:
        return substring
    }
  }
  return format.replace(regex, doFormat)
}

//将字符串数组转换成int数组
function int_array(arr){
    if(!isArray(arr)){
        return []
    }
    if(arr.length == 1 && arr[0] == ''){
        return []
    }
    for(let i = 0,l=arr.length;i<l;i++){
        arr[i] = int(arr[i])
    }

    return arr
}

function date (format, timestamp) {
  //  discuss at: http://locutus.io/php/date/
  // original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
  // original by: gettimeofday
  //    parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
  // improved by: Kevin van Zonneveld (http://kvz.io)
  // improved by: MeEtc (http://yass.meetcweb.com)
  // improved by: Brad Touesnard
  // improved by: Tim Wiel
  // improved by: Bryan Elliott
  // improved by: David Randall
  // improved by: Theriault (https://github.com/Theriault)
  // improved by: Theriault (https://github.com/Theriault)
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Theriault (https://github.com/Theriault)
  // improved by: Thomas Beaucourt (http://www.webapp.fr)
  // improved by: JT
  // improved by: Theriault (https://github.com/Theriault)
  // improved by: Rafał Kukawski (http://blog.kukawski.pl)
  // improved by: Theriault (https://github.com/Theriault)
  //    input by: Brett Zamir (http://brett-zamir.me)
  //    input by: majak
  //    input by: Alex
  //    input by: Martin
  //    input by: Alex Wilson
  //    input by: Haravikk
  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: majak
  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  // bugfixed by: omid (http://locutus.io/php/380:380#comment_137122)
  // bugfixed by: Chris (http://www.devotis.nl/)
  //      note 1: Uses global: locutus to store the default timezone
  //      note 1: Although the function potentially allows timezone info
  //      note 1: (see notes), it currently does not set
  //      note 1: per a timezone specified by date_default_timezone_set(). Implementers might use
  //      note 1: $locutus.currentTimezoneOffset and
  //      note 1: $locutus.currentTimezoneDST set by that function
  //      note 1: in order to adjust the dates in this function
  //      note 1: (or our other date functions!) accordingly
  //   example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400)
  //   returns 1: '07:09:40 m is month'
  //   example 2: date('F j, Y, g:i a', 1062462400)
  //   returns 2: 'September 2, 2003, 12:26 am'
  //   example 3: date('Y W o', 1062462400)
  //   returns 3: '2003 36 2003'
  //   example 4: var $x = date('Y m d', (new Date()).getTime() / 1000)
  //   example 4: $x = $x + ''
  //   example 4: var $result = $x.length // 2009 01 09
  //   returns 4: 10
  //   example 5: date('W', 1104534000)
  //   returns 5: '52'
  //   example 6: date('B t', 1104534000)
  //   returns 6: '999 31'
  //   example 7: date('W U', 1293750000.82); // 2010-12-31
  //   returns 7: '52 1293750000'
  //   example 8: date('W', 1293836400); // 2011-01-01
  //   returns 8: '52'
  //   example 9: date('W Y-m-d', 1293974054); // 2011-01-02
  //   returns 9: '52 2011-01-02'
  //        test: skip-1 skip-2 skip-5

  var jsdate, f
  // Keep this here (works, but for code commented-out below for file size reasons)
  // var tal= [];
  var txtWords = [
    'Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur',
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  // trailing backslash -> (dropped)
  // a backslash followed by any character (including backslash) -> the character
  // empty string -> empty string
  var formatChr = /\\?(.?)/gi
  var formatChrCb = function (t, s) {
    return f[t] ? f[t]() : s
  }
  var _pad = function (n, c) {
    n = String(n)
    while (n.length < c) {
      n = '0' + n
    }
    return n
  }
  f = {
    // Day
    d: function () {
      // Day of month w/leading 0; 01..31
      return _pad(f.j(), 2)
    },
    D: function () {
      // Shorthand day name; Mon...Sun
      return f.l()
        .slice(0, 3)
    },
    j: function () {
      // Day of month; 1..31
      return jsdate.getDate()
    },
    l: function () {
      // Full day name; Monday...Sunday
      return txtWords[f.w()] + 'day'
    },
    N: function () {
      // ISO-8601 day of week; 1[Mon]..7[Sun]
      return f.w() || 7
    },
    S: function () {
      // Ordinal suffix for day of month; st, nd, rd, th
      var j = f.j()
      var i = j % 10
      if (i <= 3 && parseInt((j % 100) / 10, 10) === 1) {
        i = 0
      }
      return ['st', 'nd', 'rd'][i - 1] || 'th'
    },
    w: function () {
      // Day of week; 0[Sun]..6[Sat]
      return jsdate.getDay()
    },
    z: function () {
      // Day of year; 0..365
      var a = new Date(f.Y(), f.n() - 1, f.j())
      var b = new Date(f.Y(), 0, 1)
      return Math.round((a - b) / 864e5)
    },

    // Week
    W: function () {
      // ISO-8601 week number
      var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3)
      var b = new Date(a.getFullYear(), 0, 4)
      return _pad(1 + Math.round((a - b) / 864e5 / 7), 2)
    },

    // Month
    F: function () {
      // Full month name; January...December
      return txtWords[6 + f.n()]
    },
    m: function () {
      // Month w/leading 0; 01...12
      return _pad(f.n(), 2)
    },
    M: function () {
      // Shorthand month name; Jan...Dec
      return f.F()
        .slice(0, 3)
    },
    n: function () {
      // Month; 1...12
      return jsdate.getMonth() + 1
    },
    t: function () {
      // Days in month; 28...31
      return (new Date(f.Y(), f.n(), 0))
        .getDate()
    },

    // Year
    L: function () {
      // Is leap year?; 0 or 1
      var j = f.Y()
      return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0
    },
    o: function () {
      // ISO-8601 year
      var n = f.n()
      var W = f.W()
      var Y = f.Y()
      return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0)
    },
    Y: function () {
      // Full year; e.g. 1980...2010
      return jsdate.getFullYear()
    },
    y: function () {
      // Last two digits of year; 00...99
      return f.Y()
        .toString()
        .slice(-2)
    },

    // Time
    a: function () {
      // am or pm
      return jsdate.getHours() > 11 ? 'pm' : 'am'
    },
    A: function () {
      // AM or PM
      return f.a()
        .toUpperCase()
    },
    B: function () {
      // Swatch Internet time; 000..999
      var H = jsdate.getUTCHours() * 36e2
      // Hours
      var i = jsdate.getUTCMinutes() * 60
      // Minutes
      // Seconds
      var s = jsdate.getUTCSeconds()
      return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3)
    },
    g: function () {
      // 12-Hours; 1..12
      return f.G() % 12 || 12
    },
    G: function () {
      // 24-Hours; 0..23
      return jsdate.getHours()
    },
    h: function () {
      // 12-Hours w/leading 0; 01..12
      return _pad(f.g(), 2)
    },
    H: function () {
      // 24-Hours w/leading 0; 00..23
      return _pad(f.G(), 2)
    },
    i: function () {
      // Minutes w/leading 0; 00..59
      return _pad(jsdate.getMinutes(), 2)
    },
    s: function () {
      // Seconds w/leading 0; 00..59
      return _pad(jsdate.getSeconds(), 2)
    },
    u: function () {
      // Microseconds; 000000-999000
      return _pad(jsdate.getMilliseconds() * 1000, 6)
    },

    // Timezone
    e: function () {
      // Timezone identifier; e.g. Atlantic/Azores, ...
      // The following works, but requires inclusion of the very large
      // timezone_abbreviations_list() function.
      /*              return that.date_default_timezone_get();
       */
      var msg = 'Not supported (see source code of date() for timezone on how to add support)'
      throw new Error(msg)
    },
    I: function () {
      // DST observed?; 0 or 1
      // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
      // If they are not equal, then DST is observed.
      var a = new Date(f.Y(), 0)
      // Jan 1
      var c = Date.UTC(f.Y(), 0)
      // Jan 1 UTC
      var b = new Date(f.Y(), 6)
      // Jul 1
      // Jul 1 UTC
      var d = Date.UTC(f.Y(), 6)
      return ((a - c) !== (b - d)) ? 1 : 0
    },
    O: function () {
      // Difference to GMT in hour format; e.g. +0200
      var tzo = jsdate.getTimezoneOffset()
      var a = Math.abs(tzo)
      return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4)
    },
    P: function () {
      // Difference to GMT w/colon; e.g. +02:00
      var O = f.O()
      return (O.substr(0, 3) + ':' + O.substr(3, 2))
    },
    T: function () {
      // The following works, but requires inclusion of the very
      // large timezone_abbreviations_list() function.
      /*              var abbr, i, os, _default;
      if (!tal.length) {
        tal = that.timezone_abbreviations_list();
      }
      if ($locutus && $locutus.default_timezone) {
        _default = $locutus.default_timezone;
        for (abbr in tal) {
          for (i = 0; i < tal[abbr].length; i++) {
            if (tal[abbr][i].timezone_id === _default) {
              return abbr.toUpperCase();
            }
          }
        }
      }
      for (abbr in tal) {
        for (i = 0; i < tal[abbr].length; i++) {
          os = -jsdate.getTimezoneOffset() * 60;
          if (tal[abbr][i].offset === os) {
            return abbr.toUpperCase();
          }
        }
      }
      */
      return 'UTC'
    },
    Z: function () {
      // Timezone offset in seconds (-43200...50400)
      return -jsdate.getTimezoneOffset() * 60
    },

    // Full Date/Time
    c: function () {
      // ISO-8601 date.
      return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb)
    },
    r: function () {
      // RFC 2822
      return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb)
    },
    U: function () {
      // Seconds since UNIX epoch
      return jsdate / 1000 | 0
    }
  }

  var _date = function (format, timestamp) {
    jsdate = (timestamp === undefined ? new Date() // Not provided
      : (timestamp instanceof Date) ? new Date(timestamp) // JS Date()
      : new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
    )
    return format.replace(formatChr, formatChrCb)
  }

  return _date(format, timestamp)
}

/**
 * php方法mktime
 * @return {[type]} [description]
 */
function mktime () {
  //  discuss at: http://locutus.io/php/mktime/
  // original by: Kevin van Zonneveld (http://kvz.io)
  // improved by: baris ozdil
  // improved by: Kevin van Zonneveld (http://kvz.io)
  // improved by: FGFEmperor
  // improved by: Brett Zamir (http://brett-zamir.me)
  //    input by: gabriel paderni
  //    input by: Yannoo
  //    input by: jakes
  //    input by: 3D-GRAF
  //    input by: Chris
  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Marc Palau
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  //  revised by: Theriault (https://github.com/Theriault)
  //      note 1: The return values of the following examples are
  //      note 1: received only if your system's timezone is UTC.
  //   example 1: mktime(14, 10, 2, 2, 1, 2008)
  //   returns 1: 1201875002
  //   example 2: mktime(0, 0, 0, 0, 1, 2008)
  //   returns 2: 1196467200
  //   example 3: var $make = mktime()
  //   example 3: var $td = new Date()
  //   example 3: var $real = Math.floor($td.getTime() / 1000)
  //   example 3: var $diff = ($real - $make)
  //   example 3: $diff < 5
  //   returns 3: true
  //   example 4: mktime(0, 0, 0, 13, 1, 1997)
  //   returns 4: 883612800
  //   example 5: mktime(0, 0, 0, 1, 1, 1998)
  //   returns 5: 883612800
  //   example 6: mktime(0, 0, 0, 1, 1, 98)
  //   returns 6: 883612800
  //   example 7: mktime(23, 59, 59, 13, 0, 2010)
  //   returns 7: 1293839999
  //   example 8: mktime(0, 0, -1, 1, 1, 1970)
  //   returns 8: -1

  var d = new Date()
  var r = arguments
  var i = 0
  var e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear']

  for (i = 0; i < e.length; i++) {
    if (typeof r[i] === 'undefined') {
      r[i] = d['get' + e[i]]()
      // +1 to fix JS months.
      r[i] += (i === 3)
    } else {
      r[i] = parseInt(r[i], 10)
      if (isNaN(r[i])) {
        return false
      }
    }
  }

  // Map years 0-69 to 2000-2069 and years 70-100 to 1970-2000.
  r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0)

  // Set year, month (-1 to fix JS months), and date.
  // !This must come before the call to setHours!
  d.setFullYear(r[5], r[3] - 1, r[4])

  // Set hours, minutes, and seconds.
  d.setHours(r[0], r[1], r[2])

  var time = d.getTime()

  // Divide milliseconds by 1000 to return seconds and drop decimal.
  // Add 1 second if negative or it'll be off from PHP by 1 second.
  return (time / 1e3 >> 0) - (time < 0)
}

/**
 * php方法strtotime
 * @param  {[type]} text [description]
 * @param  {[type]} now  [description]
 * @return {[type]}      [description]
 */
function strtotime (text, now) {
  //  discuss at: http://locutus.io/php/strtotime/
  // original by: Caio Ariede (http://caioariede.com)
  // improved by: Kevin van Zonneveld (http://kvz.io)
  // improved by: Caio Ariede (http://caioariede.com)
  // improved by: A. Matías Quezada (http://amatiasq.com)
  // improved by: preuter
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Mirko Faber
  //    input by: David
  // bugfixed by: Wagner B. Soares
  // bugfixed by: Artur Tchernychev
  // bugfixed by: Stephan Bösch-Plepelits (http://github.com/plepe)
  //      note 1: Examples all have a fixed timestamp to prevent
  //      note 1: tests to fail because of variable time(zones)
  //   example 1: strtotime('+1 day', 1129633200)
  //   returns 1: 1129719600
  //   example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200)
  //   returns 2: 1130425202
  //   example 3: strtotime('last month', 1129633200)
  //   returns 3: 1127041200
  //   example 4: strtotime('2009-05-04 08:30:00 GMT')
  //   returns 4: 1241425800
  //   example 5: strtotime('2009-05-04 08:30:00+00')
  //   returns 5: 1241425800
  //   example 6: strtotime('2009-05-04 08:30:00+02:00')
  //   returns 6: 1241418600
  //   example 7: strtotime('2009-05-04T08:30:00Z')
  //   returns 7: 1241425800

  var parsed
  var match
  var today
  var year
  var date
  var days
  var ranges
  var len
  var times
  var regex
  var i
  var fail = false

  if (!text) {
    return fail
  }

  // Unecessary spaces
  text = text.replace(/^\s+|\s+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[\t\r\n]/g, '')
    .toLowerCase()

  // in contrast to php, js Date.parse function interprets:
  // dates given as yyyy-mm-dd as in timezone: UTC,
  // dates with "." or "-" as MDY instead of DMY
  // dates with two-digit years differently
  // etc...etc...
  // ...therefore we manually parse lots of common date formats
  var pattern = new RegExp([
    '^(\\d{1,4})',
    '([\\-\\.\\/:])',
    '(\\d{1,2})',
    '([\\-\\.\\/:])',
    '(\\d{1,4})',
    '(?:\\s(\\d{1,2}):(\\d{2})?:?(\\d{2})?)?',
    '(?:\\s([A-Z]+)?)?$'
  ].join(''))
  match = text.match(pattern)

  if (match && match[2] === match[4]) {
    if (match[1] > 1901) {
      switch (match[2]) {
        case '-':
          // YYYY-M-D
          if (match[3] > 12 || match[5] > 31) {
            return fail
          }

          return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
          match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
        case '.':
          // YYYY.M.D is not parsed by strtotime()
          return fail
        case '/':
          // YYYY/M/D
          if (match[3] > 12 || match[5] > 31) {
            return fail
          }

          return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
          match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
      }
    } else if (match[5] > 1901) {
      switch (match[2]) {
        case '-':
          // D-M-YYYY
          if (match[3] > 12 || match[1] > 31) {
            return fail
          }

          return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
          match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
        case '.':
          // D.M.YYYY
          if (match[3] > 12 || match[1] > 31) {
            return fail
          }

          return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
          match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
        case '/':
          // M/D/YYYY
          if (match[1] > 12 || match[3] > 31) {
            return fail
          }

          return new Date(match[5], parseInt(match[1], 10) - 1, match[3],
          match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
      }
    } else {
      switch (match[2]) {
        case '-':
          // YY-M-D
          if (match[3] > 12 || match[5] > 31 || (match[1] < 70 && match[1] > 38)) {
            return fail
          }

          year = match[1] >= 0 && match[1] <= 38 ? +match[1] + 2000 : match[1]
          return new Date(year, parseInt(match[3], 10) - 1, match[5],
          match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
        case '.':
          // D.M.YY or H.MM.SS
          if (match[5] >= 70) {
            // D.M.YY
            if (match[3] > 12 || match[1] > 31) {
              return fail
            }

            return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
            match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
          }
          if (match[5] < 60 && !match[6]) {
            // H.MM.SS
            if (match[1] > 23 || match[3] > 59) {
              return fail
            }

            today = new Date()
            return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
            match[1] || 0, match[3] || 0, match[5] || 0, match[9] || 0) / 1000
          }

          // invalid format, cannot be parsed
          return fail
        case '/':
          // M/D/YY
          if (match[1] > 12 || match[3] > 31 || (match[5] < 70 && match[5] > 38)) {
            return fail
          }

          year = match[5] >= 0 && match[5] <= 38 ? +match[5] + 2000 : match[5]
          return new Date(year, parseInt(match[1], 10) - 1, match[3],
          match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000
        case ':':
          // HH:MM:SS
          if (match[1] > 23 || match[3] > 59 || match[5] > 59) {
            return fail
          }

          today = new Date()
          return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
          match[1] || 0, match[3] || 0, match[5] || 0) / 1000
      }
    }
  }

  // other formats and "now" should be parsed by Date.parse()
  if (text === 'now') {
    return now === null || isNaN(now)
      ? new Date().getTime() / 1000 | 0
      : now | 0
  }
  if (!isNaN(parsed = Date.parse(text))) {
    return parsed / 1000 | 0
  }
  // Browsers !== Chrome have problems parsing ISO 8601 date strings, as they do
  // not accept lower case characters, space, or shortened time zones.
  // Therefore, fix these problems and try again.
  // Examples:
  //   2015-04-15 20:33:59+02
  //   2015-04-15 20:33:59z
  //   2015-04-15t20:33:59+02:00
  pattern = new RegExp([
    '^([0-9]{4}-[0-9]{2}-[0-9]{2})',
    '[ t]',
    '([0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]+)?)',
    '([\\+-][0-9]{2}(:[0-9]{2})?|z)'
  ].join(''))
  match = text.match(pattern)
  if (match) {
    // @todo: time zone information
    if (match[4] === 'z') {
      match[4] = 'Z'
    } else if (match[4].match(/^([+-][0-9]{2})$/)) {
      match[4] = match[4] + ':00'
    }

    if (!isNaN(parsed = Date.parse(match[1] + 'T' + match[2] + match[4]))) {
      return parsed / 1000 | 0
    }
  }

  date = now ? new Date(now * 1000) : new Date()
  days = {
    'sun': 0,
    'mon': 1,
    'tue': 2,
    'wed': 3,
    'thu': 4,
    'fri': 5,
    'sat': 6
  }
  ranges = {
    'yea': 'FullYear',
    'mon': 'Month',
    'day': 'Date',
    'hou': 'Hours',
    'min': 'Minutes',
    'sec': 'Seconds'
  }

  function lastNext (type, range, modifier) {
    var diff
    var day = days[range]

    if (typeof day !== 'undefined') {
      diff = day - date.getDay()

      if (diff === 0) {
        diff = 7 * modifier
      } else if (diff > 0 && type === 'last') {
        diff -= 7
      } else if (diff < 0 && type === 'next') {
        diff += 7
      }

      date.setDate(date.getDate() + diff)
    }
  }

  function process (val) {
    // @todo: Reconcile this with regex using \s, taking into account
    // browser issues with split and regexes
    var splt = val.split(' ')
    var type = splt[0]
    var range = splt[1].substring(0, 3)
    var typeIsNumber = /\d+/.test(type)
    var ago = splt[2] === 'ago'
    var num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1)
    

    if (typeIsNumber) {
      num *= parseInt(type, 10)
    }

    if (ranges.hasOwnProperty(range) && !splt[1].match(/^mon(day|\.)?$/i)) {
      return date['set' + ranges[range]](date['get' + ranges[range]]() + num)
    }

    if (range === 'wee') {
      return date.setDate(date.getDate() + (num * 7))
    }

    if (type === 'next' || type === 'last') {
      lastNext(type, range, num)
    } else if (!typeIsNumber) {
      return false
    } else if (days.hasOwnProperty(range)){
      //处理周的加减
      date.setTime(date.getTime() + num * 7 * 86400000)
      if(date.getDay() != days[range]){
        if(num > 0){
            while(date.getDay() != days[range]){
                date.setTime(date.getTime() - 86400000)
            }
        }else{
            while(date.getDay() != days[range]){
                date.setTime(date.getTime() + 86400000)
            }
        }
      }

      return date  
    }

    return true
  }

  times = '(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec' +
    '|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?' +
    '|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)'
  regex = '([+-]?\\d+\\s' + times + '|' + '(last|next)\\s' + times + ')(\\sago)?'

  match = text.match(new RegExp(regex, 'gi'))
  if (!match) {
    return fail
  }

  for (i = 0, len = match.length; i < len; i++) {
    if (!process(match[i])) {
      return fail
    }
  }

  return (date.getTime() / 1000)
}

function first_week_begin_day(year) {
　 var tempdate = new Date(year, 0, 1);
　 var temp = tempdate.getDay();
　 if (temp == 1){
　　　 return tempdate;
　 }
　 temp = temp == 0 ? 7 : temp;
   var prevtime = (temp-1)*86400000
   var time = tempdate.getTime()-prevtime
　 return new Date(time);　 
}  

/**
 * 获得一周的开始结束日期
 * @param  {[type]} year [description]
 * @param  {Number} week [description]
 * @return {[type]}      [description]
 */
function weekdate(year,week){ 
    let weekday = {
        start:null,
        end:null
    }
    let first_day = first_week_begin_day(year)
    let time = (week-1)*7*24*3600000
    let week_time = 6*24*3600000
    let start_day = first_day

    start_day.setTime(first_day.valueOf() + time)
    weekday['start'] = start_day
    weekday['end']   = new Date(start_day.valueOf() + week_time)
    return weekday;   
}  

/**
 * 获取指定的周数的日期天数数组
 * @param  {[type]} year [description]
 * @param  {Number} week [description]
 * @return {[type]}      [description]
 */
function week_date_array(year,week){
    /*
    week = week || 1
    let dto = weekdate(year,week)
    let arr = []
    let day_time = 24*3600000
    let start_date = dto.start
    for(let i=0;i<7;i++){
        arr.push(start_date)
        start_date = new Date(start_date.valueOf() + day_time)
    }
    return arr
    */
    let weeks = weekdate(year,week)
    let arr = []
    let start_date = weeks.start 
    let day_time = 24*3600000
    for(let i=0;i<7;i++){
        arr.push(start_date)
        start_date = new Date(start_date.valueOf() + day_time)
    }
    return arr
}

/**
 * 获得指定日期所在周数
 * @param  {[type]} dateobj [description]
 * @return {[type]}         [description]
 */
function get_date_week_no(dateobj) {
    /*
    let date1 = dateobj;
    let year=date1.getFullYear();
    //1月1号
    let date2 = new Date(year, 0, 1);
    //获取1月1号星期（以周一为第一天，0周一~6周日）
    let dateWeekNum=date2.getDay()-1;
    if(dateWeekNum<0){dateWeekNum=6;}
    if(dateWeekNum<4){
        //前移日期
        date2.setDate(date2.getDate()-dateWeekNum);
    }else{
        //后移日期
        date2.setDate(date2.getDate()+7-dateWeekNum);
    }
    let d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
    if(d<0){
        let date3 = new Date(year-1,11,31)
        return getYearWeek(date3);
    }
    //得到年数周数
    let week=Math.ceil((d+1 )/ 7);
    
    return week
    */
    let today = dateobj;
    let firstDay = new Date(today.getFullYear(),0, 1);
    let dayOfWeek = firstDay.getDay(); 
    let spendDay= 1;
    if (dayOfWeek !=0) {
        spendDay=7-dayOfWeek+1;
    }
    firstDay = new Date(today.getFullYear(),0, 1+spendDay);
    let d =Math.ceil((today.valueOf()- firstDay.valueOf())/ 86400000);
    let result =Math.ceil(d/7);
    return result+1;
}

/**
 * 根据日期获取星期
 * @param  {[type]} dt [description]
 * @return {[type]}    [description]
 */
function get_week_day(dt){
    let week_day = dt.getDay()
    if(week_day == 0){
        week_day = 7
    }
    return week_day
}

/**
 * int_day的日期加一年
 * @param  {[type]} int_day [description]
 * @param  {[type]} year    [description]
 * @return {[type]}         [description]
 */
function int_day_add_year(int_day,year){
    int_day = format_int_day(int_day)
    let int_year = int(int_day.substr(0,4))
    int_year = int_year + year
    return int_year.toString() + int_day.substr(4,4)
}

//js浮点运算bug解决函数 add + ,sub - ,mul * ,div /
function add(a, b) {
    var c, d, e;
    try {
        c = a.toString().split(".")[1].length;
    } catch (f) {
        c = 0;
    }
    try {
        d = b.toString().split(".")[1].length;
    } catch (f) {
        d = 0;
    }
    return e = Math.pow(10, Math.max(c, d)), (mul(a, e) + mul(b, e)) / e;
}

function sub(a, b) {
    var c, d, e;
    try {
        c = a.toString().split(".")[1].length;
    } catch (f) {
        c = 0;
    }
    try {
        d = b.toString().split(".")[1].length;
    } catch (f) {
        d = 0;
    }
    return e = Math.pow(10, Math.max(c, d)), (mul(a, e) - mul(b, e)) / e;
}

function mul(a, b) {
    var c = 0,
        d = a.toString(),
        e = b.toString();
    try {
        c += d.split(".")[1].length;
    } catch (f) {}
    try {
        c += e.split(".")[1].length;
    } catch (f) {}
    return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
}

function div(a, b) {
    var c, d, e = 0,
        f = 0;
    try {
        e = a.toString().split(".")[1].length;
    } catch (g) {}
    try {
        f = b.toString().split(".")[1].length;
    } catch (g) {}
    return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), mul(c / d, Math.pow(10, f - e));
}

/**
 * 将Array转化为树形结构
 * @param  {[type]} list  [description]
 * @param  {[type]} pk    [description]
 * @param  {[type]} pid   [description]
 * @param  {[type]} child [description]
 * @param  {[type]} root  [description]
 * @return {[type]}       [description]
 */
function list_to_tree(list, pk, pid, child, root){
    pk    = pk || 'id'
    pid   = pid || 'pid'
    child = child || 'children'
    root  = root || 0

    let tree = []
    let parent = null
    if(_.isArray(list)){
        let refer = {}
        list.forEach((data,index)=>{
            refer[data[pk]] = deepCopy(data)
        })
        list.forEach((data,index)=>{
            let parentId = data[pid]
            if(root == parentId){
                tree.push(refer[data[pk]])
            }else{
                if(_.isDefined(refer[parentId])){
                    parent = refer[parentId]
                    if(!_.isDefined(parent[child])){
                        parent[child] = []
                    }
                    parent[child].push(refer[data[pk]])
                }
            }
        })
    }
    return tree
}
/**
 * 年龄函数
 * @param  {[type]} birth_time [description]
 * @return {[type]}            [description]
 */
function age(birth_time,format){
    //format 1 :默认显示 x岁x月  2:只显示 x岁，3:只显示数字 x
    if(birth_time == 0 || birth_time == '1970-01-01' || birth_time == '1970-01-01 08:00'){
        return '-'
    }
    format = format || 1
    let age = [0,0]
    let now = {year:0,month:0,day:0}
    let input = {year:0,month:0,day:0}
    let now_m = moment((new Date()))
    let input_m = moment(birth_time)
    now.year    = int(now_m.format('YYYY'))
    now.month   = int(now_m.format('M'))
    now.day     = int(now_m.format('D'))
    input.year  = int(input_m.format('YYYY'))
    input.month = int(input_m.format('M'))
    input.day   = int(input_m.format('D'))

    age[0] = now.year - input.year
    age[1] = now.month - input.month

    if(age[1] < 0){
        age[0] = age[0]-1
        age[1] = age[1]+12
    }

    if(age[0] == 0 && age[1] == 0){
        return '-'
    }
    if(format == 2){
        if(age[0] == 0){
            age = age[1]+'个月'
        }else{
            age = age[0]+'岁'
        }
    }else if(format == 3){
        age = age[0]
    }else{
        if(age[0] == 0){
            age = age[1]+'个月'
        }else if(age[0] > 9){
            age = age[0]+'岁'
        }else{
            age = age[0]+'岁'+age[1]+'个月' 
        }
    }

    return age

}
function get_client_height(){
  let clientHeight = 0;
  if(document.body.clientHeight&&document.documentElement.clientHeight){
  	clientHeight = (document.body.clientHeight<document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
  }
  else{
  	clientHeight = (document.body.clientHeight>document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
  }
  
  return clientHeight
}

function is_valid_phone_no(no){
    let isValid = false
    for(let o in phone_regs){
        if(phone_regs[o].test(no)){
            isValid = true
            break
        }
    }
    return isValid
}

function new_date(date_str){
    let arr = date_str.split('-');
    let dt  = new Date();
    dt.setFullYear(int(arr[0]))
    dt.setMonth(int(arr[1])-1,1)
    dt.setDate(int(arr[2]))
    dt.setHours(0)
    dt.setMinutes(0)
    dt.setSeconds(0)
    return dt
}


function char_len(content){
  let ch_reg = /[\u4e00-\u9fa5]/g
  let en_len = (content||"").length
  if(!en_len){
    return 0
  }
  let ch_match = content.match(ch_reg)
  let ch_len = ch_match?ch_match.length:0
  return en_len+ch_len
}

function get_step_unit_price_by_nums(steps,nums,origin_price){
    let price = origin_price
    let has_define = 0 
    if(steps.length == 0){
      return price
    }
    for(let i=0;i<steps.length;i++){
      if(nums <= steps[i].end){
        price = steps[i].price
        has_define = 1
        break
      }
    }
    if(has_define == 0){    //如果没有找到定价，以最后一条定价规则为准
      price = steps[steps.length-1].price
    }
    return price
}

export default {
    int,
    float,
    copy:deepCopy,
    extend,
    title,
    hbutton,
    durationLabel,
    get_sql_arr_query,      //获得GET方式的 SQL数组查询字符串
    get_date_query,         //获得GET方式的 日期格式数组查询字符串
    get_int_day_query,      //获得GET方式的 int_day格式的数组查询字符串
    get_in_query,           //获得GET方式的 in array格式的数组查询字符串
    today_range_time,       //获得今天的日期区间
    today_int_day,          //获得今天的int_day
    week_range_time,        //获得本周的日期区间
    month_range_time,       //获得本月的日期区间
    recent_week_range_time, //获得近几周的日期区间
    recent_month_range_time,//获得近几月的日期区间
    last_week_range_time,   //获得上几周的日期区间
    last_month_range_time,  //获得上几月的日期区间
    today_range,            //获得今天的日期区间(标准格式)
    week_range,             //获得本周的日期区间(标准格式)
    month_range,            //获得本月的日期区间(标准格式)
    recent_week_range,      //获得近几周的日期区间(标准格式)
    recent_month_range,     //获得近几月的日期区间(标准格式)
    random,                 //随机数字
    zeroPad,                //补充0
    dateDiff,               //获取日期天数差
    isFuture,               //判断是否是未来的一天
    dataPart,               //获取数据部分字段
    int_day_to_date,        //将int_day类型转换为日期
    int_hour_to_hour_str,   //将int_hour类型的整数转换成小时字符串900=>09:00
    int_hour_add_minutes,   //整数小时添加分钟数
    sprintf,                //字符串格式化函数
    auto_season,            //自动季节
    format_int_hour,	    //时分转化成int格式
    format_int_day,		    //日期转化成int_day格式
    int_array,              //将文本类型的数组转换成整数型
    date,                   //php同名方法
    mktime,                 //php同名方法
    strtotime,              //php同名方法
    weekdate,               //获得一周的开始及结束日期
    week_date_array,        //获得指定的周数的日期数组
    get_date_week_no,       //获得指定日期所在周数
    get_week_day,           //根据日期获取周期
    int_day_add_year,       //int_day类型的日期加年
    add,                    //+
    sub,                    //-
    mul,                    //*
    div,                    //
    list_to_tree,           //
    age,
    get_client_height,		//获取窗口可视高度
    is_valid_phone_no,      //是否合法电话
    new_date,               //创建新的日期对象
    char_len,               //字符长度
    get_step_unit_price_by_nums //根据数量获取阶梯定价单价
}