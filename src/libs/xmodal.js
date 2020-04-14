import Vue from 'vue'
import modals from '../modals'
import pages from '../vuefiles'
import store from '../store'
import View from './xmodal/view'
import {Modal} from '../../iview/dist/iview.min'
import modalMixin from '@/libs/modal.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import {router,RouterConfig} from '@/bootstrap'
import VueRouter from 'vue-router';

/**
 *用法说明
 *在任意一个 Vue文件里面，methods 方法里面调用
 *this.$Modal.open(url,params)
 *url是.vue文件的相对路径，相当于views文件夹
 *url有2种类型，一种是非Modal类型的，文件名要带 -modal.vue ，文件里面template 根标签必须是 <modal>
 *另一种是页面类型的文件，根标签可以是任何标签。
 *params 参数是 render 函数的第2个参数，里面可以包含 props,domProps,style,classes
 *具体参见：https://cn.vuejs.org/v2/guide/render-function.html
 *但是为了方便调用，将以下几个props放在了里面，width,title,maskClosable
 *
 *在组件实例内有一个 特殊 属性 $x_in_modal  可以判断组件是在modal里面调用还是非modal里面调用
 *还有一个方法 onModalOpen ,是在$Modal.open 调用以后执行的
 *可参见 business/student/info.modal
 * 
 * testXopen(){
    this.$Modal.open('business/student/info.vue?sid=91',{width:1000,title:'学员详情'})
    console.log('testXopen')
},
testXopen2(){
    this.$Modal.open('business/student/archive.vue',{width:1000,title:'学员管理'})
},
 *
 * 
 */

let comp_id = 0;

function assert (condition, message) {
  if (!condition) {
    throw new Error(("[xmodal] " + message))
  }
}

function warn (condition, message) {
  if ("development" !== 'production' && !condition) {
    typeof console !== 'undefined' && console.warn(("[xmodal] " + message));
  }
}

function isError (err) {
  return Object.prototype.toString.call(err).indexOf('Error') > -1
}

let modal_components = {}
let placeholder = null

/**
 * 获得组件ID
 * @return {[type]} [description]
 */
function getCompId(){
	return ++comp_id
}
/**
 * 获得URLkey
 * @param  {[type]} uri [description]
 * @return {[type]}     [description]
 */
