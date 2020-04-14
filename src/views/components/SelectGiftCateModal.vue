<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :width="width" :title="title" @on-cancel="closeModal">
		<div :class="classes">
    		<div class="list-main">
                <div class="list-condition">
                	<Row>
                		<Col span="8">
                			<Input v-model="search_field.cate_name" placeholder="礼品分类" size="small"></Input>
                		</Col>
                		<Col span="16">                			
            				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>                			
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
                		</Col>
                	</Row>                	
                </div>
                <div class="list-body">
                    <div class="list-body-wrap" v-loading.like="'credit_gift_cates'">
                        <table class="table-list">
                            <thead>
                                <tr>
                                    <th width="50" v-if="multiple">
                                    	<div class="ivu-table-cell">
                                    		<Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox>
                                    	</div>
                                    </th>
                                    <th><div class="ivu-table-cell">礼品分类</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in data">
                                    <td v-if="multiple">
                                        <div class="ivu-table-cell">
                                        	<Checkbox v-model="item.$selected" :disabled="disabledIds.indexOf(item.cu_id)>-1"></Checkbox>
                                        </div>
                                    </td>
                                    <td>
                                    	<div class="ivu-table-cell">
	                                    	{{item.cate_name}}
                                    	</div>
                                    </td>
                                </tr>
                                <tr v-if="data.length == 0">
                                    <td colspan="6" style="text-align: center"><p class="empty">没有礼品分类</p></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="list-page clearfix">
                        <Page 
                        	class="pull-right" 
                        	size="small" 
                        	:total="total" 
                        	:show-total="true" 
                        	:current="pageIndex" 
                        	:show-sizer="true" 
                        	:page-size="pageSize" 
                        	@on-change="pagenation" 
                        	@on-page-size-change="pagesize">
                        </Page>
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
                            <span>{{item.cate_name}}</span>
                            <Button @click="cancelSelectedId(item)" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="移除"></Button>
                        </li>
                    </ul>
                </Card>
            </div>
    	</div>
        <div slot="footer">
            <span class="footer-selected pull-left" v-if="!multiple"><i>已选择:</i>{{labelText}}</span>
            <Button type="ghost" @click="cancel">取消</Button>
            <Button type="primary" @click="ok">确定</Button>
            
        </div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	const prefixCls = 'select-list';
	const resName   = 'credit_gift_cates'
	const idField   = 'cgc_id'
	const textField = 'cate_name'

	export default {
		name: 'ChannelList',
		mixins: [ grid, common, modal ],		
		props: {
			width: {
				type: String,
				default: ''
			},
			title: {
				type: String,
				default: '选择礼品分类'
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
			},
			toFormal: {
                type: Boolean,
                default: false
            }
		},
		data() {
			return {
				rest_api: 'credit_gift_cates',
				selIds: [],
				is_data_init:false,
	            checkAll: false,
	            search_field: {
	            	cate_name: ''
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
		mounted() {
			this.init_data()
		},
		methods: {
			hook_get_param (params) {
				const search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(property){
						params[o] = property
					}
				}
			},
			search () {
				this.pagenation(1)
			},
			resetSearch () {
				this.search_field[textField] = ''
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
			ok(){
	            if(!this.isSelected){
	                this.$Message.error('没有选中任何礼品分类')
	                return
	            }
	            if(this.multiple){
	                this.$emit('on-select',this.selectedList)
	            }else{
	                let row = this.$store.getters.getMapObject(this.selIds[0],resName)
	                this.$emit('on-select',row)
	            }
	            this.$emit('input',false)
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
	            this.$emit('input',false);
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
				let obj = this.$store.getters.getMapObject(id, resName)				
				
				if(this.disabledIds.indexOf(id)>-1){
					this.$Message.error('已存在礼品分类'+obj.name)
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
			'modal$.show': function(val) {	
	            if(val){	        
	                this.init_data_cache()	     
	            }else{
	                if(this.search_field.name != ''){
	                    this.search_field.name = ''
	                    this.is_data_init = false
	                }
	            }
	            this.setSelIds(this.selected)
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
	        }
		}
	}
</script>