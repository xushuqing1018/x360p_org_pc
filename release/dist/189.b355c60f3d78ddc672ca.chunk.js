webpackJsonp([189],{1119:function(t,e,a){"use strict";var s=a(211);e.a={mixins:[s.a],data:function(){return{info:{}}}}},1241:function(t,e){},1242:function(t,e,a){"use strict";var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("Modal",{directives:[{name:"drag-modal",rawName:"v-drag-modal"}],attrs:{"mask-closable":!1,width:"800",title:t.modal$.title},on:{"on-cancel":t.close},model:{value:t.modal$.show,callback:function(e){t.$set(t.modal$,"show",e)},expression:"modal$.show"}},[t.modal$.show?[a("h3",{staticClass:"text-center mb-2"},[t._v(t._s(t.info.title))]),t._v(" "),a("p",{staticClass:"text-center"},[a("span",{staticClass:"mr-2"},[t._v(t._s(t.info.user.name))]),t._v(" "),a("span",[t._v(t._s(t.info.create_time))])]),t._v(" "),a("div",{staticClass:"content",domProps:{innerHTML:t._s(t.info.desc)}})]:t._e(),t._v(" "),a("div",{attrs:{slot:"footer"},slot:"footer"},[a("Button",{attrs:{type:"ghost"},on:{click:t.close}},[t._v("关闭")])],1)],2)},o=[];s._withStripped=!0;var n={render:s,staticRenderFns:o};e.a=n},358:function(t,e,a){"use strict";function s(t){i||a(1241)}Object.defineProperty(e,"__esModule",{value:!0});var o=a(1119),n=a(1242),i=!1,r=a(11),c=s,l=r(o.a,n.a,!1,c,"data-v-14312ad4",null);l.options.__file="src/views/dashboard/home/broadcast/cast-detail.vue",e.default=l.exports}});