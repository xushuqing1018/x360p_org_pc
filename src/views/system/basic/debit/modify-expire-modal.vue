<template>
	<Modal v-drag-modal :mask-closable="false" width="480" v-model="modal$.show" :title="modal$.title">
		<Form :label-width="120" ref="form">
    		<Form-item label="当前有效期">
    			<span v-if="info.expire_int_day">{{info.expire_int_day|int_date}}</span>
    			<span v-else>不限制</span>
    		</Form-item>
    		<Form-item label="修改后有效期">
                <DatePicker
					type="date"
			        :value="new_day"
			        @on-change="new_day = $event"
			        >
			    </DatePicker>
			    <span>(不填则不限制)</span>                  
            </Form-item>
    	</Form>
    	<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
            <Button type="primary" :loading="saving" @click="save">确定</Button>
        </div>
    </Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [common,modal,globals],
		props: {
			info: Object
		},
		data () {
			return {
				new_day: '',
			}
		},
		methods: {
			save() {
				this.$rest('student_debit_cards')
				.put({
					sdc_id:this.info.sdc_id,
					expire_int_day:this.new_day
				})
				.success(response => {
					this.$emit('save')
					this.$Message.success('修改成功')
					this.close()
				})
				.error(response => {
					this.error(response.body.message)
				})
			}
		}
	}
</script>