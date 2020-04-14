<template>
	<Modal v-model="modal$.show" :mask-closable="false" :width="width" title="打印预览" @on-cancel="cancel" v-drag-modal>
		<div class="mb-3 padder row">
			<p class="col-sm-12 mb-2">打印参数设置：</p>
			<div class="mb-2" :class="width==800?'col-sm-4':'col-xs-12'">水平偏移： <InputNumber :step="1" v-model="left"></InputNumber> 像素</div>
			<div class="mb-2" :class="width==800?'col-sm-4':'col-xs-12'">垂直偏移：<InputNumber :step="1" v-model="top"></InputNumber> 像素</div>
			<div :class="width==800?'col-sm-4':'col-xs-12'">打印份数：<InputNumber :step="1" v-model="times"></InputNumber> 份</div>
		</div>		
		<div id="printContainer" :style="{padding:margin}"></div>		
		<div slot="footer">
			<Button type="ghost" @click="cancel">关闭</Button> 
			<Button type="primary" @click="print">打印</Button>
		</div>
	</Modal>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default{
		mixins: [modal,common],		
		data () {
			return {
				info: '',
				top: 0,
				left: 0,
				times: 1,
				width: 800,
				data: {
					student:{
						student_name: '小明',
						sex:'男',
						student_type:'新生',
						sno: 'S123456',
						first_tel:'13006617500',
						first_family_name:'大明',
						first_family_rel:'爸爸',
						school_name:'育才二小',
						school_grade:'三年级',
						student_money:'100.00'

					},
					items:{
						item_name:'班课语文提升课',
						lesson_name: '班课语文提升课',
						class_name: '三年级',
						expire_time: '2018-06-01',
						nums: '10课时，送1课时',
						origin_price: '100.00',
						price: '90.00',
						subtotal: '900.00',
						
						pay_date: '2017-11-14',
						pay_no: 'NO.00001234',
						old_nums: '10',
						nums: '5',
						
						origin_times: '10',
						present_times: '1',
						unit_price: '100.00',
						lesson_amount: '1000.00',
						note: '',
						title: '班课语文提升课'
					},
					bs: {
						student_name: '小明',
						sno: 'S123456',
						pay_date: '2017-11-14',
						receipt_no: 'NO.00001234',
						class_name: '102班',
						pay_remark: '今天周二',
						origin_amount: '2700',
						balance_paid_amount: '100',
						order_reduce_amount: '100',
						pay_amount: '2500',
						pay_amount_b: '贰仟伍佰元整 [现金：2500.00]',
						pay_remain_amount: '0.00',
						op_name: '管理员',
						receiver_name: '小刚',
						account: 'xiaoming@base',
						total_amount: '3000.00',
						pay_amount: '3000.00',
						unpay_amount: '0.00',
						receive_date: moment(new Date()).format('YYYY-MM-DD'),
						refund_total: '2700.00',
						renfund_amount_b: '贰仟元整 [现金：2000.00]',
						refund_balance_amount: '0.00',
						cut_amount: '700.00',
						refund_amount: '2000.00',
					},
					bm:[{
							lesson_name: '一对一语文提升课',
							class_name: '一年级',
							expire_time: '2018-06-01',
							nums: '10课时，送1课时',
							origin_price: '100.00',
							subtotal: '900.00',				
							price: '90.00',
							
							pay_date: '2017-11-14',
							pay_no: 'NO.00001234',
							old_nums: '10',
							nums: '5',
							
							origin_times: '10',
							present_times: '1',
							unit_price: '100.00',
							lesson_amount: '1000.00',
							note: '',
							title: '一对一语文提升课'
						},
						{
							lesson_name: '一对多语文提升课',
							class_name: '二年级',
							expire_time: '2018-06-01',
							nums: '10课时，送1课时',
							origin_price: '100.00',
							price: '90.00',
							subtotal: '900.00',
							
							pay_date: '2017-11-14',
							pay_no: 'NO.00001234',
							old_nums: '10',
							nums: '5',
							
							origin_times: '10',
							present_times: '1',
							unit_price: '100.00',
							lesson_amount: '1000.00',
							note: '',
							title: '一对多语文提升课'
						},
						{
							lesson_name: '班课语文提升课',
							class_name: '三年级',
							expire_time: '2018-06-01',
							nums: '10课时，送1课时',
							origin_price: '100.00',
							price: '90.00',
							subtotal: '900.00',
							
							pay_date: '2017-11-14',
							pay_no: 'NO.00001234',
							old_nums: '10',
							nums: '5',
							
							origin_times: '10',
							present_times: '1',
							unit_price: '100.00',
							lesson_amount: '1000.00',
							note: '',
							title: '班课语文提升课'
						}
					],
					sys: {
						branch_name: '罗湖校区',
						org_name: '浪腾软件',
					}
				}
			}
		},
		methods: {
			cancel () {
				this.close()
			},
			printView (data) {			
				let content = this.info
				data = data||this.data
	            let res = Vue.compile(content)
	            let vm = new Vue({
	                data:data,
	                render: res.render,
	                staticRenderFns: res.staticRenderFns
	            })
	            let node = vm.$mount()            
	            document.getElementById('printContainer').innerHTML = ''   
	            document.getElementById('printContainer').appendChild(node.$el)
				this.modal$.show = true			
			},
			print () {
				let content = document.getElementById('printContainer').innerHTML
				let htmls = [{
					content: content,
					times: this.times,
					margin: this.margin
				}],
				cssLinks = ['/static/css/print.css']
				let page = this.width===800?'a4':'fe'
				this.printer.print(htmls,cssLinks,page)
			}
		},
		computed: {
			margin () {
				return `${this.top}px 0 0 ${this.left}px`
			}
		}
	}
</script>
