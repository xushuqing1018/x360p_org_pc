<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="700">
		<div class="ivu-table-wrapper">
			<table class="table-list" v-loading.like="'order_items'">
				<thead>
					<tr>
						<th><div class="ivu-table-cell">课程</div></th>
						<th><div class="ivu-table-cell">类型</div></th>
						<th><div class="ivu-table-cell">学管师</div></th>
						<th><div class="ivu-table-cell">操作</div></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in data">
						<td><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
						<td><div class="ivu-table-cell">{{item.student_lesson.lesson_type|lesson_type}}</div></td>
						<td><div class="ivu-table-cell">
							<span v-if="!item.$assign">{{getTeacher(item)}}</span>
							<select-employee 
								v-else
								clearbale
								:rid="4"
								v-model="item.new_eid" 
								placeholder="请选择学管师"
								style="display:inline-block;width:150px">
							</select-employee>
						</div></td>
						<td>
							<div class="ivu-table-cell">
								<template v-if="!item.$assign">
									<Button 
										type="ghost" 
										 v-if="!item.student_lesson.employee_student"
										@click="item.$assign=!item.$assign">分配学管师
									</Button>
									<Poptip
								        confirm
								        title="确定撤销学管师吗？"
								        @on-ok="undoAssign(item)"
								        v-else>
								        <Button type="ghost">撤销学管师</Button>
								    </Poptip>
								</template>
								<template v-else>
									<ButtonGroup>
										<Button type="primary" size="small" @click="save(item)" :disabled="saving">确定</Button>
								        <Button size="small" @click="item.$assign=!item.$assign" :disabled="saving">取消</Button>
									</ButtonGroup>
								</template>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	export default {
		mixins: [modal,grid,common,globals],
		components: {SelectEmployee},
		data() {
			return {
				rest_api: '',
				oid: 0
			}
		},	
		methods: {
			get_data() {
				this.data.splice(0,this.data.length)
				this.rest_api = util.sprintf('orders/%s/order_items',this.oid)
				this.$rest(this.rest_api).get()
				.success(res => {
					res.forEach(item => {
						if(item.student_lesson&&item.student_lesson.lesson_type>0) {
							item.$assign = false
							this.data.push(item)
						}
					})
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
				return this
			},
			save(item) {
				if(!item.new_eid) {
					this.$Message.error('请选择学管师')
					return false
				}
				this.$rest('student_lessons').add_url_param(item.sl_id,'employee_student')
				.post({eid:item.new_eid,sid:item.sid})
				.success(res => {
					this.$Message.success('分配成功')
					this.$emit('on-success')
					this.get_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			undoAssign(item) {
				this.$rest('student_lessons').add_url_param(item.sl_id,'employee_student')
				.delete(item.sid)
				.success(res => {
					this.$Message.success('撤销成功')
					this.$emit('on-success')
					this.get_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			getTeacher(item) {
				let es = item.student_lesson.employee_student
				if(es) {
					return this.$filter('ename')(es.eid)
				}else{
					return '-'
				}
			}
		}
	}
</script>