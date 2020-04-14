<template>
	<Modal v-drag-modal v-model="modalShow" :mask-closable="false" :width="width" :title="title" @on-cancel="closeModal">
		<div :class="classes">
    		<div class="list-main">
                <div class="list-condition">
                	<Row>
                		<Col span="8">
                			<Input v-model="search_field.name" placeholder="物品名称" size="small" v-focusme="'searchkey'"></Input>
                		</Col>
                		<Col span="10">
                			<ButtonGroup>
                				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                			</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>                            
                		</Col>
                	</Row>
                </div>
                <div class="list-body">
                    <div class="list-body-wrap" v-loading.like="'materials'">
                        <table class="table-list">
                            <thead>
                                <tr>
                                    <th width="50" v-if="multiple">
                                    	<div class="ivu-table-cell"><Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox></div>
                                    </th>
                                    <th><div class="ivu-table-cell">物品</div></th>
                                    <th><div class="ivu-table-cell">单价</div></th>
                                    <th><div class="ivu-table-cell">单位</div></th>
                                    <th><div class="ivu-table-cell">总库存</div></th>
                                    <th><div class="ivu-table-cell">库存详情</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in data">
                                    <td v-if="multiple">
                                        <div class="ivu-table-cell"><Checkbox v-model="item.$selected"></Checkbox></div>
                                    </td>
                                    <td><div class="ivu-table-cell">{{item.name}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.sale_price}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.unit}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.num||'-'}}</div></td>
                                    <td>
                                    	<div class="ivu-table-cell">
                                    		<template v-if="item.material_store_qty.length>0">
	                                    		<p v-for="i in item.material_store_qty">
	                                    			<template v-if="i.store">
	                                    				<label>{{i.store.name}}:</label>
	                                    				<span>{{i.num}}</span>
	                                    			</template>
	                                    		</p>
	                                    	</template>
	                                    	<p v-else>-</p>
	                                    </div>
                                    </td>
                                </tr>
                                <tr v-if="data.length == 0">
                                    <td colspan="6" style="text-align: center"><p class="empty">没有找到物品</p></td>
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
                            <InputNumber v-if="binding" v-model="item.bind_num" size="small" style="width:50px;"></InputNumber>
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
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import directive from '@/libs/directive.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import store from '@/store'

	const prefixCls = 'select-list';
	const resName   = 'materials'
	const idField   = 'mt_id'
	const textField = 'name'

	export default {
		name: 'SelectMaterialModal',
		mixins: [common,grid,directive,globals],
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
				default: '选择物品'
			},
			multiple: {
				type: Boolean,
				default: false,
			},
			selected: {
				type: [Array, Number, String],
				default(){
					return []
				}
			},
			binding: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				rest_api: 'materials?is_cate=0',
				pageSize:20,
				modalShow: false,
				selIds: [],
				is_data_init:false,
	            params:{
	                search_field:textField
	            },
	            search_field: {
	            	name: ''
	            },
	            checkAll: false
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
	        }
		},
		mounted() {
			
		},
		methods: {
			ok(){
	            if(!this.selectedTotal){
	                this.$Message.error('没有选中任何物品')
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
					if(this.binding) {
						item.bind_num = 1
					}
				})
				if(this.multiple) {
					if(data.length == 0) {
						this.checkAll = false
					}else{
						this.checkAll = data.every(this.checkSelectAll)
					}
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
	        hook_get_param(params) {
	        	let search_obj = util.copy(this.search_field)
	        	if(!this.enable_material_bid){
	        		params.bid = -1
	        	}
				for(let o in search_obj) {
					let property = search_obj[o]
					if(property&&property!=-1){
						params[o] = property
					}
				}

	        },
	        resetSearch() {
	        	this.search_field.name = ''
	        	this.pagenation(1)
	        }
		},
		watch: {
			value (val) {
	            this.modalShow = val;
	            if(this.modalShow){
	                this.init_data_cache()
	            }else{
	                if(this.search_field.name != ''){
	                    this.search_field.name = ''
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
		}
	}
</script>