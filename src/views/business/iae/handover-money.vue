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
    			<Form-item label="转账状态" prop="tid" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.tid">
    					<Option value="1">已转账</Option>
    					<Option value="0">未转账</Option>
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
    		<div class="content">
    			<div class="toolbar">	
					<filter-column :keys="column_keys"></filter-column>
				</div>
    			<div class="content-body">
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
    	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="500">
    		<Form ref="form" :label-width="180" :modal="hand_info" class="filter-form">
    			<Form-item label="交款人：" prop="eid">
    				<span class="ml-5">{{hand_info.eid|ename}}</span>
    			</Form-item>
    			<Form-item label="交款总额：" prop="amount">
    				<span class="ml-5">{{label_currency}}{{hand_info.amount}}</span>
    			</Form-item>
    			<Form-item label="现金部分：" prop="cash_amount">
    				<span class="ml-5">{{label_currency}}{{hand_info.cash_amount}}</span>
    			</Form-item>
    			<Form-item label="交款时间：" prop="create_time">
    				<span class="ml-5">{{hand_info.create_time}}</span>
    			</Form-item>
    		</Form>
    		<div slot="footer">
				<Button type="ghost" @click="close">取消</Button>
				<Button type="primary" @click="ok">确定</Button>
			</div>
    	</Modal>
    	<tally-info ref="tally_info" @on-success="init_data"></tally-info>
	</div>
</template>
<script>
	import moment from 'moment'
	import util   from '@/libs/util'
	import modal  from '@/libs/modal.mixin' 
	import common from '@/libs/common.mixin'
	import grid   from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import TallyInfo from './tally-info.vue'
	import RecordMoneyDetail from '@/views/dashboard/handover/money/record-money-detail.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'

	export default {
		mixins:[common,grid,globals,modal],
		components: {
			RecordMoneyDetail,
			TallyInfo,
			SelectEmployee,
			DateRangePicker
		},
		data() {
			return {
				rest_api:'handover_moneys?with=handover_work',
				search_field: {
					ack_time: '',
					eid:0,
					tid:'',
					create_time:[]
				},
				hand_info:{

				},
				column_keys:{
					eid:{
						title:'交款人',
						disabled:true,
						show:true
					},
					bid:{
						title:'交款校区',
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
						width:180,
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
						width:180,
						show:true
					},
					tid:{
						title:'是否记账',
						show:true
					},
					operation:{
						title:'操作',
						width:80,
						show:true,
						disabled:true
					}
				},
				column_render:{
					eid(h,params) {
						return h('span',this.$filter('ename')(params.row.eid))
					},
					bid(h,params) {
						return h('span',this.$filter('branch_name')(params.row.bid))
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
					},
					tid(h,params) {
						return h('span',params.row.tid?'是':'否')
					},
					operation(h,params) {
						if(!params.row.ack_time) {
							return h('Button',{
								props:{
									type:'ghost',
									shape:'circle',
									icon:'checkmark'
								},
								attrs:{
									title:'确认'
								},
								directives:[{
									name:'per',
									value:'hand.ack'
								}],
								on:{
									click:()=>{
										this.confirmMoney(params)
									}
								}
							})
						}else{
							return h('Button',{
								props:{
									type:'ghost',
									shape:'circle',
									icon:'arrow-swap',
									disabled:!!params.row.tid
								},
								attrs:{
									title:!!params.row.tid?'已转账':'转账'
								},
								directives:[{
									name:'per',
									value:'hand.transfer'
								}],
								on:{
									click:()=>{
										this.transferMoney(params)
									}
								}
							})
						}
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			confirmMoney(params) {
				this.set('hand_info',params.row)
				this.show('确认交款','info')
			},
			ok() {
				this.$rest('handover_moneys/ack')
				.get({hm_id:this.hand_info.hm_id})
				.success(res => {
					this.$Message.success('确认交款成功')
					this.init_data()
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			transferMoney(params) {
				let tally = this.$refs.tally_info,
					param = {
						amount:parseFloat(params.row.cash_amount),
						bid:params.row.bid
					}
				tally.info.cate = '3'
				Object.assign(tally.info,param)
				tally.set('hm_id',params.row.hm_id).show('新增记账','add')
			},
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