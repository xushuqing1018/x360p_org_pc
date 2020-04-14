<style lang="less" scoped>
	.gift-container{
		display: flex;
		flex-wrap: wrap;
		padding: 10px;
		position: relative;
		.empty-img{
			height: 400px;
			width: 100%;
			background: url('http://s1.xiao360.com/nothing-notice.png') no-repeat center;
			background-color: #f5f5f5;
			text-align: center;
			span{
				margin-top: 280px;
			    display: inline-block;
			    font-size: 14px;
			    color: #cccccc;
			}
		}
		
		.gift-item {
			flex: 0 0 50%;
		    display: flex;
		    align-items: center;
		    padding: 15px 0px 15px 15px;
		    cursor: pointer;  		    
		    transition: all .3s; 
		    &:hover{
	    	    box-shadow: 3px 3px 10px rgba(0,0,0,.3);
    			transform: translateX(-3px);
		    }
		    
		    .gift-item-img{
		    	img{
		    		width: 86px;
		    	}
		    }
		    .gift-item-content{
	    	    display: flex;
			    flex-direction: column;
			    padding-left: 10px;
			    p{
			    	display: block;
			    	overflow: hidden;
			    	white-space: nowrap;
			    	text-overflow: ellipsis;
			    	width: 144px
			    }
		    }
		}
		
		
	}
</style>

<template>
	<Modal v-drag-modal v-model="modalShow" :mask-closable="true" :width="width" :title="title" @on-cancel="closeModal">
		<div :class="classes">
    		<div class="list-main">
                <div class="list-condition">
                	<Row>
                		<Col span="8">
                			<Input ref="nameInput" v-model="search_field.gift_name" placeholder="书名、作者、ISBN" size="small" @keyup.enter.native="search"></Input>
                		</Col>
                		<Col span="8">
                			<select-gift-cate 
								v-model="search_field.cgc_id" 
								:show-add="false" 
								size="small"
								@on-change="search" 
								placeholder="礼品分类"
								>
							</select-gift-cate>
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
                    	<div class="gift-container">
                    		<Spin size="large" fix v-if="loading"></Spin>
                    		<div class="empty-img" v-if="!data||!data.length">
								<span v-if="search_field.gift_name">没有找到对应礼品</span>
								<span v-else>还没有礼品，快去添加吧！</span>
							</div>
	            			<div class="gift-item"  v-for="item in data" @click="toggleSelected(item)">
	            				<div class="gift-item-checkbox"><Checkbox v-model="item.$selected"></Checkbox></div>
	            				<div class="gift-item-img">
	            					<img :src="item.cover_image_url">
	            				</div>
	            				<div class="gift-item-content">
	            					<p :title="item.gift_name">名称：{{item.gift_name}}<span class="text-danger" v-if="item.status==0">·禁用</span></p>
									<p>分类：{{item.credit_gift_cate.cate_name}}</p>
									<p>上架：{{item.pub_int_day}}</p>
									<p>市价：{{item.price}}元</p>
									<p>积分：{{Number(item.credit)}}</p>
									<p>库存：{{item.qty}}</p>
									<p>已兑：{{item.buy_times}}</p>
	            				</div>
	            			</div>
            			</div>
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
                            <span v-if="item">{{item.gift_name}}</span>
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
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import store from '@/store'
	import util,{_} from '@/libs/util'
	import SelectGiftCate from 'c%/SelectGiftCate.vue'

	const prefixCls = 'select-list';
	const resName   = 'credit_gift'
	const idField   = 'cg_id'
	const textField = 'gift_name'
	const gvarName  = 'credit_gifts'

	export default {
		name: 'GiftList',
		components: {
			SelectGiftCate
		},
		mixins: [ grid, common, globals ],
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
				default: '选择礼品'
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
					gift_name: '',
					cgc_id: 0					
				},
				rest_api: 'credit_gifts',
				loading: false,
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
	        		let obj = this.data.find(item=>item[idField]==this.selIds[0])
	        		
	        		if(!_.isEmpty(obj)){
	        			return obj[textField]
	        		}
	        	}
	        	return ''
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
	            this.pagenation(1)
	        },
	        hook_get_param (params) {
	        	this.loading = true
	        	if(!/^\s*$/.test(this.search_field.gift_name)){
	                params.gift_name = this.search_field.gift_name 
	            }
	            params.with = 'credit_gift_cate'
	        },
	        deal_data (data) {
	        	this.loading = false
	        	return data.list
	        },
	        resetSearch(){
	            this.search_field.gift_name = ''
	            this.search_field.cgc_id = 0
	            this.init_data()
	        },
			getObjById(id){
				let obj = this.data.find(item=>item[idField] == id)
				if(obj){
					return util.copy(obj)
				}
				return null
			},
			ok(){
	            if(!this.selectedTotal){
	                this.$Message.error('没有选中任何礼品')
	                return
	            }
	            if(this.multiple){
	                this.$emit('on-select',this.selectedList)
	            }else{
	                let row = this.getObjById(this.selIds[0])
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
	            	this.$nextTick(()=>{
	            		if(this.$refs.nameInput){
	            			this.$refs.nameInput.focus()
	            		}
	            	})
	                this.init_data_cache()
	            }else{
	                if(this.search_field.name != ''){
	                    this.search_field.name = ''
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