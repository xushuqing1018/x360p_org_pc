<template>
	<div class="c-grid app-c-grid">
		<div class="box box-query">
			<Input 
				v-model="search_field.gift_name" 
				icon="ios-search" 
				@keyup.enter.native="search" 
				style="width:280px" 
				placeholder="礼品名称"
				>
			</Input>
			<select-gift-cate 
				v-model="search_field.cgc_id" 
				:show-add="false" 
				@on-change="search" 
				style="width: 280px" 
				placeholder="礼品分类"
				>
			</select-gift-cate>
			<Button type="primary" @click="search" icon="ios-search">搜索</Button>
			<Button type="primary" @click="resetSearch" icon="refresh">重置</Button>
			<CheckboxGroup v-model="search_field.status" class="ml-2" style="display: inline-block;">
				<Checkbox :label="1">启用</Checkbox>
				<Checkbox :label="0">禁用</Checkbox>
			</CheckboxGroup>
			<label>库存</label>
			<span class="ivu-table-sort">
				<Icon type="arrow-up-b" :class="{'on':order_sort=='asc'}" @click="setListAsc"></Icon>
				<Icon type="arrow-down-b" :class="{'on':order_sort=='desc'}" @click="setListDesc"></Icon>
			</span>
		</div>
		
		<div class="box box-result">
			<div class="toolbar text-center">
				<Button type="primary" icon="plus" @click="addGift" v-per="'gift.add'">添加礼品</Button>	
				<Button type="primary" icon="ios-list-outline" @click="giftCate">礼品分类</Button>
				<Button type="primary" icon="ios-clock-outline" @click="qtyHistory">出入库记录</Button>
			</div>
			<div class="content-body">
				<div class="gift-container">
					<Spin size="large" fix v-if="loading"></Spin>
					<div class="empty-img" v-if="!data||!data.length">
						<span v-if="search_field.gift_name.length > 0">没有找到对应的积分礼品</span>
						<span v-else>还没有积分礼品，快去添加吧！</span>
					</div>
					<div class="gift-item" v-for="item in data">
						<div class="gift-item-box">
							<div class="gift-item-img">
								<img :src="item.cover_image_url">
							</div>
							<div class="gift-item-content">
								<div class="gift-item-content-left">
									<p :title="item.gift_name">名称：{{item.gift_name}}<span class="text-danger" v-if="item.status==0">·禁用</span></p>
									<p>分类：{{item.credit_gift_cate.cate_name}}</p>
									<p>上架：{{item.pub_int_day}}</p>
									<p>市价：{{Number(item.price)}}元</p>
								</div>
								<div class="gift-item-content-right">
									<p>积分：{{Number(item.credit)}}</p>
									<p>库存：{{item.qty}}</p>
									<p>已兑：{{item.buy_times}}</p>
									<p>
										<dropdown :transfer="true" >
											<Button type="primary" size="small" icon="ios-gear">操作</Button>
											<dropdown-menu slot="list">
												<dropdown-item @click.native="editInfo(item)" v-per="'gift.edit'">
													<Icon type="edit"></Icon> 编辑
												</dropdown-item>																						
												<dropdown-item @click.native="giftExchange(item)" v-if="item.status==1" v-per="'gift.exchange'">
													<Icon type="ios-shuffle"></Icon> 兑换
												</dropdown-item>
												<dropdown-item @click.native="giftQTY(item)" v-if="item.status==1" v-per="'gift.storage'">
													<Icon type="plus"></Icon> 库存变动
												</dropdown-item>
												<dropdown-item @click.native="delGift(item)" v-per="'gift.delete'">
													<Icon type="trash-a"></Icon> 删除
												</dropdown-item>
											</dropdown-menu>
										</dropdown>
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
	    	</div>        
	    	<div class="content-footer mt-3">
	            <div class="pagenation text-right">
	                <Page 
	                	:total="total" 
	                	:current="pageIndex" 
	                	:show-sizer="true" 
	                	:page-size="pageSize" 
	                	:show-total="true" 
	                	:page-size-opts="pageSizeOpts"
	                	@on-change="pagenation" 
	                	@on-page-size-change="pagesize">
	                </Page>
	            </div>
	        </div>
	        
		</div>
		
	</div>
</template>

