<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<Alert show-icon v-if="data.length>1">以下项目归属于一个订单，默认选中当前项目。</Alert>
		<table class="referer-table">
			<tbody>
				<tr v-for="item in data">
					<td class="ivu-table-cell">
						<Checkbox v-model="item.select$" :disabled="item.oi_id==info.oi_id" class="mb-0"></Checkbox>
					</td>
					<td class="ivu-table-cell">
						{{item.item_name}}
					</td>
					<td class="ivu-table-cell">
						x {{Number(item.nums)}}
					</td>
					<td class="ivu-table-cell">
						<div class="text-success">
							<p v-if="item.referer_sid&&item.referer_student">
								转介绍学员：{{item.referer_student.student_name}}
							</p>
							<p v-if="item.referer_teacher_id">
								转介绍{{label_teacher}}：{{item.referer_teacher_id|ename}}
							</p>
							<p v-if="item.referer_eid">
								转介绍{{label_eduer}}：{{item.referer_eid|ename}}
							</p>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
		<div class="referer-person">
			<Alert show-icon>设置转介绍，请至少选择一个</Alert>
			<div class="referer">
				<label>转介绍学员：</label>
				<select-student 
					v-model="post.referer_sid" 
					clearable
					style="width: 200px;"
					>
				</select-student>
			</div>
			<div class="referer">
				<label>转介绍{{label_teacher}}：</label>
				<select-employee 
					v-model="post.referer_teacher_id" 
					clearable
					:rid="1" 
					style="width: 200px;"
					>
				</select-employee>
			</div>
			<div class="referer">
				<label>转介绍{{label_eduer}}：</label>
				<select-employee 
					v-model="post.referer_eid" 
					clearable
					:rid="4" 
					style="width: 200px;"
					>
				</select-employee>
			</div>
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
	import SelectStudent from 'c%/SelectStudent'
	import SelectEmployee from 'c%/SelectEmployee'

	export default {
		mixins: [modal,common,globals],
		components: {
			SelectEmployee,
			SelectStudent
		},
		props: {
			info: Object 
		},
		data() {
			return {
				data: [],
				post: {
					oi_ids: [],
					referer_sid: 0,
					referer_teacher_id: 0,
					referer_eid: 0
				}
			}
		},
		methods: {
			onModalOpen() {
				this.get_order_items()
			},
			get_order_items() {
				this.$rest('order_items')
				.get({
					oid: this.info.oid,
					with: 'student,referer_student'
				})
				.success(res => {
					let ret = []
					res.list.forEach(item => {
						item.select$ = true
					})
					this.data = res.list

				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			do_referer() {
				let ret = []
				this.data.forEach(d => {
					if(d.select$) {
						ret.push(d.oi_id)
					}
				})
				this.post.oi_ids = ret
				this.$rest('order_items/do_referer')
				.post(this.post)
				.success(res => {
					this.$Message.success('设置成功')
					this.$emit('on-success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			ok() {
				if(this.post.referer_sid==0
					&&this.post.referer_teacher_id==0
					&&this.post.referer_eid==0) 
				{
					this.confirm('你还没选择转介绍，将重置确定继续吗？')
					.then(() => {
						this.do_referer()
					})
				}else{
					this.do_referer()
				}
			}
		}
	}
</script>
<style lang="less">
	.referer-table {
		td {
			padding: 8px 10px;
		}
	}
	.referer-person {
		margin-top: 10px;
		.referer {
			margin:  12px 10px;
		}
	}
</style>