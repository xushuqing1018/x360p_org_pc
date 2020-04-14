<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="true" :width="width" :title="modal$.title" @on-cancel="cancel">
		<department-tree
			v-model="model"
			:rootAvailable="rootAvailable"
			@node-click="nodeClick"
			@root-click="rootClick">
		</department-tree>
	    <div slot="footer">
	        <span class="footer-selected pull-left" v-if="!multiple"><i>已选择:</i>{{labelText}}</span>
	        <Button type="default" @click="cancel">取消</Button>
	        <Button type="primary" @click="ok">确定</Button>
	    </div>
	</Modal>
</template>
<script>
import common from '@/libs/common.mixin'
import modal from '@/libs/modal.mixin'
import util from '@/libs/util'
import {_} from '@/libs/util'
import DepartmentTree from 'c%/DepartmentTree.vue'

export default {
	name: 'SelectDepartmentModal',
	mixins: [modal,common],
	components:{
		DepartmentTree
	},
	props: {
		value: {
			type:[Array,Number,String],
			default(){
				return 0
			}
		},
		width: {
			type: String,
			default: '680'
		},
		rootAvailable: {
            type: Boolean,
            default: false
        }
	},
	data() {
		return {			
			selected:null,
			model: this.value
		}
	},
	computed:{
		labelText(){
			let selectedName = ''
			if(this.selected){
				if(_.isObject(this.selected)) {
					selectedName = this.selected.dpt_name
				}else{
					selectedName = this.selected
				}
			}
			return selectedName
		},
		multiple () {
			return _.isArray(this.value)
		}
	},
	methods: {
		nodeClick(node,item){
			this.selected = util.copy(item._data)
		},
		rootClick(rootName) {
			this.selected = rootName
		},
		ok(){
			if(!this.selected){
                this.$Message.error('没有选中任何部门')
                return
            }
            this.$emit('input',this.model)
            this.$emit('on-select',this.selected)
            this.close()
		},
		cancel(){
            this.close()            
        },       
	},
}
</script>