<template>
	<tbody>
		<tr style="background:#fff">
			<td><div class="ivu-table-cell">{{index+1}}</div></td>
			<td><div class="ivu-table-cell">{{getName(item)}}</div></td>
			<td><div class="ivu-table-cell"><a @click="modifyConsumeType">{{item.consume_type|consume_type}}</a></div></td>
			<td><div class="ivu-table-cell">{{getExpire(item)}}</div></td>
			<td><div class="ivu-table-cell">
				<span>原价：{{item.origin_price | amount}}</span><br/>
				<span>折后价：{{item.price | amount}}</span>
			</div></td>
			<td>
				<div class="ivu-table-cell">
					<span>{{item.nums}}{{getUnit(item)}}</span><br/>
					<span v-if="item.nums_unit==1">(合{{item.origin_lesson_hours}}课时)</span>
					<a href="javascript:void(0);" v-if="need_lha && item.order_item_lha" @click="lha_info(item)">课时安排详情</a>
				</div>
			</td>
			<td>
				<div class="ivu-table-cell">
					<span v-if="item.sdc_id">{{debit.debit_card.card_name}}</span><br/>
					<span>折扣：{{item.discount_amount | amount}}</span><br/>
					<span>直减：{{item.reduced_amount | amount}}</span>
				</div>
			</td>
			<td>
				<div class="ivu-table-cell" v-if="item.gtype==0">
					<p v-if="item.nums_unit==1">
						<span>送课次：{{item.present_lesson_times}}</span><br/>
						<span>(合{{getPresentLessonHour(item)}}课时)</span>
					</p>
					<p v-else-if="item.nums_unit==2">送课时：{{item.present_lesson_hours}}</p>
				</div>
			</td>
			<td><div class="ivu-table-cell">{{item.subtotal}}</div></td>
			<td><div class="ivu-table-cell">{{item.paid_amount}}</div></td>
		</tr>
		<tr v-if="item.gtype==0&&item.nums_unit!==3" style="background: #f5f7f9">
			<td colspan="10">
				<template  v-if="present_lesson_consume_method==2">
					<Row style="font-weight:600">
						<Col span="6" offset="8">1课时课耗金额 = 小计金额 ÷ (原课时 + 赠送课时)</Col>
						<Col span="4" v-if="item.lid">备注：单次课扣{{unit_lesson_hours}}课时</Col>
					</Row>
					<Row>
						<Col span="6" offset="8">
							<span>{{item.unit_lesson_hour_amount | amount}}</span> = 
							<span>{{item.subtotal | amount}} ÷</span>
							(<span>{{item.origin_lesson_hours}}</span> + 
							<span v-if="item.nums_unit==2">{{item.present_lesson_hours}}</span>
							<span v-else-if="item.nums_unit==1">{{getPresentLessonHour(item)}}</span>)
						</Col>
					</Row>
				</template>
				<template v-else>
					<Row style="font-weight:600">					
						<Col span="6" :offset="showPresentHour?6:8">
							<p>
								<span v-if="showPresentHour">正常课时：</span>
								1课时课耗金额 = {{item.price | amount}}元 
								<span v-if="showPresentHour">（前{{item.origin_lesson_hours}}课时）</span>
							</p>
						</Col>
						<Col span="8" offset="2" v-if="showPresentHour">
							<p>
								赠送课时：1课时课耗金额 = 0元（后
								<span v-if="item.nums_unit==2">{{item.present_lesson_hours}}</span>
								<span v-else-if="item.nums_unit==1">{{getPresentLessonHour(item)}}</span>
								<span v-else>0</span> 课时）
							</p>
						</Col>

					</Row>
				</template>
				<Row v-if="item.refund_amount > 0">
					<Col span="6" offset="8">
						有退费,退费后1课时消耗金额 = {{item.unit_lesson_hour_amount | amount}}元
					</Col>
				</Row>
			</td>
		</tr>
	</tbody>
</template>
<script>
	import util    from '@/libs/util'
	import common  from '@/libs/common.mixin'
	import globals from  '@/libs/globals.mixin'
	export default {
		mixins: [common,globals],
		props: {
			item: {
				type: Object,
				default:() => {
					return {}
				}
			},
			index: {
				type: [Number,String],
				default:() => {
					return 0
				}
			},
			debit: {
				type: Object,
				default:() => {
					return {}
				}
			}
		},
		data() {
			return {
				unit_lesson_hours: ''
			}
		},
		mounted() {
			this.setUnitLessonHour()
		},
		computed: {
			showPresentHour () {
				let item = this.item
				return item.nums_unit==2 
					&& Number(item.present_lesson_hours) > 0 
					|| (item.nums_unit==1 && Number(this.getPresentLessonHour(item)) > 0)
			},
			present_lesson_consume_method () {
				let result = 1
				if(this.$store.state.gvars.configs.params){
					result = this.$store.state.gvars.configs.params.present_lesson_consume_method
				}
				return result
			}
		},
		methods: {
			getExpire(item) {
				if(item.gtype == 1) {
					return '-'
				}else{
					return item.expire_time||'-'
				}
			},
			getName(item) {
				return item.item_name
			},
			getUnit(item) {
				if(item.gtype == 1) {
					return item.material.unit
				}else if(item.gtype == 2){
					return '元'
				
				}else{
					return this.$filter('nums_unit')(item.nums_unit)
				}
			},
			getPresentLessonHour(item) {
				return (util.mul(this.unit_lesson_hours,item.present_lesson_times)).toFixed(2)
			},
			setUnitLessonHour() {
				if(this.item.gtype == 0 && this.item.lid > 0) {
					this.unit_lesson_hours = this.getLessonObj(this.item.lid).unit_lesson_hours
				}
			},
			modifyConsumeType() {
				this.$Modal.open('business/order/edit-consume-type-modal.vue',{
					props: {
						data: this.item
					},
					on: {
						'on-success':() => {
							this.$emit('on-success')
						}
					}
				})
				.then(modal => {
					modal.show('编辑','edit')
				})
			},
			lha_info(item){
				this.$Modal.open('business/order/lha-info-modal.vue',{
					props: {
						info: item.order_item_lha
					}
				})
				.then(modal => {
					modal.show(`【${item.item_name}】课时安排详情`)
				})
			}
		}
	}
</script>
