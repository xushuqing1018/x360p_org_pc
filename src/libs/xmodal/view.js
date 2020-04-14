import xmodal from '@/libs/xmodal'

export default {
  name: 'ModalView',
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  template:`<div class="modal-view"></div>`,
  created(){
     xmodal.regPlaceHolder(this)
  }
}