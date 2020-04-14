<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="700">
		<div class="ivu-table-wrapper">
			<table class="table-list" v-loading.like="'order_items'">
				<thead>
					<tr>
						<th><div class="ivu-table-cell">课程</div></th>
						<th><div class="ivu-table-cell">类型</div></th>
						<th><div class="ivu-table-cell">班级</div></th>
						<th><div class="ivu-table-cell">操作</div></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in data">
						<td><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
						<td><div class="ivu-table-cell">{{item.student_lesson.lesson_type|lesson_type}}</div></td>
						<td><div class="ivu-table-cell">
							<span v-if="!item.$assign">{{getClass(item)}}</span>
							<select-class 
								v-else
								clearbale
								v-model="item.new_cid" 
								disabled-temp
								:is-demo="1"
								:url="'search/classes?lid='+item.student_lesson.lid" 
								placeholder="请选择班级"
								@selected="selectClass"
								style="width:150px">
							</select-class>
						</div></td>
						<td>
							<div class="ivu-table-cell">
								<template v-if="!item.$assign">
									<Button 
										type="ghost" 
										 v-if="!item.student_lesson.one_class"
										@click="item.$assign=!item.$assign">分班
									</Button>
									<Poptip
								        confirm
								        title="确定退班吗？"
								        @on-ok="undoAssign(item)"
								        v-else>
								        <Button type="ghost">退班</Button>
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
	import SelectClass from 'c%/SelectClass.vue'
	export default {
		mixins: [modal,grid,common,globals],
		components: {SelectClass},
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
						if(item.student_lesson&&item.student_lesson.lesson_type==0) {
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
			selectClass(selected) {
				if(selected.student_nums >= selected.plan_student_nums) {
					this.$Message.error(selected.class_name+'已满，请选择其他班级')
				}
			},
			save(item) {
				if(!item.new_cid) {
					this.$Message.error('请选择班级')
					return false
				}
				let post_data = [{oi_id: item.oi_id,cid: item.new_cid}]
				this.$rest('order_items/do_assign')
				.post({data:post_data})
				.success(res => {
					this.$Message.success('分班成功')
					this.$emit('on-success')
					this.get_data()
					this.refreshClassStudent(item.new_cid)
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			undoAssign(item) {
				this.$rest('classes').add_url_param(item.student_lesson.cid,'students')
				.delete(item.sid)
				.success(res => {
					this.$Message.success('退班成功')
					this.$emit('on-success')
					this.get_data()
					this.refreshClassStudent(item.item.student_lesson.cid)
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			getClass(item) {
				let oc = item.student_lesson.one_class
				if(oc) {
					return oc.class_name
				}else{
					return '-'
				}
			},
			refreshClassStudent(cid) {
				this.dr().refreshData('classes/'+ cid + '/students?with=student_lesson')
			}
		}
	}
</script>