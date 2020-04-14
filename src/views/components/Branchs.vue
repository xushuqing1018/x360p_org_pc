<style lang="less">
.branchs{
	.ivu-tree ul li{
		margin-bottom: 5px !important;
    	font-size: 14px;
	}
}
</style>
<template>
	<div class="padder-xs branchs">
	    <Tree :data="branchs_tree" @on-select-change="change_branch" :multiple="false"></Tree>
	</div>
</template>

<script>
	import globals from '@/libs/globals.mixin'
	export default{
		mixins:[globals],
		data () {
			return {
				active_branch_id: 0,
				branchs_tree: [{
					expand: true,
					title: '校区',
					children: []
				}]
			}
		},
		props: {
			hasDefault: {
				type: Boolean,
				default: false
			}
		},
		mounted () {
			this.initGlobal('branchs').then(()=>{			
				this.active_branch_id = this.$store.state.user.info.bid
				
				if(this.hasDefault){
					this.branchs_tree[0].children.push({
						title: '默认',
						id: 0,
						selected: true
					})
					this.active_branch_id = 0
				}				
				this.branchs.forEach(b=>{
					this.branchs_tree[0].children.push({
						title: b.branch_name,
						id: b.bid,
						selected: (b.bid===this.active_branch_id?true:false)
					})
				})

				this.$emit('change-branch',this.active_branch_id)
			})
		},
		methods: {
			change_branch(tree_item) {
				if(tree_item.length>0){
					this.active_branch_id = tree_item[0].id
					this.$emit('change-branch',tree_item[0].id)					
				}
			}
		}
	}
</script>
