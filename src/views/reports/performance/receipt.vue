<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
				<Form-item label="时间段" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker
							v-model="search_field.int_day"
							label="请选择时间段"
							placement="bottom"
							style="width:280px"
							@on-change="init_data">
					</date-range-picker>
				</Form-item>
    			<Form-item label="员工姓名" prop="eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.eid" clearable placeholder="请选择员工"></select-employee>
    			</Form-item>
    			<Form-item label="角色类型" prop="sale_role_did" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.sale_role_did">
    					<Option :value="-1">不限</Option>
    					<Option v-for="item in sale_role_list" :value="item.did" :key="item.did">{{item.title}}</Option>
    				</Select>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<!-- <Button type="primary" icon="ios-download-outline" v-per="'reports.export'" @click="exportExcel('回款业绩汇总')">导出</Button>    -->
	            	<export-button res="report_receipts" :params="params"></export-button>
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
                    v-loading.like="'report_performances'" 
                    ref="tableExcel"
                    :pageSize="pageSize" 
                    :page="pageIndex" 
                    :stripe="true" 
                    :show-header="true" 
                    :data="data" 
                    :columns="columns" 
                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
                    @on-sort-change="sortChange"
                    > 
                    </Table>
                </div>
                <div class="content-footer">
                	<Alert class="pull-left" v-if="receipt_amount">
                		<span class="mr-3">收款：<Tag color="green">{{label_currency}}{{receipt_amount}}</Tag></span>
                		<span class="mr-3">退款：<Tag color="yellow">{{label_currency}}{{refund_amount}}</Tag></span>
                		<span class="mr-3">合计：<Tag color="blue">{{label_currency}}{{receipt_amount + refund_amount}}</Tag></span>
                	</Alert>
                    <div class="pagenation">
                        <Page 
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
            </div>
	    </div>
	    <receipt-detail ref="detail"></receipt-detail>
	</div>
</template>
<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import ReceiptDetail from './receipt-detail.vue'
	import ExportButton from 'c%/ExportButton.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectEmployee,
			SelectClass,
			ReceiptDetail,
			ExportButton
		},
		data() {
			return {
				rest_api: 'report_performances/receipt_list',
				autoRefresh:false,
				receipt_amount: 0,
				refund_amount: 0,
				search_field: {
					int_day: util.recent_month_range(1),
					eid: 0,
					sale_role_did: -1
				},
				column_keys: {
					eid: {
						title: '姓名',
						show: true,
						sortable:'eid'
					},
					sale_role: {
						title: '角色',
						show: true,
						sortable:'sale_role_did'
					},
					amount: {
						title: '金额',
						show: true,
						sortable:'amount'
					},
					receipt_time: {
						title: '单据日期',
						show: true,
						sortable:'receipt_time'
					},
					create_time: {
						title: '操作日期',
						show: true,
						sortable:'create_time'
					}
				},
				column_render: {
					eid(h,params) {
						return h('span',this.$filter('ename')(params.row.eid))
					},
					receipt_time(h,params) {
						return h('span',moment(params.row.receipt_time).format('YYYY-MM-DD'))
					},
					create_time(h,params) {
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
                        if(property != ',' && property.length > 0){
                            params['start_date'] = property[0]
                            params['end_date']   = property[1]
                        }
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			deal_data (data) {
				this.refund_amount = data.refund_amount
				this.receipt_amount = data.receipt_amount
				return data.list
			}
		},
		computed: {
			sale_role_list() {
				return this.$store.state.gvars.dicts.sale_role
			}
		}
	}
</script>