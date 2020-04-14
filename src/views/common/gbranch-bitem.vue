<template>
	<div class="item">
	    <a :class="{'selected':isSelected}" @click="selectBranch">
	      	{{branch.short_name || branch.branch_name}}
	    </a>
	    <span class="arr-project" @click="enterProjectView" v-if="showProjectArrow">
	      <Icon type="chevron-right"></Icon>
	    </span>
    </div>
</template>
<script>
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'


	export default {
	  	mixins:[ globals, common],
	  	name: 'bitem',
	  	props: {
			selBid: {
				type: [Number,String],
				default: 0
			},
			branch:{
				type : Object,
				default:()=>{
					return {}
				}
			},
			bidPjIdsMap:{
				type: Object,
				default:()=>{
					return {}
				}
			}
		},
		computed:{
			isSelected(){
				return this.selBid == this.branch.bid
			},
			showProjectArrow(){
				if(!this.enable_project){
					return false
				}
				if(!this.bidPjIdsMap[this.branch.bid]){
					return false
				}
				return this.bidPjIdsMap[this.branch.bid].length > 1
			}
		},
	  	data(){
	  		return {

	  		}
	  	},
	  	methods:{
	  		enterProjectView(){
				this.$emit('on-sub')
			},
			selectBranch(){
				this.$emit('on-select',this.branch)
			}
	  	}
	}
</script>