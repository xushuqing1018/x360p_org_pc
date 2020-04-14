<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="800">
		<div class="student-lesson">
			<p>请假日期:{{info.int_day|int_date}} {{info.int_start_hour|int_hour}} ~ {{info.int_end_hour}}</p>
			<p>关联课时ID:{{info.sl_id}}</p>
           
			<p><strong>修改为:</strong></p>
			<table class="table-list">
				<thead>
					<tr>
						<th>课时ID</th>
						<th>适用课程</th>
						<th>适用科目</th>
						<th>购买日期</th>
						<th>有效期</th>
						<th>剩余课时</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr 
                    v-for="(item,index) in data" 
                    :key="index" 
                    @click="changeSelect(item)"
                    >
                        <td>
                            <div class="ivu-table-cell">
								<span>{{item.sl_id}}</span>
							</div>
                        </td>
						<td>
							<div class="ivu-table-cell">
								<span>{{item.lid|lesson_name('-')}}</span>
							</div>
						</td>
						<td><div class="ivu-table-cell">{{item.sj_ids|sj_ids_text}}</div></td>
						<td><div class="ivu-table-cell">{{item.start_int_day|int_date}}</div></td>
						<td><div class="ivu-table-cell">{{item.expire_time_text}}</div></td>
						<td><div class="ivu-table-cell">{{item.remain_lesson_hours}}</div></td>
						<td>
							<div class="ivu-table-cell">
								<Radio v-model="item.selected$"></Radio>
							</div>
						</td>
					</tr>
					<tr v-if="data.length==0">
						<td colspan="7"><div class="text-center">没有其他课时记录</div></td>
					</tr>
				</tbody>
			</table>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [modal,common,globals],
		props: {
			info: Object
		},
		data() {
			return {
                data:[],
				sl_id: 0
			}
		},
		methods: {
			onModalOpen() {
				this.$rest('student_lessons')
				.get({
					sid: this.info.sid,
					with: 'one_class'
				})
				.success(res => {
					res.list.forEach(l => {
						if(l.sl_id!==this.info.sl_id) {
							l.selected$ = false
						}else{
                            l.selected$ = true
                        }
                    })
                    this.data = res.list
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			changeSelect(item) {
				this.sl_id = item.sl_id
			},
			ok() {
				if(this.sl_id==0) {
					this.$Message.error('请选择更改到哪个课时ID')
					return
				}
                this.$rest('student_leaves')
                .add_url_param(this.info.slv_id,'change_sl')
				.post({
					sl_id: this.sl_id
				})
				.success(res => {
					this.$Message.success('操作成功')
					this.$emit('on-success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>
<style scoped>
	th {
		padding: 12px !important;
	}
</style>