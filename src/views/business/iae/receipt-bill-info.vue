<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="1000">
		<template v-if="modal$.show">
			<data-ready ref="dr" :data="[info_url]" @ready="dataReady">
				<template v-if="!is_empty">
					<div class="row">
						<div class="col-md-3 col-sm-3"><Tag>收据编号：{{info.orb_no}}</Tag></div>
						<div class="col-md-3 col-sm-3"><Tag>缴费日期：{{info.paid_time}}</Tag></div>
						<div class="col-md-2 col-sm-2"><Tag>经办人：{{info.employee?info.employee.ename:'-'}}</Tag></div>
						<div class="col-md-2 col-sm-2">
							<Button 
								v-per="'bills.invalid'"
								type="error" 
								size="small" 
								icon="trash-a" 
								@click="invalidReceipt" 
								:title="!!info.hw_id?'该收据已交班不能作废':''" 
								:disabled="!!info.hw_id">作废
							</Button>
						</div>
						<div class="col-md-2 col-sm-2">
							<Dropdown>
								<Button type="primary" size="small" icon="printer">打印</Button>
								<DropdownMenu slot="list">
									<DropdownItem @click.native="print(1,info.orb_id,1)">收据</DropdownItem>
									<DropdownItem @click.native="print(1,info.orb_id,2)">合同</DropdownItem>
								</DropdownMenu>
							</Dropdown>
						</div>
					</div>
					<table class="mt-3 modal-table">
						<thead>
							<tr>
								<th><div class="ivu-table-cell">#</div></th>
								<th><div class="ivu-table-cell">缴费项目</div></th>
								<th><div class="ivu-table-cell">有效期至</div></th>
								<th><div class="ivu-table-cell">原单价</div></th>
								<th><div class="ivu-table-cell">折后单价</div></th>
								<th><div class="ivu-table-cell">数量</div></th>
								<th><div class="ivu-table-cell">单位</div></th>
								<th><div class="ivu-table-cell">优惠</div></th>
								<th><div class="ivu-table-cell">赠送</div></th>
								<th><div class="ivu-table-cell">折后金额</div></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item,index) in info.order_receipt_bill_item" :key="index">
								<td><div class="ivu-table-cell">{{index+1}}</div></td>
								<td><div class="ivu-table-cell">{{getName(item.order_item)}}</div></td>
								<td><div class="ivu-table-cell">{{getExpire(item.order_item)}}</div></td>
								<td><div class="ivu-table-cell">{{Number(item.order_item.origin_price)}}</div></td>
								<td><div class="ivu-table-cell">{{Number(item.order_item.price)}}</div></td>
								<td><div class="ivu-table-cell">{{Number(item.order_item.nums)}}</div></td>
								<td><div class="ivu-table-cell">{{getUnit(item.order_item)}}</div></td>
								<td>
									<div class="ivu-table-cell">
										<span>折扣金额：{{item.order_item.discount_amount}}</span><br/>
										<span>直减分摊金额：{{item.order_item.reduced_amount}}</span>
									</div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<span v-if="item.order_item.present_lesson_hours > 0">赠送课时：{{item.order_item.present_lesson_hours}}</span>
										<span v-if="item.order_item.present_amount > 0">赠送余额：{{item.order_item.present_amount}}</span>
									</div>
								</td>
								<td><div class="ivu-table-cell">{{getAmountAfter(item.order_item)}}</div></td>
							</tr>
						</tbody>
					</table>
					<div class="mt-3 row receipt-detail">
						<div class="col-md-6 col-sm-6" style="padding-right:0">
							<div class="title" style="background-color:#D3EAFD">
								回款业绩归属
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
											<td><InputNumber size="small" :min="0" v-model="pf_info.amount" style="width:60px"></InputNumber></td>
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
									<Form-item label="缴费金额：">
										<Tooltip placement="bottom">
									        <a class="x-a-link text-info">{{label_currency}}{{info.amount}}</a>
									        <div slot="content">
									        	<p v-for="item in account_data">
									        		{{item.aa_name}}：{{label_currency}}{{item.amount}}
									        	</p>
									        </div>
									    </Tooltip>
									</Form-item>
									<Form-item label="余额付款金额：">{{label_currency}}{{info.balance_paid_amount}}</Form-item>
									<Form-item label="非余额付款金额：">{{label_currency}}{{info.money_paid_amount}}</Form-item>
									<Form-item label="欠交金额："><span>{{label_currency}}{{info.unpaid_amount}}</span></Form-item>
									<Form-item label="电子钱包余额："><span>{{label_currency}}{{info.student_money}}</span></Form-item>
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
	import {_} 	   from '@/libs/util'
	import util    from '@/libs/util'
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
				orb_id:0,
				performance_data:[],
				pf_info:util.copy(pfInfo),
				action:''
			}
		},
		methods: {
			dataReady(rs) {
				this.performance_data = []
				if(rs[0]!=''){
					rs[0].employee_receipt.forEach(item => {
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
			invalidReceipt() {
				this.confirm('收据作废之后将无法恢复，确定作废吗？')
				.then(() => {
					this.$rest('order_receipt_bills')
					.delete(this.info.orb_id)
					.success(res => {
						this.$Message.success('作废成功')
						this.$emit('on-success')
						this.close()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			printReceipt() {
				this.print(1,this.info.orb_id)
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
				if(item.gtype == 2){
					let prefix = '储值:'
					if(item.dc_id > 0){
						prefix = '购买储值卡:'
					}
					return prefix+this.getAmountAfter(item)+'元'
				}else if(item.gtype == 0){
					let name = this.$filter('lesson_name')(item.lid)
					if(item.student_lesson&&item.student_lesson.cid&&item.student_lesson.one_class) {
						name += `(${item.student_lesson.one_class.class_name})`
					}
					return name
				}else{
					return item.item_name
				}
			},
			getUnit(item) {
				if(item.gtype == 1 && item.material) {
					return item.material.unit
				}else if(item.gtype == 2){
					return '元'
				}else if(item.gtype == 0){
					return this.$filter('nums_unit')(item.nums_unit)
				}else{
					return ''
				}
			},
			getAmountAfter(item) {
				return (util.mul(item.nums,item.price)).toFixed(2)
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
				if(this.pf_info.amount==0 || (util.sub(this.pf_info.amount,this.info.amount))>0){
					this.$Message.error('金额不能大于缴费金额或等于0')
					return false
				}
				let param = Object.assign(this.pf_info,{orb_id:this.orb_id})
				this.$rest('employee_receipts')
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
				return 'order_receipt_bills/'+this.orb_id
			},
			account_data() {
				let data = []
				this.info.order_payment_history.forEach(item => {
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