function fkey(uri){
	return uri.replace('.vue','').replace(/\//g,'_').replace(/\-/g,'$')
}
/**
 * 获得Modal类型
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
function get_modal_type(key){
	if(key.indexOf('@modal') !== -1){
		return 'modal'
	}
	if(key.indexOf('$modal') !== -1){
		return 'modal'
	}
	return 'page'
}
/**
 * 获得vue文件的组件文件定义可以是一个异步function或组件
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
function get_vue_file(key){
	let mtype = get_modal_type(key)
	if(mtype == 'modal'){
		return modals[key.replace('@modal','')]
	}else if(mtype == 'page'){
		return pages[key]
	}
	return false
}
/**
 * Modal组件类
 * @param {[type]} option [description]
 */
function ModalComponent(option){
	Object.keys(option).forEach(key=>{
		this[key] = option[key]
	})
}

ModalComponent.prototype.modalType = function(){
	return get_modal_type(this.key)
}

ModalComponent.prototype.close = function(){
	
	this.vuec  = null
	this.modal.$destroy()
	this.comp.$destroy()
	delete this.modal
	delete this.comp
	this.comp = null
	this.modal = null
	let body_style = document.body.style

	if(body_style.length > 0){
		document.body.style = '';
	}
}

ModalComponent.prototype.set = function(key,val,copy){
	if(typeof this.vuec['set'] == 'function'){
		this.vuec['set'].call(this.vuec,key,val,copy)
		return this.vuec
	}
	return this
}

ModalComponent.prototype.show  = function(title,action){
	if(typeof this.vuec['onModalOpen'] == 'function'){
		this.vuec.onModalOpen.call(this.vuec,this.query)
	}
	this.modal.show(title,action)
	return this
}

ModalComponent.prototype.hide = function(){
	this.modal.hide()
	return this
}

ModalComponent.createPageComp = createPageComp
ModalComponent.createUrlComp  = createUrlComp
ModalComponent.createModalComp = createModalComp


function comp(mc){
	if(!mc['comp']){
		mc.comp = createComp(mc)
	}
	let autoShow = mc.modalType() == 'modal'?false:true

	if(typeof mc.data['autoShow'] != 'undefined'){
		autoShow = mc.data['autoShow']
	}
	if(autoShow){
		mc.show()
	}
	
	return mc
}

function createComp(mc){
	if(!mc.comp){
		let div = document.createElement('div')
		div.id = mc.name
		placeholder.$el.appendChild(div)
	}
	let mc_type = mc.modalType()
	let fn = 'create'+mc_type.substr(0,1).toUpperCase()+mc_type.substr(1)+'Comp'
	return ModalComponent[fn](mc)
}

function createModalComp(mc){
	let data = Object.assign({},mc.data)
	data.on  = data.on || {}
	data.on  = Object.assign({},data.on,{
		'on-close':()=>{
			mc.close()
		}
	})
	data.nativeOn = data.on

	let comp = new Vue({
		el:'#'+mc.name,
		store: store,
		router:router,
		render:function(_){
			let h = placeholder.$createElement
			let vuec = h(Vue.extend(mc.def),data)
			return vuec
		}
	})
	mc.modal = comp.$children[0]
	mc.vuec  = mc.modal
	mc.vuec.__show = mc.vuec.show
	mc.vuec.show  = function(title,action){
		let vm = this
		if(typeof vm['onModalOpen'] == 'function'){
			vm.onModalOpen.call(vm,mc.query)
		}
		this.__show(title,action)
	}
	return comp
}

function createPageComp(mc){
	let directives = [],
		props = {},
		drag = true,
		on = {}
		if(mc.data.width){
			props.width = mc.data.width
		}
		if(mc.data.title){
			props.title = mc.data.title
		}
		if(mc.data.maskClosable){
			props.maskClosable = mc.data.maskClosable
		}
		if(mc.data.props){
			props = Object.assign(props,mc.data.props)
		}
		if(mc.data.on){
			on = mc.data.on
		}
	if(typeof mc.data['drag'] != 'undefiend' && mc.data['drag'] === false){
		drag = false
	}
	if(drag){
		directives.push({
			name:'drag-modal'
		})
	}
	let cmp = Vue.extend({
		mixins:[common,globals,modalMixin],
		data:function(){
			return {
				width: 800,
            	title: '',
            	scrollable: false,
            	closable: true,
            	maskClosable:false,
            	footerHide:true
			}
		},
		render:function(h){
			let vuec = h(Vue.extend(mc.def))
			return h(
				'Modal',
				{ 
					props: Object.assign({}, {
		                    width: this.width,
		                    title:this.title,
		                    scrollable: this.scrollable,
		                    closable: this.closable,
		                    maskClosable:this.maskClosable,
		                    value:this.modal$.show,
		                    footerHide:this.footerHide
		                },
		                props),
	               
	                on: Object.assign({
	                    input: (status) => {
	                        this.modal$.show = status;
	                    },
	                    'on-ok':()=>{
	                    	mc.close()
	                    },
	                    'on-cancel':()=>{
	                    	mc.close()
	                    }
	                },on),
	                directives:directives
	            },
	            [
	            	vuec
	            ]
            )
		}
	})
	let router = new VueRouter(RouterConfig)
	let comp = new Vue({
		el:'#'+mc.name,
		store:store,
		router:router,
		render:function(_){
			let h = placeholder.$createElement
			return h(cmp)
		}
	})
	mc.modal = comp.$children[0]
	mc.vuec  = mc.modal.$children[0].$children[1]
	return comp
}

function createUrlComp(mc){

}



function regPlaceHolder(comp){
	placeholder = comp
}

function parseQuery(str){
	let q = {}
	let arr = str.split('&')
	arr.forEach(s=>{
		let a = s.split('=')
		q[a[0]] = a[1]
	})
	return q
}

function hookCreateFn(){
	this.$x_in_modal = true
}

function Xopen(url,params){
	return new Promise((resolve,reject)=>{
		let mc,
			pos,
			vuefn,
			query = {},
			uri   = '',
			key   = ''
		pos = url.indexOf('?')
		if(pos !== -1){
			uri = url.substr(0,pos)
			query = parseQuery(url.substr(pos+1))
		}else{
			uri = url
		}


		params  = params || {}
		key 	= fkey(uri),
		vuefn 	= get_vue_file(key)

		if(!vuefn){
			reject(url+':'+key+' do not exist!')
			return false
		}
		mc = modal_components[key]
		if(mc){
			mc.data = params
			mc.query = query
		}else{
			mc = modal_components[key] = new ModalComponent({
				query:query,
				key:key,
				fn:vuefn,
				def:null,
				comp:null,
				modal:null,
				vuec:null,
				data:params,
				name:'xmodal'+getCompId()
			})
		}
		if(!mc['comp']){
			if(typeof mc['fn'] === 'function'){
				mc['fn'](res=>{
					mc.def  = Object.assign({},res.default)
					mc.def.beforeCreate = []
					if(res.default.beforeCreate){
						res.default.beforeCreate.forEach(fn=>{
							mc.def.beforeCreate.push(fn)
						})
					}
					mc.def.beforeCreate.push(hookCreateFn)
					resolve(comp(mc))
				})
			}else if(typeof mc['fn'] === 'object'){
				resolve(comp(mc))
			}else{
				assert(false,'component type error!')
			}
		}else{
			resolve(comp(mc))
		}
	})
}

const install = function(Vue, opts = {}) {
   if (install.installed) return;
   Modal.open = Xopen
   Vue.prototype.$x_in_modal = false
   Vue.component('modal-view', View)
};


export default {
	install,
	regPlaceHolder
}