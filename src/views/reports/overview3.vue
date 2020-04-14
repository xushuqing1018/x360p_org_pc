<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="60" class="filter-form row">
				<Form-item label="时间段" prop="int_day" class="col-sm-3">
					<date-range-picker 
						v-model="search_field.int_day" 
						label="请选择时间段" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>					
				</Form-item>
			</Form>
			<div class="mt-2 col-sm-6">
                <Button type="primary" @click="init_data" icon="ios-search">查询</Button>
                <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                <Button type="primary" icon="ios-refresh-empty" @click="refresh">刷新</Button>
            	<export-button res="report_branch_com_summarys" :params="report_params" v-per="'reports.export'"></export-button>
           </div>
	          	<div class="col-sm-12 text-right">
	          		<Button type="ghost" @click="linkOverview">返回</Button>
	          	</div>
		</div>
		<div class="box box-result">
			<div class="content">
				<div class="content-body" style="position: relative;">
					<Table 
						border
		            	:data="data" 
		            	:columns="columns3" 
		            	:show-header="true" 
		            	> 
		            </Table>
		            <Spin fix v-if="loading">
		            	<Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
		            	<div><span v-if="branchs.length>10">当前校区过多，</span>正在努力生成报表</div>
		            </Spin>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ExportButton from 'c%/ExportButton.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			DateRangePicker,
			ExportButton
		},
		data() {
			return {
				rest_api: 'report_branch_com_summarys',
				search_field: {
					int_day: []
				},
				isRefresh: false,
				autoRefresh: false,
				columns3: [
					{
						title: '校区',
						key: 'bid',
						align: 'center',
						render:(h,params)=>{
							return h('span',this.$filter('branch_name')(params.row.bid))
						}
					},
					{
						title: '预收',
						align: 'center',
						children: [
							{
								title: '课时',
								key: 'advance_lesson_hours',
								align: 'center'
							},
							{
								title: '金额',
								key: 'advance_lesson_amount',
								align: 'center'
							},
						] 
					},
					{
						title: '产能',
						align: 'center',
						children: [
							{
								title: '课时',
								key: 'consume_lesson_hours',
								align: 'center'
							},
							{
								title: '金额',
								key: 'consume_lesson_amount',
								align: 'center'
							},
						] 
					},
					{
						title: '结余',
						align: 'center',
						children: [
							{
								title: '课时',
								key: 'remain_lesson_hours',
								align: 'center'
							},
							{
								title: '金额',
								key: 'remain_lesson_amount',
								align: 'center'
							},
							{
								title: '钱包余额',
								key: 'remain_money',
								align: 'center'
							}
						] 
					},
					{
						title: '其他',
						align: 'center',
						children: [
							{
								title: '结转',
								align: 'center',
								children: [
									{
										title: '课时',
										key: 'transfer_lesson_hours',
										align: 'center'
									},
									{
										title: '金额',
										key: 'transfer_lesson_amount',
										align: 'center'
									},
								]
							},
							{
								title: '退费',
								align: 'center',
								children: [
									{
										title: '课时',
										key: 'refund_lesson_hours',
										align: 'center'
									},
									{
										title: '金额',
										key: 'refund_lesson_amount',
										align: 'center'
									},
								]
							},
							{
								title: '清零',
								align: 'center',
								children: [
									{
										title: '课时',
										key: 'free_lesson_hours',
										align: 'center'
									},
									{
										title: '金额',
										key: 'free_lesson_amount',
										align: 'center'
									},
								]
							},
						] 
					}
				]
			}
		},
		mounted() {
			this.init_data()
		},
		computed: {
			report_params() {
				let params = {}
				let int_day = this.search_field.int_day
				if(int_day!=','&&int_day.length>0) {
					params = {
						start_date: int_day[0],
						end_date: int_day[1]
					}
				}
				return params
			}
		},
		methods: {
			linkOverview () {
				this.$router.push('./overview')
			},
			deal_data(res) {
				this.data = res.list
				this.data1 = res.list1
				this.search_field.int_day = [res.params.start_date,res.params.end_date]
				return res.list
			},
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
			}
		}
	}
</script>