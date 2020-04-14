<template>
	<div class="c-grid">
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
    			<Form-item :label="label_teacher" prop="eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.eid" clearable :placeholder="label_choose_teacher"></select-employee>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<export-button res="report_employee_lesson_hours" :params="params"></export-button>
                </Col>
            </Row>
		</div>
		<div class="box box-result">
	        <div class="content">
                <div class="content-body">
                    <Table 
                    v-loading.like="'report_employee_lesson_hours'" 
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
    import DateRangePicker from 'c%/DateRangePicker.vue'

	export default {
		mixins: [grid,common,globals],
		components: {
			SelectEmployee,
			ExportButton,
            DateRangePicker
		},
		data() {
			return {
				rest_api: 'report_employee_lesson_hours',
				search_field: {
					int_day: util.recent_month_range(1),
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
					align: 'center',
					render: (h,params) => {
						return h('span',this.$filter('ename')(params.row.eid))
					}
				})
				for(let i=0,len=this.week_sections.length;i<len;i++) {
					let obj = {},
						item = this.week_sections[i]
					obj.renderHeader = (h,column) => {
						return h('div',[
							h('p',`第${i+1}周`),
							h('p',`${moment(item.start).format('MM-DD')}~${moment(item.end).format('MM-DD')}`)
						])
					}
					obj.align = 'center'
					obj.children = [
						{
							title: '课时',
							key: `week_${i}_lesson_num`,
							align: 'center'
						},
						{
							title: '试听',
							key: `week_${i}_trial_num`,
							align: 'center'
						}
					]
					columns.push(obj)
				}
				columns.push({
					title: '月统计',
					align: 'center',
					children: [
						{
							title: '课时',
							key: 'lesson_nums',
							align: 'center'
						},
						{
							title: '试听',
							key: 'trial_nums',
							align: 'center'
						},
						{
							title: '合计',
							key: 'total_nums',
							align: 'center'
						}
					]
				})
				return columns
			}
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
			deal_data(data) {
				this.week_sections = data.week_section
				return data.list
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