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
				<Form-item label="一级表头" class="col-sm-3">
					<Select v-model="first_table_head" @on-change="changeFirstHead">
						<Option v-for="item in first_column_options" :value="item.value">{{item.label}}</Option>
					</Select>
				</Form-item>
				<Form-item 
					label="二级表头" 
					class="col-sm-3" 
					v-for="item in first_column_options" 
					v-if="item.value == first_table_head"
					>
					<Select v-model="second_table_head">
						<Option v-for="item in item.children" :value="item.value">{{item.label}}</Option>
					</Select>
				</Form-item>
				<Form-item label="分公司" v-if="mode==1&&enable_company" class="col-sm-3">
					<Select v-model="dpt_id" placeholder="按分公司过滤">
						<Option :value="-1">不限</Option>
						<Option v-for="item in companys" :value="item.dpt_id">{{item.dpt_name}}</Option>
					</Select>
				</Form-item>
			</Form>
			<div class="mt-2 col-sm-6">
                <Button type="primary" @click="init_data" icon="ios-search">查询</Button>
                <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                <Button type="primary" icon="ios-refresh-empty" @click="refresh">刷新</Button>
            	<export-button res="report_business_summarys" :params="report_params" v-per="'reports.export'"></export-button>
           </div>
	          	<div class="col-sm-12 text-right">
	          		<ButtonGroup>
	          			<Button type="ghost" @click="linkLbj">预收+产能+结余</Button>
	          			<Button type="ghost" @click="linkOverview">简要版</Button>
	          		</ButtonGroup>
	          	</div>
		</div>
		<div class="box box-result">
			<div class="content">
				<div class="text-center mb-2" v-if="enable_company">
					<RadioGroup v-model="mode" type="button">
						<Radio :label="1">按校区</Radio>
						<Radio :label="2">按分公司</Radio>
					</RadioGroup>
				</div>
				<div class="content-body" style="position: relative;">
					<Table 
						border
		            	:data="mode==1?filterData:data1" 
		            	:columns="overview_columns" 
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
		mounted() {
			this.init_data()
		},
		methods: {
			linkOverview () {
				this.$router.push('./overview2')
			},
			linkLbj () {
				this.$router.push('./overview3')
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
				
				delete params['page']
				delete params['pagesize']
			},
			refresh () {
				this.isRefresh = true
				this.init_data()
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.dpt_id = -1
				this.first_table_head = 'all'
				this.second_table_head = 'all'
				this.init_data()
			},
			changeFirstHead() {
				if(this.second_table_head !== 'all') {
					this.second_table_head = 'all'
				}
			}
		},
		data() {
			return {
				rest_api: 'report_business_summarys',
				search_field: {
					int_day: []
				},
				data1: [],
				mode: 1,
				isRefresh: false,
				autoRefresh: false,
				dpt_id: -1,
				first_table_head: 'all',
				second_table_head: 'all',
				first_column_options: [
					{
						value: 'all',
						label: '所有',
						children: [
							{value: 'all',label: '所有'}
						]
					},
					{
						value: 'market',
						label: '市场',
						children: [
							{value: 'all',label: '所有'},
							{value: 'channel',label: '渠道名单'},
							{value: 'recommend',label: '家长推荐'},
							{value: 'customer',label: '客户名单录入'}
						]
					},
					{
						value: 'sale',
						label: '销售',
						children: [
							{value: 'all',label: '所有'},
							{value: 'sale_total',label: '销售总计'},
							{value: 'order',label: '订单总计'}
						]
					},
					{
						value: 'business',
						label: '运营',
						children: [
							{value: 'all',label: '所有'},
							{value: 'student',label: '学员数'},
							{value: 'classes',label: '班级报表'},
							{value: 'onebyone',label: '1对1'},
							{value: 'onebysome',label: '1对多'},
							{value: 'attendance',label: '考勤'},
							{value: 'consume',label: '总课消'}
						]
					},
					{
						value: 'iae',
						label: '财务',
						children: [
							{value: 'all',label: '所有'},
							{value: 'amount',label: '收支'},
							{value: 'prepaid',label: '预存'}
						]
					}
				]
			}
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
			},
			companys() {
				let departments = util.copy(this.$store.state.gvars.departments),
	        		ret = []
        		function findParent(data,pid,ret,d) {
        			let parent = data.find(item => item.dpt_id==pid)
					if(parent) {
						if(parent.dpt_type==2) {
							let company = ret.find(r => r.dpt_id==parent.dpt_id)
							if(company) {
								company.children.push(d.bid)
							}
						}else{
							findParent(data,parent.pid,ret,d)
						}
					}
        		} 
        		departments.forEach(d => {
        			if(d.dpt_type==2) {
        				d.children = []
        				ret.push(d)
        			}
         		})
        		departments.forEach(d => {
        			if(d.dpt_type==1){
        				findParent(departments,d.pid,ret,d)
        			}
        		})
        		return ret
			},
			filterData() {
				if(this.dpt_id == -1) {
					return this.data
				}
				let company = this.companys.find(item => item.dpt_id == this.dpt_id)
				return this.data.filter(item => company.children.indexOf(item.bid)>-1)
			},
			overview_columns() {
				let columns = [
					{
						type: 'index',
						width: 60,
						align: 'center',
						fixed: 'left'
					},
					{
						title: '校区',
						key: 'bid',
						align: 'center',
						fixed: 'left',
						width: 120,
						render: (h,params) => {
							return h('span',this.$filter('branch_name')(params.row.bid))
						}
					},
					{
						title: '市场',
						value: 'market',
						align: 'center',
						children: [
							{
								title: '渠道名单',
								value: 'channel',
								align: 'center',
								children: [
									{
										title: '来源渠道数',
										key: 'market_channel_nums',
										align: 'center',
										width: 120
									},
									{
										title: '新名单数',
										key: 'market_clue_new',
										align: 'center',
										width: 120
									},
									{
										title: '有效数',
										key: 'market_clue_valid',
										align: 'center',
										width: 120
									},
									{
										title: '转化客户数',
										key: 'market_clue_trans_customer',
										align: 'center',
										width: 120
									},
									{
										title: '诺到',
										key: 'market_clue_promise_visit',
										align: 'center',
										width: 120
									},
									{
										title: '试听',
										key: 'market_clue_trial_listen',
										align: 'center',
										width: 120
									},
									{
										title: '成交数量',
										key: 'market_clue_deal_nums',
										align: 'center',
										width: 120
									},
									{
										title: '成交金额',
										key: 'market_clue_deal_amount',
										align: 'center',
										width: 120
									}
								]
							},
							{
								title: '家长推荐',
								align: 'center',
								value: 'recommend',
								children: [
									{
										title: '推荐数',
										key: 'market_clue_recommend_new',
										align: 'center',
										width: 120
									},
									{
										title: '有效数',
										key: 'market_clue_recommend_valid',
										align: 'center',
										width: 120
									},
									{
										title: '转化客户',
										key: 'market_clue_recommend_trans_customer',
										align: 'center',
										width: 120
									},
									{
										title: '诺到',
										key: 'market_clue_recommend_promise_visit',
										align: 'center',
										width: 120
									},
									{
										title: '试听',
										key: 'market_clue_recommend_trial_listen',
										align: 'center',
										width: 120
									},
									{
										title: '成交数量',
										key: 'market_clue_recommend_deal_nums',
										align: 'center',
										width: 120
									},
									{
										title: '成交金额',
										key: 'market_clue_recommend_deal_amount',
										align: 'center',
										width: 120
									}
								]
							},
							{
								title: '客户名单录入',
								value: 'customer',
								align: 'center',
								children: [
									{
										title: '新客户名单数',
										key: 'customer_new',
										align: 'center',
										width: 120
									},
									{
										title: '有效数',
										key: 'customer_valid',
										align: 'center',
										width: 120
									},
									{
										title: '转化学员数',
										key: 'customer_trans_student',
										align: 'center',
										width: 120
									},
									{
										title: '诺到数',
										key: 'customer_trial_listen',
										align: 'center',
										width: 120
									},
									{
										title: '试听',
										key: 'customer_trial_listen',
										align: 'center',
										width: 120
									},
									{
										title: '成交数量',
										key: 'customer_deal_nums',
										align: 'center',
										width: 120
									},
									{
										title: '成交金额',
										key: 'customer_deal_amount',
										align: 'center',
										width: 120
									}
								]
							}
						]
					},
					{
						title: '销售',
						value: 'sale',
						align: 'center',
						children: [
							{
								title: '销售总计',
								align: 'center',
								value: 'sale_total',
								children: [
									{
										title: '客户名单总数',
										align: 'center',
										width: 120,
										key: 'sale_customer_total'
									},
									{
										title: '未分配数',
										align: 'center',
										width: 120,
										key: 'sale_customer_unassigned'
									},
									{
										title: '新增客户数',
										align: 'center',
										width: 120,
										key: 'sale_customer_new'
									},
									{
										title: '有效沟通数',
										align: 'center',
										width: 120,
										key: 'sale_customer_valid'
									},
									{
										title: '转化学员数',
										align: 'center',
										width: 120,
										key: 'sale_customer_trans_student'
									},
									{
										title: '诺到数',
										align: 'center',
										width: 120,
										key: 'sale_customer_promise_visit'
									},
									{
										title: '试听数',
										align: 'center',
										width: 120,
										key: 'sale_customer_trial_listen'
									},
									{
										title: '成交数',
										align: 'center',
										width: 120,
										key: 'sale_customer_deal_nums'
									},
									{
										title: '成交金额',
										align: 'center',
										width: 120,
										key: 'sale_customer_deal_amount'
									}
								]
							},
							{
								title: '订单总计',
								value: 'order',
								align: 'center',
								children: [
									{
										title: '订单数',
										align: 'center',
										width: 120,
										key: 'order_nums'
									},
									{
										title: '签约人数',
										align: 'center',
										width: 120,
										key: 'order_student_nums'
									},
									{
										title: '签约课时数',
										align: 'center',
										width: 120,
										key: 'order_lesson_hours'
									},
									{
										title: '赠送课时数',
										align: 'center',
										width: 120,
										key: 'order_present_hours'
									},
									{
										title: '签约金额',
										align: 'center',
										width: 120,
										key: 'order_amount'
									},
									{
										title: '实收金额',
										align: 'center',
										width: 120,
										key: 'order_payment_amount'
									},
									{
										title: '欠款金额',
										align: 'center',
										width: 120,
										key: 'order_unpaid_amount'
									},
									{
										title: '直减金额',
										align: 'center',
										width: 120,
										key: 'order_deduct_amount'
									},
									{
										title: '折扣金额',
										align: 'center',
										width: 120,
										key: 'order_discount_amount'
									}
								]
							}
						]
					},
					{
						title: '运营',
						value: 'business',
						align: 'center',
						children: [
							{
								title: '学员数',
								align: 'center',
								value: 'student',
								children: [
									{
										title: '新增学员数',
										align: 'center',
										width: 120,
										key: 'student_new'
									},
									{
										title: '在读学员',
										align: 'center',
										width: 120,
										key: 'student_normal'
									},
									{
										title: '停课学员',
										align: 'center',
										width: 120,
										key: 'student_stop'
									},
									{
										title: '休学学员',
										align: 'center',
										width: 120,
										key: 'student_suspend'
									},
									{
										title: '结课学员',
										align: 'center',
										width: 120,
										key: 'student_end'
									},
									{
										title: '体验课学员',
										align: 'center',
										width: 120,
										key: 'student_demo'
									},
									{
										title: '总学员数',
										align: 'center',
										width: 120,
										key: 'student_total'
									}
								]
							},
							{
								title: '班级报表',
								value: 'classes',
								align: 'center',
								children: [
									{
										title: '班级数',
										align: 'center',
										width: 120,
										key: 'class_num'
									},
									{
										title: '新开班数',
										align: 'center',
										width: 120,
										key: 'class_new'
									},
									{
										title: '计划招人数',
										align: 'center',
										width: 120,
										key: 'class_plan_student_nums'
									},
									{
										title: '实际人数',
										align: 'center',
										width: 120,
										key: 'class_real_student_nums'
									},
									{
										title: '排课次数',
										align: 'center',
										width: 120,
										key: 'class_course_arrange_nums'
									},
									{
										title: '排课课时数',
										align: 'center',
										width: 120,
										key: 'class_course_arrange_hours'
									},
									{
										title: '消耗课次',
										align: 'center',
										width: 120,
										key: 'class_consume_nums'
									},
									{
										title: '消耗课时',
										align: 'center',
										width: 120,
										key: 'class_consume_hours'
									},
									{
										title: '消耗金额',
										align: 'center',
										width: 120,
										key: 'class_consume_amount'
									}
								]
							},
							{
								title: '1对1',
								align: 'center',
								value: 'onebyone',
								children: [
									{
										title: '排课次数',
										align: 'center',
										width: 120,
										key: 'onebyone_course_arrange_nums'
									},
									{
										title: '排课课时',
										align: 'center',
										width: 120,
										key: 'onebyone_course_arrange_hours'
									},
									{
										title: '消耗课次',
										align: 'center',
										width: 120,
										key: 'onebyone_consume_nums'
									},
									{
										title: '消耗课时',
										align: 'center',
										width: 120,
										key: 'onebyone_consume_hours'
									},
									{
										title: '消耗金额',
										align: 'center',
										width: 120,
										key: 'onebyone_consume_amount'
									}
								]
							},
							{
								title: '1对多',
								align: 'center',
								value: 'onebysome',
								children: [
									{
										title: '排课次数',
										align: 'center',
										width: 120,
										key: 'onebytwo_course_arrange_nums'
									},
									{
										title: '排课课时',
										align: 'center',
										width: 120,
										key: 'onebytwo_course_arrange_hours'
									},
									{
										title: '消耗课次',
										align: 'center',
										width: 120,
										key: 'onebytwo_consume_nums'
									},
									{
										title: '消耗课时',
										align: 'center',
										width: 120,
										key: 'onebytwo_consume_hours'
									},
									{
										title: '消耗金额',
										align: 'center',
										width: 120,
										key: 'onebytwo_consume_amount'
									}
								]
							},
							{
								title: '考勤',
								align: 'center',
								value: 'attendance',
								children: [
									{
										title: '出勤学员数',
										align: 'center',
										width: 120,
										key: 'student_attendance_nums'
									},
									{
										title: '应出勤学员数',
										align: 'center',
										width: 120,
										key: 'student_attendance_need_nums'
									},
									{
										title: '学员出勤率',
										align: 'center',
										width: 120,
										key: 'student_attendance_rate'
									},
									{
										title: '未排课学员数',
										align: 'center',
										width: 120,
										key: 'student_attendance_unarrange_nums'
									}
								]
							},
							{
								title: '总课消',
								value:'consume',
								align: 'center',
								children: [
									{
										title: '总课消笔数',
										align: 'center',
										width: 120,
										key: 'consume_nums'
									},
									{
										title: '总课消课时',
										align: 'center',
										width: 120,
										key: 'consume_hours'
									},
									{
										title: '总课消金额',
										align: 'center',
										width: 120,
										key: 'consume_amount'
									},
									{
										title: '正课时课耗',
										align: 'center',
										width: 120,
										key: 'consume_type0_amount'
									},
									{
										title: '副课时消耗',
										align: 'center',
										width: 120,
										key: 'consume_type1_amount'
									},
									{
										title: '违约课耗',
										align: 'center',
										width: 120,
										key: 'consume_type3_amount'
									}
								]
							}
						]
					},
					{
						title: '财务',
						value: 'iae',
						align: 'center',
						children: [
							{
								title: '收支',
								align: 'center',
								value: 'amount',
								children: [
									{
										title: '新签金额',
										align:'center',
										width: 120,
										key: 'iae_oi_ct1_amount'
									},
									{
										title: '续报金额',
										align:'center',
										width: 120,
										key: 'iae_oi_ct2_amount'
									},
									{
										title: '扩科金额',
										align:'center',
										width: 120,
										key: 'iae_oi_ct3_amount'
									},
									{
										title: '订单金额',
										align:'center',
										width: 120,
										key: 'iae_order_amount'
									},
									{
										title: '付款金额',
										align:'center',
										width: 120,
										key: 'iae_order_pay_amount'
									},
									{
										title: '欠款金额',
										align:'center',
										width: 120,
										key: 'iae_order_unpaid_amount'
									},
									{
										title: '退费金额',
										align:'center',
										width: 120,
										key: 'iae_order_refund_amount'
									},
									{
										title: '结转金额',
										align:'center',
										width: 120,
										key: 'iae_order_transfer_amount'
									}
								]
							},
							{
								title: '预存',
								align: 'center',
								value: 'prepaid',
								children: [
									{
										title: '预存增加',
										align: 'center',
										width: 120,
										key: 'student_money_add'
									},
									{
										title: '预存消耗',
										align: 'center',
										width: 120,
										key: 'student_money_reduce'
									},
									{
										title: '剩余预存',
										align: 'center',
										width: 120,
										key: 'student_money_total'
									}
								]
							}
						]
					}
				]
				if(this.mode==2) {
					let column = {
						title: '分公司',
						key: 'dept_id',
						align: 'center',
						fixed: 'left',
						width: 120,
						render: (h,params) => {
							return h('span',this.$filter('dpt_name')(params.row.dept_id))
						}
					}
					columns.splice(1,1,column)
				}
				let first = this.first_table_head
				let titles = ['market','sale','business','iae']
				
				if(first !== 'all') {
					for(let i=0,len=titles.length;i<len;i++) {
						if(titles[i] !== first) {
							let index = columns.findIndex(item => item.value == titles[i])
							columns.splice(index,1)
						}
					}
				}
				
				let second = this.second_table_head

				if(first !=='all' && second !== 'all') {
					columns[2].children = columns[2].children.filter(child => child.value == second)
				}

				return columns
			}
		}
	}
</script>