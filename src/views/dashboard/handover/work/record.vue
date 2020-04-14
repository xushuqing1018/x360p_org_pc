<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :label-width="90" :model="search_field" class="filter-form row">
				<Form-item label="交班接收人" prop="to_eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.to_eid"></select-employee>
    			</Form-item>
    			<Form-item label="交款时间" prop="create_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.create_time" 
						label="选择日期" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
    			<Form-item label="确认状态" prop="ack_time" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.ack_time">
    					<Option value="1">已确认</Option>
    					<Option value="0">未确认</Option>
    				</Select>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                </Col>
            </Row>
		</div>
		<div class="box box-result">
			<div class="toolbar">	
				<Button type="primary" icon="refresh" @click="search">刷新</Button>
				<filter-column :keys="column_keys"></filter-column>
			</div>
    		<div class="content">
    			<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'handover_works'" 
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
    	<record-detail ref="record_detail"></record-detail>
	</div>
</template>
<script>
	import moment from 'moment'
	import util   from '@/libs/util'
	import common from '@/libs/common.mixin'
	import grid   from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import RecordDetail from './record-work-detail.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'

	export default {
		mixins:[common,grid,globals],
		components: {
			RecordDetail,
			SelectEmployee,
			DateRangePicker
		},
		data() {
			return {
				rest_api:'',
				search_field: {
					ack_time: '',
					eid:0,
					create_time:[]
				},
				column_keys:{
					eid:{
						title:'交班人',
						show:true
					},
					to_eid:{
						title:'交班接收人',
						show:true
					},
					money_inc_amount:{
						title:'收费金额',
						show:true
					},
					money_dec_amount: {
						title:'退费金额',
						show:true
					},
					cash_inc_amount:{
						title:'收费现金',
						show:true
					},
					cash_dec_amount: {
						title:'退费现金',
						show:true
					},
					submit_time:{
						title:'交班时间',
						width:200,
						show:true
					},
					ack_time:{
						title:'确认时间',
						width:200,
						show:true
					},
					operation:{
						title:'操作',
						width:100,
						show:true
					}
				},
				column_render:{
					eid(h,params) {
						return h('span',this.$filter('ename')(params.row.eid))
					},
					to_eid(h,params) {
						if(params.row.to_eid == 0) {
							return h('span','-')
						}
						return h('span',this.$filter('ename')(params.row.to_eid	))
					},
					money_inc_amount(h,params) {
						return h('a',{
							attrs:{
								class:'x-a-link text-info'
							},
							on:{
								click:() =>{
									this.showDetail(params.row)
								}
							}
						},this.label_currency+params.row.money_inc_amount)
					},
					money_dec_amount(h,params) {
						return h('span',this.label_currency+params.row.money_dec_amount)
					},
					cash_inc_amount(h,params) {
						return h('span',this.label_currency+params.row.cash_inc_amount)
					},
					cash_dec_amount(h,params) {
						return h('span',this.label_currency+params.row.cash_dec_amount)
					},
					submit_time(h,params) {
						let time = params.row.submit_time
						if(!time) {
							return h('span','-')
						}else{
							return h('span',time)
						}
					},
					ack_time(h,params) {
						let time = params.row.ack_time
						if(!time) {
							return h('span','-')
						}else{
							return h('span',time)
						}
					},
					operation(h,params) {
						return h('Button',{
							props:{
								type:'error',
								disabled:!!params.row.ack_time
							},
							on: {
								click:()=>{
									this.undoHand(params)
								}
							}
						},'撤销')
					}
				}
			}
		},
		methods: {
			undoHand(params) {
				this.confirm(util.sprintf('确认撤销此次交班吗？')).then(() => {
					this.$rest('handover_works')
					.delete(params.row.hw_id)
					.success(res => {
						this.$Message.success('撤销成功')
						this.init_data()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			showDetail(row) {
				this.$refs.record_detail
				.set('data',row.order_receipt_bill.concat(row.order_refund))
				.show(util.sprintf('交班详情【%s】',this.$filter('ename')(row.eid),'list'))
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='ack_time'||o=='tid'){
						if(property == '1'){
	                        params[o] = '[>,0]'
						}else if(property == '0') {
							params[o] = 0
						}
					}else if(o=='submit_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s,%s]',property[0].replace(/-/g,'')
								,property[1].replace(/-/g,''))
						}												
					}else{
						if(property&&property!='-1'){
							params[o] = property
						}
					}									
				}
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			}
		},
		mounted() {
			this.rest_api = 'handover_works?eid='+this.eid$
			this.init_data()
		}
	}
</script>