<template>
	<div>
		<Form :label-width="80">
			<Row>
				<Col span="12">
					<FormItem label="授课对象" class="mb-0">
						<review-object ref="object" @on-selected="setPost" style="width: 240px;"></review-object>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem :label="label_teach_teacher" class="mb-0">
						<select-employee v-model="post.eid" :rid="1" clearable style="width: 240px;"></select-employee>
					</FormItem>
				</Col>				
			</Row>
			<Row>			
				<Col span="12">
					<FormItem label="授课日期" class="mb-0">
						<DatePicker 
							type="date" 
							placeholder="请选择日期" 
							:value="post.int_day"
				            @on-change="post.int_day = $event"
				            format="yyyyMMdd"
				            style="width: 240px;">
						</DatePicker>
					</FormItem>
				</Col>
				<Col span="12">
					<Form-item label="上课时间" class="mb-0">			
						<select-time-section 
							clearable
							:value="ts_array" 
							:date="post.int_day" 
							@on-change="changeTimeSection"
							placeholder="请选择上课时间段"
							placement="right"
							style="width: 240px;"
							>
						</select-time-section>
					</Form-item>
				</Col>				
			</Row>
		</Form>
	</div>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import review from './review.mixin'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import reviewObject from './review-object.vue'	
	import SelectTimeSection from 'c%/SelectTimeSection.vue'
	
	export default {
		mixins: [common,review],
		props: {
			post: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		components: {
			reviewObject,
			selectEmployee,
			SelectTimeSection
		},
		data () {
			return {
				students: [],
				ts_array: []
			}
		},
		methods: {
			changeTimeSection (event) {
				if(event.length) {
					this.post.int_start_hour = util.format_int_hour(event[0])
					this.post.int_end_hour   = util.format_int_hour(event[1])
				}else{
					this.post.int_start_hour = ''
					this.post.int_end_hour   = ''
				}
			},
			getStudents (cid) {
				return new Promise((resolve,reject)=>{
					this.$rest(`classes/${cid}/students?with=student_lesson&pagesize=1000`)
					.get()
					.success(response=>{
						this.initStudent(response.list)						
						resolve()						
					}).error(response=>{
						this.$Message.error(response.body.message||'获取学员失败~')
						reject()						
					})
				})
				
			},
			initStudent (list) {
				let type = this.post.lesson_type				
				if(type===0){
					this.students = list.filter(l=>l.student!==null)
				}else{
					let data = list.map_ids

					this.students = []
					for(let key in data) {
						this.students.push(data[key])
					}
				}
				this.$emit('on-deal-student',this.students)
			},
			dealPost(selected) {
				let ids = selected.ids
				this.post.bid = this.bid$
				this.post.lesson_type = selected.type
				this.post.eid = selected.type==0?selected.info.teach_eid:this.eid$				
				
				switch (selected.type){
					case 0: 
						this.post.cid = selected.info.cid
						this.post.lid = selected.info.lid
						this.post.sid = 0 
						this.post.sids = []
						this.getStudents(selected.info.cid)
						break;
					case 1:
					case 2:
						this.post.cid = 0
						this.post.lid = selected.map_ids[ids[0]].lid
						this.post.sid = selected.type==1?ids[0]:0
						this.post.sids = selected.type==1?0:ids
						this.initStudent(selected)
						break;
				}
			},
			setPost (selected) {
				let ids = selected.ids
				if(selected.type !== 2) {
					this.post.rts_id = this.getTplId(selected.info)
				}
				else {
					this.post.rts_id = this.getTplId(selected.map_ids[ids[0]])
				}
				this.getCTpl().then(() => {
					this.dealPost(selected);
				})
			}
		}
	}
</script>

<style>
</style>