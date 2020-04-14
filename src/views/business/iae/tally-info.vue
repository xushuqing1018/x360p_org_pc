<style>	
	.ivu-form.x-filter-form .ivu-form-item {
	    margin-bottom: 1em!important;
	}
</style>

<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="800" :mask-closable="false" @on-cancel="cancel">
		<template v-if="modal$.show">
			<Tabs v-model="info.cate">
				<TabPane name="1" label="收入" v-if="showTab(1)"></TabPane>
				<TabPane name="2" label="支出" v-if="showTab(2)"></TabPane>
				<TabPane name="3" label="转账" v-if="showTab(3)"></TabPane>
				<TabPane name="4" label="应收/应付" v-if="showTab(4)"></TabPane>
			</Tabs>
			<div class="row">
				<div class="col-sm-8">
					<Form ref="form" :label-width="80" :model="info" class="filter-form x-filter-form" :rules="rules">
						<Form-item label="校区" prop="bid">
							<select-branch v-model="info.bid" clearable style="width: 200px" :disabled="disabled"></select-branch>
						</Form-item>
						<Form-item :label="map_label[info.cate]+'日期'" prop="int_day">
							<DatePicker :value="info.int_day" @on-change="info.int_day = $event" placeholder="选择日期" style="width: 200px"></DatePicker>
							<RadioGroup 
								class="ml-3" 
								v-if="info.cate==4"
								v-model="info.type" 
								:disabled="disabled"
								style="display: inline-block;height:32px" 
								>
								<Radio :label="1">增加</Radio>
								<Radio :label="2">减少</Radio>
							</RadioGroup>
							<i-switch v-if="info.cate==4" size="large" v-model="is_income" :disabled="disabled">
								<span slot="open">应收</span>
	        					<span slot="close">应付</span>
							</i-switch>
						</Form-item>
						<Form-item label="收入类别" v-show="info.cate==1" prop="tt_id">
							<!--:disabled="disabled"-->
							<!--tt_id：{{info.tt_id}}-->
							<!--v-model="info.tt_id"--> 
							<Select ref="tallyType1" style="width: 200px" :value="info.tt_id" @on-change="tallyChange" clearable>							
								<template v-for="item in typeList1">
									<OptionGroup :label="item.name" v-if="item.sub.length>0">
										<Option :value="sub.tt_id" v-for="sub in item.sub">{{sub.name}}</Option>
									</OptionGroup>
									<OptionGroup :label="item.name" v-else>
										<Option :value="item.tt_id"	>{{item.name}}</Option>
									</OptionGroup>
								</template>
							</Select>
						</Form-item>		
						<Form-item label="支出类别" v-show="info.cate==2" prop="tt_id">
							<!--:disabled="disabled"--> 
							<!--tt_id：{{info.tt_id}}-->
							<Select ref="tallyType2" style="width: 200px" :value="info.tt_id" @on-change="tallyChange" clearable>							
								<template v-for="item in typeList2">
									<OptionGroup :label="item.name" v-if="item.sub.length>0">
										<Option :value="sub.tt_id" v-for="sub in item.sub">{{sub.name}}</Option>
									</OptionGroup>
									<OptionGroup :label="item.name" v-else>
										<Option :value="item.tt_id"	>{{item.name}}</Option>
									</OptionGroup>
								</template>
							</Select>
						</Form-item>
						<Form-item :label="map_label[info.cate]+'账户'" v-if="info.cate<3" prop="aa_id">
							<Select style="width: 200px" v-model="info.aa_id">
								<Option :value="item.aa_id" v-for="item in accountList()">{{item.name}}</Option>						
							</Select>
						</Form-item>
						
						<Form-item :label="info.cate==3?'转出账户':'往来账户'" v-if="info.cate>2" prop="aa_id">						
							<Select style="width: 200px" v-model="info.aa_id" :disabled="disabled">
								<Option :value="item.aa_id" v-for="item in accountList(true)">{{item.name}}</Option>
							</Select>
						</Form-item>
						<Form-item :label="info.cate==3?'转入账户':'资金账户'" v-if="info.cate>2" prop="to_aa_id">
							<Select style="width: 200px" v-model="info.to_aa_id" :disabled="disabled">
								<Option :value="item.aa_id" v-for="item in accountList()">{{item.name}}</Option>
							</Select>
						</Form-item>
						
						<Form-item :label="map_label[info.cate]+'金额'" prop="amount">
							<InputNumber 
								:disabled="disabled"
								:min="1" 
								:step="1" 
								v-model="info.amount" 
								class="b-b-1"
								style="width: 200px;border:none;box-shadow: none;">
							</InputNumber>
							<Button type="primary" size="small" @click="apportion" v-if="info.cate==2">分摊</Button>
						</Form-item>
						<Form-item label="备注">
							<Input v-model="info.remark" placeholder="请输入备注" style="width: 400px"></Input>
						</Form-item>
						
						<Form-item label="核算项目">
							<help-select select-type="item" v-model="info.item_th_id"></help-select>
						</Form-item>
						
						<Form-item label="核算单位">
							<help-select select-type="client" v-model="info.client_th_id"></help-select>
						</Form-item>
						
						<Form-item label="核算人员">
							<help-select select-type="employee" v-model="info.employee_th_id"></help-select>
						</Form-item>

						<Form-item label="上传附件" prop="tally_file">
							<review-upload v-model="info.tally_file" :show-course-file="false"><span></span></review-upload>
						</Form-item>
					</Form>
				</div>
				<div class="col-sm-4">
					<Card style="height:100%" dis-hover>
						<div slot="title">
							快速记账模板：
							<Select class="x-ivu-select" v-model="tpl_cate" style="width:100px;display: inline-block;">
								<Option :value="-1">全部</Option>
								<Option :value="1">收入</Option>
								<Option :value="2">支出</Option>
								<Option :value="3">转账</Option>
								<Option :value="4">往来</Option>
							</Select>
						</div>
						<ul>
		                    <li v-for="item in filter_templates" class="mb-1" @click="setTpl(item)">
		                        <span>{{item.name}}</span>
		                        <Button @click.stop="delTpl(item)" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="移除"></Button>
		                    </li>
		                    <li v-if="!filter_templates.length">
		                    	<span>暂无数据~</span>
		                    </li>
		                </ul>
					</Card>
				</div>
			</div>
		</template>
		<div slot="footer">
			<span class="text-info mr-3" @click="modal_tpl=true">存为模板</span>
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
		
		<Modal v-drag-modal v-model="modal_tpl" title="新增模板" :mask-closable="false" width="450">
			<Form :label-width="80">
				<Form-item label="模板名称">
					<Input v-model="tpl.name" placeholder="请输入模板名称"></Input>
				</Form-item>
			</Form>
			
			<div slot="footer">
				<Button type="ghost" @click="closeTpl">取消</Button>
				<Button type="primary" @click="addTpl" :loading="saving">确定</Button>
			</div>
		</Modal>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import moment from 'moment'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import selectBranch from 'c%/SelectBranch.vue'
	import helpSelect from './help-select.vue'
	import ReviewUpload from 'c%/ReviewUpload.vue'
	
	const emptyObject = {
		cate: '1',
		bid: 0,
		amount: 0,
		int_day: '',		
		aa_id: 0,
		to_aa_id: 0,
		tt_id: 0,		
		item_th_id: 0,
		client_th_id: 0,
		employee_th_id: 0,		
		remark: '',
		tally_file: [],
		multi: {
			amount: 0,
			items: []
		}
	}
	
	const tplObject = {
		type: 2,
		cate: 0,
		name: '',
		template: {}
	}
	
	export default{		
		mixins: [modal,common],
		components: {
			helpSelect,
			selectBranch,
			ReviewUpload
		},
		data () {
			return {
				hm_id:0,
				tpl_cate: -1,
				map_label: {1:'收入',2:'支出',3:'转账',4:'业务'},
				is_income: true,
				modal_tpl: false,
				tpl: util.copy(tplObject),
				templates: [
					{name: '收入',id:1},
					{name: '支出',id:2},
					{name: '转账',id:3},
					{name: '往来',id:4}
				],
				amount_tpls: [
					{name: '彩票',content: '',id:1},
					{name: '加盟商',content: '',id:1},
				],
				info: util.copy(emptyObject),
				rules: {
					bid: [
						{ required: true, type: 'number', min: 1, message: '请选择校区', trigger: 'change' }
					],
					int_day: [
						{ required: true, type: 'string', message: '请选择日期', trigger: 'change' },
					],
					aa_id: [
						{ required: true, type: 'number', min:1, message: '请选择账户', trigger: 'change' },
					],
					to_aa_id: [
						{ required: true, type: 'number', min:1, message: '请选择账户', trigger: 'change' },
					],
					amount: [
						{ required: true, type: 'number', min:1, message: '金额必须大于0', trigger: 'blur' }
					]
				},	
			}
		},
		watch: {
			'info.cate': function (val) {
				if(val<3&&this.modal$.action=='add'){
					let ref = 'tallyType'+val
					this.info.tt_id = 0
					this.$refs[ref].clearSingleSelect()
				}
			}
		},
		mounted () {
			this.init_tpl()
		},
		methods: {
			apportion() {
				if(this.info.amount == 0) {
					this.$Message.error('请先输入支出金额')
					return;
				}
				this.$Modal.open('business/iae/apportion-modal.vue',{
					on: {
						save:(data) => {
							this.info.multi = data
							
						}
					}
				})
				.then(modal => {
					this.info.multi.amount = this.info.multi.amount || this.info.amount
					modal
					.set('data',this.info.multi)
					.show('分摊支出')
				})
			},
			tallyChange (val) {
				if(val){
					this.info.tt_id = val					
				}
			},
			closeTpl () {
				this.modal_tpl = false
				this.tpl = util.copy(tplObject)
			},
			setTpl (row) {
				this.info = util.copy(row.template)
			},
			addTpl () {
				let tpl = this.tpl			
				if(tpl.name=='') {
					this.$Notice.warning({
						title: '提示',
						desc: '请输入模板名称'
					})
					return false
				}
				
				tpl.cate = parseInt(this.info.cate)
				tpl.template = util.copy(this.info)
				
				this.$rest('input_templates').post(tpl)
				.success(data=>{
					this.$Message.success('添加成功')
					this.init_tpl()
					this.closeTpl()
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'添加失败'
					})
				})
			},
			delTpl (item) {
				this.confirm('确定删除模板【'+item.name+'】吗？')
				.then(()=>{
					this.$rest('input_templates').delete(item.it_id)
					.success(data=>{
						this.init_tpl()
					})
				})
			},
			init_tpl () {
				this.$rest('input_templates').get()
				.success(data=>{
					this.templates = data.list
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'添加失败'
					})
				})
			},
			showTab (val) {
				if(this.modal$.action=='edit' || this.hm_id){
					return this.info.cate==val
				}
				return true
			},
			accountList (filter) {
				let accounts = this.accounts,
					bid = this.info.bid,
					result = []
				if(accounts.length>0){
					result = accounts.filter(a=>a.bids.indexOf(bid)>-1||a.is_public===1)
					if(this.info.cate==4&&filter){
						result = accounts.filter(a=>a.th_id>0&&(a.bids.indexOf(bid)>-1||a.is_public===1))
					}
				}
				return result
			},					
			cancel () {
				this.info = util.copy(emptyObject)
				this.$form('form').reset()
				this.close()
			},
			ok () {
				this.$form('form').check().then(()=>{
					let params = util.copy(this.info),
						action = this.modal$.action,
						[uri,method,msg] = action=='add'?['tallys','post','记账成功']:['tallys/'+params.tid,'put','修改成功'] 
						
					params.cate = parseInt(params.cate)
					if(params.cate==4&&!this.is_income){
						params.cate = 5
					}
					//收入、应收为进账，其他为出账					
					params.type = [1,4].indexOf(params.cate)>-1?1:2					  
					params.int_day = moment(params.int_day).format('YYYY-MM-DD')
					
					this.$rest(uri)[method](params)
					.success(response=>{
						this.$Message.success(msg)
						if(this.hm_id) {
							this.handover(parseInt(response.data.tid))
						}else{
							this.$emit('on-success')
						}
						this.cancel()
					}).error(response=>{
						this.$Notice.error({
							title: '记账失败',
							desc: response.body.message||'记账失败'
						})
					})
				})
			},
			handover(tid) {
				this.$rest('handover_moneys').add_url_param(this.hm_id)
				.put({tid:tid})
				.success(res => {
					this.$emit('on-success')
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		},
		computed: {
			typeList1 () {
				let types = this.types,
					result = [],					
					type = 1//parseInt(this.info.cate)
				
				if(types.length>0){
					result = types.filter(t=>t.type===type&&t.pid===0)					
					
					if(result.length){
						result.forEach(r=>{
							r.sub = types.filter(t=>t.type===type&&t.pid===r.tt_id)
						})						
					}
				}
				return result
			},	
			typeList2 () {
				let types = this.types,
					result = [],					
					type = 2//parseInt(this.info.cate)
				
				if(types.length>0){
					result = types.filter(t=>t.type===type&&t.pid===0)					
					
					if(result.length){
						result.forEach(r=>{
							r.sub = types.filter(t=>t.type===type&&t.pid===r.tt_id)
						})						
					}
				}
				return result
			},	
			disabled () {
				return this.modal$.action=='edit'
			},
			accounts () {
				return this.$store.state.gvars.accounts
			},
			types () {
				return this.$store.state.gvars.tally_types
			},
			filter_templates () {
				let templates = this.templates,
					tpl_cate = this.tpl_cate,
					result = []
				if(templates.length>0){
					result = tpl_cate>0?templates.filter(t=>t.cate==tpl_cate):templates
				}
				return result
			}
		}
	}
</script>
