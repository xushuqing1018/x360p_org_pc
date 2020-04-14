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
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<export-button res="report_performance_totals" :params="params"></export-button>
                </Col>
            </Row>
		</div>
		<div class="box box-result">
	        <div class="content">
                <div class="content-body">
                    <div class="ivu-table-wrapper" v-loading.like="'report_performances'">
                    	<table class="modal-table receipt-summary">
                    		<thead>
                    			<tr>
                    				<th><div class="ivu-table-cell">业绩归属人</div></th>
                    				<th><div class="ivu-table-cell">签单角色</div></th>
                    				<th><div class="ivu-table-cell">签单金额/元</div></th>
                    				<th><div class="ivu-table-cell">回款金额/元</div></th>
                    			</tr>
                    		</thead>
                    		<tbody v-for="item in data">
                    			<tr v-for="(info,index) in item.infos">
                    				<td :rowspan="item.infos.length" v-if="index==0"><div class="ivu-table-cell">{{item.eid|ename}}</div></td>
                    				<td><div class="ivu-table-cell">{{info.sale_role_did|dict_title('sale_role')}}</div></td>
                    				<td><div class="ivu-table-cell">{{info.order_amount}}</div></td>
                    				<td><div class="ivu-table-cell">{{info.receipt_amount}}</div></td>
                    			</tr>
                    		</tbody>
                    		<tr v-if="data.length==0">
                    			<td class="text-center" colspan="4"><div class="ivu-table-cell">没有数据</div></td>
                    		</tr>
                    		<tr v-else>
                    			<td><div class="ivu-table-cell">合计</div></td>
                    			<td></td>
                    			<td><div class="ivu-table-cell text-primary">{{performance_total}}</div></td>
                    			<td><div class="ivu-table-cell text-primary">{{receipt_total}}</div></td>
                    		</tr>
                    	</table>
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
                        @on-page-size-change="pagesize"
                        >
                        </Page>
                    </div>
                </div>
            </div>
	    </div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import ExportButton from 'c%/ExportButton.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectEmployee,
			SelectClass,
			ExportButton
		},
		data() {
			return {
				rest_api: 'report_performances/performance_total',
				search_field: {
                    int_day: util.recent_month_range(1),
					eid: 0,
					sale_role_did: -1
				},
				receipt_total: 0,
				performance_total: 0
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
				this.receipt_total = data.receipt
				this.performance_total = data.performance
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
<style lang="less">
	.modal-table.receipt-summary {
		tr{
	        &:hover td{
	             background: transparent;
	        }
        }
	}
</style>