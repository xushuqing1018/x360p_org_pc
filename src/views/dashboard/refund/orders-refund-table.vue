<template>
	<div class="ivu-table-wrapper">
		<table class="goods-table">
			<thead>
				<tr>
					<th>交易日期</th>
					<th>订单编号</th>
					<th>项目名称</th>
					<th>购买数量</th>
					<th>单位</th>
					<th>购买单价</th>
					<th v-help="consume_help">课消情况</th>
					<th>剩余数量</th>
					<th v-help="refund_help">退费情况</th>
					<th><span v-help="premium_help">退费溢价</span></th>
					<th>欠交金额</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in items" :class="item.line == 'even' ? 'table-tr-even': 'table-tr-odd'">
					<td>
						<template v-if="item.first">{{item.paid_time||'-'}}</template>
					</td>
					<td>
						<template v-if="item.first">{{item.order_no}}</template>
					</td>
					<td>
						<template v-if="item.gtype == 0">
							<template v-if="item.lid>0&&!item._class_name">
								<Tag color="blue">课</Tag>
								<span>{{item.lid|lesson_name}}</span>
							</template>
							<template v-else-if="item._class_name">
								<Tag color="yellow">班</Tag>
								<span v-if="item.lid==0">{{item._class_name}}</span>
								<span v-else>{{item._class_name}}({{item.lid|lesson_name}})</span>
							</template>
						</template>
						<template v-else-if="item.gtype == 1">
							<Tag color="green">物</Tag>
							<span>{{item._name}}</span>
						</template>
						<template v-else-if="item.gtype == 3">
							<Tag color="#EF6AFF">杂</Tag>
							<span>{{item._name}}</span>
						</template>
					</td>
					<td>{{item.nums}}</td>
					<td>
						<span v-if="item.gtype == 0">{{item.nums_unit|nums_unit}}</span>
						<span v-else>{{item._unit}}</span>
					</td>
					<td>{{item.unit_price}}</td>
					<td>
						<template v-if="item.gtype == 0">
							<div v-if="refundMode == 0">
							<p>课消数量：{{item.use_nums}}<span v-if="item.used_present_hour">(含赠送{{item.used_present_hour}})</span></p>
								<p v-if="item.transfered>0">结转数量：{{item.transfered}}</p>
								<p v-if="item.refunded>0">退费数量：{{item.refunded}}</p>
								<p v-if="Number(item.deduct_present_lesson_hours)>0">扣除赠送数量：{{Number(item.deduct_present_lesson_hours)}}</p>
							</div>
							<p v-if="refundMode == 1">
								月课消数:
								<a href="javascript:;" @click="showMonthUseHoursDetail(item)" v-if="item.month_use_hours > 0">{{item.month_use_hours}}</a>
								<span v-else>{{item.month_use_hours}}</span>
							</p>
						</template>
						<template v-if="refundMode == 0">
							<p>是否按标准价：
								<Checkbox 
									v-model="item.is_standard_price"
									@on-change="isStandardPriceChange(item)">
								</Checkbox>
							</p>
							<p>计费单价：
								<span>
									<Input 
										v-keeptwo
										v-model="item.bill_unit_price" 
										size="small" 
										style="width:80px" 
										:readonly="item.is_standard_price"
										@on-change="billUnitPriceChange(item)">
									</Input>
								</span>
							</p>
						</template>
					</td>
					<td>{{item.remain_nums}}</td>
					<td>
						<template v-if="refundMode == 0">
							<p>可退费金额：{{item.refund_amount}}</p>
							<p>退费数量：
								<span>
									<InputNumber 
										v-model="item.refund_num" 
										:min="0" 
										:max="item.remain_nums"
										:step="1" 
										size="small" 
										style="width:60px"
										@on-change="remainNumsChange(item)">
									</InputNumber>
								</span>
							</p>
							<p>退费金额：{{item._amount}}</p>
							<p>实际退费金额：
								<span>
									<Input 
										v-keeptwo 
										v-model="item.amount" 
										size="small" 
										:readonly="item.refund_num==0"
										style="width: 90px;">
									</Input>
								</span>
							</p>
							<p v-if="item._has_present">
							扣除赠送:
								<span>
									<InputNumber 
										v-model="item.refund_present_nums" 
										:min="0" 
										:max="item.remain_present_nums"
										:step="1" 
										size="small" 
										style="width:60px"
										>
									</InputNumber>
								</span>
								<span>(赠送剩余{{item.remain_present_nums}}课时)</span>
							</p>
						</template>
						<template v-if="refundMode == 1">
							<p>退费金额：
								<span>
									<Input 
										v-keeptwo 
										v-model="item.amount" 
										size="small"
										style="width: 90px;">
									</Input>
								</span>
								<span v-if="item.total_refund_amount > 0">已退:{{item.total_refund_amount}}</span>
							</p>
						</template>
					</td>
					<td>{{item.refund_over_amount}}</td>
					<td>{{item.unpay_amount.toFixed(2)}}</td>
				</tr>
				<tr v-if="items.length == 0 && !loading">
					<td colspan="15" style="text-align:center;color:#c3cbd6;padding:30px">暂时还没有内容哦</td>
				</tr>
				<div class="ivu-spin ivu-spin-large ivu-spin-fix" v-if="loading">
					<div class="ivu-spin-main">
						<span class="ivu-spin-dot"></span>
					</div>
				</div>
			</tbody>
		</table>
	</div>
