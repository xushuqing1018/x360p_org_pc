<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="460" :mask-closable="false">
		<template v-if="modal$.show">
			<Form ref="form" :label-width="90" :model="info">						
				<Form-item label="名单姓名" prop="name">
					<span>{{info.name}}</span>
				</Form-item>
				<Form-item label="推荐人" prop="name">
					<span>{{info.recommend_student.student_name}}</span>
				</Form-item>
				<Form-item label="奖励发放" prop="sex">
					<RadioGroup v-model="info.is_reward" type="button">
						<Radio :label="0">待奖励</Radio>
						<Radio :label="1">已奖励</Radio>
					</RadioGroup>
				</Form-item>
				<Form-item label="推荐奖励备注" prop="recommend_reward_note">
					<Input v-model="info.recommend_reward_note" placeholder="请输入奖励方案,家长在手机端可以看到"></Input>
				</Form-item>
			</Form>
		</template>
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	import SelectBranch from 'c%/SelectBranch.vue'
	import SelectChannel from 'c%/SelectChannel.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	
	const emptyObject = {
		bid: 0,
		mc_id: 0,
		name: '',
		tel: '',
		email: '',
		sex: 0,
		birth_time: 0,
		grade: '',
		remark: '',
		is_valid: 0,
		assigned_eid: 0,
		recommend_reward_note: ''
	}
	
	export default{
		mixins: [ common, modal ],
		components: {
			SelectBranch,
			SelectChannel,
			SelectEmployee
		},
		data () {
			return {
				info: util.copy(emptyObject),
				mc_id: 0
			}
		},
		watch: {
			mc_id: function (val) {
				if(val){
					this.info.mc_id = val
				}
			},
			'modal$.show': function (val) {			
				if(!val){
					this.$form('form').reset()
				}	
			}
		},
		created () {
			if(this.modal$.action=='add'){
				this.info.bid = this.bid$				
			}
		},
		methods: {
			timeChange (val) {
				this.info.birth_time = val
			},
			toDecimal (val) {
				val = val||0
				return parseFloat(val)
			},
			ok () {
							
				let put = {}
				put.mcl_id = this.info.mcl_id
				put.is_reward = this.info.is_reward
				put.recommend_reward_note = this.info.recommend_reward_note
				
				this.$rest('market_clues').add_url_param(put.mcl_id)
				.put(put)
				.success(data=>{
					this.$Message.success('操作成功')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~','error')
				})
				
				
			}
		}
	}
	
</script>

<style>
</style>