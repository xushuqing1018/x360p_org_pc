<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="850">		
		<div class="mt-0 mb-3 p-2 text-center">
			<ButtonGroup class="ml-3">			
				<Button :type="tab==1?'primary':'ghost'" @click="changeTab(1)">风控建议</Button>
				<Button :type="tab==2?'primary':'ghost'" @click="changeTab(2)">预售期目标</Button>
			</ButtonGroup>
		</div>		
		<div class="x-form-title">
			数据填写
		</div>
		<Form :label-width="160" class="row">
			<template v-if="tab==1">
				<Form-item label="租金：" class="col-md-5 mb-2">
					<InputNumber v-model="info.calc1.rent" :step="1" :min="0"></InputNumber> 元/月
				</Form-item>
				
				<Form-item label="市场人员数量："  class="col-md-7 mb-2">
					<InputNumber v-model="info.calc1.market_nums" :min="0" :step="1"></InputNumber> 名
					<InputNumber class="ml-3" v-model="info.calc1.market_salary" :step="1" :min="0"></InputNumber> 元/月
				</Form-item>
				<Form-item label="年会员预期数：" class="col-md-5 mb-2">
					<InputNumber v-model="info.calc1.year_student_nums" :min="0" :step="1"></InputNumber> 名				
				</Form-item>
				<Form-item label="教师数量：" class="col-md-7 mb-2">
					<InputNumber v-model="info.calc1.teacher_nums" :step="1" :min="0"></InputNumber> 名
					<InputNumber class="ml-3" v-model="info.calc1.teacher_salary" :step="1" :min="0"></InputNumber> 元/月
				</Form-item>
				<Form-item label="" class="col-md-5 mb-0"></Form-item>
				
				<Form-item label="顾问数量：" class="col-md-7 mb-2">
					<InputNumber v-model="info.calc1.consume_nums" :min="0" :step="1"></InputNumber> 名		
					<InputNumber class="ml-3" v-model="info.calc1.consume_salary" :step="1" :min="0"></InputNumber> 元/月
				</Form-item>
			</template>
			<template v-if="tab==2">
				<Form-item label="招生人数目标：" class="col-md-7 mb-2">
					<InputNumber v-model="info.calc2.student_goal" :step="1" :min="1"></InputNumber> 个会员
				</Form-item>
				<Form-item label="主推套餐：" class="col-md-5 mb-2">
					<InputNumber v-model="info.calc2.unit_nums" :step="1" :min="1"></InputNumber> 课时
				</Form-item>
				<Form-item label="市场预热期：" class="col-md-7 mb-2">
					<DatePicker :value="date1" @on-change="dateChange($event,'market')" type="daterange" placement="bottom-end" placeholder="选择日期" style="width: 180px"></DatePicker>
					<span class="text-info">{{marketDays}} 个工作日</span>
				</Form-item>
				<Form-item label="单课时成交单价：" class="col-md-5 mb-2">
					<InputNumber v-model="info.calc2.unit_price" :step="1" :min="1"></InputNumber> 元/课时
				</Form-item>
				<Form-item label="预售期：" class="col-md-7 mb-2">
					<DatePicker :value="date2" @on-change="dateChange($event,'sale')" type="daterange" placement="bottom-end" placeholder="选择日期" style="width: 180px"></DatePicker>
					<span class="text-info">{{saleDays}} 个工作日</span>
				</Form-item>				
				<Form-item label="" class="col-md-5 mb-2"></Form-item>
				<div class="x-divider"></div>
				
				<Form-item label="市场、顾问数量：" :label-width="160" class="col-md-4 mb-2">
					<span class="text-info">4</span> 名
				</Form-item>
				<Form-item label=""  class="col-md-8 mb-0">
					<Button 
						title="修改基础参数"
						type="ghost" 
						size="small" 
						:icon="editing?'checkmark':'edit'" 
						class="pull-right mr-3" 
						@click="editing=!editing">
					</Button>
				</Form-item>
				<Form-item label="名单签约率：" :label-width="160" class="col-md-4 mb-2">
					<span class="text-info" v-if="!editing">{{info.calc2.sign_rate}} %</span>
					<template v-else>
						<InputNumber class="x-input-number" v-model="info.calc2.sign_rate" :step="1" :min="1"></InputNumber> %
					</template>
				</Form-item>
				<Form-item label="试听课转化率：" :label-width="160" class="col-md-4 mb-2">
					<span class="text-info" v-if="!editing">{{info.calc2.trial_rate}} %</span>
					<template v-else>
						<InputNumber class="x-input-number" v-model="info.calc2.trial_rate" :step="1" :min="1"></InputNumber> %
					</template>
				</Form-item>
				<Form-item label="邀约到店率：" :label-width="160" class="col-md-4 mb-2">
					<span class="text-info" v-if="!editing">{{info.calc2.arrive_rate}} %</span>
					<template v-else>
						<InputNumber class="x-input-number" v-model="info.calc2.arrive_rate" :step="1" :min="1"></InputNumber> %
					</template>
				</Form-item>
				<!--<Form-item label="全国校区每月平均招生人数：" :label-width="170"  class="col-md-8 mb-0">
					<span class="text-info">15</span>
				</Form-item>-->
			</template>
		</Form>
		<div class="x-form-title">
			计算结果
		</div>
		<Form :label-width="160" class="row">
			<template v-if="tab==1">
				<Form-item label="年总流水预期：" class="col-md-4 mb-2">
					<span class="text-info">{{yearAccount}}</span> 元/年
				</Form-item>
				<Form-item label="租金上限：" class="col-md-4 mb-2">
					<span class="text-info">{{maxRent}}</span> 元/月
				</Form-item>
				<Form-item label="收支平衡点：" class="col-md-4 mb-2">
					<span class="text-info">{{balancePayments}}</span> 个会员/月
				</Form-item>
				<Form-item label="人员成本：" class="col-md-4 mb-2">
					<span class="text-info">{{personnelCost}}</span> 元/月
				</Form-item>
				<Form-item label="人员成本上限：" class="col-md-4 mb-2">
					<span class="text-info">{{maxPersonnelCost}}</span> 元/月
				</Form-item>
				<Form-item label="员工平均月收入：" class="col-md-4 mb-2">
					<span class="text-info">{{averageSalary}}</span> 元/月
				</Form-item>
				
				<Form-item label="场地租金：" class="col-md-4 mb-2">
					<span class="text-info">{{rentPercent}} %</span>
				</Form-item>
				
				<Form-item label="人员成本：" class="col-md-4 mb-2">
					<span class="text-info">{{personPercent}} %</span>
				</Form-item>
				
				<Form-item label="运营成本：" class="col-md-4 mb-2">
					<span class="text-info">{{info.operation_cost_percent}} %</span>				
				</Form-item>
				
				<Form-item label="毛利：" class="col-md-4 mb-2">
					<span class="text-info">{{netProfitPersent}} %</span>
				</Form-item>
			</template>
			<template v-if="tab==2">
				<!--<div class="x-divider"></div>-->
				<Form-item label="有效名单总数量：" class="col-md-6 mb-2">
					<span class="text-info">{{validCustomerList}}</span> 个
				</Form-item>
				<Form-item label="员工日获取名单量：" class="col-md-6 mb-2">
					<span class="text-info">{{dayCustomerNums}}</span> 个名单/工作日/人
				</Form-item>
				<Form-item label="诺到数量：" class="col-md-6 mb-2">
					<span class="text-info">{{promiseArriveNums}}</span> 个（承诺参加试听）
				</Form-item>
				<Form-item label="实际到店试听数量：" class="col-md-6 mb-2">
					<span class="text-info">{{trialNums}}</span> 个（实际参加试听）
				</Form-item>				
			</template>
		</Form>
	
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util  from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	
	const UNIT = '元/月'
	
	export default{
		mixins: [ modal ],
		data () {
			return {
				tab: 1,
				editing: false,
				info: {
					operation_cost_percent: 5,		//运营成本
					calc1: {
						rent: 10000,				//租金
						teacher_nums: 2,			//教师数量
						teacher_salary: 3000,		//教师工资						
						consume_nums: 3,			//顾问数量
						consume_salary: 2500,		//顾问工资
						market_nums: 1,				//市场数量
						market_salary: 2500,		//市场薪资
						year_student_nums: 135,		//年会员数预期
					},
					calc2: {
						student_goal: 60,				//招生人数目标
						market_start_day: '2018-09-01',	//市场预热开始日期
						market_end_day: '2018-10-31',	//市场预热结束日期
						sale_start_day: '2018-10-01',	//预售开始日期
						sale_end_day: '2019-01-01',	//预售结束日期
						unit_price: 60,					//单课时成交单价
						unit_nums: 96,					//主推套餐
						sign_rate: 4,					//名单签约率
						trial_rate: 30,					//试听转化率
						arrive_rate: 80,				//邀约到店率
						branch_average_student: 15		//全国校区月平均招生人数
					}
					
				}
			}
		},
		computed: {		
			//市场预热期
			date1 () {
				return [this.info.calc2.market_start_day,this.info.calc2.market_end_day]
			},
			//预售期
			date2 () {
				return [this.info.calc2.sale_start_day,this.info.calc2.sale_end_day]
			},
			//人员成本
			personnelCost () {
				let calc1 = this.info.calc1
				return (calc1.teacher_nums * calc1.teacher_salary)
						+ (calc1.consume_nums * calc1.consume_salary)
						+ (calc1.market_nums * calc1.market_salary)
						+ (this.yearAccount / 20 / 12)
			},
			//年总流水预期
			yearAccount () {
				let calc1 = this.info.calc1,
					calc2 = this.info.calc2
					
				return calc1.year_student_nums * calc2.unit_price * calc2.unit_nums
			},
			//市场预热天数
			marketDays () {
				let calc2 = this.info.calc2
				return this.getNetWorkDays(calc2.market_start_day,calc2.market_end_day)
			},
			//预售期天数
			saleDays () {
				let calc2 = this.info.calc2
				return this.getNetWorkDays(calc2.sale_start_day,calc2.sale_end_day)
			},
			//市场、顾问数量
			marketAndConsumes () {
				let calc1 = this.info.calc1
				return calc1.market_nums + calc1.consume_nums
			},
			//租金上限
			maxRent () {
				return (this.yearAccount / 4) / 12
			},
			//人员成本上限
			maxPersonnelCost () {
				return (this.yearAccount / 100) * 40 / 12
			},
			//平均员工工资
			averageSalary () {
				let calc1 = this.info.calc1
				return parseFloat(this.personnelCost / (calc1.teacher_nums + calc1.consume_nums + calc1.market_nums)).toFixed(2)   
			},
			//收支平衡点（向上取整）
			balancePayments () {
				let calc1 = this.info.calc1,
					calc2 = this.info.calc2				
				
				return Math.round((calc1.rent + this.personnelCost) / (calc2.unit_price * calc2.unit_nums)) 
			},
			//场地租金（四舍五入）
			rentPercent () {
				let calc1 = this.info.calc1
					
				return Math.round(calc1.rent * 12 / this.yearAccount * 100)
			},
			//人员成本（四舍五入）
			personPercent () {
				return Math.round(this.personnelCost * 12 / this.yearAccount * 100)				
			},
			//净利润
			netProfitPersent () {				
				return 100 - this.rentPercent - this.personPercent - this.info.operation_cost_percent
			},
			//有效名单总量
			validCustomerList () {
				let calc2 = this.info.calc2
				return calc2.student_goal / calc2.sign_rate * 100
			},
			//员工日获取名单量
			dayCustomerNums () {
				return Math.round((this.validCustomerList / this.marketAndConsumes) / this.marketDays)
			},
			//诺到量
			promiseArriveNums () {
				let calc2 = this.info.calc2
				return Math.ceil(this.trialNums / calc2.arrive_rate * 100)
			},
			//实际到店试听量
			trialNums () {
				let calc2 = this.info.calc2
				
				return Math.ceil(calc2.student_goal / calc2.trial_rate * 100)
			}			
		},
		methods: {
			getNetWorkDays (date1,date2) {
				let days_diff = util.dateDiff(date1,date2),
					result = 0
				for(let i=0; i <= days_diff; i++){
					let temp_date = moment(date1).add('days',i).format('YYYY-MM-DD'),					
						week_day_no = util.get_week_day(new Date(temp_date))
						
					if(week_day_no < 6){
						result ++
					}
				}
				
				return result
			},
			changeTab (val) {
				this.tab = val
			},
			dateChange (val,type) {
				if(type=='market') {
					this.info.calc2.market_start_day = val[0]
					this.info.calc2.market_end_day = val[1]
				}else{
					this.info.calc2.sale_start_day = val[0]
					this.info.calc2.sale_end_day = val[1]
				}
			}
		}
	}
	
</script>

<style lang="less" scoped>
.x-input-number{
	width: 75px;
}
.x-form-title {
    height: 40px;
    background: #E9EAEC;
    line-height: 40px;
    padding-left: 10px;
    margin: 10px 0;
    font-size: 14px;
}
.x-divider{
	width: 100%;
	margin: 10px 15px 10px;
	border-bottom: 1px solid #EBF5FF;
}
</style>