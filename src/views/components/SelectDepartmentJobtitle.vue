<template>
<div class="b-a-1 px-2 clearfloat">
	<Tag closable @on-close="del(index)" v-for="(item,index) in value" :key="index">
		{{item.dpt_id|dpt_name}}
		 <template v-if="item.is_charge">- 负责人</template>
		 - {{labelDicts(item['jobtitle_did'],'jobtitle')}}								
	</Tag>
	<span class="text-info pull-right m-r-xs" @click="add"><Icon type="plus">添加</Icon></span>
	<select-department-jobtitle-modal
	v-model="modalShow"
	width="680"
	@on-select="selectHandle"
	>
	</select-department-jobtitle-modal>
</div>
</template>
<script>
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import SelectDepartmentJobtitleModal from 'c%/SelectDepartmentJobtitleModal.vue'

export default{
	name:'SelectDepartmentJobtitle',
	mixins:[common,globals],
	components:{
		SelectDepartmentJobtitleModal
	},
	props:{
		value:{
			type:Array,
			default(){
				return []
			}
		},
		disabled: {
            type: Boolean,
            default: false
        },
        readonly:{
            type:Boolean,
            default:false
        }
	},
	data(){
		return {
			list: this.value,
			modalShow:false
		}
	},
	methods:{
		del(index){
			this.list.splice(index,1)
			this.$emit('input',this.list)
		},
		add(){
			this.modalShow = true
		},
		selectHandle(obj){
			let exists = this.list.find(item=>item.dpt_id == obj.dpt_id && item.jobtitle_did == obj.jobtitle_did)
			if(!exists){
				this.list.push(obj)
				this.$emit('input',this.list)
			}
		},
		openModal () {
            if (this.disabled || this.readonly) {
                return false;
            }
            this.modalShow = !this.modalShow;
        }
	},
	watch:{
		value(val){
			this.list = this.value
		}
	}
}
</script>