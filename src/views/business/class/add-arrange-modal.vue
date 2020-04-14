<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="560" :mask-closable="false">
		<Card>
			<div slot="title" class="pd-10">
				<Checkbox class="mb-0" v-model="workday">工作日</Checkbox>
				<Checkbox class="mb-0" v-model="weekend">周末</Checkbox>
			</div>
			<div class="pd-10">
				<CheckboxGroup v-model="weeks">
					<div class="">
						<Checkbox :label="1">星期一</Checkbox>
						<Checkbox :label="2">星期二</Checkbox>
						<Checkbox :label="3">星期三</Checkbox>
						<Checkbox :label="4">星期四</Checkbox>
						<Checkbox :label="5">星期五</Checkbox>
					</div>
					<div class="">
						<Checkbox :label="6">星期六</Checkbox>
						<Checkbox :label="7">星期天</Checkbox>
					</div>
				</CheckboxGroup>
			</div>
		</Card>		
		
		<Card class="mt-3">
			<div class="pd-10">
				<Form :label-width="80">
					<Form-item label="上课时间" class="mb-0 ivu-form-item-required">
						<select-time-section
							clearable
							:value="ts_array" 
							@on-change="changeTimeSection"
							placeholder="请选择上课时间段">
						</select-time-section>
					</Form-item>
					<Form-item label="扣课时数" class="mb-0" v-help="'选择时段课时数会自动计算出来'">
						<InputNumber :min="0" v-model="item.consume_lesson_hour"></InputNumber>
					</Form-item>
					<Form-item label="上课教室" class="mb-0 ivu-form-item-required">
						<select-class-room 
							v-model="item.cr_id">
						</select-class-room>
					</Form-item>						
					<Form-item :label="label_teach_teacher" class="mb-0 ivu-form-item-required">
						<select-employee v-model="item.eid" :limit-per="false" :rid="1"></select-employee>
					</Form-item>
					<Form-item :label="'助教'|translate" class="mb-0">
						<select-employee v-model="item.second_eids" :limit-per="false" :rid="2"></select-employee>
					</Form-item>
					<Form-item prop="is_bk_open" label="开启预约" v-if="classType===0&&enable_bk">
						<i-switch v-model="item.is_bk_open" :true-value="1" :false-value="0"></i-switch>
					</Form-item>
					<Form-item prop="name" label="授课主题" v-if="enable_type2_bk&&classType===2">
						<Input v-model="item.name"></Input>
					</Form-item>
				</Form>
			</div>
		</Card>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectClassRoom from 'c%/SelectClassRoom'
	import SelectTimeSection from 'c%/SelectTimeSection.vue'
	
	const emptyObject = {
		week_day: 1,
		int_start_hour: '',
		int_end_hour: '',
		cr_id: 0,
		consume_lesson_hour: 0,
		eid: 0,
		second_eids: [],
		cid: 0,
		is_bk_open: 0,
		name: ''
	}
	
	export default{
		mixins: [ common, modal ],
		components: {
			SelectEmployee,
			SelectClassRoom,
			SelectTimeSection
		},
		props: {
			from: {
				type: String,
				default: 'schedule'
			}
		},
		data () {
			return {
				item: util.copy(emptyObject),
				weeks: [],
				eid: 0,
				cid: 0,
				lid: 0,
				cr_id: 0,
				second_eids: [],
				season: 'C',
				weekend: false,
				workday: false,
				ts_array: [],
				list: [],
				classType: 0
			}
		},
		watch: {
			workday: function (val) {
				this.checkAll('workday')
			},
			weekend: function (val) {
				this.checkAll('weekend')
			},
			cid: function (val) {
				this.item.cid = val
			},
			cr_id: function (val) {
				this.item.cr_id = val
			},
			eid: function (val) {
				this.item.eid = val
			},
			second_eids: function (val) {
				this.item.second_eids = val
			},
			classType: function (val) {
				if(val=='temp') {
					this.item.consume_lesson_hour = 1
				}
			},
			'modal$.show':function(v) {
				if(v&&this.classType===0&&this.enable_bk) {
					// this.item.is_bk_open = 1
				}
			}
		},
		computed: {
			time_sections () {
				let list = this.$store.state.gvars.time_sections.filter(t=>t.season==this.season),
					result = []
					
					list.forEach(l=>{
						let index = result.findIndex(r=>r.int_start_hour==l.int_start_hour&&r.int_end_hour==l.int_end_hour)
						if(index==-1){
							result.push(l)
						}
					})
					
				return result
			}
		},
		methods: {
			changeTimeSection(event) {
				if(event.length) {
					this.item.int_start_hour = event[0]
					this.item.int_end_hour   = event[1]
					if(this.item.cid || this.lid){
						this.getConsumeHour()					
					}		
				}else{
					this.item.int_start_hour = ''
					this.item.int_end_hour   = ''
				}
			},
			ok () {
				let list = [],
					weeks = this.weeks
					
					if(weeks.length==0){
						this.$Message.error('请选择上课星期')
						return 
					}
					if(this.item.int_start_hour==''){
						this.$Message.error('请选择上课时间')
						return
					}
					if(this.classType===0){
						if(this.item.cr_id==0){
							this.$Message.error('请选择上课教室')
							return
						}
						if(this.item.eid==0){
							this.$Message.error('请选择上课'+this.$filter('translate')('老师'))
							return
						}
					}
					for(let i=0;i<weeks.length;i++){
						let obj = util.copy(this.item)
						obj.week_day = weeks[i]
						
						if(this.check(obj)){
							list.push(obj)							
						}else{							
							break
						}
					}
					if(list.length!=weeks.length){
						return false
					}
					if(this.from==='schedule') {
						this.save(list)
					}else{
						this.$emit('set',list)
						this.close()
					}
			},
			save(list) {
				this.$rest('class_schedules/multi_schedules')
				.post({
					cid: this.cid,
					schedules: list
				})
				.success(res => {
					this.$Message.success('保存成功')
					this.$emit('save')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			check (item) {
				let list = this.list,
					index = list.findIndex(l=>l.int_start_hour==item.int_start_hour&&l.week_day==item.week_day),
					map_week_day = {1:'星期一',2:'星期二',3:'星期三',4:'星期四',5:'星期五',6:'星期六',7:'星期天'}
				if(index > -1){
					this.$Message.error(util.sprintf('【%s】与已添加的排课有冲突',map_week_day[item.week_day]))
					return false
				}else{
					return true
				}
			},
			checkAll (type) {
				let arr = type=='weekend'?[6,7]:[1,2,3,4,5],
					val = this[type]
				
				arr.forEach(a=>{
					let index = this.weeks.indexOf(a)
					if(index == -1 && val){
						this.weeks.push(a)
					}
					else if(index > -1 && !val){
						this.weeks.splice(index,1)
					}
				})
			},
			getConsumeHour () {
				let params = {
					cid: this.item.cid,
					int_start_hour: this.item.int_start_hour,
					int_end_hour: this.item.int_end_hour
				}

				if(this.item.cid==0){
					delete params.cid
					params.lid = this.lid
				}

				this.$rest('course_arranges/consume_lesson_hour').get(params)
				.success(data=>{
					this.item.consume_lesson_hour = data.consume_lesson_hour
				}).error(response=>{
					this.$Message.error(response.body.message||'获取扣课时数失败~')
				})
			}
		}
		
	}
</script>

<style>
</style>