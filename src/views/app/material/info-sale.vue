<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :title="modal$.title" width="600">		
		<Form ref="form" :label-width="80" :model="info" :rules="rules">
			<fieldset class="section m-b-15">
				<legend class="title">顾客</legend>
				<Form-item label="姓名" prop="name">
					<Input v-model="info.name" placeholder="请输入" style="width: 250px"></Input>
				</Form-item>
				<Form-item label="电话" prop="mobile">
					<Input v-model="info.mobile" placeholder="请输入" style="width: 250px"></Input>
				</Form-item>
			</fieldset>
			<fieldset class="section m-b-15">
				<legend class="title">物品</legend>
				<Form-item label="仓库" prop="ms_id">
					<select-store v-model="info.ms_id" style="width: 250px"></select-store>
				</Form-item>
				<Form-item label="物品" prop="mt_id">
					<select-material v-model="info.mt_id" style="width: 250px" @selected="selectMaterial"></select-material>
				</Form-item>
				<Form-item label="数量" prop="nums">
					<InputNumber v-model="info.nums" :min="1" @on-change="numsChange"></InputNumber>
				</Form-item>
			</fieldset>
			<fieldset class="section m-b-15">
				<legend class="title">收款</legend>
				<Form-item label="金额" prop="amount">
					<InputNumber v-model="info.amount" :min="0"></InputNumber>
				</Form-item>
				<Form-item label="收款账户" prop="aa_id">
					<Select ref="aa_ref" v-model="info.aa_id" style="width: 250px" clearable>
						<Option :value="item.aa_id" v-for="item in aa_list">{{item.name}}</Option>
					</Select>
				</Form-item>
			</fieldset>
			<fieldset class="section m-b-15">
				<legend class="title">业绩归属</legend>
				<Form-item label="经办人" prop="eid">
					<select-employee v-model="info.eid" style="width: 250px" @on-selected="selectEmployee"></select-employee>
				</Form-item>
				<Form-item label="校区" prop="bid">
					<select-branch v-model="info.bid" style="width: 250px"></select-branch>
				</Form-item>
			</fieldset>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
		
</template>

<script>
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import SelectMaterial from 'c%/SelectMaterial'
	import SelectEmployee from 'c%/SelectEmployee'
	import SelectStore from 'c%/SelectStore'
	import SelectBranch from 'c%/SelectBranch'
	
	const emptyObject = {
		mt_id: 0,
		ms_id: 0,
		name: '',
		mobile: '',
		nums: 1,
		amount: 0,
		eid: 0,
		aa_id: 0,
		bid: 0
	}
	
	export default{
		mixins: [modal,common],
		components: {
			SelectMaterial,
			SelectEmployee,
			SelectStore,
			SelectBranch
		},
		data () {
			return {
				info: util.copy(emptyObject),
				price: 0,
				rules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					],
					mobile: [
						{ required: true, message: '请输入手机号', trigger: 'blur' },
						{ pattern: /^1(\d{10})|(\d{6}\*{4})$/, message: '手机格式错误', trigger: 'blur'}
					],
					ms_id: [
						{ required: true, min: 1, type: 'number', message: '请选择仓库', trigger: 'change' }
					],
					mt_id: [
						{ required: true, min: 1, type: 'number', message: '请选择物品', trigger: 'change' }
					],
					nums: [
						{ required: true, min: 1, type: 'number', message: '数量不能小于1', trigger: 'change' }
					],
					aa_id: [
						{ required: true, min: 1, type: 'number', message: '请选择收款账户', trigger: 'change' }
					],
					eid: [
						{ required: true, min: 1, type: 'number', message: '请选择销售人员', trigger: 'change' }
					],
					bid: [
						{ required: true, min: 1, type: 'number', message: '请选择校区', trigger: 'change' }
					]
				}
			}
		},
		computed: {
			aa_list() {
				let bid = this.info.bid
				let ret = []
				this.accounts$.forEach(item => {
					let is_valid_account = false
					if(_.isEmpty(item.bids)){
						if(item.is_public == 1 && item.is_front == 1){
							is_valid_account = true
						}
					}else{
						if(item.bids.indexOf(bid) !== -1 && item.is_front == 1){
							is_valid_account = true
						}
					}

					if(is_valid_account){
						ret.push(item)
					}
				})
				return ret
			}
		},
		watch: {
			'info.bid'() {
				this.info.aa_id = 0
				this.$refs.aa_ref.clearSingleSelect()
			}
		},
		methods: {
			onModalOpen() {
				this.info.eid = this.eid$
				this.info.bid = this.bid_user
			},
			ok () {
				this.$form('form').check()
				.then(res => {
					this.$rest('material_sales')
					.post(this.info)
					.success(res => {
						this.$Message.success('提交成功')
						this.$emit('on-success')
						this.close()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			selectMaterial(selected) {
				this.price = selected.sale_price
				this.info.amount = util.mul(this.price,this.info.nums)
			},
			selectEmployee(selected) {
				this.info.bid = selected.bid || 0
			},
			numsChange(v) {
				this.info.amount = util.mul(this.price,v)
			}
		}
	}
</script>
