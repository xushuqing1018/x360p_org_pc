webpackJsonp([66],{1052:function(t,e,n){"use strict";var a=n(1084);e.a={mixins:[a.a],props:{info:{type:Object,default:function(){return{}}}},data:function(){return{}},methods:{handleUploadSuccess:function(t,e){this.upload_process=!1,this.info.logo=t.data.file_url}}}},1053:function(t,e,n){"use strict";e.a={props:{info:{type:Object,default:function(){return{}}}}}},1054:function(t,e,n){var a,o,s;!function(r,i){o=[t,n(1055),n(1057),n(1058)],a=i,void 0!==(s="function"==typeof a?a.apply(e,o):a)&&(t.exports=s)}(0,function(t,e,n,a){"use strict";function o(t){return t&&t.__esModule?t:{default:t}}function s(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function c(t,e){var n="data-clipboard-"+t;if(e.hasAttribute(n))return e.getAttribute(n)}var l=o(e),u=o(n),p=o(a),f="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},d=function(){function t(t,e){for(var n=0;n<e.length;n++){var a=e[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}return function(e,n,a){return n&&t(e.prototype,n),a&&t(e,a),e}}(),m=function(t){function e(t,n){s(this,e);var a=r(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return a.resolveOptions(n),a.listenClick(t),a}return i(e,t),d(e,[{key:"resolveOptions",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action="function"==typeof t.action?t.action:this.defaultAction,this.target="function"==typeof t.target?t.target:this.defaultTarget,this.text="function"==typeof t.text?t.text:this.defaultText,this.container="object"===f(t.container)?t.container:document.body}},{key:"listenClick",value:function(t){var e=this;this.listener=(0,p.default)(t,"click",function(t){return e.onClick(t)})}},{key:"onClick",value:function(t){var e=t.delegateTarget||t.currentTarget;this.clipboardAction&&(this.clipboardAction=null),this.clipboardAction=new l.default({action:this.action(e),target:this.target(e),text:this.text(e),container:this.container,trigger:e,emitter:this})}},{key:"defaultAction",value:function(t){return c("action",t)}},{key:"defaultTarget",value:function(t){var e=c("target",t);if(e)return document.querySelector(e)}},{key:"defaultText",value:function(t){return c("text",t)}},{key:"destroy",value:function(){this.listener.destroy(),this.clipboardAction&&(this.clipboardAction.destroy(),this.clipboardAction=null)}}],[{key:"isSupported",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:["copy","cut"],e="string"==typeof t?[t]:t,n=!!document.queryCommandSupported;return e.forEach(function(t){n=n&&!!document.queryCommandSupported(t)}),n}}]),e}(u.default);t.exports=m})},1055:function(t,e,n){var a,o,s;!function(r,i){o=[t,n(1056)],a=i,void 0!==(s="function"==typeof a?a.apply(e,o):a)&&(t.exports=s)}(0,function(t,e){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var a=function(t){return t&&t.__esModule?t:{default:t}}(e),o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},s=function(){function t(t,e){for(var n=0;n<e.length;n++){var a=e[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}return function(e,n,a){return n&&t(e.prototype,n),a&&t(e,a),e}}(),r=function(){function t(e){n(this,t),this.resolveOptions(e),this.initSelection()}return s(t,[{key:"resolveOptions",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action=t.action,this.container=t.container,this.emitter=t.emitter,this.target=t.target,this.text=t.text,this.trigger=t.trigger,this.selectedText=""}},{key:"initSelection",value:function(){this.text?this.selectFake():this.target&&this.selectTarget()}},{key:"selectFake",value:function(){var t=this,e="rtl"==document.documentElement.getAttribute("dir");this.removeFake(),this.fakeHandlerCallback=function(){return t.removeFake()},this.fakeHandler=this.container.addEventListener("click",this.fakeHandlerCallback)||!0,this.fakeElem=document.createElement("textarea"),this.fakeElem.style.fontSize="12pt",this.fakeElem.style.border="0",this.fakeElem.style.padding="0",this.fakeElem.style.margin="0",this.fakeElem.style.position="absolute",this.fakeElem.style[e?"right":"left"]="-9999px";var n=window.pageYOffset||document.documentElement.scrollTop;this.fakeElem.style.top=n+"px",this.fakeElem.setAttribute("readonly",""),this.fakeElem.value=this.text,this.container.appendChild(this.fakeElem),this.selectedText=(0,a.default)(this.fakeElem),this.copyText()}},{key:"removeFake",value:function(){this.fakeHandler&&(this.container.removeEventListener("click",this.fakeHandlerCallback),this.fakeHandler=null,this.fakeHandlerCallback=null),this.fakeElem&&(this.container.removeChild(this.fakeElem),this.fakeElem=null)}},{key:"selectTarget",value:function(){this.selectedText=(0,a.default)(this.target),this.copyText()}},{key:"copyText",value:function(){var t=void 0;try{t=document.execCommand(this.action)}catch(e){t=!1}this.handleResult(t)}},{key:"handleResult",value:function(t){this.emitter.emit(t?"success":"error",{action:this.action,text:this.selectedText,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)})}},{key:"clearSelection",value:function(){this.trigger&&this.trigger.focus(),window.getSelection().removeAllRanges()}},{key:"destroy",value:function(){this.removeFake()}},{key:"action",set:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"copy";if(this._action=t,"copy"!==this._action&&"cut"!==this._action)throw new Error('Invalid "action" value, use either "copy" or "cut"')},get:function(){return this._action}},{key:"target",set:function(t){if(void 0!==t){if(!t||"object"!==(void 0===t?"undefined":o(t))||1!==t.nodeType)throw new Error('Invalid "target" value, use a valid Element');if("copy"===this.action&&t.hasAttribute("disabled"))throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');if("cut"===this.action&&(t.hasAttribute("readonly")||t.hasAttribute("disabled")))throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');this._target=t}},get:function(){return this._target}}]),t}();t.exports=r})},1056:function(t,e){function n(t){var e;if("SELECT"===t.nodeName)t.focus(),e=t.value;else if("INPUT"===t.nodeName||"TEXTAREA"===t.nodeName){var n=t.hasAttribute("readonly");n||t.setAttribute("readonly",""),t.select(),t.setSelectionRange(0,t.value.length),n||t.removeAttribute("readonly"),e=t.value}else{t.hasAttribute("contenteditable")&&t.focus();var a=window.getSelection(),o=document.createRange();o.selectNodeContents(t),a.removeAllRanges(),a.addRange(o),e=a.toString()}return e}t.exports=n},1057:function(t,e){function n(){}n.prototype={on:function(t,e,n){var a=this.e||(this.e={});return(a[t]||(a[t]=[])).push({fn:e,ctx:n}),this},once:function(t,e,n){function a(){o.off(t,a),e.apply(n,arguments)}var o=this;return a._=e,this.on(t,a,n)},emit:function(t){var e=[].slice.call(arguments,1),n=((this.e||(this.e={}))[t]||[]).slice(),a=0,o=n.length;for(a;a<o;a++)n[a].fn.apply(n[a].ctx,e);return this},off:function(t,e){var n=this.e||(this.e={}),a=n[t],o=[];if(a&&e)for(var s=0,r=a.length;s<r;s++)a[s].fn!==e&&a[s].fn._!==e&&o.push(a[s]);return o.length?n[t]=o:delete n[t],this}},t.exports=n},1058:function(t,e,n){function a(t,e,n){if(!t&&!e&&!n)throw new Error("Missing required arguments");if(!i.string(e))throw new TypeError("Second argument must be a String");if(!i.fn(n))throw new TypeError("Third argument must be a Function");if(i.node(t))return o(t,e,n);if(i.nodeList(t))return s(t,e,n);if(i.string(t))return r(t,e,n);throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList")}function o(t,e,n){return t.addEventListener(e,n),{destroy:function(){t.removeEventListener(e,n)}}}function s(t,e,n){return Array.prototype.forEach.call(t,function(t){t.addEventListener(e,n)}),{destroy:function(){Array.prototype.forEach.call(t,function(t){t.removeEventListener(e,n)})}}}function r(t,e,n){return c(document.body,t,e,n)}var i=n(1059),c=n(1060);t.exports=a},1059:function(t,e){e.node=function(t){return void 0!==t&&t instanceof HTMLElement&&1===t.nodeType},e.nodeList=function(t){var n=Object.prototype.toString.call(t);return void 0!==t&&("[object NodeList]"===n||"[object HTMLCollection]"===n)&&"length"in t&&(0===t.length||e.node(t[0]))},e.string=function(t){return"string"==typeof t||t instanceof String},e.fn=function(t){return"[object Function]"===Object.prototype.toString.call(t)}},1060:function(t,e,n){function a(t,e,n,a,o){var r=s.apply(this,arguments);return t.addEventListener(n,r,o),{destroy:function(){t.removeEventListener(n,r,o)}}}function o(t,e,n,o,s){return"function"==typeof t.addEventListener?a.apply(null,arguments):"function"==typeof n?a.bind(null,document).apply(null,arguments):("string"==typeof t&&(t=document.querySelectorAll(t)),Array.prototype.map.call(t,function(t){return a(t,e,n,o,s)}))}function s(t,e,n,a){return function(n){n.delegateTarget=r(n.target,e),n.delegateTarget&&a.call(t,n)}}var r=n(1061);t.exports=o},1061:function(t,e){function n(t,e){for(;t&&t.nodeType!==a;){if("function"==typeof t.matches&&t.matches(e))return t;t=t.parentNode}}var a=9;if("undefined"!=typeof Element&&!Element.prototype.matches){var o=Element.prototype;o.matches=o.matchesSelector||o.mozMatchesSelector||o.msMatchesSelector||o.oMatchesSelector||o.webkitMatchesSelector}t.exports=n},1084:function(t,e,n){"use strict";e.a={data:function(){return{upload_process:!1,upload_percent:0}},computed:{upload_header:function(){return{"x-token":this.$store.state.user.token,"x-file-key":"file"}},pcUrl:function(){var t=this.$store.state.user.info.product_url,e=this.$store.state.user.info.x_sub_host;return t.split("//")[0]+"//"+e+"."+t.split("//")[1]},mobileUrl:function(){var t=this.$store.state.user.info.product_url,e=this.$store.state.user.info.x_sub_host;return t.split("//")[0]+"//"+e+"."+t.split("//")[1]+"/student/login"}},methods:{save:function(){this.$emit("on-save")},handleUploadError:function(t,e){this.$Notice.warning({title:"文件上传失败",desc:"文件 "+e.name+" 上传失败"})},handleUploadBefore:function(t){this.upload_process=!0,this.upload_percent=0},handleUploadProgress:function(t,e,n){this.upload_percent=t.percent},handleFormatError:function(t){this.upload_process=!1,this.$Notice.warning({title:"文件格式不正确",desc:"文件 "+t.name+" 格式不正确，请上传 jpg 或 png 格式的图片。"})},handleMaxSize:function(t){this.$Notice.warning({title:"超出文件大小限制",desc:"文件 "+t.name+" 太大，不能超过 2M。"})}}}},1217:function(t,e,n){"use strict";function a(t){r||n(1218)}var o=n(1052),s=n(1219),r=!1,i=n(8),c=a,l=i(o.a,s.a,!1,c,null,null);l.options.__file="src/views/system/configs/ui/tab-mobile.vue",e.a=l.exports},1218:function(t,e){},1219:function(t,e,n){"use strict";var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("Form",{attrs:{"label-position":"top"}},[n("Form-item",{attrs:{label:"登录地址"}},[n("Input",{attrs:{value:t.mobileUrl,disabled:""}},[n("Button",{staticClass:"copy-btn",attrs:{slot:"append",type:"ghost","data-clipboard-text":t.mobileUrl},slot:"append"},[t._v("复制")])],1)],1),t._v(" "),n("Form-item",{attrs:{label:"系统名称(登录页及标题栏显示)"}},[n("Input",{attrs:{placeholder:"请输入系统名称"},model:{value:t.info.system_name,callback:function(e){t.$set(t.info,"system_name",e)},expression:"info.system_name"}})],1),t._v(" "),n("Form-item",{attrs:{label:"顶部Logo(格式:.jpg格式,尺寸:200px*50px,文件大小:<= 200KB)"}},[n("img",{staticStyle:{width:"50px",height:"50px",background:"#03a9f3"},attrs:{src:t.info.logo}}),n("br"),t._v(" "),n("Upload",{ref:"upload",attrs:{headers:t.upload_header,"show-upload-list":!1,"on-success":t.handleUploadSuccess,"on-error":t.handleUploadError,format:["jpg","jpeg","png"],"max-size":1024,"on-format-error":t.handleFormatError,"on-exceeded-size":t.handleMaxSize,"on-progress":t.handleUploadProgress,"before-upload":t.handleUploadBefore,name:"file",type:"select",action:"/api/upload"}},[n("Button",{staticClass:"mt-2",attrs:{loading:t.upload_process,type:"ghost",icon:"ios-cloud-upload-outline"}},[t._v("更换顶部LOGO")])],1)],1),t._v(" "),n("Form-item",[n("Button",{attrs:{type:"primary"},on:{click:t.save}},[t._v("保存")])],1)],1)},o=[];a._withStripped=!0;var s={render:a,staticRenderFns:o};e.a=s},1220:function(t,e,n){"use strict";function a(t){r||n(1221)}var o=n(1053),s=n(1222),r=!1,i=n(8),c=a,l=i(o.a,s.a,!1,c,"data-v-a5a40784",null);l.options.__file="src/views/system/configs/ui/preview-mobile.vue",e.a=l.exports},1221:function(t,e){},1222:function(t,e,n){"use strict";var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"login-layout"},[n("div",{staticClass:"logo"},[n("img",{attrs:{src:t.info.logo}})]),t._v(" "),t._m(0)])},o=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"form"},[n("div",{staticClass:"x-login-box"},[n("div",[n("input",{attrs:{readonly:"",type:"text",placeholder:"手机号"}})]),t._v(" "),n("div",[n("input",{attrs:{readonly:"",placeholder:"密码"}})])]),t._v(" "),n("div",{staticClass:"bottom"},[n("button",{staticClass:"x-btn x-btn-lg",attrs:{type:"primary"}},[t._v("登录")])]),t._v(" "),n("div",{staticClass:"bottom-link"},[n("a",[t._v("注册账号")]),t._v(" "),n("span",[t._v("|")]),t._v(" "),n("a",[t._v("忘记密码?")])])])}];a._withStripped=!0;var s={render:a,staticRenderFns:o};e.a=s},1589:function(t,e,n){"use strict";var a=n(490),o=n.n(a),s=(n(4),n(433)),r=n(2445),i=n(1217),c=n(2448),l=n(1220),u=n(1054),p=n.n(u),f=null;e.a={mixins:[s.a],components:{tabPc:r.a,tabMobile:i.a,previewPc:c.a,previewMobile:l.a},data:function(){return{tab:"pc"}},mounted:function(){var t=this;f=new p.a(".copy-btn"),f.on("success",function(e){t.$Message.success("复制成功！"),e.clearSelection()})},destroyed:function(){f.destroy()},computed:{info:function(){return this.$store.state.client.params}},methods:{handleSubmit:function(){var t=this,e="add"===this.action?["post","configs/edit_center_params"]:["put","configs/edit_center_params"],n=o()(e,2),a=n[0],s=n[1],r={cid:this.$store.state.client.cid,params:{}};r.params[this.tab]=this.info[this.tab],this.$http[a](s,r).then(function(e){var n={client:{params:t.info}};t.$Message.success("保存成功!"),t.$store.commit("updateUserInfo",{user:n,action:"changeUI"})},function(e){t.$Message.error(e.message)})}}}},1590:function(t,e,n){"use strict";var a=n(1084);e.a={mixins:[a.a],props:{info:{type:Object,default:function(){return{}}}},data:function(){return{upload_process:!1,upload_percent:0}},methods:{handleUploadSuccess1:function(t,e){this.upload_process=!1,this.info.login_img=t.data.file_url},handleUploadSuccess2:function(t,e){this.upload_process=!1,this.info.big_logo=t.data.file_url},handleUploadSuccess3:function(t,e){this.upload_process=!1,this.info.small_logo=t.data.file_url}}}},1591:function(t,e,n){"use strict";var a=n(48);e.a={mixins:[a.a],props:{info:{type:Object,default:function(){return{}}}},data:function(){return{accountFocus:!1,captchaFocus:!1,passwordFocus:!1,formLogin:{account:"",password:"",captcha:""},captchaUrl:"/api/captcha"}},methods:{inputFocus:function(t,e){var n=t.target.parentNode.style;if(n.borderColor="#5cadff",n.color="#5cadff",e){this[e+"Focus"]=!0}},inputBlur:function(t,e){var n=t.target.parentNode.style;if(n.borderColor="#DDDDDD",n.color="#c5c5c5",e){this[e+"Focus"]=!1}},clearPw:function(){this.formLogin.password="",this.focus("password")},clearAccount:function(){this.formLogin.account="",this.focus("account")}}}},2444:function(t,e){},2445:function(t,e,n){"use strict";function a(t){r||n(2446)}var o=n(1590),s=n(2447),r=!1,i=n(8),c=a,l=i(o.a,s.a,!1,c,null,null);l.options.__file="src/views/system/configs/ui/tab-pc.vue",e.a=l.exports},2446:function(t,e){},2447:function(t,e,n){"use strict";var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("Form",{attrs:{"label-position":"top"}},[n("Form-item",{attrs:{label:"界面风格"}},[n("RadioGroup",{attrs:{type:"button"},model:{value:t.info.theme,callback:function(e){t.$set(t.info,"theme",e)},expression:"info.theme"}},[n("Radio",{attrs:{label:"default"}},[t._v("暗黑")]),t._v(" "),n("Radio",{attrs:{label:"light"}},[t._v("亮白")])],1)],1),t._v(" "),n("Form-item",{attrs:{label:"登录地址"}},[n("Input",{attrs:{value:t.pcUrl,disabled:""}},[n("Button",{staticClass:"copy-btn",attrs:{slot:"append",type:"ghost","data-clipboard-text":t.pcUrl},slot:"append"},[t._v("复制")])],1)],1),t._v(" "),n("Form-item",{attrs:{label:"系统名称(登录页及标题栏显示)"}},[n("Input",{attrs:{placeholder:"请输入系统名称"},model:{value:t.info.system_name,callback:function(e){t.$set(t.info,"system_name",e)},expression:"info.system_name"}})],1),t._v(" "),n("Form-item",{attrs:{label:"版权信息"}},[n("Input",{attrs:{placeholder:"请输入系统名称"},model:{value:t.info.copyright,callback:function(e){t.$set(t.info,"copyright",e)},expression:"info.copyright"}})],1),t._v(" "),n("Form-item",{attrs:{label:"登录页背景图(格式:jpg格式,尺寸:1280px*720px,文件大小:<=300KB)"}},[n("img",{staticStyle:{height:"120px"},attrs:{src:t.info.login_img}}),n("br"),t._v(" "),n("Upload",{ref:"upload",attrs:{headers:t.upload_header,"show-upload-list":!1,"on-success":t.handleUploadSuccess1,"on-error":t.handleUploadError,format:["jpg","jpeg","png"],"max-size":1024,"on-format-error":t.handleFormatError,"on-exceeded-size":t.handleMaxSize,"on-progress":t.handleUploadProgress,"before-upload":t.handleUploadBefore,name:"file",type:"select",action:"/api/upload"}},[n("Button",{staticClass:"mt-2",attrs:{loading:t.upload_process,type:"ghost",icon:"ios-cloud-upload-outline"}},[t._v("更换登录页背景图")])],1)],1),t._v(" "),n("Form-item",{attrs:{label:"顶部Logo(展开)(格式:png(透明).jpg格式,尺寸:200px*50px,文件大小:<= 200KB)"}},[n("img",{staticStyle:{width:"200px",height:"50px",background:"#03a9f3"},attrs:{src:t.info.big_logo}}),n("br"),t._v(" "),n("Upload",{ref:"upload",attrs:{headers:t.upload_header,"show-upload-list":!1,"on-success":t.handleUploadSuccess2,"on-error":t.handleUploadError,format:["jpg","jpeg","png"],"max-size":1024,"on-format-error":t.handleFormatError,"on-exceeded-size":t.handleMaxSize,"on-progress":t.handleUploadProgress,"before-upload":t.handleUploadBefore,name:"file",type:"select",action:"/api/upload"}},[n("Button",{staticClass:"mt-2",attrs:{loading:t.upload_process,type:"ghost",icon:"ios-cloud-upload-outline"}},[t._v("更换顶部LOGO(展开)")])],1)],1),t._v(" "),n("Form-item",{attrs:{label:"顶部Logo(折叠)(格式:png(透明).jpg格式,尺寸:60px*50px,文件大小:<=100KB)"}},[n("img",{staticStyle:{height:"50px",background:"#03a9f3"},attrs:{src:t.info.small_logo}}),n("br"),t._v(" "),n("Upload",{ref:"upload",attrs:{headers:t.upload_header,"show-upload-list":!1,"on-success":t.handleUploadSuccess3,"on-error":t.handleUploadError,format:["jpg","jpeg","png"],"max-size":1024,"on-format-error":t.handleFormatError,"on-exceeded-size":t.handleMaxSize,"on-progress":t.handleUploadProgress,"before-upload":t.handleUploadBefore,name:"file",type:"select",action:"/api/upload"}},[n("Button",{staticClass:"mt-2",attrs:{loading:t.upload_process,type:"ghost",icon:"ios-cloud-upload-outline"}},[t._v("更换顶部LOGO(收起)")])],1)],1),t._v(" "),n("Form-item",[n("Button",{attrs:{type:"primary"},on:{click:t.save}},[t._v("保存")])],1)],1)},o=[];a._withStripped=!0;var s={render:a,staticRenderFns:o};e.a=s},2448:function(t,e,n){"use strict";function a(t){r||n(2449)}var o=n(1591),s=n(2450),r=!1,i=n(8),c=a,l=i(o.a,s.a,!1,c,"data-v-7c380b0f",null);l.options.__file="src/views/system/configs/ui/preview-pc.vue",e.a=l.exports},2449:function(t,e){},2450:function(t,e,n){"use strict";var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"box",style:{background:"url("+t.info.login_img+") no-repeat center center"}},[n("div",{staticClass:"box-login"},[n("div",{staticClass:"login-contanier"},[n("p",{staticClass:"login-header"},[t._v(t._s(t.info.system_name))]),t._v(" "),n("div",{staticClass:"login-content"},[n("div",{staticClass:"input-container user-container"},[n("div",{staticClass:"input-box"},[n("span",{staticClass:"input-placeholder",class:(a={},a.focus=t.accountFocus,a.fill=t.formLogin.account,a)},[t._v("\n\t\t          \t\t账号\n\t\t\t          ")]),t._v(" "),n("input",{directives:[{name:"model",rawName:"v-model",value:t.formLogin.account,expression:"formLogin.account"},{name:"focusme",rawName:"v-focusme",value:"account",expression:"'account'"}],staticClass:"box-input",attrs:{type:"text"},domProps:{value:t.formLogin.account},on:{focus:function(e){t.inputFocus(e,"account")},blur:function(e){t.inputBlur(e,"account")},keyup:function(e){if(!("button"in e)&&t._k(e.keyCode,"enter",13,e.key))return null;e.preventDefault(),t.focus("password")},input:function(e){e.target.composing||t.$set(t.formLogin,"account",e.target.value)}}}),t._v(" "),""!==t.formLogin.account?n("Icon",{staticClass:"input-icon",attrs:{type:"ios-close-empty"},nativeOn:{click:function(e){t.clearAccount(e)}}}):t._e()],1)]),t._v(" "),n("div",{staticClass:"input-container password-container"},[n("div",{staticClass:"input-box"},[n("span",{staticClass:"input-placeholder",class:(o={},o.focus=t.passwordFocus,o.fill=t.formLogin.password,o)},[t._v("\n\t\t\t\t         \t 密码\n\t\t\t          ")]),t._v(" "),n("input",{directives:[{name:"model",rawName:"v-model",value:t.formLogin.password,expression:"formLogin.password"},{name:"focusme",rawName:"v-focusme",value:"password",expression:"'password'"}],staticClass:"box-input",attrs:{type:"password"},domProps:{value:t.formLogin.password},on:{focus:function(e){t.inputFocus(e,"password")},blur:function(e){t.inputBlur(e,"password")},keyup:function(e){if(!("button"in e)&&t._k(e.keyCode,"enter",13,e.key))return null;e.preventDefault(),t.focus("captcha")},input:function(e){e.target.composing||t.$set(t.formLogin,"password",e.target.value)}}}),t._v(" "),""!==t.formLogin.password?n("Icon",{staticClass:"input-icon",attrs:{type:"ios-close-empty"},nativeOn:{click:function(e){t.clearPw(e)}}}):t._e()],1)]),t._v(" "),n("div",{staticClass:"input-container captcha-contanier"},[n("div",{staticClass:"input-box captcha-wrap"},[n("input",{directives:[{name:"model",rawName:"v-model",value:t.formLogin.captcha,expression:"formLogin.captcha"},{name:"focusme",rawName:"v-focusme",value:"captcha",expression:"'captcha'"}],staticClass:"box-input",attrs:{type:"text",placeholder:"计算结果"},domProps:{value:t.formLogin.captcha},on:{focus:function(e){t.inputFocus(e,"captcha")},blur:function(e){t.inputBlur(e,"captcha")},keyup:function(e){if(!("button"in e)&&t._k(e.keyCode,"enter",13,e.key))return null;e.preventDefault(),t.login(e)},input:function(e){e.target.composing||t.$set(t.formLogin,"captcha",e.target.value)}}})]),t._v(" "),n("div",{staticClass:"img-wrap"},[n("img",{attrs:{src:t.captchaUrl}})])]),t._v(" "),n("button",{staticClass:"btn-login mb-2"},[t._v("登录")]),t._v(" "),n("div",{staticClass:"forget_pw cursor text-info pull-right"},[t._v("忘记密码?")]),t._v(" "),n("footer",{staticClass:"footer"},[n("span",{domProps:{innerHTML:t._s(t.info.copyright)}})])])])])]);var a,o},o=[];a._withStripped=!0;var s={render:a,staticRenderFns:o};e.a=s},2451:function(t,e,n){"use strict";var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("div",{staticClass:"row m-0"},[n("div",{staticClass:"col-md-6"},[n("Tabs",{model:{value:t.tab,callback:function(e){t.tab=e},expression:"tab"}},[n("TabPane",{attrs:{label:"校务系统界面设置",name:"pc"}},[n("tab-pc",{attrs:{info:t.info.pc},on:{"on-save":t.handleSubmit}})],1),t._v(" "),n("TabPane",{attrs:{label:"学习管家界面设置",name:"mobile"}},[n("tab-mobile",{attrs:{info:t.info.mobile},on:{"on-save":t.handleSubmit}})],1)],1)],1),t._v(" "),n("div",{staticClass:"col-md-6"},[n("Card",{staticStyle:{height:"100%"},attrs:{"dis-hover":""}},[n("span",{attrs:{slot:"title"},slot:"title"},[t._v("登录界面预览")]),t._v(" "),n("div",{staticClass:"login-contanier"},["pc"==t.tab?n("preview-pc",{attrs:{info:t.info.pc}}):n("preview-mobile",{attrs:{info:t.info.mobile}})],1)])],1)])])},o=[];a._withStripped=!0;var s={render:a,staticRenderFns:o};e.a=s},413:function(t,e,n){"use strict";function a(t){r||n(2444)}Object.defineProperty(e,"__esModule",{value:!0});var o=n(1589),s=n(2451),r=!1,i=n(8),c=a,l=i(o.a,s.a,!1,c,null,null);l.options.__file="src/views/system/configs/ui.vue",e.default=l.exports},432:function(t,e,n){"use strict";e.__esModule=!0;var a=n(446),o=function(t){return t&&t.__esModule?t:{default:t}}(a);e.default=function(t,e,n){return e in t?(0,o.default)(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}},433:function(t,e,n){"use strict";var a,o=n(21),s=n.n(o),r=n(432),i=n.n(r),c=n(47),l=(n(4),n(7));e.a={filters:(a={branch_name:function(t,e,n){var a="",o=c.a.getters.getGlobalVar("branchs");if(o)for(var s=0,r=o.length;s<r;s++)if(t==o[s].bid){a=o[s].short_name||o[s].branch_name;break}return a},class_name:function(t){return c.a.getters.getMapText(t,"classes")}},i()(a,"branch_name",function(t,e){if(c.a.state.maps.branch||(c.a.state.maps.branch={},c.a.state.maps.branch_object={}),c.a.state.maps.branch[t])return c.a.state.maps.branch[t];var n=c.a.state.gvars.branchs.find(function(e){return e.bid==t});return n?(c.a.state.maps.branch[t]=n.branch_name,c.a.state.maps.branch_object[t]=n,n.branch_name):e||t}),i()(a,"dpt_name",function(t,e){if(c.a.state.maps.department||(c.a.state.maps.department={},c.a.state.maps.department_object={}),c.a.state.maps.department[t])return c.a.state.maps.department[t];var n=c.a.state.gvars.departments.find(function(e){return e.dpt_id==t});return n?(c.a.state.maps.department[t]=n.dpt_name,c.a.state.maps.department_object[t]=n,n.dpt_name):e||t}),i()(a,"role_name",function(t,e){if(c.a.state.maps.role||(c.a.state.maps.role={},c.a.state.maps.role_object={}),c.a.state.maps.role[t])return c.a.state.maps.role[t];var n=c.a.state.gvars.roles.find(function(e){return e.rid==t});return n?(c.a.state.maps.role[t]=n.role_name,c.a.state.maps.role_object[t]=n,n.role_name):e||t}),i()(a,"ename",function(t,e){if(c.a.state.maps.employee||(c.a.state.maps.employee={},c.a.state.maps.employee_object={}),c.a.state.maps.employee[t])return c.a.state.maps.employee[t];var n=c.a.state.gvars.employees.find(function(e){return e.eid==t});return n?(c.a.state.maps.employee[t]=n.ename,c.a.state.maps.employee_object[t]=n,n.ename):e||t}),i()(a,"employee_name",function(t,e){if(c.a.state.maps.employee||(c.a.state.maps.employee={},c.a.state.maps.employee_object={}),c.a.state.maps.employee[t])return c.a.state.maps.employee[t];var n=c.a.state.gvars.employees.find(function(e){return e.eid==t});return n?(c.a.state.maps.employee[t]=n.ename,c.a.state.maps.employee_object[t]=n,n.ename):e||t}),i()(a,"lesson_name",function(t,e){if(c.a.state.maps.lesson||(c.a.state.maps.lesson={},c.a.state.maps.lesson_object={}),c.a.state.maps.lesson[t])return c.a.state.maps.lesson[t];var n=c.a.state.gvars.lessons.find(function(e){return e.lid==t});return n?(c.a.state.maps.lesson[t]=n.lesson_name,c.a.state.maps.lesson_object[t]=n,n.lesson_name):e||"-"}),i()(a,"lesson_no",function(t){if(c.a.state.maps.lesson_object||(c.a.state.maps.lesson={},c.a.state.maps.lesson_object={}),c.a.state.maps.lesson_object[t])return c.a.state.maps.lesson_object[t].lesson_no;var e=c.a.state.gvars.lessons.find(function(e){return e.lid==t});return e?(c.a.state.maps.lesson[t]=e.lesson_name,c.a.state.maps.lesson_object[t]=e,e.lesson_no):""}),i()(a,"subject_name",function(t,e){if(c.a.state.maps.subject||(c.a.state.maps.subject={},c.a.state.maps.subject_object={}),c.a.state.maps.subject[t])return c.a.state.maps.subject[t];var n=c.a.state.gvars.subjects.find(function(e){return e.sj_id==t});return n?(c.a.state.maps.subject[t]=n.subject_name,c.a.state.maps.subject_object[t]=n,n.subject_name):(0==t&&(t="-"),e||t)}),i()(a,"classroom_name",function(t,e){if(c.a.state.maps.classroom||(c.a.state.maps.classroom={},c.a.state.maps.classroom_object={}),c.a.state.maps.classroom[t])return c.a.state.maps.classroom[t];var n=c.a.state.gvars.classrooms.find(function(e){return e.cr_id==t});return n?(c.a.state.maps.classroom[t]=n.room_name,c.a.state.maps.classroom_object[t]=n,n.room_name):e||t}),i()(a,"season_name",function(t){var e=c.a.state.gvars.dicts.season,n=e.find(function(e){return e.name==t});return n?n.title:t}),i()(a,"dict_title",function(t,e,n){var a=c.a.state.gvars.dicts[e],o=a.find(function(e){return e.did==t});return"grade"==e&&(o=a.find(function(e){return e.name==t})),o?o.title:n}),i()(a,"lesson_status_text",function(t){return 2==t?"已结课":"正常"}),i()(a,"stop_status_text",function(t){return 1==t?"已停课":"正常"}),i()(a,"sj_ids_text",function(t,e){var n=[];return c.a.state.maps.subject||(c.a.state.maps.subject={},c.a.state.maps.subject_object={}),t.forEach(function(t){if(t=parseInt(t),c.a.state.maps.subject[t])return void n.push(c.a.state.maps.subject[t]);var e=c.a.state.gvars.subjects.find(function(e){return e.sj_id==t});e&&(c.a.state.maps.subject[t]=e.subject_name,c.a.state.maps.subject_object[t]=e,n.push(e.subject_name))}),n.join(",")}),a),methods:{initGlobal:function(t){var e=this;return new s.a(function(n,a){void 0===e.$store.state.gvars[t]?e.$store.dispatch("updateGlobalVar",t).then(function(t){n(t)},function(t){a(t)}):n(e.$store.state.gvars[t])})},initDictList:function(t,e,n){var a=this;return new s.a(function(o,s){void 0===a.$store.state.dicts[e]||!0===n?a.$store.dispatch("updateDictList",{url:t,dname:e}).then(function(t){o(t)},function(t){s(t)}):o(a.$store.state.dicts[e])})},initIdMap:function(t,e){var n=this;return new s.a(function(a,o){var s=t,r=["lessons"],i={lessons:{idf:"lid",txf:"lesson_name"},classes:{idf:"cid",txf:"class_name"},employees:{idf:"eid",txf:"ename"},subjects:{idf:"sj_id",txf:"subject_name"}},c=i[t].idf,u=i[t].txf;-1===r.indexOf(t)&&(s=[t,e].join("-")),n.$store.getters.isCache(s)?a(!0):n.$store.dispatch("initIdMap",{name:t,idf:c,txf:u}).then(function(t){a(t),l.a.set(n.$store.state.cache,s,!0)},function(t){o(t)})})},getDictList:function(t){return this.$store.getters.getDictList(t)},getGlobalVar:function(t){return this.$store.getters.getGlobalVar(t)},multiBranch:function(){this.$store.commit("branchMultiMode")},singleBranch:function(){this.$store.commit("branchSingleMode")},noneBranch:function(){this.$store.commit("branchNoneMode")},getSubjectObj:function(t){var e=this.$store;if(e.state.maps.subject_object||(e.state.maps.subject_object={},e.state.maps.subject={}),e.state.maps.subject_object[t])return e.state.maps.subject_object[t];var n=e.state.gvars.subjects.find(function(e){return e.sj_id==t});return n?(e.state.maps.subject[t]=n.subject_name,e.state.maps.subject_object[t]=n,n):null},getLessonObj:function(t){var e=this.$store;if(e.state.maps.lesson_object||(e.state.maps.lesson_object={},e.state.maps.lesson={}),e.state.maps.lesson_object[t])return e.state.maps.lesson_object[t];var n=e.state.gvars.lessons.find(function(e){return e.lid==t});return n?(e.state.maps.lesson[t]=n.lesson_name,e.state.maps.lesson_object[t]=n,n):null},getClassRoomObj:function(t){var e=this.$store;if(e.state.maps.classroom_object||(e.state.maps.classroom_object={},e.state.maps.classroom={}),e.state.maps.classroom_object[t])return e.state.maps.classroom_object[t];var n=e.state.gvars.classrooms.find(function(e){return e.cr_id==t});return n?(e.state.maps.classroom[t]=n.room_name,e.state.maps.classroom_object[t]=n,n):null},getEmployeeObj:function(t){var e=this.$store;if(e.state.maps.employee_object||(e.state.maps.employee_object={},e.state.maps.employee={}),e.state.maps.employee_object[t])return e.state.maps.employee_object[t];var n=e.state.gvars.employees.find(function(e){return e.eid==t});return n?(e.state.maps.employee[t]=n.ename,e.state.maps.employee_object[t]=n,n):null}},computed:{areas:function(){return this.$store.getters.getGlobalVar("areas")},branchs:function(){return this.$store.getters.getGlobalVar("branchs")},roles:function(){return this.$store.getters.getGlobalVar("roles")},pers:function(){return this.$store.getters.getGlobalVar("pers")},mobile_pers:function(){return this.$store.getters.getGlobalVar("mobile_pers")},configs:function(){return this.$store.getters.getGlobalVar("configs")}}}},446:function(t,e,n){t.exports={default:n(447),__esModule:!0}},447:function(t,e,n){n(448);var a=n(1).Object;t.exports=function(t,e,n){return a.defineProperty(t,e,n)}},448:function(t,e,n){var a=n(6);a(a.S+a.F*!n(10),"Object",{defineProperty:n(9).f})},490:function(t,e,n){"use strict";function a(t){return t&&t.__esModule?t:{default:t}}e.__esModule=!0;var o=n(510),s=a(o),r=n(200),i=a(r);e.default=function(){function t(t,e){var n=[],a=!0,o=!1,s=void 0;try{for(var r,c=(0,i.default)(t);!(a=(r=c.next()).done)&&(n.push(r.value),!e||n.length!==e);a=!0);}catch(t){o=!0,s=t}finally{try{!a&&c.return&&c.return()}finally{if(o)throw s}}return n}return function(e,n){if(Array.isArray(e))return e;if((0,s.default)(Object(e)))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}()},510:function(t,e,n){t.exports={default:n(511),__esModule:!0}},511:function(t,e,n){n(32),n(30),t.exports=n(512)},512:function(t,e,n){var a=n(53),o=n(2)("iterator"),s=n(17);t.exports=n(1).isIterable=function(t){var e=Object(t);return void 0!==e[o]||"@@iterator"in e||s.hasOwnProperty(a(e))}}});