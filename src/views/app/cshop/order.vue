<template>
	 <div class="c-grid">
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="学员" prop="sid" class="col-sm-3">
					<select-student v-model="search_field.sid" @on-selected="search"></select-student>
				</Form-item>
				<Form-item label="礼品名称" prop="cg_id" class="col-sm-3">
					<select-gift v-model="search_field.cg_id" @on-selected="search"></select-gift>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">   
                	<Button type="primary" @click="search" icon="ios-search">搜索</Button>
					<Button type="primary" @click="resetSearch" icon="refresh">重置</Button>
                    <CheckboxGroup v-model="search_field.order_status" class="ml-2" style="display: inline-block;">
						<Checkbox :label="1">已发货</Checkbox>
						<Checkbox :label="0">未发货</Checkbox>
					</CheckboxGroup>
                </Col>
           	</Row>
		</div>
		
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" icon="ios-shuffle" @click="giftExchange">兑换礼品</Button>
				<filter-column :keys="column_keys"></filter-column>
			</div>
			<div class="content">
				<div class="content-body">
					<Table 		            	
		            	v-loading.like="'credit_orders'" 
		            	:data="data"
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            	@on-sort-change="sortChange"> 
		            </Table>
		    	</div>        
		    	<div class="content-footer">
		            <div class="pagenation">
		                <Page 
		                	:total="total" 
		                	:current="pageIndex" 
		                	:show-sizer="true" 
		                	:page-size="pageSize" 
		                	:show-total="true" 
		                	@on-change="pagenation" 
		                	@on-page-size-change="pagesize">
		                </Page>
		            </div>
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
	import SelectGift from 'c%/SelectGift.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	
	export default{
		mixins: [ grid, common, globals ],
		components: {
			SelectGift,
			SelectStudent
		},
		data () {
			return {
				rest_api: 'credit_orders',
				pk: 'co_id',
				search_field: {
					cg_id: 0,
					sid: 0,
					order_status: [0,1]
				},
				map_order_status:{1:['已发货','text-success'],0:['未发货','text-danger']},
				column_keys: {
					sid: {
						title: '学员',
						show: true
					},
					first_tel: {
						title: '学员电话',
						show: true
					},
					gift: {
						title: '兑换礼品',
						show: true
					},
					nums: {
						title: '兑换数量',
						show: true
					},
					credit: {
						title: '消耗积分',
						show: true
					},
					order_status: {
						title: '订单状态',
						show: true
					},
					create_time: {
						title: '下单时间',
						show: true
					},
					delivery_time: {
						title: '发货时间',
						show: true
					}
				},
				column_render: {
					sid(h,params) {
						return h('span',params.row.student.student_name)
					},
					first_tel(h,params) {
						return h('span',params.row.student.first_tel)
					},
					gift(h,params) {
						return h('span',params.row.credit_gift.gift_name)
					},
					order_status(h,params) {
						return h('span',{
							class: this.map_order_status[params.row.order_status][1]
						},this.map_order_status[params.row.order_status][0])
					}
				},
				operation_keys: {
					delivery: {
						title: '发货',
						type: 'android-car',
						per: 'gorder.delivery',
						condition: 'row.order_status==0'
					},
					cancel: {
						title: '取消',
						type: 'close',
						per: 'gorder.cancel'
					}
				},
				operation_func: {
					delivery(params) {
						this.$rest('credit_orders').add_url_param(params.row.co_id,'doReceive')
						.post()
						.success(res => {
							this.$Message.success('发货成功')
							this.init_data()
						})
						.error(res => {
							this.error(res.body.message)
						})
					},
					cancel(params) {
						this.confirm(util.sprintf('确定取消【%s】兑换【%s】的订单吗？',params.row.student.student_name,params.row.credit_gift.gift_name))
						.then(() => {
							this.delete(params.row)
						})
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			giftExchange (item) {
				this.$Modal.open('app/cshop/gift/exchange-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					} 
				})
				.then(modal => {
					modal.show('兑换礼品')
				})
			},
			resetSearch () {
				this.$r('ref_search').resetFields()				
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				
				for(let o in search_obj) {
                    let property = search_obj[o]
                    if(o=='order_status') {
                    	if(property.length==1) {
                    		params[o] = property[0]
                    	}
                    }else{
                    	if(property&&property!=-1){
	                        params[o] = property    
	                    }
                    }
                }
				params.with = 'credit_gift,student'
			}
		}
	}
	
</script>