<template>
<Modal v-drag-modal v-model="modalShow" :mask-closable="true" :width="width" :title="title" @on-cancel="closeModal">
	<department-tree
		@node-click="nodeClick">
	</department-tree>
	<div slot="footer">
        <div class="footer-selected pull-left" v-if="!multiple">
        	<span>部门：</span>
        	<Input :value="labelText" class="x-ivu-input" readonly style="width:120px" placeholder="请选择"></Input>
        </div>
        <div class="footer-selected ml-3 pull-left">
            <span>职位：</span>
            <Select v-model="jobtitle_did" class="x-ivu-select" style="width:100px" placement="top" placeholder="请选择">
            	<Option :value="item.did" v-for="(item,index) in jobtitles" :key="index">{{item.title}}</Option>
            </Select>
        </div>
        <div class="footer-selected ml-3 pull-left">
            <span>负责人：</span>
            <Select v-model="is_charge" class="x-ivu-select" style="width:60px" placement="top">
            	<Option :value="1">是</Option>
            	<Option :value="0">否</Option>
            </Select>
        </div>
        <Button type="default" @click="cancel">取消</Button>
        <Button type="primary" @click="ok">确定</Button>
    </div>
</Modal>
</template>
<script>
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import util from '@/libs/util'
import DepartmentTree from 'c%/DepartmentTree.vue'

export default {
	name: 'SelectDepartmentJobtitleModal',
	mixins: [common,globals],
	components:{
		DepartmentTree
	},
	props: {
		value: {
			type: Boolean,
			default: ''
		},
		width: {
			type: String,
			default: '640'
		},
		title: {
			type: String,
			default: '选择部门与职位'
		},
		multiple: {
			type: Boolean,
			default: false,
		}
	},
	data() {
		return {
			modalShow: false,
			selected:null,
			jobtitle_did:0,
			is_charge:0
		}
	},
	computed:{
		labelText(){
			if(!this.selected){
				return ''
			}
			return this.selected.dpt_name
		},
		jobtitles () {
        	return this.$store.state.gvars.dicts.jobtitle
        }
	},
	methods: {
		nodeClick(node,item){
			this.selected = util.copy(item._data)
		},
		ok(){
			if(!this.selected){
                this.$Message.error('没有选中任何部门')
                return
            }
            if(this.jobtitle_did == 0){
            	this.$Message.error('请选择职位')
            	return
            }
            this.$emit('on-select',{
            	dpt_id: this.selected.dpt_id,
            	jobtitle_did: this.jobtitle_did,
            	is_charge: this.is_charge
            })
            this.cancel()
		},
		cancel(){
            this.modalShow = false
            this.$emit('input',false);
        },
        closeModal() {
        	this.cancel()
        },
	},
	watch: {
		value (val) {
            this.modalShow = val
            if(val){
            	this.selected = null
            	this.jobtitle_did = 0
            }
        }
	}
}
</script>