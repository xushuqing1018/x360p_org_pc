<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="500" :mask-closable="false" @on-cancel="cancel">
		<Form ref="form" :label-width="70" :model="info" :rules="rules" v-if="modal$.show">
			<Form-item label="类型" prop="type">
				<Select v-model="info.type" :disabled="disabled">
					<Option v-for="item in type_list" :disabled="disableOption" :value="item.value">{{item.label}}</Option>
				</Select>
			</Form-item>
			<Form-item label="名称" prop="name">
				<Input v-model="info.name" placeholder="请输入名称"></Input>
			</Form-item>
			<Form-item label="所属校区" prop="bids">
				 <!--:disabled="disabled"-->
				 <!--:readonly="disabled"-->
				<select-branch v-model="info.bids" clearable style="width:calc(100% - 100px)"></select-branch>
				<Checkbox v-model="info.is_public" class="ml-3" :true-value="1" :false-value="0">
					公用
				</Checkbox>
			</Form-item>
			
			<Form-item label="前台账户" prop="is_front" v-if="info.type<3">				
				<Checkbox v-model="info.is_front" :true-value="1" :false-value="0">
					可用于前台收费
				</Checkbox>
			</Form-item>
			
			<Form-item label="支付配置" prop="cp_id" v-if="info.type==2&&!disableOption">
				<Select v-model="info.cp_id" style="width:calc(100% - 100px)">
					<Option :value="item.cp_id" v-for="(item,index) in config_pay" :key="index" :disabled="item.aa_id>0" :label="item.name">						
						<span>{{item.name}}</span>
						<span style="float:right;color:#ccc" v-if="item.aa_id>0">已绑定账户</span>
					</Option>
				</Select>
				<a class="ml-3 text-primary" @click="$router.push({path:'/system/configs/payment'})"><Icon type="plus"></Icon> 去添加</a>
			</Form-item>
			
			<Form-item label="往来单位" prop="th_id" v-if="info.type>2">
				<help-select v-model="info.th_id" select-type="client"></help-select>				
			</Form-item>	
			<Row>
				<Col span="12">
					<Form-item label="初期余额" prop="start_amount">
						<Input-Number :disabled="disabled" v-model="info.start_amount" :step="1" :min="0"></Input-Number>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="收款费率" prop="fee_rate" v-if="info.type==2">
						<Input v-model="info.fee_rate">
					        <span slot="append">‰</span>
					    </Input>
					</Form-item>
				</Col>
			</Row>				
			<Form-item label="备注" prop="remark">
				<Input v-model="info.remark" placeholder="请输入备注"></Input>
			</Form-item>
		</Form>		
		
		<div slot="footer">
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import selectBranch from 'c%/SelectBranch.vue'
	import helpSelect from './help-select.vue'
	
	const emptyObject = {
		type: 0,
		name: '',
		bids: [],
		cp_id: 0,
		is_public: false,
		is_front: 0,
		start_amount: 0,
		remark: '',		
		th_id: 0,			//往来账户，若为应收款/应付款时可选择添加
		fee_rate:0.0
	}
	
	export default{
		mixins: [modal,common],
		components: {
			helpSelect,
			selectBranch
		},
		data () {
			return {
				type_list: [
					{ value:0,label:'现金' },
					{ value:1,label:'银行存款' },
					{ value:2,label:'电子钱包' },
					{ value:3,label:'应收款（债权）' },
					{ value:4,label:'应付款（债务）' }					
				],			
				info: util.copy(emptyObject),
				disableOption: false,
				rules: {
					type: [
						{ required: true, type: 'number', message: '请选择类型', trigger: 'change' }						
					],
					name: [
						{ required: true, message: '请选输入名称', trigger: 'blur' },
					]
				}
			}
		},
		watch: {
			'info.is_public': function (val) {
				if(val){
					this.info.bids = []
				}
			},
			'info.bids': function (val) {
				this.is_public = 0
			}
		},
		
		methods: {
			setType (type) {
				this.info.type = type 
				return this
			},
			cancel () {
				this.info = util.copy(emptyObject)
				this.close()
			},
			ok () {
				let action = this.modal$.action,
					[uri,method,msg] = action=='add'?['accounting_accounts','post','添加成功']:['accounting_accounts/'+this.info.aa_id,'put','编辑成功']
				
				if(action=='edit'){
					Vue.delete(this.info,'_index')
					Vue.delete(this.info,'_rowKey')
				}
				
				this.$form('form').check()
				.then(()=>{
					this.$rest(uri)[method](this.info)
					.success(data=>{
						this.$Message.success(msg)
						this.$store.dispatch('updateGlobalVar','accounts').then(()=>{
							this.$store.dispatch('updateGlobalVar','config_pay').then(()=>{
								this.$emit('on-success')
							})
						})
						this.cancel()
					}).error(response=>{
						this.$Notice.error({
							title: '失败',
							desc: response.body.message||'操作失败'
						})
					})
				})
			}
		},
		computed: {
			disabled () {
				return this.modal$.action == 'edit'
			},
			config_pay () {
				let list = this.$store.state.gvars.config_pay
				
				return list
			}
		}
	}
</script>
