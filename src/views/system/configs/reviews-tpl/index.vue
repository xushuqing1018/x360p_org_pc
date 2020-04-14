<template>
	<div>
		<Tabs v-model="tab">
	        <TabPane label="课评模板定义" name="list">
	        	<tpl-index></tpl-index>
	        </TabPane>
	        <TabPane label="模板绑定管理" name="bind">
	        	<tpl-bind v-if="tab=='bind'"></tpl-bind>
	        </TabPane>
	    </Tabs>
	</div>
</template>

<script>	
	import tplIndex from './tpl-index.vue'
	import tplBind from './tpl-bind.vue'
	
	export default{
		components: {
			tplBind,
			tplIndex,
		},
		data () {
			return {				
				tab: 'list'
			}
		}
	}
</script>

<style>
</style>