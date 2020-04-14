<template>
	<Modal v-model="modal$.show" v-drag-modal :title="modal$.title" :mask-closable="false" :width="600">
		<Form :label-width="80" v-if="modal$.show">
			<Form-item label="学员" prop="sid" class="ivu-form-item-required">
				<select-student v-model="info.sid" :disabled="sid>0" @on-selected="selectStudent"></select-student>
			</Form-item>
			<Form-item label="礼品" prop="cg_id" class="ivu-form-item-required">
	            <select-gift v-model="info.cg_id" :disabled="cgId>0" @on-selected="selectGift"></select-gift>
			</Form-item>
			<Form-item label="兑换数量" prop="nums" class="ivu-form-item-required">
				<InputNumber v-model="info.nums" :min="1" @on-change="changeNums"></InputNumber>
				<span v-if="info.sid">
					<span v-if="info.student_credit>=info.credit">学员积分:{{info.student_credit}}&nbsp;</span>
					<span class="text-danger" v-else>学员积分不足:{{info.student_credit}}&nbsp;</span>
				</span>
				<template v-if="info.cg_id">
					<span>礼品积分:{{info.gift_credit}}&nbsp;</span>
					<span>兑换所需积分:{{info.credit}}</span>
				</template>
			</Form-item>
			<Form-item label="兑换日期" prop="int_day" class="ivu-form-item-required">
				<DatePicker type="date" placeholder="请选择日期" :value="info.int_day" @on-change="info.int_day=$event"></DatePicker>
			</Form-item>
			<Form-item label="备注" prop="remark">
				<Input type="textarea" v-model="info.remark" placeholder="请输入备注" :autosize="{minRows:3,maxRows:3}"></Input>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Checkbox v-model="info.is_receive" class="pull-left" :true-value="1" :false-value="0">已发货</Checkbox>
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectGift from 'c%/SelectGift.vue'
	
	const emptyObject = {
		cg_id: [],
		nums: 1,
		int_day: moment(new Date()).format('YYYY-MM-DD'),
		sid: 0,
		remark: '',
		student_credit: 0,
		gift_credit: 0,
		credit: 0,
		is_receive: 1
	}
	
	export default{
		mixins: [ common, modal ],
		props: {
			sid: {
				type: Number,
				default: 0
			},
			cgId: {
				type: Number,
				default: 0
			},
			studentCredit: {
				type: Number,
				default: 0
			},
			giftCredit: {
				type: Number,
				default: 0
			}
		},
		components: {
			SelectGift,
			SelectStudent
		},
		data () {
			return {
				info: util.copy(emptyObject)
			}
		},
		methods: {
			onModalOpen() {
				this.info.sid = this.sid
				this.info.cg_id = this.cgId
				this.info.student_credit = this.studentCredit
				this.info.gift_credit = this.giftCredit
				this.info.credit = util.mul(this.info.gift_credit,this.info.nums)
			},
			selectStudent(selected) {
				this.info.student_credit = Number(selected.credit)
			},
			selectGift(selected) {
				this.info.gift_credit = Number(selected.credit)
				this.info.credit = util.mul(this.info.gift_credit,this.info.nums)
			},
			changeNums(v) {
				this.info.credit = util.mul(this.info.gift_credit,v)
			},
			ok () {
				if(this.info.cg_id == 0){
					this.$Message.error('请选择兑换的礼品')
					return
				}
				if(this.info.sid == 0){
					this.$Message.error('请选择兑换的学员')
					return
				}
				if(this.info.nums == 0){
					this.$Message.error('请选择兑换的数量')
					return
				}
				if(this.info.int_day == ''){
					this.$Message.error('请选择兑换日期')
					return
				}
				if(this.info.credit > this.info.student_credit) {
					this.$Message.error('学员积分不足')
					return
				}
				this.$rest('credit_orders')
				.post(this.info)
				.success(data=>{
					this.$Message.success('兑换成功')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message)
				})
			}
		}
	}
</script>

<style>
</style>