<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<Form :label-width="80">
			<Form-item label="学员">
				{{students.join(',')}}
			</Form-item>
			<Form-item label="转换规则">
				<div>
					消费积分<InputNumber v-model="info.credit2" readonly></InputNumber>个
					<Button type="ghost" class="mx-2" size="small" icon="arrow-right-a">兑换</Button>
					学习积分<InputNumber v-model="info.credit" :min="0"></InputNumber>个
				</div>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="save" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	export default {
		mixins: [modal,common,globals],
		data() {
			return {
				info: {
					credit: 1,
					credit2: 1
				},
				sids: [],
				students: []
			}
		},
		methods: {
			save() {
				if(this.info.credit==0) {
					this.$Message.error('学习积分不能为0')
					return 
				}
				this.info.sids = this.sids
				this.$rest('student_credit_historys/credit_change')
				.post(this.info)
				.success(res => {
					this.$Message.success('转化成功')
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