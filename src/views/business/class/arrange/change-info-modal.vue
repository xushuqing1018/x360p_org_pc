<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="460">
		
		<Form :label-width="100">
			<template v-if="type=='move'">
				<Form-item label="调整上课日期">
					<Button class="ml-3" size="small" type="ghost" icon="arrow-swap" @click="changeMoveType">{{move_type=='before'?'向前':'向后'}}</Button>
					  调整  
					<InputNumber :max="1000" :min="0" v-model="move_days"></InputNumber> 天
					
				</Form-item>
				<Form-item label="上课时段">
					<select-time-section 
						clearable
						:value="ts_array" 
						:date="info.int_day" 
						@on-change="changeTimeSection"
						placeholder="请选择上课时间段">
					</select-time-section>
				</Form-item>
			</template>
			
			<template v-if="type=='time'">
				<Form-item label="上课日期">
					<DatePicker 
						:value="info.int_day|int_date" 
						@on-change="dateChange" 
						type="date" 
						placeholder="请选择上课日期" 
						style="width: 200px">
					</DatePicker>
				</Form-item>
				<Form-item label="上课时段">
					<select-time-section 
						clearable
						:value="ts_array" 
						:date="info.int_day" 
						@on-change="changeTimeSection"
						placeholder="请选择上课时间段">
					</select-time-section>
				</Form-item>
			</template>
			<Form-item :label="label_teach_teacher" v-if="type=='teacher'">
				<select-employee :rid="1" v-model="info.teach_eid" :limit-per="false"></select-employee>
			</Form-item>
			<Form-item :label="label_secteacher" v-if="type=='ss'">
				<select-employee :rid="2" v-model="info.second_eids" :limit-per="false"></select-employee>
			</Form-item>
			<Form-item label="上课教室" v-if="type=='room'">
				<select-class-room v-model="info.cr_id"></select-class-room>
			</Form-item>
			<Form-item label="冲突设置">
				<Checkbox class="ml-3" v-model="info.ignore_class_cc" :true-value="1" :false-value="0">忽略教室冲突</Checkbox>
				<Checkbox v-model="info.ignore_class_ec" :true-value="1" :false-value="0">忽略老师冲突</Checkbox>
				<Checkbox v-model="info.ignore_student_cc" :true-value="1" :false-value="0">忽略学员冲突</Checkbox>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectClassRoom from 'c%/SelectClassRoom'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectTimeSection from 'c%/SelectTimeSection.vue'
	
	const emptyObject = {
		int_day: '',
		teach_eid: 0,
		second_eids: [],
		cr_id: 0,
		int_start_hour: '',
		int_end_hour: '',
		ignore_class_cc:0,
		ignore_class_ec:0,
		ignore_student_cc:0
	}
	
	export default{
		mixins: [ common,modal ],
		components: {
			SelectEmployee,
			SelectClassRoom,
			SelectTimeSection
		},
		data () {
			return {
				info: util.copy(emptyObject),
				ts_array: [],
				type: '',
				move_type: 'after',
				data: [],
				copyData: [],
				move_days: 1
			}
		},
		props: {
			caIds: {
				type: Array,
				default: ()=>{
					return []
				}
			},
			objType: {
				type: Number,
				default: 0
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(!val) {
					this.info = util.copy(emptyObject)

				}else{
					if(this.info.int_start_hour&&this.info.int_end_hour) {
						let start = this.$filter('int_hour')(this.info.int_start_hour)
						let end = this.$filter('int_hour')(this.info.int_end_hour)
						this.ts_array = [start,end]
					}else{
						this.ts_array = []
					}
				}			
			}
		},
		methods: {
			dateChange (val) {
				this.info.int_day = moment(val).format('YYYYMMDD')
			},
			changeMoveType () {
				this.move_type = (this.move_type=='before'?'after':'before') 
			},
			changeTimeSection(event) {
				if(event.length) {
					this.info.int_start_hour = event[0]
					this.info.int_end_hour   = event[1]
				}else{
					this.info.int_start_hour = ''
					this.info.int_end_hour   = ''
				}
			},
			ok () {
				this.confirmCheck()
				.then(()=>{
					this.setArrangeData()	
				},tip=>{
					this.$Message.error(tip)
				})
				
			},
			setArrangeData () {
				let ca_ids = this.caIds,
					type = this.type,
					data = this.data,
					copy_data = this.copyData,
					info = this.info,
					obj = {}
								
				if(info.ca_id){
					obj = copy_data.find(c=>c.ca_id==info.ca_id)||{}
					this.setField(obj)		
				}else{
					if(ca_ids.length){
						ca_ids.forEach(i=>{
							obj = copy_data.find(c=>c.ca_id==i)||{}							
							this.setField(obj)
						})
					}
				}
				this.arrangeCheck(ca_ids,info)
			},
			setField (obj) {
				let changeField = this.changeField
								
				if(changeField.length){	
					changeField.forEach(i=>{						
						if(i=='int_day'){
							if(this.info.ca_id){
								obj[i] = this.info.int_day																
							}else{
								obj[i] = this.getMoveDaysResult(obj[i])
							}
							
						}else if(i=='int_start_hour'||i=='int_end_hour'){
							obj[i] = util.format_int_hour(this.info[i])
						}
						else{
							if(!obj[i]){
								this.$set(obj,i,this.info[i])							
							}else{
								obj[i] = this.info[i]							
							}
						}
						
						if(!obj._change_field){
							this.$set(obj,'_change_field',changeField)
						}else{							
							changeField.forEach(c=>{
								if(obj._change_field.indexOf(c)===-1){
									obj._change_field.push(c)
								}
							})
						}
					})
				}
			},
			getMoveDaysResult (int_day) {
				let move_days = this.move_days,
					old_date = this.$filter('int_date')(int_day),
					move_type = this.move_type,
					method = (move_type == 'after'?'add':'subtract'),
					result = ''
					
				result = moment(moment(old_date)[method](move_days,'days')).format('YYYYMMDD')
				
				return result
			},
			confirmCheck () {
				let changeField = this.changeField,
					map_error = {
						'int_day':'上课日期',
						'teach_eid':'上课'+this.$filter('translate')('老师'),
						'second_eids':this.$filter('translate')('助教'),
						'cr_id':'上课教室',
						'int_start_hour':'上课时段',
						'int_end_hour':'上课时段'
					}
					
				return new Promise((resolve,reject)=>{
					if(changeField.length){
						let err = 0
						changeField.forEach(i=>{
							if(i=='int_day'&&!this.info.ca_id){
								if(this.move_days < 0){
									reject('调整天数不能为负数')
									return
								}
							}else{
								if(!this.info[i]){								
									reject('请选择'+map_error[i])
									return 
								}		
							}
						})
					}
					resolve()
				})
				
			},
			arrangeCheck (ca_ids,info) {				
				let data = this.initCheckData(ca_ids,info)
				
				this.$rest('course_arranges/query_course').post(data)
				.success(data=>{
					this.$emit('on-ok',this.copyData)
					this.close()
				}).error(response=>{
					this.error(response.body.message||'排课有冲突','排课冲突提示')
					
				})
			},
			initCheckData (ca_ids,info) {
				let result = []
				if(info.ca_id){
					ca_ids = [info.ca_id]
				}
				ca_ids.forEach(id=>{
					let obj = this.copyData.find(d=>d.ca_id==id)
					if(obj){
						obj.ignore_class_ec = info.ignore_class_ec
						obj.ignore_class_cc = info.ignore_class_cc
						obj.ignore_student_cc = info.ignore_student_cc
						result.push(obj)
					}
				})
				
				return result				
			}
			
		},
		computed: {
			changeField () {
				let change_field = []
				
				switch(this.type){
					case 'move':
						change_field = ['int_day','int_start_hour','int_end_hour']
						break
					case 'teacher':
						change_field = ['teach_eid']
						break
					case 'ss':
						change_field = ['second_eids']
						break
					case 'room':
						change_field = ['cr_id']
						break
					case 'time':
						change_field = ['int_day','int_start_hour','int_end_hour']
						break	
				}
				
				return change_field
			}
		}
	}
	
</script>

<style>
</style>