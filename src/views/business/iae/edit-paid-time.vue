<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<Form ref="form" :model="info" :label-width="80">
			<Form-item label="缴费日期" class="custom-form-item-required">
                <DatePicker type="date" v-model="info.paid_time" placeholder="选择缴费日期" style="width: 200px"></DatePicker>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
    import moment from 'moment'
    
	export default {
		mixins: [modal,common],
		data() {
			return {
				info: {}
			}
		},
		methods: {
			ok() {
				if(!this.info.paid_time) {
					this.$Message.error('缴费日期不能为空')
					return
                }
                this.info.paid_time = moment(this.info.paid_time).format('YYYY-MM-DD');
                this.$rest('order_receipt_bills').add_url_param(this.info.orb_id)
                .add_url_param('paid_time')
				.post(this.info)
				.success(res => {
					this.$Message.success('修改缴费日期成功')
					this.$emit('success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>