<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="收款账户" prop="aa_id" class="col-md-4 col-sm-6">
				<Select v-model="search_field.aa_id">
					<Option :value="-1">不限</Option>
					<Option v-for="item in accounts" :value="item.aa_id">{{item.name}}</Option>
				</Select>
			</Form-item>
			<Form-item label="支付时间" prop="pay_time" class="col-md-4 col-sm-6">
				<date-range-picker 
					v-model="search_field.pay_time" 
					@on-change="search" 
					label="选择支付时间" 
					placement="bottom"
					style="width:100%">
				</date-range-picker>					
			</Form-item>
		</Form>
		<Row class="basic">
            <Col span="24" class="mt-2 mb-2">
            	<Button class="ml-2" type="primary" size="small" icon="ios-search" @click="search">查询</Button>
            	<Button class="ml-2" type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
            </Col>
        </Row>      
		<div class="content-body">
	        <Table 
		        v-loading="'order_payment_onlines'" 
		        :page-size="pageSize" 
		        :page="pageIndex" 	
		        :stripe="true" 
		        :show-header="true" 
		        :data="data" 
		        :columns="columns" 
		        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		        @on-sort-change="sortChange"> 
	        </Table>
	    </div>
	    <div class="content-footer">
	        <div class="clearfix">
	            <Page 
	            	class="pull-right mt-2"
	            	size="small"
		            :total="total" 
		            :current="pageIndex" 
		            :show-sizer="true" 
		            :page-size="pageSize" 
		            :show-total="true" 
		            @on-change="pagenation" 
		            @on-page-size-change="pagesize"
	            >
	            </Page>
	        </div>
	    </div>
		<div slot="footer">
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'

	import DateRangePicker from 'c%/DateRangePicker.vue'

	export default {
		mixins:[modal,globals,common,grid],
		components: {
			DateRangePicker
		},
		data() {
			return {
				rest_api: 'order_payment_onlines',
				search_field: {
					aa_id: -1,
					pay_time: [],
					status: -1
				},
				column_keys: {
					pay_time: {
						title:'支付日期'
					},
					aa_id:{
						title:'收款账户',
						disabled:true
					},
					paid_amount:{
						title:'支付金额',
						width:150
					},
					orb_no:{
						title:'订单编号'
					}
				},
				column_render: {
					aa_id(h,params) {
						return h('span',this.accounts$.find(item=>item.aa_id==params.row.aa_id).name)
					},
					paid_amount(h,params) {
						return h('span',this.label_currency+params.row.paid_amount)
					},
					orb_no(h,params) {
						let result,
							history = params.row.order_payment_history
						if(history) {
							if(history.order_receipt_bill) {
								result = history.order_receipt_bill.orb_no
								return h('span',{
									attrs: {
										class: 'x-a-link text-info cursor'
									},
									on: {
										click: ()=>{
											this.toOrder(result)						
										}
									}
								},result)
							}
						}
						return h('span','-')
					}
				}
			}
		},
		methods: {
			onModalOpen() {
				this.init_data()
			},
			toOrder(no) {
				this.modal$.show = false
				this.$emit('on-query',no)
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='pay_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				params.status = 1
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			}
		},
		computed: {
			accounts() {
				return this.accounts$.filter(item => item.cp_id>0)
			}
		}
	}
</script>