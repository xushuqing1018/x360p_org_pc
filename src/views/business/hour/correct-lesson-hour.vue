<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="800">
		<div class="student-lesson">
			<p>课消日期:{{info.int_day|int_date}} {{info.int_start_hour|int_hour}} ~ {{info.int_end_hour}}</p>
			<p v-if="info.lid>0">课消课程:{{info.lid|lesson_name('-')}}</p>
			<p v-if="info.cid>0 && info.cls">课消班级:{{info.cls.class_name}}</p>
			<p v-if="info.sj_id>0">课消科目:{{info.sj_id|subject_name}}</p>
			<table class="table-list">
				<thead>
					<tr>
						<th></th>
						<th>适用课程</th>
						<th>适用科目</th>
						<th>购买日期</th>
						<th>有效期</th>
						<th>剩余课时</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><div class="ivu-table-cell">原扣课课时</div></td>
						<td>
							<div class="ivu-table-cell">
								<span>{{info.student_lesson.lid|lesson_name('-')}}</span>
							</div>
						</td>
						<td><div class="ivu-table-cell">{{info.student_lesson.sj_ids|sj_ids_text}}</div></td>
						<td><div class="ivu-table-cell">{{info.student_lesson.start_int_day|int_date}}</div></td>
						<td><div class="ivu-table-cell">{{info.student_lesson.expire_time_text}}</div></td>
						<td><div class="ivu-table-cell">{{info.student_lesson.remain_lesson_hours}}</div></td>
						<td></td>
					</tr>
					<tr v-for="(item,index) in data" :key="index" @click="changeSelect(item)">
						<td>
							<div class="ivu-table-cell"><span v-if="index==0">修改为</span></div>
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
						<td colspan="6"><div class="text-center">没有其他课时记录</div></td>
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
				data: [],
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
					let ret = []
					res.list.forEach(l => {
						if(l.sl_id!==this.info.sl_id) {
							l.selected$ = false
							ret.push(l)
						}
					})
					this.data = ret
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			changeSelect(item) {
				this.data.forEach(d => {
					this.$set(d,'selected$',false)
				})
				this.$set(item,'selected$',true)
				this.sl_id = item.sl_id
			},
			ok() {
				if(this.data.length==0) {
					this.$Message.error('没有其他的课时记录，不能修正')
					return
				}
				if(this.sl_id==0) {
					this.$Message.error('请选择修正到哪个课时记录')
					return
				}
				this.$rest('student_lesson_hours').add_url_param('change_sl')
				.post({
					slh_id: this.info.slh_id,
					sl_id: this.sl_id
				})
				.success(res => {
					this.$Message.success('修正成功')
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