<template>
  <footer class="app-footer">
    <p v-html="copyright"></p>
    <a :href="add_help_url" target="_blank" v-if="has_add_help_permit"><Icon size="16" type="plus-circled"></Icon></a>
  </footer>
</template>
<script>
import {_} from '@/libs/util'
import util from '@/libs/util'
export default {
  name: 'appfooter',
  computed: {
    copyright () {
      let year   = (new Date()).getFullYear()
    	let result = 'Powered by <a href="http://www.xiao360.com">校360<sup>TM</sup></a>',
    			ui = window.CLIENT_PARAMS
    			
			if(!_.isEmpty(ui)){
	    		result = ui.pc.copyright
			}
			
			return result
    },
    has_add_help_permit(){
      return this.$store.state.user.info.allow_add_help == 1
    },
    add_help_url(){
      return util.sprintf(this.$store.state.user.info.add_help_url,this.$route.path)
    }
  }
}
</script>
