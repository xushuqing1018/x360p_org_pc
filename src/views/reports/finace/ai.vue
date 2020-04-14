<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="时间段" prop="int_day" class="col-md-3 col-sm-6">
    				<date-range-picker 
						:value="search_field.int_day" 
						@on-change="search_field.int_day=$event" 
						label="请选择年月" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>
    			</Form-item>
    			<Form-item label="确实收入" class="col-md-9 col-sm-6">
    				= 课耗金额 + 物品收入 + 杂费收入 - 支出金额
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
	            	<Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="resetSearch">刷新统计</Button>
	            	<export-button res="report_branch_assure_incomes" :params="params"></export-button>             	
                </Col>
            </Row>
		</div>
		<div class="box box-result">
	        <div class="content">
                <div class="content-body">
                    <Table 
                    v-loading.like="'report_branch_assure_incomes'" 
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
	import Vue from 'vue'
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ExportButton from 'c%/ExportButton.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			ExportButton,
			DateRangePicker
		},
		data() {
			return {
				rest_api: 'report_branch_assure_incomes',
				search_field: {
					int_day: util.recent_month_range(1),
				},
				column_keys: {
					bid: {
						title: '校区',
						show: true,
					},
					lesson_hour_amount: {
						title: '课耗金额',
						show: true,
						sortable:'custom'
					},
					goods_income_amount: {
						title: '物品收入',
						show: true,
						sortable:'custom'
					},
					fee_income_amount: {
						title: '杂费收入',
						show: true,
						sortable:'custom'
					},
					outcome_amount:{
						title:'支出金额',
						show:true,
						sortable:'custom'
					},
					assure_income_amount: {
						title: '确实收入',
						show: true,
						sortable:'custom'
					}
				},
				column_render: {
					bid(h, params) {
						return h('span',this.$filter('branch_name')(params.row.bid))
					}
				},
				isRefresh: false
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
						if(property!=','&&property.length>0){
							params['start_date'] = property[0]
					     	params['end_date']   = property[1]
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				if(this.isRefresh){
					params.refresh = 1
				}
				this.isRefresh = false
				delete params['page']
				delete params['pagesize']
			},
			resetSearch () {
				this.isRefresh = true
				this.init_data()
			},
			get_data() {
				if(!this.checkDate()) return
				this.init_data()
			},
			checkDate() {
				if(this.search_field.int_day[0] === '') {
					this.$Message.error('时间段不能为空')
					return false
				}
				return true
			},
			deal_data(data) {
				return data.list
			}
		},

	}
</script>

