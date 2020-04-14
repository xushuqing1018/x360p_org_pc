import Vue from 'vue';
import iView from '../iview/dist/iview.min';
import VueRouter from 'vue-router';
import VueLocalStorage from 'vue-localstorage'
import Vue2Filters from 'vue2-filters'
import VueHack from './libs/vuehack.plugin'
import VueDragDrop from 'vue-drag-drop';
import VueIntro from './libs/introjs/index'
import VueTooltip from 'v-tooltip'
import ImageViewer from './views/components/ImageViewer/index'
import xmodal from './libs/xmodal'

import Util from './libs/util';
import {_} from '@/libs/util';
import App from './app.vue';
import routes from './router'
import Auth  from './libs/auth'
import modalDragDirective from './libs/modaldrag.directive'
import loadingDirective from './libs/loading.directive'
import dragDirective from './libs/drag.directive'
import transferDomDirective from './libs/transfer-dom'
import helpDirective from './libs/help.directive'
import 'mavon-editor/dist/css/index.css'
import 'v-charts/lib/style.css'

import store from './store'


Vue.use(VueLocalStorage)
Vue.use(VueRouter)
Vue.use(iView)
Vue.use(VueHack)
Vue.use(Vue2Filters)
Vue.use(VueDragDrop)
Vue.use(VueIntro)
Vue.use(xmodal)
Vue.use(ImageViewer)

// 路由配置
const RouterConfig = {
    linkActiveClass: 'active',
    linkExactActiveClass:'current',
    routes: routes
}

// 创建路由实例
const router = new VueRouter(RouterConfig)

/**
 * 全局钩子
 */ 
function config_router() {
    router.beforeEach((to, from, next) => {
        if(!to.meta.public ) {
		    if (Auth.isLogin()) {
		    	iView.LoadingBar.start()
			    if(to.meta && to.meta.title){
					Util.title(title_replace(to.meta.title))
				}
				if(typeof to.meta['bid'] == 'undefined'){
					to.meta.bid = 1
				}
				if(to.meta.bid == 2){
					store.commit('branchMultiMode')
				}else if(to.meta.bid == 1){
					store.commit('branchSingleMode')
				}else{
					store.commit('branchNoneMode')
				}
			    if(to.path.indexOf('/configs') > -1 || to.path.indexOf('/basic') > -1){
			    	document.body.classList.add('sidebar-minimized')
			    	store.commit('changeSiderbar')
			    }
				if(!Auth.isLock()){					
		    		next()
		    	}else{
		    		next({path:'/lock'})
		    	}
		    } else {
		      next({path:'/login'})
		    }
		}else{
			if(to.meta && to.meta.title){
				Util.title(to.meta.title)
			}
		    next()
		}
    })
    router.afterEach(() => {
        iView.LoadingBar.finish()
        window.scrollTo(0, 0)
    })
}

/**
 * http全局配置
 */
function config_http(){
	Vue.http.options.root = '/api'
	Vue.http.interceptors.push(function(request,next){
		if(request.method == 'GET'){
			store.commit('httpRequestStart',request.url)
		}else{
			store.commit('httpSavingStart',{url:request.url,method:request.method})
		}
		Vue.http.headers.common['x-client-time']   = Math.round((new Date()).getTime()/1000).toString()
	    next(function (response) {
	    	if(request.method == 'GET'){
	    		store.commit('httpRequestEnd',request.url)
	    	}else{
	    		store.commit('httpSavingEnd',{url:request.url,method:request.method})
	    	}
	    	if(response.body.authed){
	    		store.commit('updateLoginExpire')
	    	}
	    	if(response.body.tts){
	    		store.dispatch('exeTodayTask')
	    	}
	    })
	})
}

const vtooltipConfig = {
    // Default CSS classes applied to the tooltip element
    defaultClass: 'vue-tooltip-theme',
    // It must include `tooltip` & `tooltip-inner` CSS classes
    defaultTemplate: '<div class="xtooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
  }
  
function reg_directives(){
    Vue.use(VueTooltip,vtooltipConfig)
    Vue.directive('per',function(el,binding,vnode){
        let pers = vnode.context.$store.state.user.info.pers
        let index = pers.indexOf(binding.value)
        let arg = binding.arg?binding.arg:'display'
        let tag = el.tagName.toLowerCase()
        if(index == -1){
            if(arg == 'disable' && ['button','input'].indexOf(tag) !== -1){
                el.disabled = true
            }else{
                el.style.display = 'none'
            } 
        }
    })
    Vue.directive('keeptwo',{
    	bind:function(el,binding,vnode){
    		let $ = window.jQuery
    		$(el).find('input').on({
    			'keypress':function(e){
    				let $input  = $(this)
	    			let old_val = $input.val()
	    			let input = e.key
	    			let reg = /[\d\.]/
	    			let reg1 = /^\d*\.?(\d{1,2})?$/

	    			if(binding.modifiers.minus){
	    				reg = /[\d\.\-]/
	    				reg1 = /^-?\d*\.?(\d{1,2})?$/
	    			}
	    			if(!reg.test(input)){
	    				return false
	    			}
	    			setTimeout(()=>{
	    				if(!reg1.test($input.val())){
		    				$input.val(old_val)
		    			}
	    			},200)
	    			return true
	    		},
	    		'change':function(e){
	    			let val = $(this).val()
	    			let reg = /[^\d\.]/g
	    			if(binding.modifiers.minus){
	    				reg = /[^\d\.\-]/g
	    			}
	    			$(this).val(val.replace(reg,''))
	    		}
    		})
    	}
    })
    Vue.directive('help',helpDirective)
    Vue.directive('dragModal',modalDragDirective)
    Vue.directive('drag',dragDirective)
    Vue.directive('loading',loadingDirective)
    Vue.directive('transferDom',transferDomDirective)
}

function title_replace(title){
	if(title.indexOf('%') === -1){
		return title
	}
	let lpos = title.indexOf('%'),
		rpos = title.lastIndexOf('%')
	let word = title.substring(lpos+1,rpos)
	title = title.replace('%'+word+'%',translate(word))
	return title
}

function translate(value){
	let words = store.state.gvars.words
	if(!words){
		return value
	}
	let word = value
	for(let i=0,l=words.length;i<l;i++){
		if(words[i][0] == value){
			word = words[i][1]
			break
		}
	}
	return word
}

function reg_filters(){
	Vue.filter('translate',translate)
}

/**
 * 启动App
 */
function start() {
    new Vue({
        el: '#app',
        router: router,
        store: store,
        render: h => h(App)
    })
}

export {
	RouterConfig,
	router
}

export default {
    config_router,
    config_http,
    reg_directives,
    reg_filters,
    title_replace,
    start
}