<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="1000">
		<template v-if="modal$.show">
			<data-ready ref="dr" :data="[info_url]" @ready="dataReady">
				<template v-if="!is_empty">
					<div class="row">
						<div class="col-md-3 col-sm-3"><Tag>收据编号：{{info.bill_no}}</Tag></div>
						<div class="col-md-3 col-sm-3">
							<Tag>退费日期：{{info.refund_int_day|int_date}}</Tag>
							<Tag v-if="info.refund_mode == 1">退费月份：{{info.refund_int_month}}</Tag>
						</div>

						<div class="col-md-2 col-sm-2"><Tag>经办人：{{info.employee?info.employee.ename:'-'}}</Tag></div>
						<div class="col-md-2 col-sm-2">
							<Button 
								v-per="'bills.invalid'"
								type="error" 
								size="small" 
								icon="trash-a"
								@click="undoRefund"
								>撤销
							</Button>
						</div>
						<div class="col-md-2 col-sm-2">
							<Button 
								type="primary" 
								size="small" 
								icon="printer" 
								@click="printReceipt">打印收据
							</Button>
						</div>
					</div>
					<table class="mt-3 modal-table" v-if="info.refund_mode == 0">
						<thead>
							<tr>
								<th><div class="ivu-table-cell">#</div></th>
								<th><div class="ivu-table-cell">退费项目</div></th>
								<th><div class="ivu-table-cell">有效期至</div></th>
								<th><div class="ivu-table-cell">购买单价</div></th>
								<th><div class="ivu-table-cell">退费单价</div></th>
								<th><div class="ivu-table-cell">退费数量</div></th>
								<th><div class="ivu-table-cell">单位</div></th>
								<th><div class="ivu-table-cell">退费金额</div></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item,index) in info.order_refund_item" :key="index">
								<td><div class="ivu-table-cell">{{index+1}}</div></td>
								<td><div class="ivu-table-cell">{{getName(item.order_item)}}</div></td>
								<td><div class="ivu-table-cell">{{getExpire(item.order_item)}}</div></td>
								<td><div class="ivu-table-cell">{{Number(item.order_item.unit_lesson_hour_amount)}}</div></td>
								<td><div class="ivu-table-cell">{{Number(item.unit_price)}}</div></td>
								<td><div class="ivu-table-cell">{{Number(item.nums)}}</div></td>
								<td><div class="ivu-table-cell">{{getUnit(item.order_item)}}</div></td>
								<td><div class="ivu-table-cell">{{item.amount}}</div></td>
							</tr>
						</tbody>
					</table>
					<table class="mt-3 modal-table" v-else>
						<thead>
							<tr>
								<th><div class="ivu-table-cell">#</div></th>
								<th><div class="ivu-table-cell">项目</div></th>
								
								<th><div class="ivu-table-cell">返现金额</div></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item,index) in info.order_refund_item" :key="index">
								<td><div class="ivu-table-cell">{{index+1}}</div></td>
								<td><div class="ivu-table-cell">{{getName(item.order_item)}}</div></td>
								
								<td><div class="ivu-table-cell">{{item.amount}}</div></td>
							</tr>
						</tbody>
					</table>
					<div class="mt-3 row receipt-detail">
						<div class="col-md-6 col-sm-6" style="padding-right:0">
							<div class="title" style="background-color:#D3EAFD">
								退费业绩归属
							</div>
							<div class="content">
								<table>
									<tbody>
										<tr><td>姓名</td><td>角色</td><td>金额</td><td>操作</td></tr>
										<tr v-for="item in performance_data">
											<td>{{item.eid|ename}}</td>
											<td>{{labelDicts(item.sale_role_did,'sale_role')}}</td>
											<td>{{item.amount}}</td>
											<td>
												<Poptip
											        confirm
											        title="确定删除吗？"
											        @on-ok="delPerforamnce(item)">
											        <Button 
														type="ghost" 
														shape="circle" 
														icon="trash-a"
														size="small" 
														title="删除">
													</Button>
											    </Poptip>
											</td>
										</tr>
										<tr v-if="action=='add'">
											<td colspan="2">
												<Tag>
													{{mapLabelText(pf_info.eid,'employee')}}
													 - {{labelDicts(pf_info.sale_role_did,'sale_role')}}								
												</Tag>
											</td>
											<td>- <InputNumber size="small" :min="0" v-model="pf_info.amount" style="width:60px"></InputNumber></td>
											<td>
												<ButtonGroup>
													<Button type="primary" @click="ok" size="small" :disabled="saving">确定</Button>
											        <Button size="small" @click="cancel" :disabled="saving">取消</Button>
												</ButtonGroup>
											</td>
										</tr>
									</tbody>
									<tfoot>
										<tr class="text-center" v-if="action!='add'">
											<td colspan="4">
												<Button 
													type="primary" 
													size="small" 
													@click="add">添加
												</Button>
											</td>
										</tr>
									</tfoot>
								</table>
							</div>
						</div>
						<div class="col-md-6 col-sm-6">
							<div class="title" style="background-color:#FDEAD3">
								结算
							</div>
							<div class="content">
								<Form :label-width="220" class="filter-form p-2">
									<Form-item label="应退费金额：">{{label_currency}}{{info.need_refund_amount}}</Form-item>
									<Form-item 
									label="扣款金额："
									v-if="info.cut_amount > 0"
									>
									{{label_currency}}{{info.cut_amount}}
									</Form-item>
									<Form-item 
									label="退电子钱包余额："
									v-if="info.refund_balance_amount > 0"
									><span>
									{{label_currency}}{{info.refund_balance_amount}}
									</span>
									</Form-item>
									<Form-item label="实际退费：">
										<Tooltip placement="bottom">
									        <a class="x-a-link text-info">{{label_currency}}{{info.refund_amount}}</a>
									        <div slot="content">
									        	<p v-if="info.refund_to == 0">
									        		退到电子钱包
									        	</p>
									        	<template v-else>
										        	<p v-for="item in account_data">
										        		{{item.aa_name}}：{{label_currency}}{{item.amount}}
										        	</p>
										        </template>
									        </div>
									    </Tooltip>
									</Form-item>
								</Form>
							</div>
						</div>
					</div>
				</template>
			</data-ready>
		</template>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
		<select-employee v-show="false" ref="ref_employee" :did="1" @onChange="addSaleRole"></select-employee>
	</Modal>
