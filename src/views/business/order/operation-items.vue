<template>
	<div>
		<Dropdown trigger="click">
			<slot>
				<Button type="primary" size="small">操作 <Icon type="arrow-down-b"></Icon></Button>
			</slot>
			<DropdownMenu slot="list">
				<!--<DropdownItem @click.native="assignClass" v-if="assign_items.length!==0" v-per="'offline.asclass'">
	            	<Icon type="plus"></Icon> 分班
	            </DropdownItem>-->
	            <DropdownItem @click.native="makeup" v-if="info.pay_status < 2 && info.order_status > 0" v-per="'offline.makeup'">
	            	<Icon type="cash"></Icon> 补缴
	            </DropdownItem>
				<DropdownItem @click.native="reduce" v-if="info.pay_status < 2 && info.order_status > 0" v-per="'order.reduce'">
	            	<Icon type="scissors"></Icon> 欠费扣除
	            </DropdownItem>
	            <template v-if="info.order_status > 0">
	            	<DropdownItem @click.native="transfer" v-per="'offline.transfer'">
		            	<Icon type="loop"></Icon> 结转
		            </DropdownItem>
		            <DropdownItem @click.native="refund" v-per="'offline.refund'">
		            	<Icon type="arrow-return-left"></Icon> 退费
		            </DropdownItem>
	            </template>
	            <DropdownItem @click.native="printCourseTable" v-per="'offline.print'" v-if="info.is_submit == 1">
	            	<Icon type="printer"></Icon> 打印课表
	            </DropdownItem>
	            <DropdownItem @click.native="detail" v-if="!isDetail">
	            	<Icon type="more"></Icon> 订单详情
	            </DropdownItem>
	            <DropdownItem @click.native="printInvoice" v-per="'offline.invoice'" v-if="enable_invoice_print && info.order_status == 0">
	            	<Icon type="printer"></Icon> 打印INVOICE
	            </DropdownItem>
	            <DropdownItem @click.native="continuePay" v-per="'offline.pay'" v-if="info.order_status == 0">
	            	<Icon type="arrow-right-c"></Icon> 继续支付
	            </DropdownItem>
	            <DropdownItem @click.native="editContractNo" v-per="'offline.edit'">
		            <Icon type="edit"></Icon> 修改合同号
		        </DropdownItem>
		        <DropdownItem @click.native="deleteOrder">
	            	<Icon type="ios-trash"></Icon> 删除订单
	            </DropdownItem>
				<DropdownItem @click.native="doCheck" v-per="'order.check'" v-if="info.pay_status > 0 && info.is_check == 0">
	            	<Icon type="checkmark"></Icon> 审核订单
	            </DropdownItem>
				<DropdownItem @click.native="doUnCheck" v-per="'order.uncheck'" v-if="info.is_check == 1">
	            	<Icon type="close"></Icon> 取消审核
	            </DropdownItem>
	        </DropdownMenu>
		</Dropdown>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [modal,globals,common],
		props: {
			info: {
				type: Object,
				default: function () {
					return {}
				}
			},
			refs: {
				type: Object,
				default: () => {
					return {}
				}
			},
			isDetail:Boolean
		},
		methods: {
			makeup () {
				this.$router.push({name:'dashboard_payment',params:{sid:this.info.sid,oid:this.info.oid}})
			},
			transfer() {
				this.$router.push({name:'dashboard_transfer',params:{sid:this.info.sid,oid:this.info.oid}})
			},
			refund () {
				this.$router.push({name:'dashboard_refund',params:{sid:this.info.sid,oid:this.info.oid}})
			},
			detail () {
				this.$router.push({path:'/business/order/'+this.info.oid})
			},
			deleteOrder() {
				this.confirm('您确定要删除该订单吗？')
				.then(() => {
					let hasPer = this.userPers.indexOf('offline.delete')>-1
					if(hasPer) {
						this.$rest('orders')
		                .delete(this.info.oid)
		                .success((response)=>{
		                    this.$Message.success('删除成功')
		                    if(this.isDetail) {
		                    	this.$router.go(-1)
		                    }else{
		                    	this.$emit('refresh')
		                    }
		                })
		                .error((response)=>{
		                    this.error(response.body.message)
		                })
					}else{
						this.$Message.error('您没有删除订单的权限, 请联系管理员')
					}
				})
			},
			continuePay() {
				this.$router.push({name:'dashboard_payment',params:{sid:this.info.sid,oid:this.info.oid}})
			},
			assignClass() {
				this.refs.assign_class
				.set('oid',this.info.oid)
				.get_data()
				.show(util.sprintf('报名分班【%s】',this.info.student.student_name),'assign_class')
			},
			refresh() {
				if(this.isDetail) {
                	this.refreshData('orders/'+this.info.oid)
                }else{
                	this.$emit('refresh')
                }
			},
			assignTeacher() {
				this.refs.assing_teacher
				.set('oid',this.info.oid)
				.get_data()
				.show(util.sprintf('分配学管师【%s】',this.info.student.student_name),'assign_teacher')
			},
			printCourseTable() {
				this.showPageSpin('正在获取打印模板...')
				this.$rest('orders/do_print?type=lesson&number='+this.info.oid)
				.get()
				.success(data=>{
					this.printer.printBill(5,data,1,'0 0 0 0',true)
					this.hidePageSpin()
				}).error(body=>{
					this.hidePageSpin()
					this.$Notice.error({
						title: '错误',
						desc: body.message||'获取打印数据错误'
					})
				})
			},
			editContractNo() {
				this.$Modal.open('business/order/edit-contract-modal.vue',{
					on:{
						'success':()=>{
							this.$emit('refresh')
						}
					}
				})
				.then(modal => {
					let info = {
						oid: this.info.oid,
						user_contract_no: this.info.order_no
					}
					modal
					.set('info',info)
					.show('修改合同号','edit')
				})
			},
			printInvoice() {
				this.showPageSpin('正在获取打印模板...')
				this.$rest(`orders/do_print?type=invoice&number=${this.info.oid}`)
				.get()
				.success(data=>{
					this.printer.printBill(7,data,1,'0 0 0 0',true)
					this.hidePageSpin()
				}).error(body=>{
					this.hidePageSpin()
					this.$Notice.error({
						title: '错误',
						desc: body.message||'获取打印数据错误'
					})
				})
			},
			doCheck(){
				this.do_check(this.info.oid,1)
			},
			doUnCheck(){
				this.do_check(this.info.oid,0)
			},
			do_check(id,type) {
				let [tip,action,msg] = type?['审核','docheck','审核成功']:['取消审核','douncheck','取消成功']
				this.confirm('确定'+tip+'此订单吗？')
				.then(() => {
					this.$rest('orders')
					.add_url_param(id,action)
					.post({
						oid: id
					})
					.success(res => {
						this.$Message.success(msg)
						this.$emit('refresh')
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			reduce() {
				this.$Modal.open('business/order/order-reduce-modal.vue',{
					props:{
						order:this.info
					},
					on:{
						'success':()=>{
							this.$emit('refresh')
						}
					}
				})
				.then(modal => {
					modal.show('欠费清除','add')
				})
			},
		},
		computed: {
			remain_nums() {
				let total = 0
				this.info.order_items.forEach(item => {
					total += item.remain_nums
				})
				return total
			},
			assign_items() {
				let arr = []
				let lessons = this.$store.state.gvars.lessons
				this.info.order_items.forEach(item => {
					if(item.student_lesson != undefined && item.student_lesson.lid > 0) {
						let lesson = lessons.find(l=>l.lid == item.student_lesson.lid)
						if(lesson&&lesson.lesson_type == 0) {
							arr.push(item)
						}
					}
				})
				return arr
			}
		}
	}
</script>

<style>
</style>