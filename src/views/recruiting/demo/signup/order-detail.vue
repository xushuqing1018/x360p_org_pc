<template>
	<div class="c-grid">
		<div class="row padder-sm">
			<div class="col-sm-12">
				<Button type="primary" icon="reply" size="small" @click="back"></Button>
				<operation-items class="pull-right" :info="info" :refs="$refs" :is-detail="true" v-if="!isEmpty"></operation-items>				
			</div>		
			<data-ready ref="dr" :cache="false" :data="[info_url]" @refresh="refresh" @ready="dataReady" class="col-sm-12 mt-3">
				<template v-if="!isEmpty">
					<Card dis-hover>
						<div slot="title"><Icon type="information-circled" class="align-middle mr-1" size="24"></Icon>订单信息</div>
						<div class="row" style="align-items:center;justify-content:center;font-size:12px">
							<div class="col-sm-2">
								<letter-avatar 
									:name='info.student.student_name' 
									:src="info.student.photo_url" 
									size='120' 
									:rounded="true">
								</letter-avatar>
								<div class="profile-wrap center"> 
									<h3 class="pt-2">
										{{info.student.student_name}}
									</h3>
									<div class="pt-2">
										{{info.student.sex|sex}}
										<span v-if="info.student.birth_year">·&nbsp;{{age}}</span>
									</div>
								</div>
							</div>
							<div class="col-sm-10">
								<table>
									<tbody>
										<tr>
											<td class="pr-3"><h5>订单编号：{{info.order_no}}</h5></td>
											<td class="pr-3">下单日期：{{info.create_time}}</td>
											<td class="pr-3">订单金额：{{info.order_amount}}元</td>
											<td class="pr-3">已付金额：{{info.paid_amount}}元</td>
											<td class="pr-3">缴费状态：
												<span class="text-success" v-if="info.pay_status == 2">已缴清</span>
												<span class="text-warning" v-else-if="info.pay_status == 0">待缴费</span>
												<span class="text-danger" v-else>欠费{{info.unpaid_amount}}元</span>
											</td>
											<td class="pr-3">订单状态：
												<span v-if="info.order_status == 0">待付款</span>
												<span v-if="info.order_status == 1">已付款</span>
												<span v-if="info.order_status == 11">已退款</span>
											</td>
											<td class="pr-3">
												<Button type="primary" size="small" @click="showPerforModal">签单人</Button>
											</td>
										</tr>
									</tbody>
								</table>
								<table class="mt-4 modal-table">
									<thead>
										<tr>
											<th width="60"><div class="ivu-table-cell">编号</div></th>
											<th><div class="ivu-table-cell">项目名称</div></th>
											<th><div class="ivu-table-cell">有效期至</div></th>
											<th><div class="ivu-table-cell">单价</div></th>
											<th><div class="ivu-table-cell">数量</div></th>
											<th><div class="ivu-table-cell" v-help="'折扣金额=(原价-折后价)X数量'">金额优惠</div></th>
											<th><div class="ivu-table-cell">赠送优惠</div></th>
											<th><div class="ivu-table-cell" v-help="'小计金额 = （原价 X 数量)-折扣金额-直减优惠金额'">小计金额</div></th>
											<th><div class="ivu-table-cell">实缴金额</div></th>
										</tr>
									</thead>
									<template v-for="(item,index) in info.order_items">
										<order-detail-item :item="item" :index="index"></order-detail-item>
									</template>
								</table>
							</div>
						</div>
					</Card>
				</template>
			</data-ready>
			<div class="col-sm-12 mt-3">
				<Card dis-hover>
					<Tabs v-model="current_tab">
						<TabPane label="缴费记录" name="pay">
							<pay :oid="oid" v-if="current_tab == 'pay'"></pay>
						</TabPane>
						<TabPane label="退费记录" name="refund">
							<refund :oid="oid" v-if="current_tab == 'refund'"></refund>
						</TabPane>
						<TabPane label="结转记录" name="transfer">
							<transfer :oid="oid" v-if="current_tab == 'transfer'"></transfer>
						</TabPane>
					</Tabs>
				</Card>
			</div>
		</div>
		<assign-class ref="assign_class" @on-success="refreshData"></assign-class>
		<performance-info ref="ref_performance" :data="info" @on-success="refreshData"></performance-info>
	</div>
</template>

<script>
	import Vue 				from 'vue'
	import {_}   			from '@/libs/util'
	import moment 			from 'moment'
	import common       	from '@/libs/common.mixin'
	import globals 			from '@/libs/globals.mixin'
	import grid 			from '@/libs/grid.mixin'
	import dataReady 		from 'c%/DataReady.vue'
	import operationItems 	from './operation-items.vue'
	import letterAvatar     from 'c%/LetterAvatar.vue'
	import Pay 				from 'v%/business/order/record/pay.vue'
	import Transfer 		from 'v%/business/order/record/transfer.vue'
	import Refund 			from 'v%/business/order/record/refund.vue'
	import AssignClass 		from './assign-class.vue'
	import OrderDetailItem  from 'v%/business/order/order-detail-item.vue'
	import PerformanceInfo  from 'v%/business/order/performance-info.vue'
	
	export default{
		mixins: [common,globals,grid],
		components: {
			dataReady,
			operationItems,
			letterAvatar,
			Pay,
			Transfer,
			Refund,
			AssignClass,
			OrderDetailItem,
			PerformanceInfo
		},
		data () {
			return {
				oid: this.$route.params.id,
				info: {},
				nums_unit: {1:'课次',2:'课时',3:'月'},
				current_tab: 'pay'
			}
		},
		beforeRouteEnter(to,from,next) {
			next(vm=>{
				if(from.path !== '/') {
					Vue.localStorage.set('__ORDER_INFO_FROM__',from.path)
				}
			})
		},
		methods: {
			back () {
				let from = Vue.localStorage.get('__ORDER_INFO_FROM__')
				this.$router.push({path: from})
			},
			dataReady (rs) {
				this.info = rs[0]
			},
			refresh (rs) {
				this.info = rs.response  
			},
			refreshData () {
				this.$r('dr').refreshData(this.info_url)
			},
			showPerforModal () {
				this.$r('ref_performance').show('签单人','performance')
			}
		},
		computed: {
			isEmpty() {
				return _.isEmpty(this.info)
			},
			age() {
				return this.info.student.birth_year == 0 ? '未设置' : moment(new Date()).format('YYYY')-this.info.student.birth_year + '岁'
			},
			info_url() {
				return 'orders/' + this.oid
			}
		}
	}
</script>