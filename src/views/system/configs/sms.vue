<template>
	<Tabs v-model="tab">
		<TabPane label="短信接口设置" name="gateway">
			<tab-gateway></tab-gateway>
		</TabPane>
		<TabPane label="短信模板设置" name="tpls">
			<tab-tpls></tab-tpls>
		</TabPane>
	</Tabs>
			
</template>

<script>
	import {_} from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import tabGateway from './sms/gateway.vue'
	import tabTpls from './sms/tpls.vue'
	
	var clipboard = null
	
	export default{
		mixins:[globals],
		components: {
			tabGateway,
			tabTpls
		},
		data () {
			return {
				tab: 'gateway'
			}
		},
		mounted () {		
			
		},
		destroyed () {			
			
		},
		computed: {
			
		}	
	}
</script>