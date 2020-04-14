<template>
	<Modal v-drag-modal :mask-closable="false" width="880" v-model="modal$.show" :title="modal$.title">
		<template v-if="modal$.show">
			<Alert show-icon>{{text}}</Alert>
			<div class="list-body-wrap" v-loading.like="'classes'" style="max-height:500px;overflow:auto">
				<table class="modal-table">
					<thead>
						<th>
							<div class="ivu-table-cell">
								<Checkbox v-model="select_all" @on-change="toggleSelectAll($event)"><span v-if="modal$.action=='close'">课程结课</span></Checkbox>
							</div>
						</th>
						<th v-if="modal$.action=='close'">
							<div class="ivu-table-cell">
								<Checkbox :value="true" :disabled="true">本班结课</Checkbox>
							</div>
						</th>			
						<th><div class="ivu-table-cell">姓名</div></th>
						<th><div class="ivu-table-cell">学号</div></th>
						<th><div class="ivu-table-cell">性别</div></th>
						<th><div class="ivu-table-cell">剩余课时</div></th>
						<th><div class="ivu-table-cell">入班日期</div></th>
					</thead>
					<tbody>
						<tr v-for="(item,key) in data">
							<td>
								<div class="ivu-table-cell">
									<Checkbox v-model="item.$select" @on-change="toggleSelect($event,item)"></Checkbox>
								</div>
							</td>
							<td v-if="modal$.action=='close'">
								<div class="ivu-table-cell">
									<checkbox :value="true" :disabled="true"></checkbox>
								</div>
							</td>
							<td><div class="ivu-table-cell">{{item.student.student_name}}</div></td>
							<td><div class="ivu-table-cell">{{item.student.sno}}</div></td>
							<td>
								<div class="ivu-table-cell">{{item.student.sex|sex}}</div>
							</td>
							<td><div class="ivu-table-cell">{{getRemainHour(item)}}</div></td>
							<td><div class="ivu-table-cell">{{item.in_time|date}}</div></td>
						</tr>
						<tr v-if="data.length == 0">
							<td colspan="6">
								<div class="text-center ivu-table-cell">暂无学员~</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</template>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确认</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import upInfo from './up-info.vue'
	export default {
		mixins:[common,globals,modal],
		components:{
			upInfo
		},
		data(){
			return {
				rest_api: '',
				sId: [],
				classInfo: {cid:0},
				toCid: 0,
				select_all: false,
				data: []
			}
		},
		methods:{
			onModalOpen() {
				this.init_data()
			},
			init_data() {
				this.$rest(this.rest_api)
				.get()
				.success(res => {
					this.refreshData(res.list)
					this.data = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			refreshData(data) {
				data.forEach((item) => {
					if(this.modal$.action=='up') {
						if(this.getRemainHour(item) > 0) { //升班默认剩余课时>0
							item.$select = true
							this.sId.push(item.sid)
						} else {
							item.$select = false
						}
					}else if(this.modal$.action=='close') { //结课默认剩余课时=0
						if(this.getRemainHour(item) <= 0) {
							item.$select = true
							this.sId.push(item.sid)
						} else {
							item.$select = false
						}
					}
					
				})
				this.select_all = data.every(this.checkSelectAll)
			},
			checkSelectAll(item, index, arr) {
	        	if(this.sId.indexOf(item.sid) !== -1) {
	        		return true
	        	} else {
	        		return false
	        	}
	        },
			toggleSelectAll (event) {
				this.data.forEach(item => {
					let index = this.sId.indexOf(item.sid)
					if(event) {
						if(index < 0) {
							this.sId.push(item.sid)
							item.$select = true
						}
					}else{
						if(index > -1) {
							this.sId.splice(index,1)
							item.$select = false
						}
					}
				})
			},
			toggleSelect (event,item) {
				if(event) {
					this.sId.push(item.sid)
				}else{
					let index = this.sId.indexOf(item.sid)
					this.sId.splice(index,1)
				}
				this.select_all = this.data.every(this.checkSelectAll)
			},
			ok () {
				if(this.modal$.action == 'up') {
					if(!this.sId.length) {
						this.$Message.error('请至少选择一名学员')
						return false
					}else{
						this.upGrade()
					}
				}else{
					this.closeGrade()
				}
			},
			closeGrade () {
				this.confirm(`结课之后不能再修改班级信息，也不能升班、排课、分班<br/>
					确定将${this.classInfo.class_name}结课吗？`).then(() => {
					this.$rest('classes').add_url_param(this.classInfo.cid,'doclose')
					.post({info:this.sId})
					.success(response => {
						this.$Message.success('结课成功')
						this.$emit('on-success')
						this.close()
					})
					.error(response => {
						this.error(response.body.message)
					})
				})
				.catch(() => {})
			},
 			upGrade () {
 				this.$Modal.open('business/class/up/up-info.vue@modal',{
 					on: {
 						'on-success':() => {
 							this.$emit('on-success')
							this.close()
 						}
 					}
 				})
 				.then(modal => {
 					modal
 					.set('students',this.student_up_arr)
	 				.set('data',{to:this.toCid,from:this.classInfo.cid,sid:this.sId})
	 				.show(util.sprintf('升班确认【%s】',this.classInfo.class_name))
 				})
			},
			getRemainHour(item) {
				return item.student_lesson.remain_lesson_hours
			}
		},
		computed:{
			text() {
				return this.modal$.action=='up' ? '请先勾选要升班的学员，然后点击确认(默认勾选剩余课时大于0的学员)'
				 : '请先勾选要结课的学员，然后点击确认(课程结课默认勾选剩余课时等于0的学员，班级默认结课)'
			},
			student_up_arr() {
				let arr = []
				this.sId.forEach(id => {
					arr.push(this.data.find(item => item.sid==id).student.student_name)
				})
				return arr
			}
		}
	}
</script>