<template>
	<div class="c-grid">
		<div class="box box-info-query filter-form">
			<label>学员姓名</label>
			<select-student 
				v-model="student.sid" 
				:clearable="true" 
				style="max-width: 250px" 
				placeholder="请选择学员" 
				@select="selectCustomer" 
				@on-clear-all="reset">
			</select-student>
			<Checkbox class="pl-4" v-model="is_contain_good">包含物品</Checkbox>
			<div class="row student-info" style="position: relative;">
				<div class="col-lg-2 col-md-3 col-sm-6">
					<span>姓名：</span>
					<span v-if="student.student_name">
						<Icon :type="getSexIconType()"></Icon>&nbsp;{{student.student_name}}
					</span>
					<Tag color="blue" v-if="enable_vip&&student.vip_level>-2">
						{{student.vip_level===-1?'非会员':vip_level_config[student.vip_level].name}}
					</Tag>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6">
					<span>校区：</span>
					<span>{{student.bid|branch_name}}</span>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6">
					<span>手机：</span>
					<span>{{student.first_tel}}</span>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6">
					<span>电子钱包余额：</span>
					<span>{{student.money}}</span>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6" v-if="student.unpay_all > 0">
					<span>欠交金额：</span>
					<span>{{student.unpay_all.toFixed(2)}}</span>
				</div>
                <div v-if="importantHoursData.length > 0" style="position: absolute;right: 15px;bottom: 0px;">
                    <Button type="success" @click="showImportantLesson" style="padding: 5px 10px;">导入课时结转</Button>
                </div>
			</div>
		</div>
		<div class="box box-goods">
			<orders-transfer-table :items="orders_items" :loading="loading" :showTag="is_contain_good"></orders-transfer-table>
		</div>
		<div class="box">
			<div class="card-transfer row m-0">
				<div class="col-sm-12 col-md-6">
					<div class="title" style="background-color: #D3EAFD">
						备注
					</div>
					<div class="remark filter-form">
						<Input type="text" v-model="remark"></Input>
					</div>
				</div>
				<div class="col-sm-12 col-md-6">
					<div class="title" style="background-color: #FDEAD3">
						结转
					</div>
					<div class="transfer-cacu row">
						<div class="col-sm-2 col-md-2"></div>
						<div class="col-sm-8 col-md-8">
							<div class="row">
								<div class="col-sm-9 col-md-9 m-t-15">
									<label>待结转费用合计：</label>
								</div>
								<div class="col-sm-3 col-md-3 m-t-15">
									<span>{{transfer_amount}}</span>
								</div>
								<div class="col-sm-9 col-md-9 m-t-5">
									<label>减欠交金额：</label>
								</div>
								<div class="col-sm-3 col-md-3 m-t-5">
									<span>{{unpay_amount}}</span>
								</div>
								<div class="col-sm-9 col-md-9 m-t-5">
									<label>电子钱包余额：</label>
								</div>
								<div class="col-sm-3 col-md-3 m-t-5">
									<span>{{student.money}}</span>
								</div>
								<div class="col-sm-9 col-md-9 m-t-5">
									<label>扣款金额：</label>
								</div>
								<div class="col-sm-3 col-md-3 m-t-5 drop-cut">
									<Dropdown trigger="custom" :visible="visible">
								        <a href="javascript:void(0)" @click="handleTrigger">
								            {{cut_amount}}
								            <Icon type="arrow-down-b"></Icon>
								        </a>
								        <DropdownMenu slot="list">
								        	<table class="cut-table">
								        		<thead>
								        			<tr>
														<th>扣款项目</th>
														<th>金额</th>
								        			</tr>
								        		</thead>
								        		<tbody>
								        			<tr v-for="item in cut_items">
								        				<td>{{item.title}}</td>
								        				<td><Input v-keeptwo v-model="item.amount" size="small" style="width:50px;"></Input></td>
								        			</tr>
								        			<tr v-if="cut_items.length == 0">
														<td colspan="2" style="text-align: center"><p class="empty">暂无扣款项目</p></td>
								        			</tr>
								        		</tbody>
								        	</table>
								        </DropdownMenu>
								    </Dropdown>
								</div>
								<div class="col-sm-12 col-md-12 m-t-5">
									<div class="dashed"></div>
								</div>
								<div class="col-sm-9 col-md-9 m-t-5">
									<label>结转后电子钱包余额：</label>
								</div>
								<div class="col-sm-3 col-md-3 m-t-5">
									<span>{{money_transfer}}</span>
								</div>
							</div>
						</div>
						<div class="col-sm-2 col-md-2"></div>
					</div>
				</div>
			</div>
		</div>
		<div class="box clearfix">
			<div class="settle-btn">
				<Button type="primary" @click="doTransfer">确认结转</Button>
			</div>
		</div>
	</div>