</template>
<script>
	import util,{_}    from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import common  from '@/libs/common.mixin'
	import modal   from '@/libs/modal.mixin' 
	import DataReady from 'c%/DataReady.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	const pfInfo = {
		eid:0,
		sale_role_did:0,
		amount:0
	}

	export default {
		mixins: [globals,common,modal],
		components: {
			DataReady,
			SelectEmployee
		},
		data() {
			return {
				info:{},
				or_id:0,
				performance_data:[],
				pf_info:util.copy(pfInfo),
				action:''
			}
		},
		methods: {
			dataReady(rs) {
				this.performance_data = []
				if(rs[0]!=''){
					rs[0].employee_receipts.forEach(item => {
						this.performance_data.push({
							eid:item.eid,
							amount:item.amount,
							sale_role_did:item.sale_role_did,
							erc_id:item.erc_id
						})
					})
					this.info = rs[0]
				}
			},
			refreshData() {
				this.dr().refreshData(this.info_url)
				.then(rs => {
					this.dataReady([rs])
				})
			},
			undoRefund() {
				this.confirm('确定要撤销退费吗？')
				.then(() => {
					this.$rest('order_refunds')
					.delete(this.or_id)
					.success(res => {
						this.$Message.success('撤销成功')
						this.$emit('on-success')
						this.close()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			printReceipt() {
				this.print(2,this.info.or_id)
				this.close()
			},
			getExpire(item) {
				if(item.gtype == 1) {
					return '-'
				}else{
					return item.expire_time||'-'
				}
			},
			getName(item) {
				if(item.gtype == 1) {
					return item.material.name
				}else if(item.gtype == 2){
					let prefix = '储值:'
					if(item.dc_id > 0){
						prefix = '购买储值卡:'
					}
					return prefix+this.getAmountAfter(item)+'元'
				}else if(item.gtype == 3){
					return item.item_name
				}else{
					let name = this.$filter('lesson_name')(item.lid)
					if(item.student_lesson&&item.student_lesson.cid&&item.student_lesson.one_class) {
						name += `(${item.student_lesson.one_class.class_name})`
					}
					return name
				}
			},
			getUnit(item) {
				if(item.gtype == 1) {
					return item.material.unit
				}else if(item.gtype == 2){
					return '元'
				}else if(item.gtype == 0){
					return this.$filter('nums_unit')(item.nums_unit)
				}else{
					return ''
				}
			},
			addSaleRole(item) {
				if(this.performance_data.find(d=>d.eid==item.eid)){
					this.$Message.error('请不要重复添加')
					return false
				}
				this.action = 'add'
				Object.assign(this.pf_info,item)
			},
			add() {
				this.$refs.ref_employee.openModal()
			},
			delPerforamnce(item) {
				this.$rest('employee_receipts')
				.delete(item.erc_id)
				.success(res => {
					this.$Message.success('删除成功')
					this.$emit('on-success')
					this.refreshData()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			ok() {
				if(this.pf_info.amount==0 && util.sub(this.pf_info.amount,this.info.refund_amount)>0){
					this.$Message.error('金额不能大于退费金额或等于0')
					return false
				}
				let param = Object.assign(this.pf_info,{or_id:this.or_id})
				param.amount = 0 - this.pf_info.amount
				this.$rest('employee_receipts').add_url_param('refund_receipt')
				.post(param)
				.success(res => {
					this.$Message.success('添加成功')
					this.$emit('on-success')
					this.cancel()
					this.refreshData()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			cancel() {
				this.action = ''
				this.pf_info = util.copy(pfInfo)
			}
		},
		computed: {
			is_empty() {
				return _.isEmpty(this.info)
			},
			info_url() {
				return 'order_refunds/'+this.or_id
			},
			account_data() {
				let data = []
				this.info.order_refund_history.forEach(item => {
					data.push({
						aa_name:this.accounts$.find(a=>a.aa_id==item.aa_id).name,
						amount:item.amount
					})
				})
				return data
			}
		}
	}
</script>
<style lang="less">
	.receipt-detail {
		.title {
			line-height: 30px;
			padding-left: 10px;
		}
		.content {
			height: 220px;
			overflow-y: auto;
		}
		table {
			width: 100%;
			td {
				padding: 10px 15px;
			}
		}
	}
</style>