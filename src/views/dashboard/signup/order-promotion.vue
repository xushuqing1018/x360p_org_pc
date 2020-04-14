<template>
	<Poptip title="优惠方案">
		<Icon 
			class="fun-icon" 
			type="pricetag"
			:color="item._pr_id>0?'#39f':''" 
			title="点击选择优惠"
			>
		</Icon>
		<Select v-model="item._pr_id" @on-change="selectPromotion(item,$event)" slot="content">
			<Option 
				:value="r.pr_id" 
				v-for="r in item._define_promotion_rule"
				:disabled="pDisabled(item,r)"
				>
				{{r.title}}
			</Option>
		</Select>
	</Poptip>
</template>
<script>
	import util from '@/libs/util'
	export default {
		props: {
			item: Object
		},
		data() {
			return {

			}
		},
		computed: {
			origin_amount_by_nums() {
				return util.float(util.mul(this.item.origin_price,this.item.nums).toFixed(2))
			}
		},
		methods: {
			pDisabled(item,rule) {
				let result = false
				let type = rule.promotion_type
				let valve = Number(rule.valve)
                let value = Number(rule.promotion_value)
				switch(type) {
					case 1:
						if(item.origin_price == 0) {
							result = true
						}
						break;
					case 2:
						if(this.origin_amount_by_nums < valve) {
							result = true
						}
						break;
					case 3:
						if(item.origin_price == 0 || this.origin_amount_by_nums < value) {
							result = true
						}
						break;
					case 4: 
						if(item.nums_unit == 3) {
							result = true
						}
						break;
				}
				return result
			},
			selectPromotion(item,$event) {
				let rule = item._define_promotion_rule.find(r => r.pr_id == $event)
				let type = rule.promotion_type
                let valve = Number(rule.valve)
                let value  = Number(rule.promotion_value)
                let rule_extra_present = Number(rule.present_lesson_hours || 0)

                item.present_lesson_hours = 0
                item._discount_rate = 100
                item.price = item._data.origin_price
                item.origin_price = item._data.origin_price
                item._amount_by_discount = this.origin_amount_by_nums

                switch(type) {
                    case 1: 
                    	//打折计算折后单价
                        item._discount_rate = value
                        item.price = (util.mul(item._discount_rate, item.origin_price) / 100).toFixed(6)
                        item._amount_by_discount = util.float(util.mul(item.nums,item.price).toFixed(2))
                        break;
                    case 2: 
                    	//满减计算折扣率
                        item._amount_by_discount = util.float(util.sub(this.origin_amount_by_nums,value).toFixed(2))
                        item.price = Number(util.div(item._amount_by_discount,item.nums).toFixed(6))
                        item._discount_rate = Math.round(item.price / item.origin_price * 10000) / 100
                        break
                    case 3:
                    	//直减计算折扣率
                    	item._amount_by_discount = util.float(util.sub(this.origin_amount_by_nums,value).toFixed(2))
                        item.price = Number(util.div(item._amount_by_discount,item.nums).toFixed(6))
                        item._discount_rate = Math.round(item.price / item.origin_price * 10000) / 100
                        break
                    case 4:
                        item.present_lesson_hours = value
                        break
                }
                if(rule_extra_present && type < 4 && type > 0) {
                	item.present_lesson_hours = rule_extra_present
                }
                item.origin_amount = util.mul(item.origin_price, item.nums).toFixed(2)
                item.discount_amount = util.sub(item.origin_amount,util.mul(item.price,item.nums)).toFixed(2)
			}
		}
	}
</script>