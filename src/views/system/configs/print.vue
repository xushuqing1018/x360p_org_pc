<template>
	<Tabs v-model="tab">
		<TabPane 
		:name="item.name" 
		:label="item.title" 
		class="x-fixed-parent" 
		v-for="item in tpls"
		>
			<print-tpl
			:bill-type="item.bill_type"
			:title="item.title"
			:allow-format="item.allow_format"
			:default-format="item.default_format"
			v-if="item.name == tab"
			>
			</print-tpl>
		</TabPane>
	</Tabs>
</template>

<script>
	import common from '@/libs/common.mixin'
	import PrintTpl from './print/tpl.vue'
	export default{
		mixins:[common],
		components: {
			PrintTpl
		},
		data () {
			return {
				tab: ''
			}
		},
		computed:{
			tpls(){
				let enable_tpls = this.$store.state.gvars.configs.params.system.enable_print_tpls
				let tpls = []
				this.ptpls.forEach(item=>{
					if(enable_tpls.indexOf(item.bill_type) !== -1){
						tpls.push(item)
					}
				})
				return tpls
			}
		},
		created(){
			this.tab = this.tpls[0]['name']
		}
	}
</script>

<style>
	/*加上此属性即可让子级fixed定位元素以当前div为父级，此样式解决Umeditor退费模板image按钮失效问题*/
	.x-fixed-parent{
		transform: translate(0,0);
	}
</style>