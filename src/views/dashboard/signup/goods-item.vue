<template>
	<table class="goods-table">
		<thead>
			<tr>
				<th>项目名称</th>
				<th>有效期至</th>
				<th>原单价</th>
				<th>数量</th>
				<th>单位</th>
				<th>折扣%</th>
				<th>折后单价</th>
				<th>金额</th>
				<th>总数</th>
				<th width="100px">
					<Dropdown @on-click="changeConsumeType" transfer>
				        <span>
				            收费类型
				            <Icon type="arrow-down-b"></Icon>
				        </span>
				        <DropdownMenu slot="list">
				            <DropdownItem 
				            	v-for="(item,index) in consume_types"
								:key="index" 
				            	:name="item.value" 
				            	:disabled="order._submit===0">{{item.label}}
				            </DropdownItem>
				        </DropdownMenu>
				    </Dropdown>
				</th>
				<th>操作</th>
			</tr>
		</thead>
		<tbody>
			<template v-for="(item,index) in order.items" v-if="order._submit == 1">
				<tr>
					<td>
						<Tag color="blue" v-if="item.lid>0">课</Tag>
						<Tag color="#EF6AFF" v-if="item.pi_id>0">杂</Tag>
						<Tag color="yellow" v-else-if="item.lid==0&&item.cid>0">班</Tag>
						<Tag color="green" v-else-if="item.gtype==1">物</Tag>
						{{item.item_name}}
						<Tag v-if="item._is_term==1" color="blue" type="border">按期收费</Tag>
						<div v-if="item.cid>0&&item.lid>0">
							<Tag color="yellow" class="ml-4">班</Tag>{{item._class_name}}
						</div>
						<div v-if="item.from_lid" style="color:#f50">
							<span>{{item.from_lid|lesson_name}}</span>  <Icon type="arrow-up-c" size="14" style="vertical-align: -1px;"></Icon>
						</div>
					</td>
					<td>
						<set-expire-day 
							:item="item" 
							:list="order.items" 
							:paid-time="order.paid_time"
							v-if="show_set_expire(item)"
							>
						</set-expire-day>
						<DatePicker
							 type="date" 
							 :value="item.expire_time"
							 @on-change="item.expire_time=$event"
							 placeholder="不限" 
							 size="small" 
							 style="width: 110px">
						 </DatePicker>
					</td>
					<td>
						<InputNumber
							v-model="item.origin_price"
							:min="0"
							size="small"
							:readonly="priceReadOnly(item)"
							v-if="item._is_lock == 0||item._is_flex==1"
							@on-change="originPriceChange($event,item)"
							style="width: 80px;"
							>
						</InputNumber>
						<span v-else>{{item.origin_price}}</span>
						<Icon 
							class="fun-icon"
							:type="item._is_lock ? 'ios-locked' : 'ios-unlocked-outline'" 
							:title="item._is_lock ? '点击解锁原单价' : '点击锁定原单价'"
							@click.native="toggleLock(item)" 
							v-if="item.origin_price!==0&&item.gtype!==3"
							>
						</Icon>
						<order-promotion :item="item" v-if="item._define_promotion_rule && item._define_promotion_rule.length>1"></order-promotion>
					</td>
					<td>
						<p>
							<span>购：</span>
							<InputNumber
							 	v-model="item.nums" 
							 	:min="0" 
							 	:step="1" 
							 	size="small" 
							 	:readonly="readOnly(item)"
							 	style="width:70px;" 
							 	@on-change="numsChange(item)"
							 	v-if="item.gtype<3"
							 	>
							</InputNumber>
							<span v-else>{{item.nums}}</span>
						</p>
						<p v-if="item.nums_unit == 2" style="margin-top: 5px;">
							<span>赠：</span>
							<InputNumber 
								v-model="item.present_lesson_hours" 
								:min="0" 
								:step="1" 
								size="small"
								:readonly="readOnly(item)" 
								style="width:70px;">
							</InputNumber>
						</p>
					</td>
					<td>
						<span v-if="item.gtype == 0">{{item.nums_unit|nums_unit}}</span>
						<span v-else>{{item._unit}}</span>
					</td>
					<td>
						<InputNumber
							 v-model="item._discount_rate" 
							 :min="0" 
							 :step="1" 
							 size="small" 
							 :readonly="priceReadOnly(item)"
							 style="width:70px;" 
							 @on-change="discountRateChange(item)">
						 </InputNumber>
					</td>
					<td>
						<InputNumber
							:value="parseFloat(item.price)"
							:min="0"
							:max="parseFloat(item.origin_price)"
							size="small" 
							:readonly="priceReadOnly(item)"
							style="width:70px;"
							@on-change="priceChange($event,item)">
						</InputNumber>
					</td>
					<td>
						<InputNumber
							v-model="item._amount_by_discount"
							:min="0"
							size="small"
							:readonly="priceReadOnly(item)"
							style="width:70px;"
							@on-change="changeAmountByTerm(item)">
						</InputNumber>
						<div style="color: #ff7200">
							<div class="mt-2" v-if="item._apply_debit_type===2 && item._debit_reduced>0">
								{{item.product_level_did|dict_title('product_level')}}, 原价{{item.origin_amount}}, 直减{{item._debit_reduced}}
							</div>
							<div class="mt-2" v-if="item._apply_debit_type===1">
							 	{{item.product_level_did|dict_title('product_level')}}, 原价{{item.origin_amount}}, 折扣{{item._debit_discount}}%
							</div>
							<div class="mt-2" v-if="item._apply_debit_type===3">
							 	{{item.product_level_did|dict_title('product_level')}}, 原价{{item._debit_origin}}, 现价{{item._debit_current}}
						 	</div>
						 </div>
					</td>
					<td>
						<p>合计：{{item.nums+item.present_lesson_hours}}</p>
					</td>
					<td>
						<Select v-model="item.consume_type" size="small">
							<Option :value="0">请选择</Option>
							<Option v-for="item in consume_types" :value="item.value">{{item.label}}</Option>
						</Select>
					</td>
					<td>
						<Button 
							type="ghost" 
							shape="circle" 
							size="small" 
							icon="ios-trash" 
							@click="removeOrderItem(item,index)">
						</Button>
					</td>
				</tr>
				<tr v-if="(need_lha && item.nums_unit == 2) && (item.lesson_type == 1 || item.lesson_type == 2)">
					<td colspan="6"></td>
					<td class="text-left" colspan="2">
						<template v-if="item.lha_obj">
							<p>上课时间：</p>
							<p v-for="(v,k) in item.lha_obj">
								<Tag type="border">{{k}} ({{v.join(',')}})</Tag>
							</p>
						</template>
					</td>
					<td class="text-left" colspan="3">
						<a @click="setItemLha(item)">
							<Icon type="plus"></Icon>
							{{item.arrange_detail_length?'已安排：'+item.arrange_detail_length:'安排课时'}}
						</a>
						<a @click="teacherSchedule(item)" style="margin-left: 10px;">
							<Icon type="search"></Icon>
							教师日/周课表
						</a>
					</td>
				</tr>
			</template>
			<template v-for="(item,index) in order.items" v-if="order._submit == 0">
				<tr>
					<td>
						<Tag color="blue" v-if="item.gtype == 0">课</Tag>
						<Tag color="green" v-else>物</Tag>
						{{item.item_name}}
						<Tag v-if="item._is_term==1" color="blue" type="border">按期收费</Tag>
						<div v-if="item.cid">
							<Tag color="yellow" class="ml-4">班</Tag>{{item._class_name}}
						</div>
						<div v-if="item.from_lid" style="color:#f50">
							<span>{{item.from_lid|lesson_name}}</span>  <Icon type="arrow-up-c" size="14" style="vertical-align: -1px;"></Icon>
						</div>
					</td>
					<td>{{item.expire_time||'不限'}}</td>
					<td>{{item.origin_price}}</td>
					<td>
						<p>购：{{item.nums}}</p>
						<p v-if="item.nums_unit == 2" style="margin-top: 5px;">
							赠：{{item.present_lesson_hours}}
						</p>
					</td>
					<td>
						<span v-if="item.gtype == 0">{{item.nums_unit|nums_unit}}</span>
						<span v-else>{{item._unit}}</span>
					</td>
					<td>{{item._discount_rate}}</td>
					<td>{{item.price}}</td>
					<td>{{cacu_item_amount(item)}}</td>
					<td>
						<p>合计：{{item.present_lesson_hours+item.nums}}</p>
					</td>
					<td>{{item.consume_type|consume_type}}</td>
					<td></td>
				</tr>
				<tr v-if="(need_lha && item.nums_unit == 2) && (item.lesson_type == 1 || item.lesson_type == 2)">
					<td colspan="6"></td>
					<td class="text-left" colspan="2">
						<template v-if="item.lha_obj">
							<p>上课时间：</p>
							<p v-for="(v,k) in item.lha_obj">
								<Tag type="border">{{k}} ({{v.join(',')}})</Tag>
							</p>
						</template>
					</td>
					<td class="text-left" colspan="3">
						<a @click="setItemLha(item)">
							<Icon type="plus"></Icon>
							{{item.arrange_detail_length?'已安排：'+item.arrange_detail_length:'安排课时'}}
						</a>
						<a @click="teacherSchedule(item)" style="margin-left: 10px;">
							<Icon type="search"></Icon>
							教师日/周课表
						</a>
					</td>
				</tr>
			</template>
			<tr v-if="order.items.length == 0">
				<td colspan="12" style="text-align:center;color:#c3cbd6;padding:30px">请选择课程或物品</td>
			</tr>
		</tbody>
	</table>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modalMixin from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import OrderPromotion from './order-promotion.vue'
	import SetExpireDay from './set-expire-day.vue'
	
	export default {
		name: 'GoodsTable',
		mixins: [modalMixin,common,globals],
		components: {
			OrderPromotion,
			SetExpireDay
		},
		props: {
			order: {
				type: Object,
				default(){
					return {}
				}
			},
			student:{
				type:Object,
				default(){
					return {
						sid:0
					}
				}
			}
		},
		data() {
			return {
				
			}
		},
		created() {

		},
		methods: {
			setItemLha(item) {
				if(_.isEmpty(item.lha)) {
					let lha = {
						int_day: [],
						teach_eid: [],
						lid: 0,
						int_start_hour:'',
						int_end_hour:'',
						week_days: [],
						lesson_type: 2
					}
					lha.int_day.push(this.order.paid_time)
					if(item.expire_time) {
						lha.int_day.push(item.expire_time)
					}
					else{
						let end = moment(this.order.paid_time).add(60,'days').format('YYYY-MM-DD')
						lha.int_day.push(end)
					}
					lha.lid = item.lid
					lha.lesson_type = item.lesson_type
					item.lha = lha
				}
				let student = this.student
				
				this.$Modal.open('dashboard/signup/lesson-hour-arrange.vue@modal',{
					on: {
						'on-success':(data) => {
							this.setItemLhaObj(item,data)
						}
					},
					props: {
						item: item,
						student:student
					}
				})
				.then(modal => {
					modal.show(util.sprintf('选择上课时段，共 %s 课时',item.nums+item.present_lesson_hours))
				})
			},
			setItemLhaObj(item,data) {
				let lha_obj = {}
				item.lha.arrange_detail = data
				this.$set(item,'arrange_detail_length',data.length)
				data.forEach(d => {
					let k = this.$filter('int_hour')(d.int_start_hour)+'-'+this.$filter('int_hour')(d.int_end_hour)
					if(lha_obj[k]) {
						lha_obj[k].push(d.int_month)
					}
					else {
						lha_obj[k] = []
						lha_obj[k].push(d.int_month)
					}
				})
				this.$set(item,'lha_obj',lha_obj)
			},
			teacherSchedule(item) {
				this.$Modal.open('business/arrange/schedule/teacher-schedule.vue@modal',{
					props: {
						lid: item.lid
					}
				})
				.then(modal => {
					modal.show(util.sprintf('教师日/周课表【%s】',item.item_name))
				})
			},
			show_set_expire(item) {
				return item.expire_time!==''&&this.order.items.filter(i => i.expire_time !== '').length>1
			},
			readOnly(item) {
				if(item._pr_id > 0) {
					return true
				}
				return false
			},
			priceReadOnly(item){
				if(item._pr_id > 0 || !this.hasPer('payment.changeprice')) {
					return true
				}
				return false
			},
			buildType(item) {
				return item._is_lock ? 'ios-locked' : 'ios-unlocked-outline'
			},
			toggleLock(item) {
				item._is_lock = !item._is_lock
			},
			cacu_item_amount(item){
				return util.mul(item.price,item.nums).toFixed(2)
			},
			// 数量改变重新统计原始金额、折扣金额
			numsChange(item) {
				item.origin_amount = util.mul(item.origin_price, item.nums).toFixed(2)
				item.discount_amount = util.sub(item.origin_amount,util.mul(item.price,item.nums)).toFixed(2)
				if(item.nums_unit == 3) {
					item.expire_time = moment().add(item.nums,'months').format('YYYY-MM-DD')
				}
				item._amount_by_discount = util.float(util.mul(item.nums,item.price).toFixed(2))
				if(item._apply_debit_type == 3) {
					item._debit_current = item._amount_by_discount
				}else if(item._apply_debit_type == 1) {
					item._debit_discount = item._discount_rate
				}else{
					item._debit_reduced = item.discount_amount
				}
			},
			// 折扣率发生变化
			discountRateChange(item) {
				item.price = (util.mul(item._discount_rate, item.origin_price) / 100).toFixed(6)
				this.numsChange(item)
			},
			// 原单价为0是可以修改
			originPriceChange(val,item) {
				this.discountRateChange(item)
			},
			// 折后单价变化
			priceChange(val,item) {
				item.price = val
				item._discount_rate = Math.round(item.price / item.origin_price * 10000) / 100
				this.numsChange(item)
			},
			// 赠送数量改变
			presentChange(item, type) {
				if(type == 1) {
					item.lesson_times = util.add(item.nums, item.present_lesson_times)
				}else{
					item.lesson_hours = util.add(item.nums, item.present_lesson_hours)
				}
			},
			// 移除项目
			removeOrderItem(item,index) {
				if(item.oi_id) {
					this.deleteOrderItem(item,index)
				}else{
					this.order.items.splice(index, 1)
				}
			},
			changeConsumeType(name) {
				this.order.items.forEach(item=>{
					item.consume_type = name
				})
			},
			changeAmountByTerm(item) {
				item.price = Number(util.div(item._amount_by_discount,item.nums).toFixed(6))
				if(item._data.origin_price == 0 && !item._is_lock) {
					if(item._apply_debit_type == 0) {
						item._discount_rate = 100
						item.origin_price = item.price
						item.origin_amount = item._amount_by_discount
					}else if(item._apply_debit_type == 3) {
						item._debit_current = item._amount_by_discount
						item._discount_rate = Math.round(item.price / item.origin_price * 10000) / 100
					}
				}else{
					item._discount_rate = Math.round(item.price / item.origin_price * 10000) / 100
				}
				item.discount_amount = util.sub(item.origin_amount,util.mul(item.price,item.nums)).toFixed(2)
			},
			deleteOrderItem(item,index) {
				this.confirm('确定删除订单条目吗?')
				.then(() => {
					this.$rest('order_items').delete(item.oi_id)
					.success(res => {
						this.$Message.success('删除成功')
						this.order.items.splice(index, 1)
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			}
		}
	}
</script>
<style>
	.fun-icon {
		font-size: 16px;
		cursor: pointer;
		vertical-align: -2px;
		margin-left: 2px;
	}
</style>
