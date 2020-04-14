<template>
  <div v-if="isExternalLink">
    <a :href="url" :class="classList">
      <i :class="icon"></i> {{name}}
      <b-badge v-if="badge && badge.text" :variant="badge.variant">{{badge.text}}</b-badge>
    </a>
  </div>
  <div v-else>
    <router-link :to="url_first" :class="classList">
      <i :class="icon"></i> {{name}}
      <b-badge v-if="badge && badge.text" :variant="badge.variant">{{badge.text}}</b-badge>
    </router-link>
  </div>
</template>

<script>
  export default {
    name: 'sidebar-nav-link',
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
      },
      badge: {
        type: Object,
        default: () => {}
      },
      variant: {
        type: String,
        default: ''
      },
      sub: {
        type: Array,
        default(){
          return []
        }
      }
    },
    computed: {
      classList () {
        return [
          'nav-link',
          this.is_active,
          this.linkVariant
        ]
      },
      is_active () {
        let path = this.$route.path
        return path.indexOf(this.url)>-1 || 
               path.indexOf('dashboard')>-1&&this.url.indexOf('dashboard')>-1 
               ? 'active'
               :''
      },
      linkVariant () {
        return this.variant ? `nav-link-${this.variant}` : ''
      },
      isExternalLink () {
        if (this.url.substring(0, 4) === 'http') {
          return true
        } else {
          return false
        }
      },
      url_first () {
        const len = this.sub.length
        if(len > 0) {
          let first = this.sub[0].uri.split('.')[1]
          if(len > 1 && first === 'overview') {
            return this.url + '/' + this.sub[1].uri.split('.')[1]
          }else{
            return this.url + '/' + first
          }
        }else{
          return this.url
        }
      }
    }
  }
</script>
