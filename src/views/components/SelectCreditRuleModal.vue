<template>
    <Modal v-drag-modal v-model="modalShow" :mask-closable="true" :width="width" :title="title" @on-cancel="closeModal">
    	<div :class="classes">
    		<div class="list-main">
                <div class="list-condition">
                	<Row>
                		<Col span="8">
                			<Input v-model="search_field.rule_name" size="small" placeholder="套餐名称" v-focusme="'searchkey'"></Input>
                		</Col>
                		<Col span="10">
                			<ButtonGroup>
                				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                			</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
                            <CheckboxGroup 
                            	v-model="search_field.type" 
                            	@on-change="init_data" 
                            	class="ml-2"
                            	style="display: inline-block;">
                            	<Checkbox :label="1" :readonly="readonly(1)">加分</Checkbox>
                            	<Checkbox :label="2" :readonly="readonly(2)">减分</Checkbox>
                            </CheckboxGroup>
                		</Col>
                	</Row>
                </div>
                <div class="list-body">
                    <div class="list-body-wrap" v-loading="'credit_rules'">
                        <table class="table-list">
                            <thead>
                                <tr>
                                    <th width="50" v-if="multiple">
                                        <div class="ivu-table-cell"><Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox></div>
                                    </th>
                                    <th><div class="ivu-table-cell">规则名称</div></th>
                                    <th><div class="ivu-table-cell">积分操作</div></th>
                                    <th><div class="ivu-table-cell">积分类型</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in data">
                                    <td v-if="multiple">
                                        <div class="ivu-table-cell"><Checkbox v-model="item.$selected"></Checkbox></div>
                                    </td>
                                    <td><div class="ivu-table-cell">{{item.rule_name}}</div></td>
                                    <td><div class="ivu-table-cell">
                                    	{{item.credit==0?item.type==1?'加分不限制':'减分不限制':item.type==1?'加'+item.credit+'分':'减'+item.credit+'分'}}
                                    </div></td>
                                    <td><div class="ivu-table-cell">
                                    	{{item.cate==1?'学习积分':'消费积分'}}
                                    </div></td>
                                </tr>
                                <tr v-if="data.length == 0">
                                    <td colspan="5" style="text-align: center"><p class="empty">没有合适的积分规则</p></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="list-page clearfix">
                        <Page class="pull-right" size="small" :total="total" :show-total="true" :current="pageIndex" :show-sizer="true" :page-size="pageSize" @on-change="pagenation" @on-page-size-change="pagesize"></Page>
                    </div>
                    
                </div>
            </div>
            <div class="multi-selected" v-if="this.multiple">
                <Card>
                    <div style="display: flex; align-items: center" slot="title">
                        <span style="flex: 0 0 190px">已选择:<span class="badge">{{selectedTotal}}</span></span>
                        <Button @click="clearSelectedId" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="清空"></Button>
                    </div>
                    <ul class="multi-selected-list">
                        <li style="display: flex; align-items: center" v-for="item in selectedList">
                            <span style="flex: 0 0 190px">{{item.rule_name}}</span>
                            <Button @click="cancelSelectedId(item)" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="移除"></Button>
                        </li>
                    </ul>
                </Card>
            </div>
    	</div>
        <div slot="footer">
            <span class="footer-selected pull-left" v-if="!multiple"><i>已选择:</i>{{labelText}}</span>
            <Button type="default" @click="cancel">取消</Button>
            <Button type="primary" @click="ok">确定</Button>
        </div>
    </Modal>
</template>
<script>
import util from '@/libs/util'
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import directive from '@/libs/directive.mixin'

