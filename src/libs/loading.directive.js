/*
* @Author: Administrator
* @Date:   2017-10-19 12:16:20
* @Last Modified by:   Administrator
* @Last Modified time: 2017-10-19 12:17:27
*/
import {_} from './util'
export default{
	bind(el,binding,vnode){
        let uri = '',
            ctn,
            lw  = 'div.loading-wrap',
            txt = '正在加载数据',
            vm  = vnode.context
        if(_.isObject(binding.value)){
            uri = binding.value.uri
            lw = binding.value.loadingWrap?binding.value.loadingWrap:lw
            txt = binding.value.loadingText?binding.value.loadingText:txt
        }else if(_.isString(binding.value)){
            uri = binding.value
        }else{
            uri = binding.expression
        }
        ctn = el.querySelector(lw)
        if(!ctn){
           ctn = document.createElement('div')
           ctn.className = 'loading-wrap'
           ctn.innerHTML = '<p class="loading-text"><span class="loading-gif"></span></p>'
           el.appendChild(ctn)
           ctn = el.querySelector(lw)
        }
        function is_loading(v){
            let loading = false
            if(binding.modifiers.like){
                if(v.indexOf(uri) !== -1){
                    loading = true
                }
            }else{
                if(v == uri){
                    loading = true
                }
            }
            return loading
        }

        vm.$watch('$store.state.http.request',function(v){
            if(is_loading(v)){
                el.className = el.className.indexOf(' loading') === -1?el.className+' loading':el.className
                ctn.className = ctn.className.indexOf(' loading-start') === -1 ?ctn.className+' loading-start':ctn.className
            }
        })
        vm.$watch('$store.state.http.response',function(v){
            if(is_loading(v)){
                if(ctn.className.indexOf(' loading-start') !== -1){
                   
                    ctn.className = ctn.className.replace(' loading-start','')
                }
                if(el.className.indexOf(' loading') !== -1){
                    el.className = el.className.replace(' loading','')
                }
            }
        })
    }
}