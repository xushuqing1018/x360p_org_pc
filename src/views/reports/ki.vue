<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="60" class="filter-form row">
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
			</Form>
			<div class="mt-2">
                <Button type="primary" @click="search" icon="ios-search">查询</Button>
                <Button type="primary" icon="ios-refresh-empty" @click="refresh">刷新</Button>
            	<export-button res="report_keys" :params="report_params" v-per="'reports.export'"></export-button>
            	<Button class="pull-right" type="primary" icon="gear-a" @click="kiConfig">配置</Button>
           </div>

		</div>
		<div class="box box-result">
			<div class="content">
				<div class="content-body" style="position: relative;min-height:500px;">
				    

					<table class="table" v-if="!empty">
					    <tr>
					    	<th colspan="10">{{data.month}} {{data.branch_name}} 关键指标</th>
					    </tr>
					    <!-- 校区 -->
						<tr>
							<td rowspan="2" width="7.3%">校区</td>
							<td width="10.3%">在读学员数</td>
							<td width="10.3%">剩余课时数</td>
							<td width="10.3%">剩余课时金额</td>
							<td width="10.3%">班级数量</td>
							<td width="10.3%">班级平均学员数</td>
							<td width="10.3%">满校人数</td>
							<td width="10.3%">满校差额</td>
							<td width="10.3%">课时≤40学员</td>
							<td width="10.3%">课时≤40学员续费率</td>
						</tr>
						<tr>
							<td><a style="color: #39f" @click="viewDetail('student_nums')">{{data.branch.student_nums}}</a></td>
							<td>{{data.branch.remain_lesson_hours}}</td>
							<td>{{data.branch.remain_lesson_amount}}</td>
							<td>{{data.branch.class_nums}}</td>
							<td>{{data.branch.class_avg_student_nums}}</td>
							<td>{{data.branch.full_school_student_nums}}</td>
							<td>{{data.branch.differ_student_nums}}</td>
							<td><a style="color: #39f" @click="viewDetail('expire_student_nums')">{{data.branch.expire_student_nums}}</a></td>
							<td>{{data.educate.renew_rate}}</td>
						</tr>
						<!-- 教务 -->
						<tr>
							<td rowspan="2" width="7.3%">教务</td>
							<td width="10.3%">新签学员数</td>
							<td width="10.3%">续费学员数</td>
							<td width="10.3%">续费率</td>
							<td width="10.3%">转介绍人数</td>
							<td width="10.3%">转介绍成交人数</td>
							<td width="10.3%">转介绍成交率</td>
							<td width="10.3%">退费人数</td>
							<td width="10.3%">教室周平均排课量</td>
							<td width="10.3%">教室使用率</td>
						</tr>
						<tr>
							<td><a style="color: #39f" @click="viewDetail('new_student_nums')">{{data.educate.new_student_nums}}</a></td>
							<td><a style="color: #39f" @click="viewDetail('renew_student_nums')">{{data.renew_student_nums}}</a></td>
							<td>{{data.educate.renew_student_rate}}</td>
							<td><a style="color: #39f" @click="viewDetail('refer_nums')">{{data.educate.refer_nums}}</a></td>
							<td><a style="color: #39f" @click="viewDetail('refer_deal_nums')">{{data.educate.refer_deal_nums}}</a></td>
							<td>{{data.educate.refer_deal_rate}}</td>
							<td><a style="color: #39f" @click="viewDetail('refund_student_nums')">{{data.educate.refund_student_nums}}</a></td>
							<td>{{data.educate.cr_arrange_nums}}</td>
							<td>{{data.educate.cr_arrange_rate}}</td>
						</tr>
						<!-- 市场 -->
						<tr>
							<td rowspan="2" width="7.3%">市场</td>
							<td width="10.3%">市场名单数</td>
							<td width="10.3%">市场渠道成单金额</td>
							<td width="10.3%">来源渠道数量</td>
							<td width="10.3%">市场有效名单数</td>
							<td width="10.3%">市场名单外呼数</td>
							<td width="10.3%">市场名单有效率</td>
							<td width="10.3%">市场名单签约数</td>
							<td width="10.3%">市场名单签约率</td>
							<td width="10.3%"></td>
						</tr>
						<tr>
							<td><a style="color: #39f" @click="viewDetail('mc_student_nums')">{{data.market.mc_student_nums}}</a></td>
							<td><a style="color: #39f" @click="viewDetail('mc_deal_amount')">{{data.market.mc_deal_amount}}</a></td>
							<td>{{data.market.market_channel_nums}}</td>
							<td><a style="color: #39f" @click="viewDetail('mc_valid_nums')">{{data.market.mc_valid_nums}}</a></td>
							<td><a style="color: #39f" @click="viewDetail('mc_customer_nums')">{{data.market.mc_customer_nums}}</a></td>
							<td>{{data.market.mc_valid_rate}}</td>
							<td><a style="color: #39f" @click="viewDetail('mc_sign_nums')">{{data.market.mc_sign_nums}}</a></td>
							<td>{{data.market.mc_sign_rate}}</td>
							<td></td>
						</tr>
						<!-- 顾问 -->
						<tr>
							<td rowspan="2" width="7.3%">顾问</td>
							<td width="10.3%">销售/退费金额</td>
							<td width="10.3%">销售/退费课时数</td>
							<td width="10.3%">客户名单数</td>
							<td width="10.3%">有效沟通数</td>
							<td width="10.3%">诺到人数</td>
							<td width="10.3%">诺到率</td>
							<td width="10.3%">试听人数</td>
							<td width="10.3%">试听报名人数</td>
							<td width="10.3%">试听成单率</td>
						</tr>
						<tr>
							<td><a style="color: #39f" @click="viewDetail('sale_amount')">{{data.counselor.sale_amount}}</a> / <a style="color: #39f" @click="viewDetail('refund_amount')">{{data.counselor.refund_amount}}</a></td>
							<td>{{data.counselor.sale_lesson_hours}} / {{data.counselor.refund_lesson_hours}}</td>
							<td><a style="color: #39f" @click="viewDetail('customer_nums')">{{data.counselor.customer_nums}}</a></td>
							<td><a style="color: #39f" @click="viewDetail('valid_communicate_nums')">{{data.counselor.valid_communicate_nums}}</a></td>
							<td><a style="color: #39f" @click="viewDetail('accept_nums')">{{data.counselor.accept_nums}}</a></td>
							<td>{{data.counselor.accept_rate}}</td>
							<td><a style="color: #39f" @click="viewDetail('trial_nums')">{{data.counselor.trial_nums}}</a></td>
							<td><a style="color: #39f" @click="viewDetail('trial_sign_nums')">{{data.counselor.trial_sign_nums}}</a></td>
							<td>{{data.counselor.trial_sign_rate}}</td>
						</tr>
						<!-- 教学 -->
						<tr>
							<td rowspan="2" width="7.3%">教学</td>
							<td width="10.3%">课耗金额</td>
							<td width="10.3%">学员消耗课时数</td>
							<td width="10.3%">实际出勤人数</td>
							<td width="10.3%">未出勤学员数</td>
							<td width="10.3%">出勤学员人次</td>
							<td width="10.3%">应出勤学员人次</td>
							<td width="10.3%">学员出勤率</td>
							<td width="10.3%">未分班学员</td>
							<td width="10.3%">未排课学员数</td>

						</tr>
						<tr>
							<td><a style="color: #39f" @click="viewDetail('employee_lesson_amount')">{{data.teach.employee_lesson_amount}}</a></td>
							<td>{{data.teach.employee_lesson_hours}}</td>
							<td>{{data.teach.attendance_nums}}</td>
							<td>{{data.teach.no_attendance_nums}}</td>
							<td><a style="color: #39f" @click="viewDetail('attendance_times')">{{data.teach.attendance_times}}</a></td>
							<td><a style="color: #39f" @click="viewDetail('should_attendance_times')">{{data.teach.should_attendance_times}}</a></td>
							<td>{{data.teach.attendance_rate}}</td>
							<td><a style="color: #39f" @click="viewDetail('no_class_student_nums')">{{data.teach.no_class_student_nums}}</a></td>
							<td><a style="color: #39f" @click="viewDetail('no_arrange_student_nums')">{{data.teach.no_arrange_student_nums}}</a></td>

						</tr>
					</table>


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
	import util,{_} from '@/libs/util'
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
				rest_api: 'report_keys',
				search_field: {
					int_day: []
				},
				isRefresh: false,
				autoRefresh: false,
				key_fields: [],
				detailTypeMap: {
					student_nums: '在读学员数',
					expire_student_nums: '合同到期学员数',
					new_student_nums: '新签学员数',
					renew_student_nums: '续费学员数',
					refer_nums: '转介绍人数',
					refer_deal_nums: '转介绍成交人数',
					refund_student_nums: '退费人数',
					mc_student_nums: '市场名单数',
					mc_deal_amount: '市场渠道成单金额',
					market_channel_nums: '来源渠道数量',
					mc_valid_nums: '市场有效名单数',
					mc_customer_nums: '市场名单外呼数',
					mc_sign_nums: '市场名单签约数',
					sale_amount: '销售金额',
					refund_amount: '退费金额',
					customer_nums: '客户名单数',
					valid_communicate_nums: '有效沟通数',
					accept_nums: '诺到人数',
					trial_nums: '试听人数',
					trial_sign_nums: '试听报名人数',
					employee_lesson_amount: '课耗金额',
					employee_lesson_hours: '学员消耗课时数',
					attendance_times: '出勤学员人次',
					should_attendance_times: '应出勤学员人次',
					no_class_student_nums: '未分班学员',
					no_arrange_student_nums: '未排课学员数'
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
						if(property!=','&&property.length>0){
							/*params['start_date'] = moment(property).startOf('month').format('YYYY-MM-DD')
					     	params['end_date']   = moment(property).endOf('month').format('YYYY-MM-DD')*/
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
			deal_data (data) {
				this.data = data
				this.search_field.int_day = [data.params.start_date,data.params.end_date]
				return data
			},
			kiConfig () {
				this.$Modal.open('reports/ki/config-modal.vue',{
					on: {
						'success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('关键指标配置')
				})
			},
			viewDetail(type) {
				this.$Modal.open('reports/ki/detail-view.vue@modal',{
					props: {
						type: type,
						startDate: this.search_field.int_day[0],
						endDate: this.search_field.int_day[1]
					}
				})
				.then(modal => {
					modal.show(`查看【${this.detailTypeMap[type]}】详情`)
				})
			}
		},
		computed: {
			report_params() {
				let params = {}
				let int_day = this.search_field.int_day
				if(int_day!=','&&int_day.length>0) {
					params = {					
						type: this.mode,
						start_date: int_day[0],
						end_date: int_day[1]
					}
				}
				return params
			},
			empty() {
				return _.isEmpty(this.data)
			}
		}
	}
</script>

<style scoped>
	.table{border: 1px solid #ccc;width: 100%;}
    .table td{border: 1px solid #ccc;height: 30px;text-align: center;vertical-align: middle;}
    .table th{padding: 15px;font-size: 20px;font-weight: normal;}
</style>