<script>
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectGiftCate from 'c%/SelectGiftCate.vue'
	
	export default{
		mixins: [ grid, common, globals ],
		components: {
			SelectGiftCate
		},
		data () {
			return {
				rest_api: 'credit_gifts',
				pk: 'cg_id',
				search_field: {
					gift_name: '',
					cgc_id: 0,
					status: [1]
				},
				map_status:{1:'启用',0:'禁用'},
				pageSize: 12,
				pageSizeOpts: [12,24,36],
				order_sort: '' 
			}
		},
		
		mounted () {
			this.init_data()
		},
		methods: {
			setListDesc () {
				this.order_sort = 'desc'
				this.search()
			},
			setListAsc () {
				this.order_sort = 'asc'
				this.search()
			},
			giftCate () {
				this.$Modal.open('app/cshop/gift/cate-modal.vue')
				.then(modal=>{
					modal.show('礼品分类')
				})
			},
			giftExchange (item) {
				this.$Modal.open('app/cshop/gift/exchange-modal.vue',{
					props: {
						'cg-id': item.cg_id,
						'gift-credit': Number(item.credit)
					},
					on: {
						'on-success':() => {
							this.init_data()
						}
					} 
				})
				.then(modal => {
					modal.show(util.sprintf('兑换【%s】',item.gift_name))
				})
			},
			editInfo (item) {
				this.$Modal.open('app/cshop/gift/info-modal.vue',{
					on: {
						'save': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					let info = util.copy(item)
					info.price = Number(info.price)
					info.credit = Number(info.credit)
					info.gift_detail = info.credit_gift_detail.detail
					info.gift_images = info.credit_gift_image
					delete info.credit_gift_detail
					delete info.credit_gift_image
					delete info.credit_gift_cate
					modal
					.set('info',info)
					.show(`编辑积分礼品【${item.gift_name}】`,'edit')
				})
			},			
			resetSearch () {
				this.search_field.gift_name = ''
				this.search_field.cgc_id = 0
				this.search()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				
				for(let o in search_obj) {
                    let property = search_obj[o]
                    if(o=='status') {
                    	if(property.length==1) {
                    		params[o] = property[0]
                    	}
                    }else{
                    	if(property&&property!=-1){
	                        params[o] = property    
	                    }
                    }
                }
                if(this.order_sort) {
                	params.order_field = 'qty'
                	params.order_sort = this.order_sort
                }
				params.with = 'credit_gift_cate,credit_gift_detail,credit_gift_image'
			},
			addGift () {
				this.$Modal.open('app/cshop/gift/info-modal.vue',{
					on: {
						'save':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('新增礼品','add')
				})
			},	
			delGift(item){
				this.confirm(util.sprintf('确定删除【%s】',item.gift_name))
				.then(() => {
					this.delete(item)
				})
			},
			qtyHistory(item) {
				this.$Modal.open('app/cshop/gift/qty-record.vue@modal')
				.then(modal=>{
					modal.show('出入库记录')
				})
			},
			giftQTY (row) {
				this.$Modal.open('app/cshop/gift/qty-modal.vue',{
					props: {
						cgId: row.cg_id
					},
					on: {
						'on-success': () => {
							this.init_data()
						}
					}
				}).then(modal=>{
					modal.show(`【${row.gift_name}】库存变动`)
				})
			}
		}
		
	}
	
</script>

<style lang="less" scoped>
.app-c-grid{
	.box .ivu-btn{
		padding: 6px 15px;
		&.ivu-btn-small{
			padding: 2px 7px;
		}
	}	
}

.gift-container{
	display: flex;
	position: relative;
	flex-wrap: wrap;

	.empty-img{
		height: 450px;
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
	
	.gift-item{
		flex: 0 0 25%;
		height: 180px;		
		padding: 10px;
        overflow: hidden;
        
        .gift-item-box{
        	width: 100%;
        	height: 100%;
        	padding: 20px;
        	display: flex;
			box-sizing: border-box;
			background: #F5F7F9;
			border-radius: 3px;
			transition: all .3s; 
			
			&:hover{
			    box-shadow: 0 0 5px rgba(0,0,0,.3);
		        transform: translateY(-5px);     	
	        	.gift-item-img{
	        		img{
	    			    transform: scale(1.1) translateX(-5px);
	    				opacity: 1;
	        		}
	        	}
	        }
	        .gift-item-content {
			    margin-left: 10px;
			    flex: 1;
			    
			    .gift-item-content-left,
			    .gift-item-content-right{
			    	float: left;
			    	width: 50%;
			    	height: 100%;
			    	display: flex;
			    	flex-direction: column;
			    	justify-content: space-around;
			    	
			    	p {
					    white-space: nowrap;
					    width: 100%;
					    overflow: hidden;
					    text-overflow: ellipsis;
					    padding-right: 10px;
					}
			    }
			}
			
			.gift-item-img{
				width: 96px;
				height: 120px;
				line-height: 120px;
				img{
					max-width: 100%;
					max-height: 100%;
					opacity: .8;
					transition: all .3s;
				}
			}
        }
        
	}
}

@media screen and (max-width: 1440px) {
	.gift-container .gift-item{
		flex: 0 0 33.33%;
	}
}

</style>