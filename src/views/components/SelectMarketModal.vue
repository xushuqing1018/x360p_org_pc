<template>
	<Modal v-drag-modal v-model="modalShow" :mask-closable="false" :width="width" :title="title" @on-cancel="closeModal">
		<div :class="classes">
    		<div class="list-main">
                <div class="list-condition">
                	<Row>
                		<Col span="8">
                			<Input v-model="search_field.name" placeholder="姓名" size="small" v-focusme="'searchkey'"></Input>
                		</Col>
                		<Col span="16">
                			<ButtonGroup>
                				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                				<Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch" size="small"></Button>
                			</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
                            
                            <div class="pull-right" v-per="'customer.all'">
		                        <per-scope per="clue.all" @on-change="perScopeChange"></per-scope>
		                   	</div>
                		</Col>
                	</Row>
                	<div class="mt-3" v-if="searchExpand">
						<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form mt-3 row">
							<Form-item label="有效性" prop="is_valid" class="col-sm-4">
								<Select v-model="search_field.is_valid">
									<Option :value="-1">不限</Option>
									<Option :value="0">待确认</Option>
									<Option :value="1">有效</Option>
									<Option :value="2">无效</Option>
								</Select>
							</Form-item>
							<Form-item label="转化" prop="is_change" class="col-sm-4">
								<Select v-model="search_field.is_change">
									<Option :value="-1">不限</Option>
									<Option :value="1">已转化</Option>
									<Option :value="0">待转化</Option>
								</Select>
							</Form-item>
							<Form-item label="分配" prop="is_reg" class="col-sm-4">
								<Select v-model="search_field.is_reg">
									<Option :value="-1">不限</Option>
									<Option :value="1">已分配</Option>
									<Option :value="0">未分配</Option>
								</Select>
							</Form-item>
						</Form>
                	</div>
                </div>
                <div class="list-body">
                    <div class="list-body-wrap" v-loading.like="'market_clues'">
                        <table class="table-list">
                            <thead>
                                <tr>
                                    <th width="50" v-if="multiple">
                                    	<div class="ivu-table-cell"><Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox></div>
                                    </th>
                                    <th><div class="ivu-table-cell">ID</div></th>
                                    <th><div class="ivu-table-cell">姓名</div></th>
                                    <th><div class="ivu-table-cell">性别</div></th>
                                    <th><div class="ivu-table-cell">年龄</div></th>
                                    <th><div class="ivu-table-cell">电话</div></th>
                                    <th><div class="ivu-table-cell">有效性</div></th>
                                    <th><div class="ivu-table-cell">跟进人</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in data">
                                    <td v-if="multiple">
                                        <div class="ivu-table-cell"><Checkbox v-model="item.$selected" :disabled="disabledIds.indexOf(item.cu_id)>-1"></Checkbox></div>
                                    </td>
                                    <th><div class="ivu-table-cell">{{item.mcl_id}}</div></th>
                                    <td><div class="ivu-table-cell">{{item.name}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.sex|sex}}</div></td>
                                    <td><div class="ivu-table-cell">{{formatAge(item.birth_time)}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.tel}}</div></td>
                                    <td><div class="ivu-table-cell">{{formatIsValid(item.is_valid)}}</div></td>
                                    <td><div class="ivu-table-cell">{{formatAssign(item.assign_eid)}}</div></td>
                                </tr>
                                <tr v-if="data.length == 0">
                                    <td colspan="5" style="text-align: center"><p class="empty">没有找到市场名单</p></td>
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
                            <span>{{item.name}}</span>
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
	import Vue from 'vue'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import directive from '@/libs/directive.mixin'
	import globals from '@/libs/globals.mixin'
	import store from '@/store'
	import util from '@/libs/util'

	import SelectAge from 'c%/SelectAge'

	const prefixCls = 'select-list'
	const resName   = 'market_clues'
	const idField   = 'mcl_id'
	const textField = 'name'

	export default {
		name: 'MarketList',
		mixins: [ grid, common, directive, globals ],
		components: {
			SelectAge
		},
		props: {
			value: {
				type: Boolean,
				default: ''
			},
			width: {
				type: String,
				default: ''
			},
			title: {
				type: String,
				default: '选择市场名单'
			},
			multiple: {
				type: Boolean,
				default: false,
			},
			disabledIds: {
            	type: Array,
            	default: ()=>{
            		return []	
            	}
            },
			selected: {
				type: [Array, Number, String],
				default: []
			}
		},
		data() {
			return {
				rest_api: 'market_clues',
				modalShow: false,
				selIds: [],
				is_data_init:false,
				type_market: '',
	            params:{
	                search_field:textField
	            },
	            checkAll: false,
	            search_field: {
	            	is_change: -1,
	            	is_reg: -1,
	            	is_valid: -1,
	            	name: ''
	            }
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
	        isSelected(){
	        	if(this.multiple){
	        		if(this.selIds.length > 0 && this.selIds[0] != 0){
	        			return true
	        		}
	        	}else{
	        		return this.selIds[0] != 0
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
	        }
		},
		methods: {
			perScopeChange(value) {
				this.type_market = value
			},
			hook_get_param (params) {
				const search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='is_change'){
						if(property == 1) {
							params.cu_id = '[>,0]'
						}else if(property == 0) {
							params.cu_id = 0
						}
					}else if(o=='is_reg'){
						if(property == 1) {
							params.assigned_eid = '[>,0]'
						}else if(property == 0) {
							params.assigned_eid = 0
						}	
					}else if(o == 'is_valid'){
						if(property!=-1){
							params[o] = property
						}
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
				if(this.type_market == 'my') {
					params.assigned_eid = this.eid$
				}
			},
			search () {
				this.pagenation(1)
			},
			resetSearch () {
				this.search_field.name = ''
				this.search_field.is_valid = -1
				this.search_field.is_reg = -1
				this.search_field.is_change = -1
				this.search()
			},
			setSelIds(id){
				if(id === 0 || id == '' || id.length === 0) {
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
			},
			formatAge(birth_time) {
				return util.age(birth_time)
			},
			formatIsValid(v) {
				let map = {0:'待确认',1:'有效',2:'无效'}
				return map[v]
			},
			formatAssign(v) {
				return this.$filter('ename')(v,'-')
			},
			ok(){
	            if(!this.isSelected){
	                this.$Message.error('没有选中任何市场名单')
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
			addSelectedId(id) {
				let obj = this.$store.getters.getMapObject(id, resName)				
				
				if(this.disabledIds.indexOf(id)>-1){
					this.$Message.error('已存在'+obj.name)
					return false
				}
				
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
	        			//全选时排除 【禁止ids】
	        			if(index == -1&&this.disabledIds.indexOf(item[idField])==-1) {
	        				
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
	        }
		},
		watch: {
			value: function(val) {			
	            this.modalShow = val
	            if(this.modalShow){	        
	                this.init_data_cache()	     
	            }else{
	                if(this.search_field.name != ''){
	                    this.search_field.name = ''
	                    this.is_data_init = false
	                }
	            }
	        },
	        selected: function(id) {
	        	this.setSelIds(id)
	        },
	        '$store.state.branch.id': {
	            handler: function(bid, old_bid) {
	            	this.pageIndex = 1
	            	this.pageSize = 10
	                this.init_data()
	            }
	        },
	        'type_market':function() {
	        	this.init_data()
	        }
		}
	}
</script>