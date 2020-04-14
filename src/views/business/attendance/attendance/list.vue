<template>
	<div>
		<div class="mb-3">
			<Input v-model="name" icon="ios-search" placeholder="请输入姓名" style="width:280px"></Input>
			<Button type="primary" icon="plus" @click="addStudent" v-if="lessonType!=1">添加学员</Button>
			<Button type="primary" icon="refresh" @click="refreshStudent" title="学员不见了？刷新试试~"></Button>
			<Button type="primary" icon="android-list" @click="showPrepareDetail" title="查看备课内容"></Button>
		</div>
		<div style="position:relative">
			<Spin size="large" fix v-if="loading"></Spin>
			<table class="x-modal-table modal-table">
				<thead>
					<th width="90px"><div class="ivu-table-cell"></div></th>
					<th width="225px">
						<div class="ivu-table-cell">
							学员 <Badge class-name="x-badge-info" :count="total('all')"></Badge>
						</div>
					</th>
					<th width="206px">
						<div class="ivu-table-cell">
							<Checkbox v-model="all.is_in" @on-change="checkAll($event,'is_in')">
								出勤 <Badge class-name="x-badge-info" :count="total('is_in')"></Badge>
							</Checkbox>
						</div>
					</th>
					<th width="140px">
						<div class="ivu-table-cell" v-if="has_untime_student">
							<Checkbox 
								:disabled="arrange.is_trial == 1"
								v-model="all.is_leave" 
								@on-change="checkAll($event,'is_leave')">
								请假 <Badge class-name="x-badge-info" :count="total('is_leave')"></Badge>
							</Checkbox>							
						</div>
					</th>
					<th width="240px">
						<div class="ivu-table-cell" v-if="has_untime_student">
							<Checkbox  
								:disabled="arrange.is_trial == 1"
								v-model="all.is_consume" 
								@on-change="checkAll($event,'is_consume')"
								>
								{{arrange.consume_source_type==1?'扣课时':'扣余额'}} <Badge class-name="x-badge-info" :count="total('is_consume')"></Badge>
							</Checkbox>
							<!--<span>（{{total('is_consume')}}）</span>-->
							<template v-if="arrange.is_trial == 0">								
								<InputNumber 
									v-if="arrange.consume_source_type==1"
									:value="parseFloat(post.consume_lesson_hour)"
									@on-change="post.consume_lesson_hour = $event" 
									placeholder="扣课时数" 
									:disabled="!allow_modify_consume_hour"
									:min="0">								
								</InputNumber>
								<template v-else>
									<InputNumber
										:value="parseFloat(post.consume_lesson_amount)"
										@on-change="post.consume_lesson_amount = $event" 
										placeholder="扣余额" 
										:min="0">								
									</InputNumber>
									元
								</template>
							</template>
						</div>
					</th>					
				</thead>
			</table>
			
			<div style="max-height: 400px;overflow: auto;">
				<table class="x-modal-table modal-table">	
					<attendance-item
						@on-del="delArrangeStudent" 
						@on-disabled="disabled"
						@on-att-change="attChange"
						@on-leave-change="leaveChange"
						@on-consume-change="consumeChange"
						@on-att-clear="attClear(item)"
						:item="item" 
						:arrange="arrange"
						:teach-eid="post.teach_eid"
						:consume-lesson-hour="post.consume_lesson_hour"
						:consume-lesson-amount="post.consume_lesson_amount"
						v-for="item in list">						
					</attendance-item>			
					
					<tr v-if="!list||!list.length">
						<td colspan="5">
							<div class="ivu-table-cell text-center">还没有学员~去添加一个吧！</div>
						</td>
					</tr>
				</table>
				<delay-arrange :delay-arrange="delayArrange" :arrange="arrange" :list="post.students"></delay-arrange>
			</div>
		</div>
	</div>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'

	import attendanceItem from './item.vue'
	import delayArrange from './delay-arrange.vue'
	
	export default{
		mixins: [ modal,common ],
		components: {
			attendanceItem,
			delayArrange
		},
		props: {
			post: {
				type: Object,
				default: ()=>{
					return {}
				}
			},
			loading: {
				type: Boolean,
				default: false
			},
			arrange:{
				type:Object,
				default:()=>{
					return {}
				}
			},
			caId: {
				type: [String,Number],
				default: 0
			},
			lessonType: {
				type: [String,Number],
				default: 0
			},
			delayArrange: {
				type: Object
			}
		},
		data () {
			return {
				name: '',
				all: {
					is_in: false,
					is_comsume: false,
					is_leave: false
				}
			}
		},
		computed: {
			list () {
				let list = this.post.students||[],
					name = this.name,
					filter = (item)=>{
						if(!/^\s*$/.test(name)){
							if(item.sid>0){
								return item.student.student_name.indexOf(name)>-1						
							}else{
								return item.customer.name.indexOf(name)>-1
							}
						}
						return !_.isEmpty(item.student)||!_.isEmpty(item.customer)
					}
					
				return list.filter(filter)
			},
			has_untime_student(){
				//有非按时间的学员
				let has = 0,l = this.list.length
				for(let i=0;i<l;i++){
					if(!_.isEmpty(this.list[i].student) && this.list[i].student.student_lesson.price_type != 3){
						has = 1
						break
					}
				}
				return has
			}
		},
		methods: {
			showPrepareDetail () {
				let arrange = this.arrange,
					mapTitle = {1:'一对一',2:'一对多'},
					result = ''
				if(arrange.lesson_type===0){					
					result = arrange.one_class!=null?arrange.one_class.class_name:arrange.name					
				}else{					
					result = mapTitle[arrange.lesson_type]										
				}
				
				this.$Modal.open('business/attendance/attendance/prepare-detail.vue@modal',{
					on: {
						'on-success': ()=>{
							this.init_data()
						}
					},
					props: {
						caId: this.caId,
						class_name: result
					}
				})
				.then(modal=>{
					modal.show('查看备课内容')
				})
			},
			refreshStudent () {
				this.$emit('on-refresh')
			},
			total (type) {
				let list = this.post.students||[],
					length = 0
				if(type=='all'){
					length = list.length
				}else{
					length = list.filter(l=>l[type]==1).length
				}
				return length
			},
			attChange({val,item}){

				if(val && !item.is_trial) {					
					//选中出勤时自动选中扣课时且取消请假
					item.is_leave = 0
					item.is_consume = 1
					item.remark = ''
				}else{
					item.is_consume = 0
				}
			},
			leaveChange({val,item}){
				
				if(val == 1){
					item.is_in = 0
					if(this.regatt_default_consume) {
						item.is_consume = 1
					}else{
						item.is_consume = 0
					}
				}else{
					if(item.is_consume) {
						item.is_in = 1
					}
				}
			},
			consumeChange({val,item}) {
				
				if(val) {
					if(item.is_leave) {
						item.is_in = 0
						this.all.is_in = false
					}else{
						if(item.is_in==-1) {
							item.is_in = 1
						}
					}
				}
			},
			disabled ({item,field}) {
				//已考勤或学员状态不为1(正常)的禁止选中
				if((field == 'is_in' || field == 'is_leave') && item.is_trial == 0){
					if(item._disabled){
						return true
					}
				}
				if(item.is_trial == 1 && field == 'is_leave'){
					return true
				}
				if(item.cu_id>0){
					return item.is_attendance==1
				}else{
					return item.is_attendance==1||item.student.status!=1 
				}

				return false
			},
			itemChange (val,item,field) {
				if(field=='is_leave'){
					if(val) {
						item.is_in = 0
						if(this.regatt_default_consume) { // 请假默认扣课时
							item.is_consume = 1
						}else{
							item.is_consume = 0
						}
					}else{
						item.is_in = -1
						item.is_consume = 0
					}
				}
				else if(field=='is_consume') {
					if(val) {
						if(item.is_leave) {
							item.is_in = 0
							this.all.is_in = false
						}else{
							item.is_in = 1
						}
					}else{
						if(!item.is_leave) {
							item.is_in = -1
						}
					}
				}
				else if(field=='is_in'){
					if(val) {					
						//选中出勤时自动选中扣课时且取消请假
						if(!item.is_trial) {
							item.is_consume = 1
						}
						item.is_leave = 0
						item.remark = ''
					}else{
						item.is_consume = 0
						item.is_in = -1
					}
				}				
			},
			delArrangeStudent (item) {
				let tip = util.sprintf('确定将学员【%s】从本次排课中移除吗？',this.getListItem(item).name),
					params = {
						ca_id: this.caId,
						list: [
							{
								sid: item.sid,
								cu_id: item.cu_id
							}
						]
					}
				
				this.confirm(tip)
				.then(()=>{					
					this.$rest('course_arrange_students/delete_student')
					.post(params)
					.success(data=>{
						this.$Message.success('移除成功！')
						this.$emit('on-success')
					}).error(response=>{
						this.error(response.body.message||'操作失败~')
					})
				})
				
			},
			getListItem (item) {
				let obj = {}
				if(item.sid>0){			
					obj = item.student||{}
					obj.name = item.student?item.student.student_name:''
				}else{
					obj = item.customer||{}
				}
				return obj
			},
			checkAll (val,field) {
				
				if(field=='is_leave'){
					if(val) {
						this.all.is_in = false
						if(this.regatt_default_consume) {
							this.all.is_consume = true
						}
					}else{
						this.all.is_consume = false
					}
				}
				if(field=='is_in'){
					if(val) {
						this.all.is_leave = false						
					}
					this.all.is_consume = val
				}
				if(field=='is_consume') {
					this.all.is_in = val
				}
				this.list.forEach(l=>{
					if(!l.is_attendance && !l._disabled){
						if(
							(l.sid>0
							&& l.student.status==1)
							|| l.cu_id>0
						){
							
							if(
								!_.isEmpty(l.student.student_lesson)
								&& l.student.student_lesson.price_type == 3
								&& (field == 'is_leave' 
								|| field == 'is_consume')
							){
								return
							}
							l[field] = 	this.all[field]?1:0							
							this.itemChange(l[field],l,field)
						}
					}
				})
			},
			addStudent () {
				this.$emit('add-student')
			},
			attClear(item){
				if(!item.is_attendance && !item._disabled){
					item.is_in = -1
					item.is_consume = 0
				}

			}
		}
	}
</script>

<style>
	.x-badge-info{
		background: #2d8cf0 !important;
	}
</style>