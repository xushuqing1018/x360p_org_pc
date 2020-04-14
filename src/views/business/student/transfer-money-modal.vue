<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false">
				
		<Form :label-width="80" v-if="modal$.show">
			<Form-item label="学员">
				<avatar-and-name :name="student.student_name" :src="student.photo_url" :sex="student.sex"></avatar-and-name>
			</Form-item>
			<Form-item label="余额">
				<span>{{label_currency}}{{student.money}}</span>
			</Form-item>
			<Form-item label="转出金额">
				<InputNumber :min="0" :max="Number(student.money)" v-model="info.amount" placeholder="转出金额"></InputNumber>
			</Form-item>
			<Form-item label="收款学员">
				<select-student v-model="info.to_sid"></select-student>
			</Form-item>
			<Form-item label="备注">
				<Input v-model="info.remark" placeholder="请输入备注"></Input>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	import AvatarAndName from 'c%/AvatarAndName.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	
	const emptyObject = {
		from_sid: 0,
		to_sid: 0,
		amount: 0,
		remark: ''
	}
	
	export default{
		mixins: [ common, modal ],
		components:{
			SelectStudent,
			AvatarAndName
		},		
		props: {
			student:{
				type: Object,
				default: ()=>{
					return {}
				}
			}			
		},
		data () {
			return {
				info: util.copy(emptyObject)
			}
		},
		methods: {
			ok () {
				let params = util.copy(this.info)
				
				params.from_sid = this.student.sid
				
				if(params.amount == 0){
					this.$Message.error('转让金额必须大于0!')
					return
				}
				
				if(params.to_sid == 0) {
					this.$Message.error('请先选择收款学员!')
					return
				}
				
				if(params.to_sid == params.from_sid){
					this.$Message.error('收款学员与转出金额学员为同一人，请选择其他收款学员!')
					return
				}
				
				this.$rest(`students/${params.from_sid}/dotransmoney`)
				.post(params)
				.success(data=>{
					this.$Message.success('转让成功！')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'转让失败~')
				})
			}
		}
	}
	
</script>

<style>
</style>