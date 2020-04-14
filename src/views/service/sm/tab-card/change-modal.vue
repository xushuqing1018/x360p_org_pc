<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="550">
		<Form :label-width="100" :model="info">
			<Form-item label="会员卡" class="mb-2">
				<span>{{info.card_name}}</span>
			</Form-item>
			<Form-item label="余额类型" class="mb-2">
				<RadioGroup v-model="info.btype" type="button">
					<Radio :label="0" v-if="btype==0||btype==-1">余额</Radio>
					<Radio :label="1" v-if="btype==1||btype==-1">积分</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="操作类型" class="mb-2">
				<RadioGroup v-model="info.op_type" type="button">
					<Radio :label="1">储值</Radio>
					<Radio :label="4">扣除</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="操作数值" prop="amount" class="ivu-form-item-required mb-2">
				<InputNumber v-model="info.amount" :min="0" style="width: 187px"></InputNumber>
			</Form-item>
			<Form-item label="操作日" prop="op_int_day" class="mb-2">
				<DatePicker :value="info.op_int_day" @on-change="info.op_int_day=$event"></DatePicker>
			</Form-item>
			<Form-item label="操作员工" prop="activate_end_time" class="mb-2">
				<select-employee v-model="info.op_eid" clearable></select-employee>
			</Form-item>
			<Form-item label="备注" prop="remark" class="mb-2">
				<Input v-model="info.remark" placeholder="请输入备注"></Input>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee'

	const emptyObject = {
		uc_id: 0,
		btype: 0,
		amount: 0,
		op_type:1,
		op_int_day:'',
		remark:'',
		op_eid:0
	}
	export default {
		mixins: [modal,common,globals],
		components: {
			SelectEmployee
		},
		props: {
			btype: {
				type: Number,
				default: -1
			},
			extra: {
				type: Object,
				default:()=>{
					return {
						uc_id: 0,
						btype: 0,
						card_name: '',
						op_eid: 0,
						op_int_day: ''
					}
				}
			}
		},
		data() {
			return {
				info: util.copy(emptyObject)
			}
		},
		mounted() {
			this.info = Object.assign({},this.info,this.extra)
		},
		methods: {
			ok () {
				if(this.info.amount == 0){
					this.$Message.error('操作数值不能为0')
					return
				}
				let doaction = this.info.btype==0?'dobalance':'dobonus'
				this.$rest('user_cards').add_url_param(this.info.uc_id,doaction)
				.post(this.info)
				.success(data=>{
					this.$Message.success('操作成功')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message)
				})
			}
		}
	}
</script>