<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="550">
		<Alert show-icon>每个学员的钱包余额只能兑换一次储值卡</Alert>
		<Form :label-width="80">
			<Form-item label="储值卡">
				<Select 
					v-model="info.dc_id" 
					placeholder="请选择一张储值卡" 
					style="width: 350px;" 
					@on-change="selectDebitCard">
					<Option 
						v-for="item in debit_cards" 
						:value="item.dc_id">{{item.card_name}} (+{{item.amount}})</Option>
				</Select> 
				<span 
					style="color:#f30" 
					v-if="info.amount>student.money&&info.dc_id>0"
					>
					<Icon type="close"></Icon>余额不足
				</span>
			</Form-item>
			<Form-item label="有效期至">
				<DatePicker 
					:value="info.expire_int_day"
					:options="options"
					@on-change="info.expire_int_day = $event"
					clearable
					>
				</DatePicker> (不填则不限制)
			</Form-item>
		</Form> 
		<div slot="footer">
			<Button type="ghost" @click="close" :disabled="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin' 
	import common from '@/libs/common.mixin'

	const emptyObj = {
		dc_id: 0,
		amount: 0,
		expire_int_day: '',
	}

	export default {
		mixins: [modal,common],
		props: {
			student: {
				type: Object,
				default() {
					return {}
				}
			}
		},
		data() {
			return {
				debit_cards: [],
				info: util.copy(emptyObj),
				options: {
					disabledDate (date) {
                        return date && date.valueOf() < Date.now() - 86400000
                    }
				}
			}
		},
		methods: {
			onModalOpen(){
				this.get_debit_cards()
			},
			selectDebitCard(v) {
				let debit = this.debit_cards.find(item => item.dc_id === v)
				if(debit) {
					this.info.amount = Number(debit.amount)
					this.info.expire_int_day = moment().add(debit.expire_days,'days').format('YYYY-MM-DD')
				}
			},
			get_debit_cards() {
				this.$rest('debit_cards')
				.get({
					bid: this.bid$,
					pagesize: 1000
				})
				.success(res => {
					this.debit_cards = res.list
					this.auto_select_dc()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			auto_select_dc(){
				this.debit_cards = this.orderBy(this.debit_cards,'amount',-1)
				for(let i=0,len=this.debit_cards.length;i<len;i++){
					if(util.float(this.student.money) >= util.float(this.debit_cards[i].amount)) {
						this.info.dc_id = this.debit_cards[i].dc_id
						this.selectDebitCard(this.info.dc_id)
						break;
					}
				}
			},
			ok() {
				if(this.info.dc_id === 0) {
					this.$Message.error('请选择一张储值卡')
					return;
				}
				if(this.info.amount > this.student.money) {
					this.$Message.error('该学员钱包余额小于储值卡面额')
					return;
				}
				this.$rest('students')
				.add_url_param(this.student.sid,'dochangedc')
				.post(this.info)
				.success(res => {
					this.$Message.success('兑换成功')
					this.$emit('success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>