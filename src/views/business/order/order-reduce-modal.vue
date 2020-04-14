<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<Form :label-width="labelWidth" class="row">
            <Form-item label="订单号：" class="mb-0 col-sm-4">
                {{order.order_no}}
            </Form-item>
            <Form-item label="下单时间：" class="mb-0 col-sm-4">
                {{order.create_time}}
            </Form-item>
            <Form-item label="报名日期：" class="mb-0 col-sm-4">
                {{order.paid_time}}
            </Form-item>
            <Form-item label="订单金额：：" class="mb-0 col-sm-4">
                {{order.order_amount|amount}}
            </Form-item>
            <Form-item label="已付金额：" class="mb-0 col-sm-4">
                {{order.paid_amount|amount}}
            </Form-item>
            <Form-item label="缴费状态：" class="mb-0 col-sm-4">
                <span class="text-success" v-if="order.pay_status == 2">已缴清</span>
                <span class="text-warning" v-else-if="order.pay_status == 0">待缴费</span>
                <span class="text-danger" v-else>欠费{{order.unpaid_amount | amount}}元</span>
            </Form-item>
		</Form>

        <table class="mt-4 modal-table" v-for="(item,index) in order_items" :key="index">
            <thead>
                <tr>
                    <th><div class="ivu-table-cell">项目</div></th>
                    <th><div class="ivu-table-cell">单价</div></th>
                    <th><div class="ivu-table-cell">数量</div></th>
                    <th><div class="ivu-table-cell" v-help="'折扣金额=(原价-折后价)X数量'">金额优惠</div></th>
                    <th><div class="ivu-table-cell">赠送优惠</div></th>
                    <th><div class="ivu-table-cell" v-help="'小计金额 = （原价 X 数量)-折扣金额-直减优惠金额'">小计金额</div></th>
                    <th><div class="ivu-table-cell">实缴金额</div></th>
                    <th><div class="ivu-table-cell">欠缴</div></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><div class="ivu-table-cell">{{getName(item)}}</div></td>
                    <td>
                        <div class="ivu-table-cell">
                        <span>原价：{{item.origin_price | amount}}</span><br/>
                        <span>折后价：{{item.price | amount}}</span>
                        </div>
                    </td>
                    <td>
                        <div class="ivu-table-cell">
                            <span>{{item.nums}}{{getUnit(item)}}</span><br/>
                            <span v-if="item.nums_unit==1">(合{{item.origin_lesson_hours}}课时)</span>
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
                    <td><div class="ivu-table-cell">{{item.unpay_amount}}</div></td>
                </tr>
                <template v-if="item.unpay_amount > 0">
                <tr>
                    <td></td>
                    <td>
                        <div class="ivu-table-cell text-right">减少数量:</div>
                    </td>
                    <td>
                        <div class="ivu-table-cell">
                            <Input v-model="item.reduce_nums" v-keeptwo size="small"></Input>
                        </div>
                    </td>
                    <td>
                        <div class="ivu-table-cell text-right">扣除赠送</div>
                    </td>
                    <td>
                        <div class="ivu-table-cell">
                            <template v-if="item.present_lesson_hours > 0">
                                <Input v-model="item.reduce_present_nums" v-keeptwo size="small"></Input>
                            </template>
                            <span v-else>
                                -
                            </span>
                        </div>
                    </td>
                    <td colspan="2">
                        <div class="ivu-table-cell text-right">扣除欠款:</div>
                    </td>
                    <td>
                        <div class="ivu-table-cell">
                            <Input v-model="item.reduce_amount" v-keeptwo size="small"></Input>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td>备注/原因</td>
                    <td colspan="6">
                        <Input v-model="item.reason" size="small"></Input>
                    </td>
                </tr>
                </template>
            </tbody>
        </table>
		<div slot="footer">
			<Button type="ghost" @click="close" :disabled="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
    import common from '@/libs/common.mixin'
    import util from '@/libs/util'
	export default {
        mixins: [modal,common],
        props:{
           order: {
				type: Object,
				default:() => {
					return {
                        oid:0
                    }
				}
			}
        },
		data() {
			return {
                labelWidth:80,
                order_items:[]
			}
        },
        mounted(){
            this.init_data()
        },
		methods: {
            init_data(){
                this.order.order_items.forEach(item=>{
                    let oi = util.copy(item)
                    oi.unpay_amount = util.sub(oi.subtotal,oi.paid_amount)
                    if(oi.unpay_amount > 0){
                        oi.reduce_amount = oi.unpay_amount
                        oi.reduce_nums   = Number(util.div(oi.unpay_amount,oi.price)).toFixed(2)
                        oi.reduce_present_nums = 0
                        if(oi.present_lesson_hours > 0){
                            oi.reduce_present_nums = oi.present_lesson_hours
                        }
                        oi.reason = ''
                    }
                    this.order_items.push(oi)
                })
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
            build_post(){
                let post = {}
                post.oid = this.order.oid 
                post.items = []
                for(let i=0;i<this.order_items.length;i++){
                    let item = this.order_items[i]
                    item.reduce_nums = util.float(item.reduce_nums)
                    item.reduce_amount = util.float(item.reduce_amount)
                    item.reduce_present_nums = util.float(item.reduce_present_nums)
                    if(item.reduce_amount > item.unpay_amount){
                        this.$Message.error('减少金额不能大于未付款金额')
                        return false
                    }
                    if(item.reduce_nums > item.nums){
                        this.$Message.error('减少数量不能大于总数')
                        return false
                    }
                    if(item.reduce_present_nums > item.present_lesson_hours){
                        this.$Message.error('扣除赠送数量不能大于赠送数')
                        return false
                    }

                    if(item.reduce_amount > 0){
                        post.items.push({
                            oi_id:item.oi_id,
                            reduce_nums:item.reduce_nums,
                            reduce_present_nums:item.reduce_present_nums,
                            reduce_amount:item.reduce_amount,
                            reason:item.reason
                        })
                    }
                }
                return post
            },
			ok() {
                let post = this.build_post()
                if(false === post){
                    return false
                }
                this.$rest('orders')
                .add_url_param(this.order.oid,'doreduce')
                .post(post)
                .success(response=>{
                    this.$emit('success')
                    this.$Message.success('欠款扣除操作成功!')
                    this.close()
                })
                .error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>