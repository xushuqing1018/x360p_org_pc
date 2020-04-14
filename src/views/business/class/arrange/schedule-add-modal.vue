<template>
	<Modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" v-drag-modal :width="600">
		<Form :label-width="80" v-if="modal$.show">
			<Form-item label="开始日期" class="mb-2 custom-form-item-required">
				<date-picker :value="info.int_start_day" @on-change="dateChange($event,'int_start_day')" format="yyyy-MM-dd"></date-picker>
			</Form-item>
			<Form-item label="结束方式" class="mb-2 custom-form-item-required">
				<Select v-model="info.end_type" style="width:200px">
					<!--<Option value="0">不结束</Option>-->
					<Option value="1">按结束日期</Option>
					<Option value="2">按排课次数</Option>
				</Select>
				<date-picker :options="disabledEndDate" :value="info.int_end_day" @on-change="dateChange($event,'int_end_day')" format="yyyy-MM-dd" v-if="info.end_type==1"></date-picker>
				<template v-if="info.end_type==2">
					<InputNumber v-model="info.loop_times" :min="minLoopTimes" :step="1"></InputNumber>
					<span class="ml-3">次</span>
				</template>
			</Form-item>			
			<Form-item label="循环方式" class="mb-2 custom-form-item-required">	
				<ButtonGroup v-if="info.end_type==2">
					<Button :type="info.loop_type==0?'primary':'ghost'" @click="info.loop_type=0">每天</Button>
					<Button :type="info.loop_type==1?'primary':'ghost'" @click="info.loop_type=1">隔天</Button>
					<Button :type="info.loop_type==2?'primary':'ghost'" @click="info.loop_type=2">每周</Button>
					<Button :type="info.loop_type==3?'primary':'ghost'" @click="info.loop_type=3">单周</Button>
					<Button :type="info.loop_type==4?'primary':'ghost'" @click="info.loop_type=4">双周</Button>
				</ButtonGroup>
				<ButtonGroup v-else>
					<Button :type="info.loop_type==0?'primary':'ghost'" @click="info.loop_type=0">每周循环</Button>
					<Button :type="info.loop_type==1?'primary':'ghost'" @click="info.loop_type=1">单周循环</Button>
					<Button :type="info.loop_type==2?'primary':'ghost'" @click="info.loop_type=2">双周循环</Button>					
				</ButtonGroup>				
			</Form-item>
			<Form-item label="周几上课" class="mb-2 custom-form-item-required" v-if="info.end_type!=2 || (info.end_type==2&&info.loop_type>1)">
				<CheckboxGroup v-model="info.week_days">
					<Checkbox :label="item" v-for="item in 7" :disabled="disabled(item)">周{{map_week_text[item]}}</Checkbox>
				</CheckboxGroup>
			</Form-item>			
			<Form-item label="上课时间" class="mb-2 custom-form-item-required">
				<select-time-section
					clearable
					:value="ts_array" 
					@on-change="changeTimeSection"
					placeholder="请选择上课时间段"
					 style="width:380px">
				</select-time-section>
			</Form-item>
			
			<Form-item label="上课教室" class="mb-2">
				<select-class-room 
					v-model="info.cr_id"
					 style="width:220px">
				</select-class-room>
			</Form-item>						
			<Form-item :label="label_teach_teacher" class="mb-2 custom-form-item-required">
				<select-employee clearable v-model="info.teach_eid" :rid="1" :limit-per="false" style="width:220px"></select-employee>
			</Form-item>
			<Form-item :label="'助教'|translate" class="mb-2">
				<select-employee clearable v-model="info.second_eids" :rid="2" :limit-per="false" style="width:220px"></select-employee>
			</Form-item>
			<Form-item prop="consume_source_type" label="课消来源" v-help="info.consume_source_type==1?'考勤时扣课时':'考勤时直接扣电子钱包余额'" v-if="enable_money_consume">
				<RadioGroup type="button" v-model="info.consume_source_type">
					<Radio :label="1">课时</Radio>
					<Radio :label="2">电子钱包</Radio>
				</RadioGroup>
				<div class="mt-2">
					<template v-if="info.consume_source_type == 1">						
						<InputNumber v-model="info.consume_lesson_hour" style="width:60px"></InputNumber>
						<span class="ml-2">课时</span>
					</template>
					<template v-else>
						<InputNumber v-model="info.consume_lesson_amount" style="width:60px"></InputNumber>
						<span class="ml-2">元</span>
					</template>										
				</div>
			</Form-item>
			<Form-item label="扣课时数" class="mb-2" v-else v-help="'选择时段课时数会自动计算出来'">
				<InputNumber :min="0" v-model="info.consume_lesson_hour"></InputNumber>		
			</Form-item>
			<Form-item prop="is_bk_open" label="开启预约" v-if="enable_bk">
				<i-switch v-model="info.is_bk_open" :true-value="1" :false-value="0"></i-switch>
			</Form-item>
		</Form>		
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">取消</Button>
			<Button type="primary" @click="preview()" :loading="saving">预览</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import schedule from './schedule.mixin'
	import SelectClass from 'c%/SelectClass.vue'
	import SelectClassRoom from 'c%/SelectClassRoom'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectTimeSection from 'c%/SelectTimeSection.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{
		mixins: [ common, modal, schedule ],
		components: {
			SelectClass,
			SelectClassRoom,
			SelectEmployee,
			SelectTimeSection,
			DateRangePicker
		},		
		data () {
			return {
				ts_array: [],				
				map_week_text: {1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'天'}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {
					if(
						!_.isEmpty(this.item)
						&& this.modal$.action == 'edit'
					){
						let item = util.copy(this.item)
						
						this.info = item
						this.ts_array = [item.int_start_hour,item.int_end_hour]
					}else{
						this.info.teach_eid = this.ignore.teach_eid || 0
						this.info.second_eid = this.ignore.second_eid || 0
						this.info.second_eids = this.ignore.second_eids || []
						this.info.cr_id 	= this.ignore.cr_id
					}
					if(this.enable_bk) {
						// this.info.is_bk_open = 1
					}
				}
			},
			'info.int_start_day': function (val) {				
				if(moment(val).isAfter(this.info.int_end_day)){
					this.info.int_end_day = val
				}
			}
		},
		computed: {
			disabledEndDate () {
				let start_date = new Date(this.info.int_start_day).getTime()
				return { 
					disabledDate (date) {
                    	return date && date.valueOf() < start_date - 86400000;
                	}
				}
			}
		},
		methods: {
			check () {
				return new Promise((resolve,reject)=>{
					if(this.info.int_start_day == ''){
						this.$Message.error('请选择开始时间')
						reject()
						return
					}
					if(this.info.end_type==1 && this.info.int_end_day == ''){
						this.$Message.error('请选择结束时间')
						reject()
						return
					}
					
					if(this.info.end_type==1 && _.isEmpty(this.info.week_days)){
						this.$Message.error('请选择周几上课')
						reject()
						return
					}
					
					if(_.isEmpty(this.ts_array)){
						this.$Message.error('请选择上课时间')
						reject()
						return
					}
					if(this.info.teach_eid == 0){
						this.$Message.error(`请选择授课${this.label_teach_teacher}`)
						reject()
						return
					}
					resolve()
				})
				
			},
			ok () {
				Promise.all([this.check(),this.setList(),this.checkArrange()])
				.then(()=>{
					let obj = util.copy(this.info)					
					obj.list = this.arrangeList||[]
					obj.week_days = obj.week_days.sort()
					
					if(obj.list.length == 0) {
						this.$Message.error('当前设置的排课次数为0，请您修改排课设置!')
						return
					}
					
					this.$emit('on-add-schedule',obj)
					this.close()
				})				
				
			}
		}
	}
</script>

<style>
</style>