</template>
<script>
	import modalMixin from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import util from '@/libs/util'
	export default {
		name: 'OrdersRefundTable',
		mixins: [modalMixin,common,globals],
		props: {
			items: {
				type: Array,
				default(){
					return []
				}
			},
			showTag: {
				type: Boolean,
				default: false
			},
			loading: {
				type: Boolean,
				default: false
			},
			refundMode:{
				type:Number,
				default:0
			},
			refundIntMonth:{
				type:String,
				default:''
			}
		},
		data() {
			this.consume_help = '计费单价:表示对已消耗的课如何计费<br/>标准价:此处打勾表示按原始单价计算课消，退费通常不享受缴费时的优惠，否则按购买单价(可修改)计算'
			this.refund_help = '可退费金额 = 小计金额 - (课消数量 * 计费单价)<br/>退费金额 = 小计金额 - (购买数量 - 退费数量) * 计费单价'
			this.premium_help = '退费溢价 = (购买数量 - 退费数量) * (计费单价 - 购买单价)'
			return {
				
			}
		},
		methods: {
			// 计费单价改变
			billUnitPriceChange(item) {
				if(item.remain_nums == 0) return false
				this.cacuRefundAmount(item)
				if(!this.cacuAmount(item)) return false
				if(!this.cacuRefundOverAmonut(item)) return false			
			},
			// 退费数量改变
			remainNumsChange(item) {
				this.cacuAmount(item)
				this.cacuRefundOverAmonut(item)					
			},
			// 计算退费金额
			cacuAmount(item) {
				if(item.refund_num == 0) {
					item._amount = item.amount = '0.00'
					return false
				}
				let use_and_remain_nums = util.sub(item.nums, item.refund_num)				// 除去退费的数量
				let use_and_remain = util.mul(use_and_remain_nums, item.bill_unit_price)	// 除去退费的总价
				item._amount = item.amount = util.float(util.sub(item.subtotal, use_and_remain).toFixed(6))		// 退费金额
				if(item.amount < 0) {
					item._amount = item.amount = '0.00'
				}
				item.refund_price = util.float(util.div(item.amount, item.refund_num).toFixed(6))
				return true
			},
			// 计算可退费金额，计费单价改变可退费金额也会变
			cacuRefundAmount(item) {
				let consume_nums = util.sub(item.nums, item.remain_nums)					// 消耗数量
				let consume_amount = util.mul(consume_nums, item.bill_unit_price)			// 课消金额
				item.refund_amount = util.float(util.sub(item.subtotal, consume_amount).toFixed(6))		// 可退费金额
			},
			// 计算溢价
			cacuRefundOverAmonut(item) {
				if(item.refund_num == 0) return false
				let use_and_remain_nums = util.sub(item.nums, item.refund_num)				// 除去退费的数量
				let minus_price = util.sub(item.bill_unit_price, item.unit_price)		    // 计费单价与购买单价的差额
				item.refund_over_amount = util.float(util.mul(use_and_remain_nums, minus_price).toFixed(6)) // 溢价金额
				return true
			},
			// 计费单价是否按标准价
			isStandardPriceChange(item) {
				// if(item.bill_unit_price == item.origin_price) return
				if(item.is_standard_price) {
					item.bill_unit_price = item.origin_price
				}else{
					item.bill_unit_price = item.unit_price
				}
				this.billUnitPriceChange(item)
			},
			showMonthUseHoursDetail(item){
				this.$Modal
				.open('dashboard/refund/slh-modal.vue')
				.then(modal=>{
					modal.vuec.setParams(item._sl_id,this.refundIntMonth)
					.show(this.refundIntMonth+'月课消明细')
				})
			}
		}
	}
</script>
<style lang="less" scoped>
	p {
		margin-bottom: 5px;
	}
	.goods-table .ivu-spin-fix {
		top: 42px;
	}
</style>