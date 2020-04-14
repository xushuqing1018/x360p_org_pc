<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="550">
		<Form :label-width="80">
			<Form-item label="储值方式" v-if="enable_debit_card">
				<RadioGroup v-model="info.debit_type" type="button">
					<Radio :label="1">直接储值</Radio>
					<Radio :label="2">购买储值卡</Radio>
				</RadioGroup>
			</Form-item>
			<template v-if="info.debit_type===2">
				<Form-item label="储值卡" >
					<Select 
						v-model="info.dc_id" 
						placeholder="请选择一张储值卡" 
						style="width: 350px;" 
						@on-change="selectDebitCard">
						<Option 
							v-for="item in debit_cards" 
							:value="item.dc_id">{{item.card_name}} (+{{item.amount}})</Option>
					</Select>
				</Form-item>
			</template>
			<Form-item label="储值金额">
				<InputNumber 
					v-model="info.amount" 
					:readonly="info.debit_type===2" 
					:min="0">
				</InputNumber> 元
			</Form-item>

			<Form-item label="赠送金额" v-if="info.debit_type===1">
				<InputNumber 
					v-model="info.present_amount" 
					:readonly="info.debit_type===2" 
					:min="0">
				</InputNumber> 元
			</Form-item>

			<fieldset class="section m-b-15">
				<legend class="title">储值协议</legend>
				<Row>
					<Col span="12">
						<Form-item label="开始日期">
							<DatePicker 
								:value="info.c_start_int_day"
								@on-change="cacu_expire_day($event)"
								>
							</DatePicker>
						</Form-item>
					</Col>
					<Col span="12">
						<Form-item label="截止日期">
							<DatePicker 
								:value="info.expire_int_day"
								@on-change="info.expire_int_day = $event"
								>
							</DatePicker>
						</Form-item>
					</Col>
				</Row>
			</fieldset>
			<Form-item label="缴费日期">
				<DatePicker 
					:value="info.buy_int_day"
					@on-change="info.buy_int_day = $event"
					>
				</DatePicker>
			</Form-item>
			<Form-item label="收款账号" :class="{'mb-0':info._aa_ids.length > 0}">
				<Select v-model="info._aa_ids" multiple placeholder="请选择收款账号" @on-change="selectAccountMulti">
		            <Option v-for="(item,index) in aa_list" :value="item.aa_id" :key="index">{{item._name}}</Option>
		        </Select>
		        <p v-for="(item,index) in aa_list" v-if="info._aa_ids.indexOf(item.aa_id) > -1" class="mt-2">
		        	<label>{{item._name}}：</label>
		        	<InputNumber v-model="item.amount" :min="0"></InputNumber>
		        	<span>元</span>
		        </p>
			</Form-item>
			<Form-item label="备注">
				<Input v-model="info.remark" size="small"></Input>
			</Form-item>
			<Form-item label="收费类型">
				<Select v-model="info.consume_type">
					<Option :value="1">新报</Option>
					<Option :value="2">续报</Option>
				</Select>
			</Form-item>
			<Form-item label="业绩归属">
				<template>
					<Tag closable @on-close="del_sale_role(index)" v-for="(item,index) in info.salesman" :key="index">
						{{item.eid|ename}}
						 - {{labelDicts(item['sale_role_did'],'sale_role')}}								
					</Tag>
					<select-employee style="width:auto;line-height: inherit;" :did="1" :limit-per="false" @onChange="add_sale_role">
						<span class="text-info" style="cursor:pointer" title="添加"><Icon type="plus"></Icon></span>
					</select-employee>
				</template>
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
	import util,{_} from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import modal from '@/libs/modal.mixin' 
	import common from '@/libs/common.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	const emptyObj = {
		dc_id: 0,
		debit_type: 2,
		amount: 0,
		present_amount: 0,
		buy_int_day: moment().format('YYYY-MM-DD'),
		c_start_int_day:moment().format('YYYY-MM-DD'),
		expire_int_day: '',
		remark:'',
		_aa_ids: [],
		payment: [],
		salesman:[],
		consume_type: 1
	}

	export default {
		mixins: [modal,common,globals],
		components: {
			SelectEmployee
		},
		
		data() {
			return {
				debit_cards: [],
				sid: 0,
				salesman:[],
				student:null,
				info: util.copy(emptyObj),
				options: {
					disabledDate (date) {
                        return date && date.valueOf() < Date.now() - 86400000
                    }
				},
				aa_list: []
			}
		},
		computed:{
			default_pre_charge_month(){
				return this.$store.state.gvars.configs.params.student_signup.precharge_contract_month
			}
		},
		mounted() {
			this.init_info()
			this.deal_aa_list()
		},
		methods: {
			init_info(){
				if(this.enable_debit_card){
					this.info.debit_type = 2
				}else{
					this.info.debit_type = 1
				}
				let default_month = this.default_pre_charge_month
				this.info.expire_int_day = moment().add(default_month,'months').format('YYYY-MM-DD')
				this.get_money_history()
			},
			onModalOpen(){
				this.get_debit_cards()
				this.init_salesman()
			},
			selectAccountMulti(aa_ids) {
				for(let i =0,len=aa_ids.length;i<len;i++) {
					if(i == len-1) {
						this.aa_list.find(a => a.aa_id == aa_ids[i]).amount = this.info.amount
					}else{
						this.aa_list.find(a => a.aa_id == aa_ids[i]).amount = 0
					}
				}
				this.setHideAccountAmount(aa_ids)
			},
			setHideAccountAmount(ids) {
				this.aa_list.forEach(item => {
					let index = ids.indexOf(item.aa_id)
					if(index === -1) {
						item.amount = 0
					}
				})
			},
			init_salesman(){
				if(this.salesman.length > 0){
					this.salesman.forEach(item=>{
						this.info.salesman.push(util.copy(item))
					})
				}
			},
			add_sale_role (item) {
				if(this.info.salesman.find(d=>d.eid==item.eid)){
					this.$Message.error('请不要重复添加')
					return false
				}
				let obj = util.copy(item)
				this.info.salesman.push({
					eid: obj.eid,
					sale_role_did: obj.sale_role_did
				})
			},
			del_sale_role(index) {
				this.info.salesman.splice(index,1)
			},
			deal_aa_list(){
				let bid = this.bid$
				this.accounts$.forEach(item => {
					let is_valid_account = false
					let is_default_account = false
					let account_type = 'others'
					if(_.isEmpty(item.bids)){
						if(item.is_public == 1 && item.is_front == 1){
							is_valid_account = true
							if(item.type == 0 && item.is_default == 1){
								is_default_account = true
							}
						}
					}else{
						if(item.bids.indexOf(bid) !== -1 && item.is_front == 1){
							is_valid_account = true
						}
					}

					if(is_valid_account){
						if(is_default_account){
							account_type = 'default'
						}
						this.aa_list.push(
							this.create_account_item(item,account_type)
						)
					}
				})	
			},
			// 创建收款账户数据结构
			create_account_item(account,type) {
				let item = {}

				item.aa_id  = parseInt(account.aa_id)
				item._name   = account.name
				item.amount   = 0
				
				return item
			},
			selectDebitCard(v) {
				let debit = this.debit_cards.find(item => item.dc_id === v)
				if(debit) {
					this.info.amount = Number(debit.amount)
					this.info.expire_int_day = moment(this.info.c_start_int_day).add(debit.expire_days,'days').format('YYYY-MM-DD')
				}
			},
			cacu_expire_day($event){
				this.info.c_start_int_day = $event
				if(this.info.dc_id > 0){
					this.selectDebitCard(this.info.dc_id)
				}else{
					this.info.expire_int_day = moment(this.info.c_start_int_day).add(this.default_pre_charge_month,'months').format('YYYY-MM-DD')
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
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			get_money_history() {
				this.$rest('student_money_historys')
				.get({
					sid: this.sid
				})
				.success(res => {
					if(res.list.filter(i=>i.business_type==3).length > 0) {
						this.info.consume_type = 2
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			ok() {
				if(this.info.debit_type === 2) {
					if(this.info.dc_id === 0) {
						this.$Message.error('请选择一张储值卡')
						return
					}
				}else{
					if(this.info.amount === 0) {
						this.$Message.error('储值金额不能为0')
						return
					}
				}
				if(this.info._aa_ids.length == 0){
					if(/^\s*$/.test(this.info.remark)){
						this.$Message.error('未选择收款账号，请必须注明原因!')
						return
					}
					if(!confirm('您没有选择收款账号，储值操作将不会产生关联的财务流水记录，您确定吗？')){
						return
					}
				}
				let total = 0
				this.info.payment = this.aa_list.filter(item => item.amount > 0)
				this.info.payment.forEach(item => {
					total = util.add(item.amount,total)
				})
				if(total != this.info.amount
					&& this.info.payment.length > 0
					) {
					this.$Message.error('收款账户总金额不等于储值金额')
					return
				}
				this.$rest('students')
				.add_url_param(this.sid,'money')
				.post(this.info)
				.success(res => {
					this.$Message.success('储值成功')
					this.$emit('success',res)
					this.close()
					
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>