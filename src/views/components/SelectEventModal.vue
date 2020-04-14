<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :width="width" :title="title" @on-cancel="closeModal">
		<div :class="classes">
    		<div class="list-main">
               <div class="list-condition">
                	<Row>
                		<Col span="8">
                			<Input 
	                			v-model="search_field.event_name" 
	                			placeholder="活动" 
	                			size="small" 
	                			icon="ios-search">
                			</Input>
                		</Col>
                		<Col span="16">
                			<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>                            
                		</Col>
                	</Row>
                </div>
                <div class="list-body">
                    <div class="list-body-wrap" v-loading.like="'students'">
                        <table class="modal-table">
                            <thead>
                                <tr>
                                    <th width="50" v-if="multiple">
                                    	<div class="ivu-table-cell"><Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox></div>
                                    </th>
                                    <th><div class="ivu-table-cell">活动名称</div></th>
                                    <th><div class="ivu-table-cell">活动类型</div></th>
									<th width="180px"><div class="ivu-table-cell">活动时间</div></th>
                                    <th width="90px"><div class="ivu-table-cell">状态</div></th>
                                    <th><div class="ivu-table-cell">活动范围</div></th>
                                    <th width="180px"><div class="ivu-table-cell">报名进度</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in data">
                                    <td v-if="multiple">
                                        <div class="ivu-table-cell"><Checkbox v-model="item.$selected"></Checkbox></div>
                                    </td>
                                    <td>
                                    	<div class="ivu-table-cell">
                                    		{{item.event_name}}
                                		</div>
                                    </td>
                                    <td>
                                    	<div class="ivu-table-cell">
                                    		{{event_type(item.event_type_did)}}
                                		</div>
                                    </td>
                                    <td>
                                    	<div class="ivu-table-cell">
                                    		{{item.event_start_time.substring(0,10)}} -- {{item.event_end_time.substring(0,10)}}	                                    
	                                	</div>
                                    </td>
                                    <td>
                                    	<div class="ivu-table-cell">
                                    		{{map_status[item.status]}}
                                    	</div>
                                    </td>
                                    <td><div class="ivu-table-cell">{{getScope(item)}}</div></td>
                                    <td>
                                    	<div class="ivu-table-cell">
	                                    	<Progress :percent="item.apply_nums/item.apply_nums_limit*100" :stroke-width="5">
	                                			<span>{{item.apply_nums+'/'+item.apply_nums_limit}}</span>
	                                		</Progress>
                                    	</div>
                                    </td>
                                </tr>
                                <tr v-if="data.length == 0">
                                    <td colspan="6" style="text-align: center"><p class="empty">{{notFoundText}}</p></td>
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
                    <div slot="title">
                        <span>已选择：<span class="badge">{{selectedTotal}}</span></span>
                        <Button @click="clearSelectedId" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="清空"></Button>
                    </div>
                    <ul class="multi-selected-list">
                        <li v-for="item in selectedList">
                            <span>{{item.student_name}}</span>
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
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import directive from '@/libs/directive.mixin'
	import globals from '@/libs/globals.mixin'

	const prefixCls = 'select-list';
	const resName   = 'events'
	const idField   = 'event_id'
	const textField = 'event_name'

	export default {
		name: 'EventList',
		mixins: [grid,common,directive,globals,modal],
		props: {
			value: {
				type: Boolean,
				default: false
			},
			width: {
				type: String,
				default: ''
			},
			title: {
				type: String,
				default: '选择活动'
			},
			multiple: {
				type: Boolean,
				default: false,
			},
			selected: {
				type: [Array, Number, String],
				default: []
			},
			notFoundText: {
				type: String,
				default:'没有活动~'
			}
		},
		data() {
			return {
				rest_api: 'events',
				selIds: [],
				is_data_init:false,
	            params:{
	                search_field:textField
	            },	           
	            search_field: {
                    bid: 0,
                    event_name:''
	            },
	            checkAll: false,
	            map_scope: {'class':'班级活动','branch':'校区活动','global':'全局活动'},
	            map_status: {0:'已禁用',1:'正常',2:'已结束',3:'已取消'}
			}
		},
		computed: {
			classes () {
	            return [
	                `${prefixCls}`,
	                {
	                    [`${prefixCls}-multiple`]: this.multiple,
	                    [`${prefixCls}-single`]: !this.multiple
	                }
	            ];
	        },
	        labelText() {
	        	if(this.selIds.length > 0) {
	        		return this.$store.getters.getMapText(this.selIds[0], resName)
	        	}
	        },
	        selectedTotal(){
	            return this.selIds.length 
	        },
	        selectedList(){
	            let list = []
	            this.selIds.forEach(id=>{
	                if(id > 0){
	                    list.push(this.$store.getters.getMapObject(id, resName))
	                }
	            })
	            return list
            },
            event_type(){
                return function(event_type_did){
                    return this.labelDicts(event_type_did,'event_type')
                }
            }
		},
		mounted() {
			this.search_field.bid = this.bid$
		},
		methods: {
			getScope (item) {
				let result = '全局活动'
				if(item.scope!=='global'){
					result = this.map_scope[item.scope]
				}
				
				if(item.scope=='class'&&item.one_class){					
					result += item.one_class.class_name
				}
				else if(item.scope=='branch'){
					
					item.bids.forEach(id=>{
						result += this.$filter('branch_name')(id) + ', '
					})
					result = result.substring(0,result.length - 2)
				}
				
				return result
			},
			ok(){
	            if(!this.selectedTotal){
	                this.$Message.error('没有选中任何活动')
	                return
	            }
	            if(this.multiple){
	                this.$emit('on-select',this.selectedList)
	            }else{
	                let row = this.$store.getters.getMapObject(this.selIds[0],resName)
	                this.$emit('on-select',row)
	            }
	            this.$emit('input',false);
	            this.close()
	        },
	        cancel(){
	            
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
	            this.$emit('input',false)
	            this.close()
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
			addSelectedId(id) {
				if(this.selIds.indexOf(id) === -1) {
					this.selIds.push(id)
					this.refreshData(this.data)
				}
			},
			removeSelectedId(id) {
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
			toggleSelected(item) {
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
	        hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='bid') {
						if(property!==this.bid$) {
							params.bid = property
						}
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
			},
			search() {				
				this.pagenation(1)
        	},
			resetSearch () {
                this.search_field.bid = this.bid$
                this.search_field.event_name = ''
				this.params.search_value = ''
				this.search()
			},
			toggleBranch(id) {
				this.pageIndex = 1
            	this.pageSize = 10
				this.search_field.bid = id
			}
		},
		watch: {

	        'modal$.show': function (val){
	        	if(val){
	                this.init_data_cache()
	            }else{
	                if(this.search_field.event_name != ''){
	                    this.search_field.event_name = ''
	                    this.is_data_init = false
	                }
	            }
	        },
	        selected(id){
	        	if(id.length === 0 || id === '' || id === 0) {
	        		this.selIds = []
	        		this.refreshData(this.data)
	        	}
	            if(this.multiple){
	                this.selIds = id
	                this.refreshData(this.data)
	            }else{
	                if(this.selIds.length == 0){
	                    this.selIds.push(id)
	                }else{
	                    this.selIds.splice(0,1,id)
	                }
	            }
	        }
		}
	}
</script>