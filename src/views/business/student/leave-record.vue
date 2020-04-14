<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="700">
		<table class="table-list">
			<thead>
				<th><div class="ivu-table-cell">休学日期</div></th>
				<th><div class="ivu-table-cell">复学日期</div></th>
				<th><div class="ivu-table-cell">休学原因</div></th>
				<th><div class="ivu-table-cell">操作</div></th>
			</thead>
			<tr v-for="item in list">
				<td><div class="ivu-table-cell">{{item.stop_int_day|int_date}}</div></td>
				<td><div class="ivu-table-cell">{{item.recover_int_day|int_date}}</div></td>
				<td><div class="ivu-table-cell">{{item.stop_remark}}</div></td>	
				<th>
					<div class="ivu-table-cell">
						<Button type="ghost" shape="circle" title="撤销" size="small" icon="reply" @click="del(item)"></Button>
					</div>
				</th>
			</tr>
		</table>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	export default{
		mixins: [common,globals,modal],
		data () {
			return {				
				list: [],
				name: ''		
			}
		},
		methods: {
			del (item) {
				this.confirm(util.sprintf('确定将【%s】撤销休学吗？',this.name))
				.then(() => {
					this.$rest('student_lesson_stops')
					.delete(this.list[0].sls_id)
					.success(response => {
						this.$Message.success('撤销成功')
						this.$emit('on-success',{sid:this.list[0].sid,name:this.name})
						this.close()
					})
					.error(response => {
						this.error(response.body.message)
					})
				})
			}
		},
		watch: {
			'modal$.show': function(val) {
				if(val) {
					setTimeout(() => {
						this.$Message.info('该同学已有休学记录，如果要修改请先撤销')
					},500)
				}
			}
		}
	}
</script>
