<template>
	<Modal v-drag-modal :mask-closable="false" width="480" v-model="modal$.show" :title="modal$.title">
		<template v-if="modal$.show">
        	<Form :label-width="120" ref="form">
        		<Form-item label="当前到期日">
        			<span>{{info.expire_day|int_date}}</span>
        		</Form-item>
        		<Form-item label="续费延期到" class="custom-form-item-required">
                    <DatePicker
						type="date"
				        :value="format_day(new_day)"
				        @on-change="new_day = $event"
				        >
				    </DatePicker>                   
                </Form-item>
        	</Form>
        </template>
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
		data () {
			return {
				info: {},
				new_day: '',
			}
		},
		methods: {
			save() {
				if(this.new_day === '')  {
					this.$Message.error('日期不能为空')
					return false
				}
				if(this.info.expire_day!==0) {
					let last_date = this.$filter('int_date')(this.info.expire_day)
					let minus = Date.parse(this.new_day) - Date.parse(last_date)
					if(minus<=0) {
						this.$Message.error('所选日期小于当前到期时间，请重新选择')
						return false
					}
				}
				this.$rest('orgs').add_url_param(this.info.og_id,'renew')
				.post({new_day:this.new_day})
				.success(response => {
					this.$emit('save')
					this.$Message.success('续费成功')
					this.close()
				})
				.error(response => {
					this.error(response.body.message)
				})
			}
		}
	}
</script>