<style lang="less" scoped>
	.content {
		.content-table {
			min-height: 150px;
			max-height: 400px;
			overflow-x: hidden;
			overflow-y: auto;
		}
	}
</style>
<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" width="600">
		<p slot="header">
			<span>{{title}}</span>
		</p>
		<div class="content">
			<label>如有缺课学员请</label>
			<select-student v-model="sids" @on-selected="select" style="width: auto">
				<Button type="primary"size="small">选择</Button>
			</select-student>
			<div class="content-table">
				<table class="table-list">
					<thead>
						<tr>
							<th>
								<div class="ivu-table-cell">缺课学员</div>
							</th>
							<th>
								<div class="ivu-table-cell">
									<Checkbox v-model="all.is_leave" @on-change="toggleAllLeave($event)">请假</Checkbox>
								</div>
							</th>
							<th>
								<div class="ivu-table-cell">
									<Checkbox v-model="all.is_consume" @on-change="toggleAllConsume($event)">扣课时</Checkbox>
								</div>
							</th>
							<th width="100">
								<div class="ivu-table-cell">
									<Poptip
										confirm
										title="确认全部删除吗?"
										@on-ok="delAll">
										<Button 
											type="ghost" 
											size="small" 
											icon="ios-trash" 
											shape="circle">
										</Button>
									</Poptip>
									操作
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item,index) in data" :key="item.sid">
							<td>
								<div class="ivu-table-cell">{{item.student_name}}</div>
							</td>
							<td>
								<div class="ivu-table-cell">
									<Checkbox 
										v-model="item.is_leave" 
										:true-value="1" 
										:false-value="0"
										@on-change="toggle($event)">
									</Checkbox>
									<span v-if="item.already==1">已请假</span>
								</div>
							</td>
							<td>
								<div class="ivu-table-cell">
									<Checkbox 
										v-model="item.is_consume" 
										:true-value="1" 
										:false-value="0"
										@on-change="toggle($event)">
									</Checkbox>
									<span :class="item.remain_hours<2?'text-danger':''">剩 ({{item.remain_hours}})</span>
								</div>
							</td>
							<td>
								<div class="ivu-table-cell">
									<Poptip
										confirm
										title="确认删除吗?"
										@on-ok="delItem(item,index)"
										>
										<Button 
											type="ghost" 
											size="small" 
											icon="ios-trash" 
											shape="circle">
										</Button>
									</Poptip>
								</div>
							</td>
						</tr>
						<tr v-if="data.length == 0">
							<td colspan="4" class="text-center">没有数据</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close" :disabled="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	export default {
		mixins: [modal,common],
		components: {
			SelectStudent
		},
		props: {
			date: Date,
			default() {
				return new Date()
			}
		},
		data() {
			return {
				sids: [],
				all: {
					is_consume: false,
					is_leave: false
				},
				data: []
			}
		},
		methods: {
			ok() {
				let tip = '确认进行批量考勤吗'
				if(this.data.length == 0) {
					tip = '你没有选择缺课学员，' + tip
				}
				this.confirm(tip).then(() => {
					this.$rest('course_arranges').add_url_param(0,'dayatts')
					.post({
						int_day: moment(this.date).format('YYYYMMDD'),
						absences: this.data
					})
					.success(res => {
						this.$Message.success('批量考勤成功')
						this.$emit('on-success')
						this.data.splice(0)
						this.all.is_leave = false
						this.all.is_consume = false
						this.close()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			select(selected) {
				selected.forEach(student => {
					let index = this.data.findIndex(d => d.sid == student.sid)
					if(index < 0) {
						this.data.push(this.buildItem(student,0))
					}
				})
				this.sids.splice(0)
				this.refreshAllStatus()
			},
			delItem(item,index) {
				this.data.splice(index,1)
				this.refreshAllStatus()
			},
			delAll() {
				this.data.splice(0)
				this.refreshAllStatus()
			},
			refreshAllStatus() {
				this.all.is_leave = this.data.every(item => item.is_leave == 1)
				this.all.is_consume = this.data.every(item => item.is_consume == 1)
			},
			toggleAllLeave(event) {
				if(event) {
					this.data.forEach(item => item.is_leave = 1)
				}else{
					this.data.forEach(item => item.is_leave = 0)
				}
			},
			toggleAllConsume(event) {
				if(event) {
					this.data.forEach(item => item.is_consume = 1)
				}else{
					this.data.forEach(item => item.is_consume = 0)
				}
			},
			toggle(event) {
				this.refreshAllStatus()
			},
			getAlreadyLeave() {
				this.$rest('student_leaves')
				.get({
					int_day: moment(this.date).format('YYYYMMDD'),
					pagesize: 1000,
					with: 'student'
				})
				.success(res => {
					res.list.forEach(item => {
						let student = item.student
						if(student) {
							this.data.push(this.buildItem(student,1))
						}
						this.refreshAllStatus()
					})
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
				return this
			},
			buildItem(student,leave) {
				let obj = {}
				
				obj.student_name = student.student_name
				obj.sid = student.sid
				obj.is_leave = leave
				obj.is_consume = 0
				obj.already = leave
				obj.remain_hours = student.student_lesson_remain_hours

				return obj
			}
		},
		computed: {
			title() {
				return util.sprintf('批量对%s当天所有的排课进行考勤登记',moment(this.date).format('YYYY~MM~DD'))
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					this.data.splice(0)
				}
			}
		}
	}
</script>