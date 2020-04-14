<template>
  <router-link tag="li" class="nav-item nav-dropdown" :to="url" disabled>
    <div class="nav-link nav-dropdown-toggle" @click="handleClick"><i :class="icon"></i> {{name}}</div>
    <ul class="nav-dropdown-items">
      <slot></slot>
    </ul>
  </router-link>
</template>

<script>
const $ = window.jQuery
export default {
  props: {
    name: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleClick (e) {
      e.preventDefault()
      let $parent = $(e.target.parentElement)
      let classList = e.target.parentElement.classList

      if($parent.hasClass('active')){
        classList.toggle('closed')
          this.$parent.$children.forEach(item => {
          item.$el.classList.remove('open')
        });
      }else{
        this.$parent.$children.forEach(item => {
          if(item.$el.classList.contains('active')) {
            item.$el.classList.add('closed')
          }else{
            if(this._uid!==item._uid) {
              item.$el.classList.remove('open')
            }
          }
        });
        if(!classList.contains('open')) {
          classList.add('open')
        }else{
          classList.remove('open')
        }
      }
    }
  }
}
</script>
