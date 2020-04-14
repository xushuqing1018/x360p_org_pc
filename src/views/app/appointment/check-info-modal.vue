<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="400">
		<Form ref="form" :model="info" :label-width="80">
			<Form-item label="审核状态" prop="title">
				<RadioGroup v-model="info.check_status" type="button">
                    <Radio :label="1">通过</Radio>
                    <Radio :label="2">驳回</Radio>
                </RadioGroup>
			</Form-item>
            <Form-item label="驳回原因" prop="desc" v-if="info.check_status == 2">
				<Input v-model="info.reject_reason" type="textarea" placeholder="请输入" :autosize="{minRows:3,maxRows:3}"></Input>
			</Form-item>
		</Form> 
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin' 
    import common from '@/libs/common.mixin'

	export default {
        mixins: [modal,common],
        props:{
            astu_id:{
                type:Number,
                default:0
            }
        },
		data() {
			return {
				info: {
                    check_status:1,
                    reject_reason:''
                }
			}
		},
		methods: {
			ok() {
                if(this.info.check_status == 2 && this.info.reject_reason == '') {
					this.$Message.error('请填写驳回原因')
					return
                }

                if(this.info.check_status == 1){
                    this.info.reject_reason == ''
                }
				
                this.$rest('appointment_students/' + this.astu_id + '/check')
                .post(this.info)
				.success(response=>{
                    this.$Message.success('审核成功')
                    this.$emit('on-success')
                    this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~')
				})
			}
		}
	}
</script>