<template>
	<div>
		<Dropdown trigger="click">
			<slot>
				<Button type="primary" size="small">操作 <Icon type="arrow-down-b"></Icon></Button>
			</slot>
			<DropdownMenu slot="list">
				<DropdownItem @click.native="assignClass" v-if="assign_items.length!==0" v-per="'demoorder.asclass'">
	            	<Icon type="plus"></Icon> 分班
	            </DropdownItem>
	            <DropdownItem @click.native="makeup" v-if="info.pay_status < 2 && info.order_status > 0" v-per="'demoorder.makeup'">
	            	<Icon type="cash"></Icon> 补缴
	            </DropdownItem>
	            <template v-if="info.order_status > 0">
	            	<DropdownItem @click.native="transfer" v-per="'demoorder.transfer'">
		            	<Icon type="loop"></Icon> 结转
		            </DropdownItem>
		            <DropdownItem @click.native="refund" v-per="'demoorder.refund'">
		            	<Icon type="arrow-return-left"></Icon> 退费
		            </DropdownItem>
	            </template>
	            <DropdownItem @click.native="detail" v-if="!isDetail">
	            	<Icon type="more"></Icon> 订单详情
	            </DropdownItem>
	            <DropdownItem @click.native="deleteOrder">
	            	<Icon type="ios-trash"></Icon> 删除订单
	            </DropdownItem>
	            <DropdownItem @click.native="continuePay" v-per="'demoorder.pay'" v-if="info.order_status == 0">
	            	<Icon type="arrow-right-c"></Icon> 继续支付
	            </DropdownItem>
	        </DropdownMenu>
		</Dropdown>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	
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
				this.$router.push({path:'/recruiting/demo/signup/'+this.info.oid})
			},
			deleteOrder() {
				this.confirm('您确定要删除该订单吗？')
				.then(() => {
					let hasPer = this.userPers.indexOf('demoorder.delete')>-1
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
			}
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
						if(lesson.lesson_type == 0) {
							arr.push(item)
						}
					}
				})
				return arr
			},
			hasNonClassLesson() {
				return !!this.info.order_items.find(item => item.gtype==0
														&&item.student_lesson
														&&item.student_lesson.lid > 0
														&&this.getLessonObj(item.student_lesson.lid).lesson_type>0)
			}
		}
	}
</script>

<style>
</style>