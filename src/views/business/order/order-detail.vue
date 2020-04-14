<template>
	<div class="c-grid">
		<div class="row padder-sm">
			<div class="col-sm-12">
				<Button type="primary" icon="chevron-left" size="small" @click="back"></Button>
				<operation-items class="pull-right" :info="info" :refs="$refs" :is-detail="true" v-if="!isEmpty"></operation-items>				
			</div>		
			<data-ready ref="dr" :cache="false" :data="[info_url]" @refresh="refresh" @ready="dataReady" class="col-sm-12 mt-2">
				<template v-if="!isEmpty">
					<Card dis-hover>
						<div slot="title"><h5>订单编号 {{info.order_no}}</h5></div>
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
											<td class="pr-3">下单时间：{{info.create_time}}</td>
											<td class="pr-3">报名日期：{{info.paid_time}}</td>
											<td class="pr-3">订单金额：{{info.order_amount | amount}}元</td>
											<td class="pr-3">已付金额：{{info.paid_amount | amount}}元</td>
											<td class="pr-3">缴费状态：
												<span class="text-success" v-if="info.pay_status == 2">已缴清</span>
												<span class="text-warning" v-else-if="info.pay_status == 0">待缴费</span>
												<span class="text-danger" v-else>欠费{{info.unpaid_amount | amount}}元</span>
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
										<tr v-if="info.refund_amount > 0">
											<td colspan="7">
												有退费:{{info.refund_amount | amount}}元
											</td>
										</tr>
									</tbody>
								</table>
								<table class="mt-4 modal-table">
									<thead>
										<tr>
											<th width="60"><div class="ivu-table-cell">#</div></th>
											<th><div class="ivu-table-cell">项目</div></th>
											<th><div class="ivu-table-cell">类型</div></th>
											<th><div class="ivu-table-cell">有效期</div></th>
											<th><div class="ivu-table-cell">单价</div></th>
											<th><div class="ivu-table-cell">数量</div></th>
											<th><div class="ivu-table-cell" v-help="'折扣金额=(原价-折后价)X数量'">金额优惠</div></th>
											<th><div class="ivu-table-cell">赠送优惠</div></th>
											<th><div class="ivu-table-cell" v-help="'小计金额 = （原价 X 数量)-折扣金额-直减优惠金额'">小计金额</div></th>
											<th><div class="ivu-table-cell">实缴金额</div></th>
										</tr>
									</thead>
									<template v-for="(item, index) in info.order_items">
										<order-detail-item 
											:item="item" 
											:index="index" 
											:debit="info.student_debit_card"
											@on-success="refreshData"
											>
										</order-detail-item>
									</template>
								</table>
							</div>
						</div>
					</Card>
				</template>
			</data-ready>
			<div class="col-sm-12 mt-2">
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
						<TabPane label="课时记录" name="lesson">
							<lesson :sid="info.sid" v-if="current_tab == 'lesson'"></lesson>
						</TabPane>
					</Tabs>
				</Card>
			</div>
		</div>
		<assign-class ref="assign_class" @on-success="refreshData"></assign-class>
		<assign-teacher ref="assing_teacher" @on-success="refreshData"></assign-teacher>
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
	import Pay 				from './record/pay.vue'
	import Lesson 			from '../student/record/lesson.vue'
	import Transfer 		from './record/transfer.vue'
	import Refund 			from './record/refund.vue'
	import AssignClass 		from './assign-class.vue'
	import AssignTeacher 	from './assign-teacher.vue'
	import OrderDetailItem  from './order-detail-item.vue'
	import PerformanceInfo  from './performance-info.vue'
	
	export default{
		mixins: [common,globals,grid],
		components: {
			dataReady,
			operationItems,
			letterAvatar,
			Pay,
			Transfer,
			Refund,
			AssignTeacher,
			AssignClass,
			OrderDetailItem,
			PerformanceInfo,
			Lesson
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
				this.$store.commit('setSearchDetail',true)
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
				return `orders/${this.oid}?with=student_debit_card.debit_card`
			}
		}
	}
</script>