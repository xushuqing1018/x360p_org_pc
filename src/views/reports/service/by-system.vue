<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">

				<Form-item label="时间段" prop="int_day" class="col-sm-3">
					<date-range-picker
							v-model="search_field.int_day"
							label="请选择时间段"
							placement="bottom"
							style="width:100%"
							@on-change="init_data"
					>
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
	            	<Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="refresh">刷新统计</Button>
	            	<export-button res="report_service_by_systems" :params="params"></export-button>             	
                </Col>
            </Row>
		</div>
		<div class="box box-result">
	        <div class="content">
                <div class="content-body">
                    <Table 
                    v-loading.like="'report_service_by_systems'" 
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
	import Vue from 'vue'
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ExportButton from 'c%/ExportButton.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
    import DateRangePicker from 'c%/DateRangePicker.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
            DateRangePicker,
			ExportButton,
			SelectEmployee,
		},
		data() {
			return {
				rest_api: 'report_service_by_systems',
				search_field: {
					eid: 0,
					int_day: [],
				},
			}
		},
		mounted() {
			this.init_data()
		},
		computed: {
            my_columns(){
            	let columns = []
            	columns.push({
            		title: this.$filter('translate')('老师')+'姓名',
            		key: 'eid',
            		align: 'center',
            		// render: (h,params) => {
            		// 	return h('span',this.$filter('ename')(params.row.eid))
            		// }
            	})
            	columns.push({
            		title: '排课次数',
            		key: 'arrange_times',
            		align: 'center',
            	})
            	columns.push({
            		title: '考勤次数',
            		key: 'attendance_times',
            		align: 'center',
            	})


            	columns.push({
					title: '课前提醒',
					align: 'center',
					children: [
						{
							title: '次数',
							key: 's1_times',
							align: 'center'
						},
						{
							title: '人数',
							key: 's1_nums',
							align: 'center'
						}
					]
				})
				columns.push({
					title: '备课服务',
					align: 'center',
					children: [
						{
							title: '次数',
							key: 's2_times',
							align: 'center'
						},
						{
							title: '人数',
							key: 's2_nums',
							align: 'center'
						}
					]
				})
				columns.push({
					title: '课评服务',
					align: 'center',
					children: [
						{
							title: '次数',
							key: 's4_times',
							align: 'center'
						},
						{
							title: '人数',
							key: 's4_nums',
							align: 'center'
						}
					]
				})
				columns.push({
					title: '作业服务',
					align: 'center',
					children: [
						{
							title: '次数',
							key: 's5_times',
							align: 'center'
						},
						{
							title: '人数',
							key: 's5_nums',
							align: 'center'
						}
					]
				})
				columns.push({
					title: '作品服务',
					align: 'center',
					children: [
						{
							title: '次数',
							key: 's6_times',
							align: 'center'
						},
						{
							title: '人数',
							key: 's6_nums',
							align: 'center'
						}
					]
				})
				columns.push({
					title: '学员回访',
					align: 'center',
					children: [
						{
							title: '次数',
							key: 's7_times',
							align: 'center'
						},
						{
							title: '人数',
							key: 's7_nums',
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
			},
            refresh () {
                this.isRefresh = true
                this.init_data()
            },
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			generateData() {
				if(!this.checkDate()) return
				let date = this.search_field.int_day
				let params = {
					start_date: moment(date).startOf('month').format('YYYY-MM-DD'),
					end_date: moment(date).endOf('month').format('YYYY-MM-DD')
				}
				this.$rest(this.rest_api)
				.post(params)
				.success(response => {
					this.get_data()
				})
				.error(response => {
					this.$Message.error(response.body.message)
				})
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

<style lang="less">
	.performance-summary {
		.ivu-table {
			tr th {
				border: 1px solid #e3e8ee;
			}
		}
	}
</style>