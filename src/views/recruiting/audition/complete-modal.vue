<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false">
		
		<Form :label-width="80">
			<Form-item label="是否到校">
				<RadioGroup v-model="info.is_arrive" type="button">
					<Radio :label="1">已到</Radio>
					<Radio :label="0">未到</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="试听状态" v-if="info.is_arrive == 1">
				<RadioGroup v-model="info.attendance_status" type="button">
					<Radio :label="1">已试听</Radio>
					<Radio :label="0">未试听</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="备注">
				<Input v-model="info.remark" placeholder="请输入备注"></Input>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	const emptyObject = {		
		is_arrive: 1,
		attendance_status: 1,
		remark: ''
	}	
	
	export default{
		mixins: [ common, modal ],
		data () {
			return {
				id: 0,
				info: util.copy(emptyObject)
			}
		},
		watch: {
			'info.is_arrive': function (val) {
				if(val == 0){
					this.info.attendance_status = 0
				}
			}
		},
		methods: {
			ok () {
				let params = util.copy(this.info)				
				
				this.$rest(`trial_listen_arranges/${this.id}`)
				.put(params)
				.success(data=>{
					this.$Message.success('登记成功！')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'登记失败~')
				})
			}
		}
	}
</script>

<style>
</style>