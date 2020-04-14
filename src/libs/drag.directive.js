import Drag from './drag'
import {_} from './util'
const $ = window.jQuery
export default {
    bind: function (element, binding,vnode) {
    	let hSelector = '',dragEl
    	if(_.isObject(binding.value)){
            hSelector = binding.value.selector
        }else if(_.isString(binding.value)){
            hSelector = binding.value
        }else{
            hSelector = binding.expression
        }
        if(hSelector != ''){
        	dragEl = element.querySelector(hSelector)
	      	if(!dragEl){
	        	dragEl = element
	      	}
	     }
		dragEl.style.cursor = 'move'
		element.style.position = 'absolute'
		$(dragEl).on(Drag.START,function(event){
			new Drag(element,event)
			event.preventDefault()
		})
	}
  }