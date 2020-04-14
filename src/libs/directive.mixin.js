import clickOut from './clickout.directive'
export default {
	data(){
        return {
            inputelem:''
        }
    },
	directives: {
      focusme:function(el,binding,vnode){
        let v = vnode.context
        let tag
        if(binding.value == v.inputelem){
        	tag = el.tagName.toLowerCase()
        	if(tag == 'input' || tag == 'textarea'){
        		el.focus()
        	}else{
        		let input = el.querySelector('input[type=text]')
        		if(input){
        			input.focus()
        		}
        	}
        	v.inputelem = ''
        }
      },
      tabindex:function(el,binding,vnode){
        let tag
        tag = el.tagName.toLowerCase()
        if(tag == 'inpu' || tag == 'textarea'){
            el.setAttribute('tabindex',binding.value)
        }else{
            let input = el.querySelector('input')
            if(input){
                input.setAttribute('tabindex',binding.value)
            }else{
                input = el.querySelector('textarea')
                if(input){
                    input.setAttribute('tabindex',binding.value)
                }
            } 
        }
      },
      clickOut
    },
    methods: {
    	focus(name){
			this.inputelem = name
		}
    }
}