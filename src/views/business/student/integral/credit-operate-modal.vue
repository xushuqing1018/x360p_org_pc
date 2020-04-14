<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="500">		
		<Form :label-width="70" :model="info">
			<Form-item label="学员">
				<Input v-model="student_names" readonly></Input>
			</Form-item>
			<Form-item label="规则">
				<select-credit-rule 
					clearable
					v-model="info.cru_id" 
					@selected="selectRule"
					@on-clear="clearRule">
				</select-credit-rule>
			</Form-item>
			<Form-item label="类型">
				<RadioGroup v-model="info.cate" type="button">
					<Radio :label="1" v-show="info.cru_id==0||current_rule.cate==1">学习积分</Radio>
					<Radio :label="2" v-show="info.cru_id==0||current_rule.cate==2">消费积分</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="加/减分">
				<RadioGroup v-model="info.type" type="button" >
			        <Radio :label="1" v-show="info.cru_id==0||current_rule.type==1">加分</Radio>
			        <Radio :label="2" v-show="info.cru_id==0||current_rule.type==2">减分</Radio>
			    </RadioGroup>
			</Form-item>
			<Form-item label="积分">
				<InputNumber 
					v-model="info.credit" 
					:min="0" 
					:disabled="info.cru_id>0&&current_rule.credit>0">
				</InputNumber>
			</Form-item>
			
			<Form-item label="备注">
				<Input v-model="info.remark" placeholder="请输入备注"></Input>
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
	import SelectCreditRule from 'c%/SelectCreditRule.vue'

	const emptyObject = {
		cru_id: 0,
		credit: 1,
		remark: '',
		cate: 1,  //1：学习积分，2：消费积分
		type: 1,  //1：增加，2：减少
		op_type: 1 //1：手动操作  
	}
	export default {
		mixins: [modal],
		components: {
			SelectCreditRule
		},
		data() {
			return {
				sids: [],
				students: [],
				current_rule: {},
				info: util.copy(emptyObject)
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					this.current_rule = {}
					this.info = util.copy(emptyObject)
				}
			}
		},
		computed: {
			student_names() {
				if(this.students.length > 3) {
					let copy = util.copy(this.students)
					copy.splice(3)
					return copy.join(',') + '等' + this.students.length + '个学员'
				}else{
					return this.students.join(',')
				}
			}
		},
		methods: {
			selectRule (data) {
				this.current_rule = data
				this.info.type = data.type
				this.info.cate = data.cate
				this.info.credit = util.float(data.credit)
			},
			clearRule () {
				this.info.type = 1
				this.info.cate = 1
				this.info.credit = 1
			},
			ok () {
				if(this.info.credit == 0) {
					this.$Message.error('积分不能为0')
					return false
				}
				let postData = []
				this.sids.forEach(sid => {
					let info = util.copy(this.info)
					postData.push(Object.assign(info,{sid:sid}))
				})
				this.$rest('student_credit_historys')
				.post(postData)
				.success(data=>{
					this.$Message.success('操作成功')
					this.$emit('on-success')
					this.close()				
				})
				.error(response=>{
					this.$Notice.error({
						title: '操作失败',
						desc: response.body.message||'操作失败'
					})
				})
			}
		}
	} 
</script>