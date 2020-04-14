
import {_} from './util'
export default{
	bind(el,binding,vnode){
        let $ = window.jQuery,
        	$el = $(el),
        	option = _.isObject(binding.value)?binding.value:{width:'200px',selector:'',style:'',class:'',content:binding.value},

        	helpText = option.content,
        	selector = option.selector,
        	width    = option.width,
        	style    = option.style,
        	cls      = option.class != ''?' '+option.class:'',
        	$ctEle
        	
        function findHelpEle(){
        	if($el.children().length == 0){
        		return $el
        	}
        	if(selector != ''){
        		return $el.find(selector)
        	}
        	return $el.children().eq(0)
        }

        let $helpEl = findHelpEle()
        if(!$helpEl){
        	return;
        }

        if($helpEl.prop('tagName') == 'LABEL') {
            let offsetWidth = $helpEl.width() - 15*2
            style = style + 'left:'+offsetWidth+'px'
        }

        if(binding.modifiers.left){
            $helpEl.addClass('left')
        }

        $ctEle = '<div class="x-help-content'+cls+'" style="width:'+width+';'+style+'"><div class="x-help-content-inner">'+helpText+'</div>'

        $helpEl.append($ctEle).addClass('x-help').bind({
        	'mouseover':function(el){
        		$(this).addClass('opend')
        	},
        	'mouseout':function(e){
        		$(this).removeClass('opend')
        	}
        })
    }
}