<template>
    <Modal v-drag-modal :mask-closabled="false" v-model="modal$.show" :title="modal$.title" :width="450">
        <Form ref="form" :model="info" :rules="rules_channel" :label-width="120">
            <Form-item label="选择要推送的外教" prop="eids">
                <select-employee :rid='1' v-model="info.eids" clearable></select-employee>
            </Form-item>
            <Form-item label="推送时间" prop="int_hour">
                <TimePicker type="time" placeholder="选择推送时间" v-model="info.int_hour" format="HH:mm"></TimePicker>
            </Form-item>
        </Form>
        <div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
            <Button type="primary" @click="ok" :loading="saving">确定</Button>
        </div>
    </Modal>
</template>

<script>
	import moment from 'moment'
	import util from  '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import selectEmployee from 'c%/SelectEmployee.vue'

	
	export default {
		mixins: [ common, modal ],
		props: {
		},
		components: {
            selectEmployee
        },
		data () {
            var emptyObject = {
                eids: [],
                int_hour: moment().format("HH:mm")
            };
			return {
                info: util.copy(emptyObject),
                rules_channel: {
					int_hour: [
						{ required: true, message: '请选择推送时间', trigger: 'change' }
                    ]
				},
			}
		},
		methods: {	
			ok () {
				this.$form('form').check().then(()=>{
					let action = this.modal$.action,
						[method,uri,msg] = ['post','ft_review_remind_plans','推送成功'];
                    
					this.$rest(uri)[method](this.info)
					.success(data=>{
						this.$Message.success(msg)
						this.$emit('on-success')
						this.close()
					}).error(body=>{
						this.$Notice.error({
							title: '失败',
							desc: body.message||'推送失败'
						})
					})
					
				})
				
			},
		}
	}
</script>

<style>
</style>