import Drag from './drag'
import _ from './util'
const $ = window.jQuery
export default {
    bind: function (element, binding) {
      let $element = $(element)
      $element.bind('mouseover',creater)
      function creater(event){
        if($element.attr('drag-binded')){
          $element.unbind('mouseover',creater)
          return
        }
        bind_drag()
      }
      function bind_drag(){
        let mSelector,hSelector
        let selectorConfig = binding.value
        let $window = $(window)
        let $document = $(document)
        let need_center = false
        if(typeof selectorConfig == 'object'){
          mSelector = selectorConfig.ms 
          hSelector = selectorConfig.hs
        }
        mSelector = mSelector || '.ivu-modal'
        hSelector = hSelector || '.ivu-modal-header'

        // 如果拖动元素非元素本身（el），传入id
        let dragEl = element.querySelector(hSelector)
        if(!dragEl){
          console.log('no hSelector')
          return
        }

        let moveEl = element.querySelector(mSelector)
        if(!moveEl){
          moveEl = element
        }
        if(!moveEl.getAttribute('drag')){
          need_center = true
        }
        moveEl.setAttribute('drag',true)
        moveEl.style.position = 'absolute'
        let $elem = $(moveEl)
        let $wrap = moveEl.parentNode.nodeName === 'BODY' ? $document : $elem.offsetParent();
        //$elem.css("left", Math.max(0, (($(window).width() - $(moveEl).outerWidth()) / 2) + $(window).scrollLeft()) + "px")
        if(need_center){
          let centerLeft = ($wrap.width()-$elem.outerWidth())/2
          moveEl.style.left = Math.max(0,centerLeft) + 'px'
        }
       
        dragEl.style.cursor = 'move'
        $(dragEl).on(Drag.START,function(event){
          new Drag(moveEl,event)
          event.preventDefault()
        })

        $element.attr('drag-binded',true)
      }
    }
  }