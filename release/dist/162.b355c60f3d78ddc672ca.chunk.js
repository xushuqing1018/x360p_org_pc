webpackJsonp([162],{1833:function(t,e,n){"use strict";var i=n(910),a=n(210);e.a={mixins:[i.a,a.a],data:function(){return{show_form:!1,cfg_name:"storage",config:{access_key:"",secret_key:"",bucket:"",prefix:"",domain:""}}}}},2766:function(t,e,n){"use strict";var i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"page-grid"},[n("Card",{attrs:{"dis-hover":""}},[n("div",{attrs:{slot:"title"},slot:"title"},[n("a",{attrs:{href:"https://portal.qiniu.com/signup?code=3laiccx4xi6he",target:"_blank"}},[t._v("七牛")]),t._v("云存储配置\n\t        ")]),t._v(" "),n("Alert",{directives:[{name:"show",rawName:"v-show",value:""==t.config.access_key||t.show_form,expression:"config.access_key == '' || show_form"}],attrs:{"show-icon":""}},[t._v("\n\t\t        云存储开通说明\n\t\t        "),n("Icon",{attrs:{slot:"icon",type:"ios-lightbulb-outline"},slot:"icon"}),t._v(" "),n("template",{slot:"desc"},[t._v("\n\t\t        \t系统默认赠送 "),n("Tag",{attrs:{color:"red"}},[t._v("2G")]),t._v(" 的云存储空间，用于存放所有的上传文件附件包括图像、语音、小视频等。\n\t\t        \t"),n("br"),t._v("\n\t\t        \t您可以"),n("Tag",{attrs:{color:"blue"}},[t._v("免费")]),t._v("的开通七牛云存储，获取更多的存放空间，并且文件存储在您自己的云存储账号上面。\n\t\t        \t"),n("br"),t._v("\n\t\t        \t您需要 "),n("a",{attrs:{target:"_blank",href:"https://portal.qiniu.com/signup?code=3laiccx4xi6he"}},[t._v("先前往申请")]),t._v(" 账号，如果您已经有七牛云存储账号，只需将相关云存储的配置信息填写到下面的配置表格即可。\n\t\t        \t"),n("br"),t._v("\n\t\t        \t如果您在操作上有任何疑问，可以与我们的客服联系，获取更多帮助。\n\t\t        \t"),n("br"),t._v(" "),n("Button",{attrs:{type:"primary"},on:{click:function(e){t.show_form=!0}}},[t._v("我要使用自己的云存储账号")])],1)],2),t._v(" "),n("div",{directives:[{name:"show",rawName:"v-show",value:""!=t.config.domain||t.show_form,expression:"config.domain != '' || show_form"}]},[n("Form",[n("Form-item",{attrs:{label:"AccessKey"}},[n("Input",{attrs:{placeholder:"请输入AK"},model:{value:t.config.access_key,callback:function(e){t.$set(t.config,"access_key",e)},expression:"config.access_key"}})],1),t._v(" "),n("Form-item",{attrs:{label:"SecretKey"}},[n("Input",{attrs:{placeholder:"请输入SK"},model:{value:t.config.secret_key,callback:function(e){t.$set(t.config,"secret_key",e)},expression:"config.secret_key"}})],1),t._v(" "),n("Form-item",{attrs:{label:"Bucket"}},[n("Input",{attrs:{placeholder:"Bucket"},model:{value:t.config.bucket,callback:function(e){t.$set(t.config,"bucket",e)},expression:"config.bucket"}})],1),t._v(" "),n("Form-item",{attrs:{label:"资源前缀"}},[n("Input",{attrs:{placeholder:"资源前缀"},model:{value:t.config.prefix,callback:function(e){t.$set(t.config,"prefix",e)},expression:"config.prefix"}})],1),t._v(" "),n("Form-item",{attrs:{label:"访问域名"}},[n("Input",{attrs:{placeholder:"访问域名"},model:{value:t.config.domain,callback:function(e){t.$set(t.config,"domain",e)},expression:"config.domain"}})],1)],1),t._v(" "),n("div",{staticClass:"footer-btn",staticStyle:{"padding-left":"0"}},[n("Button",{attrs:{type:"primary"},on:{click:function(e){t.handleSubmit()}}},[t._v("保存配置")])],1)],1)],1)],1)},a=[];i._withStripped=!0;var o={render:i,staticRenderFns:a};e.a=o},531:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i=n(1833),a=n(2766),o=n(11),s=o(i.a,a.a,!1,null,null,null);s.options.__file="src/views/system/configs/storage.vue",e.default=s.exports},602:function(t,e,n){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}e.__esModule=!0;var a=n(611),o=i(a),s=n(212),c=i(s);e.default=function(){function t(t,e){var n=[],i=!0,a=!1,o=void 0;try{for(var s,r=(0,c.default)(t);!(i=(s=r.next()).done)&&(n.push(s.value),!e||n.length!==e);i=!0);}catch(t){a=!0,o=t}finally{try{!i&&r.return&&r.return()}finally{if(a)throw o}}return n}return function(e,n){if(Array.isArray(e))return e;if((0,o.default)(Object(e)))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}()},611:function(t,e,n){t.exports={default:n(612),__esModule:!0}},612:function(t,e,n){n(36),n(27),t.exports=n(613)},613:function(t,e,n){var i=n(56),a=n(4)("iterator"),o=n(18);t.exports=n(2).isIterable=function(t){var e=Object(t);return void 0!==e[a]||"@@iterator"in e||o.hasOwnProperty(i(e))}},910:function(t,e,n){"use strict";var i=n(602),a=n.n(i),o=n(1);e.a={data:function(){return{cfg_name:"",cfg_id:0,config:{},action:"edit"}},mounted:function(){this.init_config_data()},methods:{init_config_data:function(){var t=this;this.$http.get("configs?cfg_name="+this.cfg_name).then(function(e){if(o.a.isArray(e.body.data)&&0===e.body.data.length)t.action="add";else{0==e.body.data.cfg_id&&(t.action="add");for(var n in e.body.data.cfg_value)t.$set(t.config,n,e.body.data.cfg_value[n]);t.cfg_id=e.body.data.cfg_id}t.initFinished()}).catch(function(e){t.$Message.error(e.message)})},initFinished:function(){},handleSubmit:function(){var t=this,e="add"===this.action?["post","configs"]:["put","configs/"+this.cfg_id],n=a()(e,2),i=n[0],o=n[1],s={cfg_name:this.cfg_name,cfg_value:this.config};this.$http[i](o,s).then(function(e){var n=t.cfg_name;"lesson"==n&&(n="lesson_config"),"params"==n&&(n="configs"),t.$Message.success("保存成功!"),t.$store.dispatch("updateGlobalVar",n),t.init_config_data()}).catch(function(e){t.$Message.error(e.message)})},restoreDefault:function(){var t=this;this.confirm("你确定恢复默认的菜单设置吗？").then(function(){t.$rest("configs").delete(t.cfg_id).success(function(e){t.$Message.success("恢复成功"),t.init_config_data()}).error(function(e){t.$Message.error(e.body.message)})})}}}}});