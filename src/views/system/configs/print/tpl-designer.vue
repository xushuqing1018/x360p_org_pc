<style lang="less">
.x-ivu-card{
	.ivu-card-body{
		padding: 0!important;		
	}
}
</style>
<template>
	<div>
		<print-tpl-designer-one
		:type="type"
		v-if="format==1"
		>
		</print-tpl-designer-one>
		<print-tpl-designer-two
		:type="type"
		v-if="format==2"
		>
		</print-tpl-designer-two>
		<print-tpl-designer-three
		:type="type"
		v-if="format==3"
		>
		</print-tpl-designer-three>
		<!--<print-tpl-view ref="preview"></print-tpl-view>-->
	</div>
</template>
<script>
//import printTplView from './tpl-preview.vue'
import printTplDesignerOne from './tpl-designer-one.vue'
import printTplDesignerTwo from './tpl-designer-two.vue'
import printTplDesignerThree from './tpl-designer-three.vue'

export default{
	name:'printTplDesigner',
	components:{		
		printTplDesignerOne,
		printTplDesignerTwo,
		printTplDesignerThree
	},
	props:{
		type: {
			type:[String,Number],
			default: 1
		},
		format: {
			type:[String,Number],
			default: 1
		}
	}
}
</script>