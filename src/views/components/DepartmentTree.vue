<template>
	<div :class="classes" style="min-height:500px;overflow: auto;">
		<div :class="multiple?'col-sm-7':'col-sm-12'">
			<span :class="{'tree-anchor':rootAvailable}" :style="rootActive?activeStyleObj:''" @click="clickRootNode">
				<Icon type="ios-people"></Icon>
				{{org_name}}
			</span>
			<x-tree
				:sel-ids="selIds"
				:multiple="multiple"
				:show-checkbox="multiple"
				:allow-batch="multiple"
			    :data="department"
			    text-field-name="dpt_name"
			    value-field-name="dpt_id"
			    @item-click="nodeClick"
		    >
		    </x-tree>
	    </div>
	    <div class="col-sm-5" v-if="multiple">
	    	<Card dis-hover style="height:100%">
	    		<div slot="title">
                    <span>已选择：<span class="badge">{{selectedTotal}}</span></span>
                    <Button @click="clearSelectedId" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="清空"></Button>
                </div>
                <ul class="multi-selected-list">
                    <li v-for="item in selectedList" class="mt-2">
                        <span>{{item.dpt_name}}</span>
                        <Button @click="cancelSelectedId(item)" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="移除"></Button>
                    </li>
                </ul>
	    	</Card>
	    </div>
	</div>
</template>
<script>
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import util from '@/libs/util'
import {_} from '@/libs/util'
import XTree from 'c%/Xtree.vue'
const prefixCls = 'x-department';

export default{
	name:'DepartmentTree',
	mixins:[common,globals],
	props: {
		value: {
			type: [Array,Number,String],
			default: () => {
				return 0
			}
		},
		rootAvailable: {
            type: Boolean,
            default: false
        }
	},
	components:{
		XTree
	},
	data () {
		return {
			selIds: this.value,
			rootActive: false,
			activeStyleObj: {
				background: '#e1e1e1'
			}
		}
	},
	computed:{
		multiple () {			
			return _.isArray(this.value)			
		},
		classes () {
            return [
                `${prefixCls} row`
            ];
        },
		department(){
            let department_list = util.copy(this.$store.state.gvars.departments)
            
            department_list.forEach(item=>{
                item.id = item.dpt_id
                if(item.dpt_type == 1){
                    item.icon = 'ivu-icon ivu-icon-ios-home'
                }else if(item.dpt_type == 2){
                    item.icon = 'ivu-icon ivu-icon-location'
                }else{
                    item.icon = 'ivu-icon ivu-icon-network'
                }
            })
            return util.list_to_tree(department_list,'dpt_id','pid')
		},
		selectedTotal(){
            return this.selIds.length
        },
        selectedList () {
        	let list = []
            this.selIds.forEach(id=>{
                if(id > 0){
                    list.push(this.$store.state.gvars.departments.find(d=>d.dpt_id===id))
                }
            })
            return list
        }
	},
	watch: {
		value: function(val) {
			this.selIds = val
		}
	},
	methods:{
		nodeClick(node,item){	
			if(this.multiple){
				this.addSelectedId(item)
				this.handleItemParent(node)
			}else{
				this.rootActive = false
				this.selIds = item.id
			}
			this.$emit('input',this.selIds)
			this.$emit('node-click',node,item)
		},
		clickRootNode() {
			if(!this.multiple&&this.rootAvailable) {
				this.selIds = 0
				this.rootActive = true
				this.clearSty(this.department)
				this.$emit('input',this.selIds)
				this.$emit('root-click',this.org_name)
			}
		},
		clearSty(list) {
            list.forEach(item => {
                item.selected = false
                if(item.children&&item.children.length>0) {
                    this.clearSty(item.children)
                }
            })
        },
		//处理选中父节点
		handleItemParent (node) {		  
		  let parentNode = node.$parent
    	  let childrengroup = parentNode.$refs.group
          if(!!childrengroup) {		
          	let index = this.selIds.indexOf(parentNode.data.id)
			if(parentNode.data.selected){
				if(index===-1){
					this.selIds.push(parentNode.data.id)					
				}
			}else{
				if(index>-1){
					this.selIds.splice(index,1)					
				}
			}
          	this.handleItemParent(parentNode)
          }
		},
		addSelectedId (row) {
			let index = this.selIds.indexOf(row.id)
			
			if(row.selected){
				if(index === -1){
					this.selIds.push(row.id)					
				}
			}else{
				if(index > -1){
					this.selIds.splice(index,1)
				}
			}
			
			if(row.children.length > 0){
				row.children.forEach(c=>{
					this.addSelectedId(c)
				})
			}
		},
		clearSelectedId () {
			this.selIds = []
		},
		cancelSelectedId (row) {
			let index = this.selIds.indexOf(row.dpt_id)
			if(index > -1){
				this.selIds.splice(index,1)
			}
		}
	}

}
</script>