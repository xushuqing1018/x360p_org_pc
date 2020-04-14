<template>
	<Modal v-drag-modal v-model="modalShow" :mask-closable="true" :width="width" :title="title" @on-cancel="closeModal">
		<div :class="classes">
    		<div class="list-main">
                <div class="list-condition">
                	<Row>
                		<Col span="8">
                			<Input v-model="search_field.branch_name" placeholder="校区名称" size="small" v-focusme="'searchkey'"></Input>
                		</Col>
                		<Col span="8" v-if="enable_company" style="margin-left: 10px;">
                			<Select v-model="search_field.dpt_id" placeholder="分公司名称" size="small">
                				<Option v-for="item in companys" :value="item.dpt_id">{{item.dpt_name}}</Option>
                			</Select>
                		</Col>
                		<Col span="6">
                			<ButtonGroup>
                				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                			</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
                		</Col>
                	</Row>
                </div>
                <div class="list-body">
                    <div class="list-body-wrap">
                        <table class="table-list">
                            <thead>
                                <tr>
                                    <th width="50" v-if="multiple">
                                    	<div class="ivu-table-cell"><Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox></div>
                                    </th>
                                    <th><div class="ivu-table-cell">校区</div></th>
                                    <th><div class="ivu-table-cell">简称</div></th>
                                    <th><div class="ivu-table-cell">电话</div></th>
                                    <th><div class="ivu-table-cell">地址</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in data">
                                    <td v-if="multiple">
                                        <div class="ivu-table-cell"><Checkbox v-model="item.$selected"></Checkbox></div>
                                    </td>
                                    <td v-if="item"><div class="ivu-table-cell">{{item.branch_name}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.short_name}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.branch_tel}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.address}}</div></td>
                                </tr>
                                <tr v-if="data.length == 0">
                                    <td colspan="5" style="text-align: center"><p class="empty">没有找到校区</p></td>
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
                        @on-page-size-change="pagesize"
                        >
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
                            <span v-if="item">{{item.branch_name}}</span>
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
	import common from '@/libs/common.mixin'
	import directive from '@/libs/directive.mixin'
	import globals from '@/libs/globals.mixin'
	import store from '@/store'
	import util from '@/libs/util'

	const prefixCls = 'select-list';
	const resName   = 'branch'
	const idField   = 'bid'
	const textField = 'branch_name'
	const gvarName  = 'branchs'

	export default {
		name: 'BranchList',
		mixins: [common,directive,globals],
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
				default: '选择校区'
			},
			multiple: {
				type: Boolean,
				default: false,
			},
			selected: {
				type: [Array, Number],
				default: []
			},
			limitPer: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				search_field:{
					branch_name: '',
					dpt_id: 0
				},
				modalShow: false,
				pageIndex:1,
				pageSize:10,
				totalCount:0,
				data:[],
				selIds: [],
				is_data_init:false,
	            checkAll: false
			}
		},
		computed: {
			total(){
				return this.totalCount
			},
			
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
	        		const branch_name = this.$filter(textField)(this.selIds[0])
	        		return branch_name?branch_name:''
	        	}
	        },
	        selectedTotal(){
	            return this.selIds.length 
	        },
	        selectedList(){
	            let list = []
	            this.selIds.forEach(id=>{
	                if(id > 0){
	                    list.push(this.getObjById(id))
	                }
	            })
	            return list
	        },
	        companys() {
			    let branchs = this.is_admin ? this.branchs : this.branchs.filter(b => this.bids_user.indexOf(b.bid) > -1),
			        departments = this.$store.state.gvars.departments.filter(
			        	d => d.dpt_type==2 || d.dpt_type==0 || branchs.findIndex(b => b.bid==d.bid) > -1
		        	),
			        ret = []
			    function findParent(data,pid,ret,d) {
			        let parent = data.find(item => item.dpt_id==pid)
			        if(parent) {
			            if(parent.dpt_type==2) {
			              	let company = ret.find(r => r.dpt_id==parent.dpt_id)
			              	if(company) {
			              	company.bids.push(d.bid)
			            }
			        }else{
			            findParent(data,parent.pid,ret,d)
			            }
			        }
			    } 
			    departments.forEach(d => {
			        if(d.dpt_type==2) {
			    	    d.bids = []
			            ret.push(d)
			        }
			    })

			    departments.forEach(d => {
			        if(d.dpt_type==1){
			            findParent(departments,d.pid,ret,d)
			        }
			    })
		      	return ret.filter(r=>r.bids.length>0)
			}
		},
		mounted() {
			this.init_data()
			this.refreshSelId(this.selected)
		},
		methods: {
			pagesize(pagesize){
	            this.pageSize = pagesize
	            this.init_data()
	        },
	        pagenation(page){
	            this.pageIndex = page    
	            this.init_data() 
	        },
	        search(){
	            if(/^\s*$/.test(this.search_field.branch_name) && this.search_field.dpt_id == 0){
	                return
	            }
	            this.pagenation(1)
	        },
	        resetSearch(){
	            this.search_field.branch_name = ''
	            this.search_field.dpt_id = 0
	            this.init_data()
	        },
	        init_data(){
				let list = [],
					branchs = this.$store.state.gvars.branchs,
					start,end,index
				if(!this.is_admin && this.limitPer) {
					branchs = branchs.filter(b => this.bids_user.indexOf(b.bid) > -1)
				}

				if(!/^\s*$/.test(this.search_field.branch_name)){
					branchs = branchs.filter(item=>{
						if(item.branch_name.indexOf(this.search_field.branch_name) !== -1){
							return true
						}
						return false
					})
				}

				if(this.search_field.dpt_id) {
					let company = this.companys.find(c => c.dpt_id==this.search_field.dpt_id)
					branchs = branchs.filter(item=>company.bids.findIndex(bid=>bid==item.bid)>-1)
				}
				this.totalCount = branchs.length
				start = (this.pageIndex - 1) * this.pageSize
				end   = start + this.pageSize
				index = 0
				branchs.forEach(b=>{
					if(index >= start && index < end){
						list.push(util.copy(b))
					}
					index++
				})
				this.data = list
				this.refreshData(list)
			},
			getObjById(id){
				let obj = this.$store.state.gvars[gvarName].find(item=>item[idField] == id)
				if(obj){
					return util.copy(obj)
				}
				return null
			},
			ok(){
	            if(!this.selectedTotal){
	                this.$Message.error('没有选中任何校区')
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
	        refreshSelId(id){
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
		watch: {
			value (val) {
	            this.modalShow = val;
	            if(this.modalShow){
	                this.init_data_cache()
	            }else{
	                if(this.search_field.branch_name != ''){
	                    this.search_field.branch_name = ''
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