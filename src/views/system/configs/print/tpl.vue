<template>
	<div class="print-tpl-wrap">
		<RadioGroup v-model="format" type="button" v-if="isMultiFormat">
	        <Radio :label="1" v-if="hasF1">白单</Radio>
	        <Radio :label="2" v-if="hasF2">小票</Radio>
	        <Radio :label="3" v-if="hasF3">针式套打</Radio>
	    </RadioGroup>
	    <print-tpl-designer 
	    :type="bill_type" 
	    :format="format"
	    >
	    </print-tpl-designer>
	</div>
</template>

<script>
import common from '@/libs/common.mixin'
import printTplDesigner from './tpl-designer.vue'
import {_} from '@/libs/util'
export default{
	name:'PrintTpl',
	mixins: [ common ],
	components: {
		printTplDesigner
	},
	props:{
		billType: {
			type:[Number,String],
			default: 1
		},
		defaultFormat:{
			type:[Number,String],
			default:1
		},
		allowFormat:{
			type:Array,
			deafult:[1,2,3]
		},
		title:{
			type:String,
			default:''
		}
	},
	computed:{
		isMultiFormat(){
			return this.allowFormat.length > 1
		},
		hasF1(){
			return this.allowFormat.indexOf(1) > -1
		},
		hasF2(){
			return this.allowFormat.indexOf(2) > -1
		},
		hasF3(){
			return this.allowFormat.indexOf(3) > -1
		}
	},
	created(){
		this.bill_type = this.billType
		this.format = this.defaultFormat
		this.init_data()
	},
	
	data () {
		return {
			bill_type:1,
			format:1				
		}
	},
	methods:{
		init_data(){
			let list = this.$store.state.gvars.print_tpls.list,
				tpl  = list.find(item=> (item.bid == 0 || item.bid==this.bid$) && item.bill_type == this.bill_type && item.is_default == 1)||{}
				
			if(!_.isEmpty(tpl)){
				
				this.format = tpl.format
			}
		}
	},
	watch:{
		billType(value){
			this.bill_type = value
		}
	}
}
</script>
