<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<table class="table-list">
			<thead>
				<!-- <th>
					<div class="ivu-table-cell">
						<Checkbox v-model="select_all" @on-change="toggleSelectAll"></Checkbox>
					</div>
				</th> -->
				<th><div class="ivu-table-cell">课程名称</div></th>
				<th><div class="ivu-table-cell">当前状态</div></th>
				<th><div class="ivu-table-cell">停课日期</div></th>
				<th><div class="ivu-table-cell">复课日期</div></th>
				<th><div class="ivu-table-cell">备注</div></th>
				<th><div class="ivu-table-cell">操作</div></th>
			</thead>
			<tr v-for="item in data">
				<!-- <td>
					<div class="ivu-table-cell">
						<Checkbox v-model="item.$select" :disabled="item.is_stop==1" @on-change="toggleSelect(item)"></Checkbox>
					</div>
				</td> -->
				<td width="180"><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
				<td><div class="ivu-table-cell">{{item.lesson_status|lesson_status}}<br>{{item.is_stop|stop_status}}</div></td>
				
				<td><div class="ivu-table-cell">{{item.stop_int_day|int_date}}</div></td>
				<td><div class="ivu-table-cell">{{item.recover_int_day|int_date}}</div></td>
				<td><div class="ivu-table-cell">{{item.stop_remark}}</div></td>	
				<td>
					<div class="ivu-table-cell" v-if="item.stop_int_day==0">
						<Button type="ghost" size="small" @click="stop(item)">停课</Button>
					</div>
					<div class="ivu-table-cell" v-else>
						<Button type="ghost" size="small" @click="edit(item)">编辑</Button>
						<Button type="ghost" size="small" @click="resume(item)">撤销</Button>
					</div>
				</td>
			</tr>
			<tr class="text-center" v-if="data.length==0">
				<td colspan="6"><div class="ivu-table-cell">没有数据</div></td>
			</tr>
		</table>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
		<stop-info ref="stop_info" @on-success="refresh"></stop-info>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import StopInfo from './stop-info.vue'
	
	export default{
		mixins: [common,globals,modal],
		components: {StopInfo},
		data () {
			return {				
				data: [],
				info: {}		
			}
		},
		methods: {
			stop (item) {
				this.$r('stop_info')
				.set('student',{
					sid:this.info.sid,
					student_name: this.info.student_name,
					sl_id:item.sl_id,
					lid:item.lid
				})
				.show(util.sprintf('停课【%s】',this.$filter('lesson_name')(item.lid)),'add')
			},
			edit (item) {
				this.$r('stop_info')
				.set('info',{
					stop_time:this.$filter('int_date')(item.stop_int_day),
					recover_time:this.$filter('int_date')(item.recover_int_day),
					stop_remark:item.stop_remark}
				)
				.set('student',{sid:this.info.sid,sl_id:item.sl_id})
				.show(util.sprintf('编辑停课【%s】',this.$filter('lesson_name')(item.lid)),'edit')
			},
			resume (item) {
				this.confirm(util.sprintf('确定将【%s】撤销停课吗？',this.$filter('lesson_name')(item.lid)))
				.then(() => {
					let params = [{sl_id:item.sl_id,stop_time:0}]
					this.$rest('students').add_url_param(this.info.sid,'dostop')
					.post({info:params})
					.success(response => {
						this.$Message.success('撤销成功')
						this.refresh()
					})
					.error(response => {
						this.error(response.body.message)
					})
				})
			},
			refresh () {
				this.$rest('students')
				.add_url_param(this.info.sid,'student_lessons')
				.get({
					is_stop:0
				})
				.success(response => {
					let data = []
					response.list.forEach(item => {
						if(item.lesson_status < 2) {
							data.push(item)
						}
					})
					this.data = data
					this.$emit('on-success')
				})
				.error(response => {
					this.$Message.error(response.body.message)
				})
			}
		},
		computed: {
			
		}
	}
</script>
