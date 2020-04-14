<template>
	<div>
		<Alert show-icon>
			打勾 <Icon type="arrow-right-c"></Icon> 启用，
			不打勾 <Icon type="arrow-right-c"></Icon> 禁用，
			保存后请刷新页面
		</Alert>
		<x-tree
			v-if="data.length>0"
			ref="ref_x_tree"
			:data="data"
			text-field-name="title"
	    	value-field-name="uri"
	    	:show-checkbox="true"
	    	:multiple="true"
	    	:allowBatch="true"
			>
		</x-tree>
		<div class="mt-4">
			<Button type="primary" @click="ok">保存</Button>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import config from '@/libs/config.mixin'
	import globals from '@/libs/globals.mixin'
	import XTree from 'c%/XTree.vue' 

	const doc = 'ivu-icon ivu-icon-document'
	const folder = 'ivu-icon ivu-icon-ios-folder'

	export default{
		mixins:[common,config,globals],
		components: {
			XTree
		},
		data() {
			return {
				data: [],
				cfg_name:'org_pc_ui',
				config: {
					disabled_per_items:[]
				}
			}
		},
		computed:{
			globalPersList(){
				return this.$store.state.gvars.pers
			}
		},
		methods: {
			ok () {
				let nodes = this.$refs['ref_x_tree'].getUnselectNodes(),
					pers = []
				nodes.forEach(item => {
					pers.push(item.value)
				})
				this.config.disabled_per_items = pers
				this.handleSubmit()
				this.data.splice(0)
			},
			initFinished() {
				let ret = this.buildPerItems(this.globalPersList,this.config.disabled_per_items)
				ret.shift()
				this.data = ret
			},
			buildPerItems(persList,disabledPers){
				let items = []
				persList = util.copy(persList)
				persList.forEach(item=>{
					let opened = false,
						is_selected = disabledPers.indexOf(item.uri) == -1,
						is_selected_part = false,
						sub_length = 0,
						sub_selected_length = 0,
						ismenuItem = [],
						subHasMenuItem = item.sub 
										&& item.sub.length > 0 
											&& item.sub.filter(i => i.ismenu !== false).length > 0
					
					if(subHasMenuItem){
						ismenuItem = item.sub.filter(i => i.ismenu !== false)
						sub_length = ismenuItem.length
						ismenuItem.forEach(subitem=>{
							if(disabledPers.indexOf(subitem.uri) == -1){
								sub_selected_length++
							}
						})

						if(sub_selected_length > 0){
							if(sub_selected_length == sub_length){
								is_selected = true
							}else{
								is_selected_part = true
							}
							opened = true
						}
					}
					let child = {
							opened: opened,
							title: item.text,
							uri: item.uri,
							icon: subHasMenuItem ? folder : doc,
							selected: is_selected,
							selected_part: is_selected_part
						}

					if(subHasMenuItem){
						child.children = this.buildPerItems(ismenuItem,disabledPers)
					}

					items.push(child)
				})
				return items
			}
		}
	}
</script>