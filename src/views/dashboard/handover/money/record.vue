<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="交款人" prop="eid" class="col-md-3 col-sm-6">
					<select-employee v-model="search_field.eid"></select-employee>
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
				<filter-column :keys="column_keys"></filter-column>
			</div>
    		<div class="content">
    			<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'handover_moneys'" 
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
    	<record-money-detail ref="money_detail"></record-money-detail>
	</div>
</template>
<script>
	import moment from 'moment'
	import util   from '@/libs/util'
	import common from '@/libs/common.mixin'
	import grid   from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import RecordMoneyDetail from './record-money-detail.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'

	export default {
		mixins:[common,grid,globals],
		components: {
			RecordMoneyDetail,
			DateRangePicker,
			SelectEmployee
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
						title:'交款人',
						disabled:true,
						show:true
					},
					amount:{
						title:'交款总额',
						show:true
					},
					cash_amount:{
						title:'现金',
						show:true
					},
					non_cash_amount:{
						title:'非现金',
						show:true
					},
					create_time:{
						title:'交款时间',
						show:true
					},
					is_ack:{
						title:'是否确认',
						show:true
					},
					ack_eid:{
						title:'确认人',
						show:true
					},
					ack_time:{
						title:'确认时间',
						show:true
					}
				},
				column_render:{
					eid(h,params) {
						return h('span',this.$filter('ename')(params.row.eid))
					},
					amount(h,params) {
						return h('a',{
							attrs:{
								class:'x-a-link text-info'
							},
							on:{
								click:() =>{
									this.showDetail(params.row)
								}
							}
						},this.label_currency+params.row.amount)
					},
					cash_amount(h,params) {
						return h('span',this.label_currency+params.row.cash_amount)
					},
					non_cash_amount(h,params) {
						return h('span',this.label_currency+(util.sub(params.row.amount,params.row.cash_amount)).toFixed(2))
					},
					is_ack(h,params) {
						return h('span',params.row.ack_time?'是':'否')
					},
					ack_eid(h,params) {
						if(params.row.ack_eid) {
							return h('span',this.$filter('ename')(params.row.ack_eid))
						}else{
							return h('span','-')
						}
					},
					ack_time(h,params) {
						return h('span',params.row.ack_time||'-')
					}
				}
			}
		},
		mounted() {
			this.rest_api = 'handover_moneys?with=handover_work&eid='+this.eid$
			this.init_data()
		},
		methods: {
			showDetail(row) {
				this.$refs.money_detail
				.set('data',row.handover_work)
				.show(util.sprintf('交款详情【%s】',this.$filter('ename')(row.eid)))
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s,%s]',property[0].replace(/-/g,'')
								,property[1].replace(/-/g,''))
						}												
					}else if (o=='ack_time'||o=='tid'){
						if(property == '1'){
	                        params[o] = '[>,0]'
						}else if(property == '0') {
							params[o] = 0
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
		}
	}
</script>