const prefixCls = 'select-list';
const resName   = 'credit_rule'
const idField   = 'cru_id'
const textField = 'rule_name'
export default {
	name:'creditRuleModal',
    mixins: [grid,directive,common,globals],
    props:{
        value: {
            type: Boolean,
            default: false
        },
        width:{
            type:String,
            default:'640'
        },
        title:{
            type:String,
            default:'选择积分规则'
        },
        multiple: {
            type: Boolean,
            default: false
        },
        selected:{
            type:[Array,Number],
            default(){
                return []
            }
        }
    },
    computed:{
        classes () {
            return [
                `${prefixCls}`,
                {
                    [`${prefixCls}-multiple`]: this.multiple,
                    [`${prefixCls}-single`]: !this.multiple
                }
            ];
        },
        selectedTotal(){
            return this.selIds.length 
        },
        selectedList(){
            let list = []
            this.selIds.forEach(id=>{
                if(id > 0){
                    list.push(this.$store.getters.getMapObject(id,resName))
                }
            })
            return list
        },
        labelText(){
            if(this.selIds.length > 0){
                return this.$store.getters.getMapText(this.selIds[0],resName)
            }
            return ''
        }
    },
	data() {
		return {
            pk:'cru_id',
            selIds:[],
			modalShow: false,
            rest_api:'credit_rules',
            is_data_init:false,
            search_field:{
                rule_name: '',
                type: [1,2]
            },
            checkAll: false
		}
	},
    methods: {
    	readonly(value) {
    		if(this.search_field.type.length == 1 && this.search_field.type[0] == value) {
    			return true
    		}
    		return false
    	},
        ok(){
            if(!this.selectedTotal){
                this.$Message.error('没有选中任何积分规则')
                return
            }
            if(this.multiple){
                this.$emit('on-select',this.selectedList)
            }else{
                let row = this.$store.getters.getMapObject(this.selIds[0],resName)
                this.$emit('on-select',row)
            }
            this.modalShow = false
            this.$emit('input',false);
        },
        cancel(){
            this.modalShow = false
            if(this.multiple) {
                this.selIds = []
                this.selected.forEach((item) => {
                    this.selIds.push(item)
                })
                this.refreshData(this.data)
            }else{
                this.selIds = []
                this.selIds.push(this.selected)
                this.refreshData(this.data)
            }
            this.$emit('input',false);
        },
        closeModal() {
            this.cancel()
        },
        clearSelectedId(){
            this.selIds.splice(0,this.selIds.length)
            this.refreshData(this.data)
        },
        cancelSelectedId(item){
            let index = this.selIds.indexOf(item[idField])
            if(index !== -1){
                this.selIds.splice(index,1)
                this.refreshData(this.data)
            }
        },
        deal_data(data){
            if(data.list.length > 0){
                this.$store.commit('buildIdTextMap',{
                   list:data.list,
                   name:resName,
                   ifield:idField,
                   tfield:textField
                })
                //this.refreshData()
                this.refreshData(data.list)
            }else{
                if(this.multiple && this.checkAll) {
                    this.checkAll = false
                }
            }
            return data.list
        },
        checkSelectAll(item, index, arr) {
            if(this.selIds.indexOf(item[idField]) !== -1) {
                return true
            } else {
                return false
            }
        },
        refreshData(data) {
            data.forEach((item) => {
                if(this.selIds.indexOf(item[idField]) !== -1) {
                    item.$selected = true
                } else {
                    item.$selected = false
                }
            })
            if(this.multiple) {
                this.checkAll = data.every(this.checkSelectAll)
            }
        },
        addSelectedId(id){
            if(this.selIds.indexOf(id) === -1){
                this.selIds.push(id)
                this.refreshData(this.data)
            }
        },
        removeSelectedId(id){
            let index = this.selIds.indexOf(id)
            if(index !== -1){
                this.selIds.splice(index,1)
                this.refreshData(this.data)
            }
        },
        replaceSelectedId(id){
           if(this.selIds.length == 0){
                this.selIds.push(id)
            }else{
                this.selIds.splice(0,1,id)
            }
        },
        toggleSelected(item){
            if(this.multiple){
                if(!item.$selected){
                    this.addSelectedId(item[idField])
                }else{
                    this.removeSelectedId(item[idField])
                }
            }else{
                if(item.$selected){
                    this.ok()
                }else{
                    this.data.forEach(item=>{
                        item.$selected = false
                    })
                    item.$selected = true
                    this.replaceSelectedId(item[idField])
                }
            }
        },
        init_data_cache(){
            if(!this.is_data_init){
                this.init_data()
                this.is_data_init = true
            }
        },
        hook_get_param (params) {
			let search_obj = util.copy(this.search_field)
			for(let o in search_obj) {
				let property = search_obj[o]
				if(o=='type'||o=='cate') {
					if(property.length>0) {
						params[o] = util.sprintf('[in,%s]',property.join(','))
					}
				}else{
					if(property&&property!=-1){
						params[o] = property
					}
				}
			}
            params.enable = 1
            params.bid = this.bid$
		},
        handleCheckAll() {
            this.data.forEach((item)=>{
                let index = this.selIds.indexOf(item[idField])
                if(this.checkAll === false) {
                    if(index == -1) {
                        this.selIds.push(item[idField])
                        item.$selected = true
                    }
                } else {
                    if(index > -1) {
                        this.selIds.splice(index,1)
                        item.$selected = false
                    }
                }
            })
        },
        refreshSelId(id) {
            if(id === null || id.length === 0 || id === '' || id === 0) {
                this.selIds = []
                this.refreshData(this.data)
            }
            if(this.multiple){
                id.forEach(_id=>{
                    if(this.selIds.indexOf(_id) == -1){
                        this.selIds.push(_id)
                    }
                })
            }else{
                if(this.selIds.length == 0){
                    this.selIds.push(id)
                }else{
                    this.selIds.splice(0,1,id)
                }
            }
        }
    },
    mounted() {
        
    },
    watch: {
        value (val) {
            this.modalShow = val;
            if(this.modalShow){
                this.init_data_cache()
            }else{
                if(this.params.search_value != ''){
                    this.params.search_value = ''
                    this.is_data_init = false
                }
            }
        },
        selected(id){
            this.refreshSelId(id)
        }
    }
}
</script>