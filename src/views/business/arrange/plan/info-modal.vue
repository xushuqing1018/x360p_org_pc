<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :title="modal$.title" width="600">
		<Form :label-width="100" v-if="modal$.show">
			<Form-item label="周几上课" class="mb-0 custom-form-item-required">
				<CheckboxGroup v-model="info.week_days" style="display: inline-block;">
					<Checkbox :label="item" v-for="item in 7">周{{map_week_text[item]}}</Checkbox>
				</CheckboxGroup>
				<Checkbox v-model="sameSection">共用时间段</Checkbox>
			</Form-item>
			<Form-item label="上课时间" class="mb-2 custom-form-item-required" v-if="sameSection">
				<Tag closable v-for="(i,index) in info.int_hour_map[0]" @on-close="closeTimeSection(0,index)">
					{{i.int_start_hour}}~{{i.int_end_hour}}
				</Tag>
				<select-time-section
					:value="ts_array" 
					@on-change="changeTimeSection($event,0)"
					style="width: auto"
					>
					<Button type="dashed" size="small" icon="plus"></Button>
				</select-time-section>
			</Form-item>
			<template v-else>
				<Form-item 
					class="mb-0 custom-form-item-required" 
					:label="'周'+map_week_text[j]+'上课时间'" 
					v-for="j in 7" v-if="info.week_days.indexOf(j)>-1"
					>
					<Tag closable v-for="(i,index) in info.int_hour_map[j]" @on-close="closeTimeSection(j,index)">
						{{i.int_start_hour}}~{{i.int_end_hour}}
					</Tag>
					<select-time-section
						:value="ts_array"
						@on-change="changeTimeSection($event,j)"
						style="width: auto"
						>
						<Button type="dashed" size="small" icon="plus"></Button>
					</select-time-section>
					<a title="复制" class="btn-copy" @click="copySection(j)" v-if="info.int_hour_map[j].length>0 && info.week_days.length>1">
						<Icon type="ios-copy"></Icon>
					</a>
				</Form-item>
			</template>
			<Form-item :label="label_teach_teacher" class="mb-2" :class="{'custom-form-item-required':info.schedule_type==0}" v-if="info.schedule_type!==1">
				<select-employee 
					v-model="info.eid" 
					:rid="1" 
					:limit-per="false" 
					clearable 
					style="width:220px">
				</select-employee>
			</Form-item>
			<Form-item :label="'助教'|translate" class="mb-2">
				<select-employee 
					v-model="info.second_eids" 
					:rid="2" 
					:limit-per="false" 
					clearable 
					style="width:220px"
					>
				</select-employee>
			</Form-item>
			<Form-item label="上课教室" class="mb-2">
				<select-class-room 
					v-model="info.cr_id"
					 style="width:235px">
				</select-class-room>
			</Form-item>
			<Form-item label="科目" class="mb-2" v-if="info.schedule_type==0&&info.lesson_type!==0">
				<Select v-model="info.sj_id" style="width:220px">
					<Option :value="sj_id" v-for="sj_id in info._sj_ids">{{sj_id|subject_name}}</Option>
				</Select>
			</Form-item>
			<Form-item 
				prop="consume_source_type" 
				label="课消来源" 
				v-help="info.consume_source_type==1?'考勤时扣课时':'考勤时直接扣电子钱包余额'" 
				v-if="enable_money_consume"
				>
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
			<Form-item label="扣课时数" class="mb-2" v-else>
				<InputNumber :min="0" v-model="info.consume_lesson_hour"></InputNumber>		
			</Form-item>
			<Form-item prop="is_bk_open" label="开启预约" v-if="enable_bk&&info.cid">
				<i-switch v-model="info.is_bk_open" :true-value="1" :false-value="0"></i-switch>
			</Form-item>
			<Form-item prop="name" label="授课主题" v-if="enable_type2_bk&&info.schedule_type==2">
				<Input v-model="teacher_theme" placeholder="请输入授课主题"></Input>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectClassRoom from 'c%/SelectClassRoom.vue'
	import SelectTimeSection from 'c%/SelectTimeSection.vue'

	export default {
		mixins: [common,globals,modal],
		props: {
			info: {
				type: Object,
				default: () => {
					return {}
				}
			}
		},
		components: {
			SelectEmployee,
			SelectClassRoom,
			SelectTimeSection
		},
		data() {
			return {
				ts_array: [],
				map_week_text: {1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'天'},
				scheduleList: [],
				sameSection: true,
				teacher_theme: ''
			}
		},
		computed: {
			enable_money_consume () {
				let result = 0
				
				if(this.$store.state.gvars.configs.params.class_attendance){
					result = this.$store.state.gvars.configs.params.class_attendance.enable_money_consume
				}
				
				return result
			}
		},
		mounted() {
			if(this.info.csm_id) {
				this.sameSection = false
			}
		},
		methods: {
			ok() {
				this.check()
				.then(() => {
					this.setScheduleList()
					this.close()
				})
				.catch(() => {

				})
			},
			check () {
				return new Promise((resolve,reject)=>{
					if(this.info.start_int_day == ''){
						this.$Message.error('请选择开始时间')
						reject()
						return
					}
					if(this.info.end_type==0 && this.info.end_int_day == ''){
						this.$Message.error('请选择结束时间')
						reject()
						return
					}
					
					if(_.isEmpty(this.info.week_days)){
						this.$Message.error('请选择周几上课')
						reject()
						return
					}

					let result = false
					if(this.sameSection) {
						if(this.info.int_hour_map[0].length==0) {
							this.$Message.error('请选择上课时间')
							result = true
							return
						}
					}else{
						for(let i in this.info.week_days) {
							if(this.info.int_hour_map[this.info.week_days[i]].length==0) {
								this.$Message.error('请选择上课时间')
								result = true
								return
							}
						}
					}
					if(result) {
						reject()
						return
					}
					if(this.info.eid == 0 && this.info.schedule_type==0){
						this.$Message.error(`请选择${this.label_teach_teacher}`)
						reject()
						return
					}
					resolve()
				})
				
			},		
			setScheduleList () {
				this.scheduleList = []
				let	obj = {
					eid: this.info.eid,
					cid: this.info.cid,
					sid: this.info.sid,
					sids: this.info.sids,
					student_limit: this.info.student_limit,
					lid: this.info.lid,
					sj_id: this.info.sj_id,
					lesson_type: this.info.lesson_type,
					cr_id: this.info.cr_id,
					second_eids: this.info.second_eids,
					consume_source_type: this.info.consume_source_type,
					consume_lesson_hour: this.info.consume_lesson_hour,
					consume_lesson_amount: this.info.consume_lesson_amount,
					is_bk_open: this.info.is_bk_open,
					name: this.teacher_theme
				}
				if(this.info.schedule_type == 0) {
					obj.student_limit = 0
				}
				if(obj.consume_source_type == 1) {
					obj.consume_lesson_amount = 0
				}
				else if(obj.consume_source_type == 2) {
					obj.consume_lesson_hour = 0
				}
				this.info.week_days.forEach(d => {
					let time_sections = []
					if(this.sameSection) {
						time_sections = this.info.int_hour_map[0]
					}else{
						time_sections = this.info.int_hour_map[d]
					}
					time_sections.forEach(h => {
						let c_obj = util.copy(obj)
						c_obj.week_day = d
						c_obj.int_start_hour = h.int_start_hour
						c_obj.int_end_hour = h.int_end_hour
						this.scheduleList.push(c_obj)
					})
				})
				
				if(this.info.schedules.length) {
					this.confirm('编辑计划将会覆盖原有计划，确定吗？')
					.then(() => {
						this.info.schedules = this.scheduleList
					})
				}else{
					this.info.schedules = this.scheduleList
				}
				console.log(this.info.schedules)
			},
			copySection (j) {
				this.$Modal.open('business/arrange/plan/copy-modal.vue',{
					on: {
						'on-ok':(data,days) => {
							this.setSectionByCopy(data,days,j)
						}
					},
					props: {
						sections: this.info.int_hour_map[j],
						weekdays: this.info.week_days
					}
				})
				.then(modal => {
					modal
					.set('current_day',j)
					.show(util.sprintf('周%s时间段复制到',this.map_week_text[j]))
				})
			},
			setSectionByCopy(data,days,j) {
				days.forEach(d => {
					if(d!==j) {
						this.info.int_hour_map[d] = util.copy(data)
					}
				})
			},
			closeTimeSection (j,i) {
				this.info.int_hour_map[j].splice(i,1)
			},
			changeTimeSection (e,j) {
				if(e&&e.length) {
					let start = e[0],
						end = e[1],
						int_hour_day = this.info.int_hour_map[j],
						starts = []
					if(int_hour_day.length) {
						starts = int_hour_day.map(_=>_.int_start_hour)
					}
					if(starts.indexOf(start)==-1) {
						this.info.int_hour_map[j].push({
							int_start_hour: start,
							int_end_hour: end
						})
					}
					this.info.int_hour_map[j] = this.orderBy(this.info.int_hour_map[j],'int_start_hour')
				}
			}
		}
	}
</script>