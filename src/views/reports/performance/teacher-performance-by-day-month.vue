<template>
	<div class="c-grid">
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="年 / 月" prop="int_day" class="col-md-3 col-sm-6">
    				<date-picker
    					type="month"
						:value="search_field.month"
						@on-change="search_field.month=$event"
						label="请选择年月"
						placement="bottom"
						style="width:100%">
					</date-picker>
    			</Form-item>
    			<Form-item :label="label_teacher" prop="eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.eid" clearable :placeholder="label_choose_teacher"></select-employee>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<export-button res="report_employee_month_day_summarys" :params="params"></export-button>
                </Col>
            </Row>
		</div>
		<div class="box box-result">
	        <div class="content">
                <div class="content-body">
                    <Table 
                    v-loading.like="'report_employee_month_day_summarys'" 
                    class="performance-summary"
                    :pageSize="pageSize" 
                    :page="pageIndex" 
                    :stripe="true" 
                    :show-header="true" 
                    :data="data" 
                    :columns="my_columns" 
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
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import ExportButton from 'c%/ExportButton.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			SelectEmployee,
			ExportButton
		},
		data() {
			return {
				rest_api: 'report_employee_month_day_summarys',
				search_field: {
					month: moment().format('YYYY-MM'),
					eid: 0,
				},
				week_sections: []
			}
		},
		mounted() {
			this.init_data()
		},
		computed: {
			my_columns() {
				let columns = []
				columns.push({
					title: this.$filter('translate')('老师')+'姓名',
					key: 'eid',
					width:200,
					align: 'center',
					render: (h,params) => {
						return h('span',this.$filter('ename')(params.row.eid))
					},
					fixed:'left'
				})
				for(let i=1;i<32;i++){
					columns.push({
						title:i,
						width:60,
						align:'center',
						key:'day'+i
					})
				}
				columns.push({
					title:'课时数',
					align:'center',
					width:60,
					key:'total_lesson_hour_nums'
				})
				columns.push({
					title:'学员数',
					align:'center',
					width:60,
					key:'total_student_nums'
				})
				columns.push({
					title:'课时金额',
					align:'center',
					width:80,
					key:'total_amount_nums'
				})
				
				return columns
			}
		},
		methods: {
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='month'){
						let arr = property.split('-')
						params['year'] = arr[0]
						params['month'] = util.int(arr[1])

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
			}
			
		},

	}
</script>
<style lang="less">
	.performance-summary {
		.ivu-table {
			tr th {
				border: 1px solid #e3e8ee;
			}
		}
	}
</style>