</template>
<script>
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'
	import pay from './mixin/pay.mixin'
	import moment from 'moment'
	import $rest from '@/libs/rest'
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import SelectStudent from 'c%/SelectStudent.vue'
	import OrdersTransferTable from './transfer/orders-transfer-table.vue'

	const studentObj = {
		sid:0,
		sno:'',
		cid:0,
		student_name: '',
		first_tel: '',
		sex: '',
		school_grade: '',
		school_class:'',
		school_id: '',
		money:'0.00',
		unpay_all:0.00
	}

	export default {
		name: 'Transfer',
		mixins: [common,globals,grid,pay],
		components: {
			SelectStudent,
			OrdersTransferTable
		},
		props: {
			
		},
		data() {
			return {
				student: util.copy(studentObj),		// 学员信息
				orders_items: [],					// 所有提交的订单中的item
				remark: '',
				cache: [],
                loading: false,
                importantHoursData:[]
			}
		},
		mounted() {
			this.getQueryInfo()
			this.dealCutItems(this.cut$)
		},
		methods: {
			// 根据路由参数获取学员信息
			getQueryInfo() {
				let sid = this.$route.params.sid
				if(typeof sid !== 'undefined') {
					this.getStudentInfo(sid)
				}
			},
			getStudentInfo(sid) {
				this.loading = true
				this.$rest('students/' + sid)
	            .get()
	            .success(response=>{
	            	Object.assign(this.student, response)
                    this.getOrdersTransfer(sid)
                    this.getImportantHours(sid)
	            })
	            .error(response=>{
	                this.$Message.error(response.body.message)
	                this.loading = false
	            })
			},
			// 选择学员自动补全信息
			selectCustomer(sid) {
				this.getStudentInfo(sid)
            },
            //查询学员的导入课时
            getImportantHours(sid){
                this.$rest('student_lesson_hours/get_important_hours')
                .get({
                    sid:sid
                })
                .success(res => {
                    this.importantHoursData = res.list
                })
                .error(res => {
                    this.$Message.error(response.body.message)
                })
            },
			// 结转查询所有订单的item
			getOrdersTransfer(sid) {
				let oid = this.$route.params.oid
				let filter1 = function(item) {
					if(typeof oid !== 'undefined') {
						return item.is_submit == 1 && item.oid == oid
					}else{
						return item.is_submit == 1
					}
				}
				let filter2 = function(item) {
					return item.is_submit == 1 && (item.pay_status == 0 || item.pay_status == 1)
				}
				this.$rest('orders')
				.get({
					sid: sid,
					bid: -1,
					pagesize: 1000
				})
				.success(response => {
					// 计算学员欠费总金额
					this.student.unpay_all = 0
					response.list.filter(filter2).forEach((item) => {
            			this.student.unpay_all =util.add(this.student.unpay_all, item.unpaid_amount)
            		})
					// 构造结转item数据
					this.cache = response.list.filter(filter1)
					this.getItems(this.cache)
					this.loading = false
				})
				.error(response =>{
					this.$Message.error(response.body.message)
					this.loading = false
				})
			},
			getItems(orders) {
				this.orders_items.splice(0,this.orders_items.length)
				if(orders.length > 0) {
					orders.forEach((order,order_index) => {

						let condition = (item) => {
							let remain_present = item.present_lesson_hours - item.deduct_present_lesson_hours
							//let result = (item.remain_nums > 0 || remain_present > 0) && item.is_lesson_hour_end == 0
							//20191102:这里不需要判断是否结课
							let result = (item.remain_nums > 0 || remain_present > 0)
							if(this.is_contain_good) {
								return result
							}else{
								return result && item.gtype !== 1
							}
						}
						let firstIndex = order.order_items.findIndex(condition)

						if(firstIndex != -1) {
							order.order_items.filter(condition).forEach((item,item_index) => {
								if(firstIndex == item_index) {
									this.orders_items.push(this.createTransferItems(order,order_index,item,'first'))
								}else{
									this.orders_items.push(this.createTransferItems(order,order_index,item,'other'))
								}
							})
						}
					})
				}
			},
			// 构造结转item数据
			createTransferItems(order,order_index,item,mode) {
				let obj = {}

				obj.order_no = order.order_no							 	 // 订单编号
				obj.paid_time = order.paid_time							 	 // 交易日期
				obj.oid = item.oid											 // oid
				obj.oi_id = item.oi_id										 // oi_id
				obj.nums_unit = item.nums_unit							     // 单位
				obj.nums = util.float(item.nums)							 // 购买数量(不含赠送)
				obj.gtype = item.gtype										 // 商品类型
				obj.unit_price = this.calcDealPrice(item) 	 				 // 购买单价
				obj.remain_nums = item.remain_nums							 // 剩余数量(不含赠送)
				obj.bill_unit_price = this.calcDealPrice(item) 				 // 计费单价(课消)
				obj.transfer_amount = this.cacuTransferAmount(item)		 	 // 可结转金额
				obj.transfer_num = 0										 // 结转数量
				obj.amount = '0.00'										 	 // 实际结转金额（可编辑）
				obj._amount = '0.00'										 // 原始结转金额
				obj.transfer_over_amount = '0.00'							 // 结转溢价
				obj.unpay_amount = this.cacuRealUnpay(item)			         // 欠交金额
				obj.is_standard_price = false								 // 是否按原始单价计算课消
				obj.use_nums = Number(item.used_nums)						 // 课消数量
				obj.transfer_price = 0.00									 // 结转单价
				obj.subtotal = item.subtotal								 // 小计，不用nums*unit_price计算item总额
				obj.origin_price = item.origin_price						 // 原始单价
				obj.present_lesson_hours = item.present_lesson_hours         // 赠送数量
				obj._has_present = false									 // 是否有赠送
				obj.transfer_present_nums = 0.00						     // 扣除赠送数量
				obj.refunded = item.refund_nums								 // 已退费数量
				obj.transfered = item.transfer_nums 						 // 已结转数量
				obj.used_present_hour = item.used_present_hour				 // 赠送已消耗的数量


				if(item.cid > 0 && item.one_class) {
					obj._class_name = item.one_class.class_name
				}

				if(item.gtype == 1) {
					obj.gid = item.gid 										 // 物品gid
					obj._name = item.material.name 							 // 物品名称
					obj._unit = item.material.unit 						     // 物品单位
				}else if(item.gtype == 0){
					obj.lid = item.lid					     				 // 课程
					let remain = item.present_lesson_hours - item.deduct_present_lesson_hours - item.used_present_hour
					if(remain > 0){
						obj._has_present = true
						obj.remain_present_nums = remain
					}
				}else if(item.gtype == 3) {
					obj._name = item.item_name
					obj._unit = ''
				}

				if(mode == 'first') {
					obj.first = true
				}else{
					obj.first = false
				}

				if(order_index % 2 == 0) {
					obj.line = 'odd'
				}else{
					obj.line = 'even'
				}

				if(obj.bill_unit_price == obj.origin_price) {
					obj.is_standard_price = true
				}

				return obj
			},
			// 计算成交单价
			calcDealPrice(item) {
				if(item.nums == 0) {
					return Number(item.origin_price)
				}
				return util.float(util.div(item.subtotal, item.nums).toFixed(6))
			},
			cacuUnitPrice(item) {
				return util.div(item.subtotal, item.nums).toFixed(2)
			},
			// 计算可结转金额
			cacuTransferAmount(item) {
				let unit_price, use_nums, use
				unit_price = this.calcDealPrice(item)
				use_nums = this.cacuUseNums(item)
				use = util.mul(use_nums, unit_price)
				return util.float(util.sub(item.subtotal, use).toFixed(6))
			},
			// 计算课消数量
			cacuUseNums(item) {
				return util.sub(item.nums, item.remain_nums)
			},
			// 计算欠交金额
			cacuRealUnpay(item) {
				let origin_unpay_amount = util.sub(item.subtotal ,item.paid_amount) 
				let back_nums = util.add(item.refund_nums, item.transfer_nums)
				if(back_nums > 0) {
					return 0
				}else{
					return origin_unpay_amount
				}
			},
			// 结转按钮
			doTransfer() {
				if(this.student.sid == 0) {
					this.$Message.error('请选择一名学员')
					return false
				}
				if(this.transfer_nums == 0) {
					if(this.has_present) {
						if(this.transfer_present_nums == 0) {
							this.$Message.error('结转数量和扣除赠送数量不能同时为0')
							return false
						}
					}else{
						this.$Message.error('结转数量不能为0')
						return false
					}
				}
				if(this.transfer_amount < 0) {
					this.$Message.error('结转金额不能为负数')
					return false
				}
				if(!this.checkTransferAndUnpay()) return false
				let minus_unpay = util.sub(this.unpay_amount_all, this.unpay_amount).toFixed(2)
				let str_1 = parseFloat(minus_unpay) > 0 ? `${this.student.student_name}在别的课程或物品上还有欠交${minus_unpay}，` : ''
				let str_2 = `本次结转金额为${this.transfer_amount}元，确定结转吗？`
				this.$Modal.confirm({
                    title: '提示',
                    content: `<p>${str_1}${str_2}</p>`,
                    onOk: () => {
                        this.transfer()
                    },
                    onCancel: () => {
                    	// todo
                    }
                });
			},
            showImportantLesson(){
                this.$Modal.open('dashboard/transfer/import-lesson-modal.vue',{
                    props:{
                        item:this.importantHoursData,
                        sid:this.student.sid
                    },
					on:{
						'on-success':() => {
							this.getImportantHours(this.student.sid)
						}
					}
				})
				.then(modal=>{
					modal.show('导入课时记录','list')
				})
            },
			// 判断是否存在欠交金额大于等于结转金额,有则提示不能进行下一步操作
			checkTransferAndUnpay() {
				let str = ''
				this.orders_items.forEach((item) => {
					if(item.transfer_num > 0) {
						if(item.amount > 0 && item.amount <= item.unpay_amount) {
							let name = item.gtype == 1 ? item._name : this.$filter('lesson_name')(item.lid)
							str += `<p>订单号：${item.order_no}，${name}</p>`
						}
					}
				})
				if(str != '') {
					this.$Modal.confirm({
	                    title: '提示',
	                    content: `<p>${this.student.student_name}在以下课程或物品上的欠交金额大于等于结转金额，请先通过收费操作将费用补齐：</p>${str}`,
	                    onOk: () => {
	                        // todo
	                        this.$router.push({
	                        	name:'dashboard_payment',
	                        	params:{sid:this.student.sid}
	                        })
	                    },
	                    onCancel: () => {
	                    	// todo
	                    }
	                });
	                return false
				}else{
					return true
				}
			},
			transfer() {
				let params = {
					student: {sid:this.student.sid},
					items: this.orders_items.filter(item=>item.transfer_num > 0||item.transfer_present_nums > 0),
					remark: this.remark,
					cut_items: this.filterCut()
				}
				this.$rest('orders/do_transfer')
				.post(params)
				.success(response => {
					this.reset()
					this.$Message.success('费用结转成功')
				})
				.error(response => {
					this.error(response.body.message)
				})
			},
			// reset
			reset() {
				this.student = util.copy(studentObj)
				this.orders_items.splice(0,this.orders_items.length)
				this.resetCut()
			}
		},
		computed: {
			// 待结转总金额
			transfer_amount() {
				let total = 0
				if(this.orders_items.length > 0) {
					this.orders_items.forEach((item) => {
						if(item.transfer_num > 0) {
							total = util.add(total, item.amount)
						}
					})
					return util.float(total.toFixed(6))
				}else{
					return '0.00'
				}
			},
			// 结转总数量
			transfer_nums() {
				let total  = 0
				if(this.orders_items.length > 0) {
					this.orders_items.forEach((item) => {
						total = util.add(total, item.transfer_num)
					})
					return total
				}else{
					return 0
				}
			},
			has_present() {
				return !!this.orders_items.find(item => item._has_present)
			},
			transfer_present_nums() {
				let total  = 0
				if(this.orders_items.length > 0) {
					this.orders_items.forEach((item) => {
						total = util.add(total, item.transfer_present_nums)
					})
					return total
				}else{
					return 0
				}
			},
			// 总的欠交金额
			unpay_amount_all() {
				let total = 0
				if(this.orders_items.length > 0) {
					this.orders_items.forEach((item) => {
						total = util.add(total, item.unpay_amount)
					})
				}
				return util.float(total.toFixed(6))
			},
			// 结转的欠交金额
			unpay_amount() {
				let total = 0
				if(this.orders_items.length > 0) {
					this.orders_items.forEach((item) => {
						if(item.transfer_num > 0) {
							total = util.add(total, item.unpay_amount)
						}
					})
					return util.float(total.toFixed(6))
				}else{
					return '0.00'
				}
			},
			// 结转后电子钱包余额
			money_transfer() {
				let money            = this.student.money
				let transfer_amount  = this.transfer_amount
				let unpay_amount     = this.unpay_amount
				let cut_amount       = this.cut_amount
				if(this.orders_items.length > 0) {
					let a = util.sub(transfer_amount, unpay_amount)
					let b = util.sub(a, cut_amount)
					return util.float(util.add(b, money).toFixed(6))
				}else{
					return util.float(util.sub(money, cut_amount).toFixed(6))
				}
			},
			cut_amount() {
				let total = 0
				this.cut_items.forEach((item) => {
					total = util.add(total, item.amount)
				})
				return util.float(total.toFixed(6))
			}
		},
		watch: {
			'is_contain_good': {
				handler: function() {
					this.getItems(this.cache)
				},
				deep:true
			}
		},
		beforeDestroy() {

		}
	}
</script>
<style lang="less">
	.box {
		.card-transfer {
			min-height: 200px;
			.col-sm-6, .col-md-6 {
				padding: 0
			}
			.title {
				line-height: 30px;
				font-weight: bold;
				padding-left: 10px;
				color: #737373;
			}
			.ivu-dropdown .ivu-select-dropdown {
				width: 200px;
			}
			.drop-cut {
				padding-right: 0;
			}
		}
		.settle-btn {
			float: right;
			margin: 5px 15px;
			button {
				width: 100px;
				padding: 6px 15px;
			}
		}
		.transfer-cacu{
			label{
				padding-left:10px;
			}
		}
	}
</style>