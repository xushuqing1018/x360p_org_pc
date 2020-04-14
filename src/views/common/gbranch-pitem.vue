<template>
	<div class="item">
	    <a :class="{'selected':isSelected}" @click="selectProject">
	      	{{project.pj_name}}
	    </a>
    </div>
</template>
<script>
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	export default {
	  	mixins:[ globals, common],
	  	name: 'pitem',
	  	props: {
			selPjId: {
				type: [Number,String],
				default: 0
			},
			project:{
				type : Object,
				default:()=>{
					return {}
				}
			}
		},
		computed:{
			isSelected(){
				return this.selPjId == this.project.pj_id
			}
		},
	  	data(){
	  		return {

	  		}
	  	},
	  	methods:{
			selectProject(){
				this.$emit('on-select',this.project)
			}
	  	}
	}
</script>