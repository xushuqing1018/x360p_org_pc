<template>
	<div>
		<p class="table-title mt-0">课时订单记录</p>
		<Table :show-header="true" :data="data" :columns="columns"></Table>
	</div>
</template>
<script>
import moment from 'moment'
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
export default {
	mixins: [grid,common,globals],
	props: {
		list: {
			type: Array,
			default:() => {
				return []
			}
		}
	},
	watch: {
		list(l) {
			this.data = l
		}
	},
	data() {
		return {
			column_keys: {
				nums:{
					title:'购买课时数',
					show:true
				},
				unit_lesson_hour_amount: {
					title:'课时单价',
					show:true
				},
				op_name: {
					title: '操作人',
					show:true
				},
				create_time: {
					title:'操作时间',
					show:true
				},
				op: {
					title: '操作',
					show: true,
					width: 80
				}
			},
			column_render: {
				nums(h,params) {
					let divs = []
					divs.push(h('p',params.row.nums))
					if(Number(params.row.present_lesson_hours)>0) {
						divs.push(h('p','+'+params.row.present_lesson_hours+' (赠送)'))
					}
					return h('span',divs)
				},
				unit_lesson_hour_amount(h,params) {
					return h('span',this.label_currency+params.row.unit_lesson_hour_amount)
				},
				create_time(h,params) {
					return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
				},
				op(h,params) {
					return h('Button',{
						props: {
							type: 'ghost',
							size: 'small',
							shape: 'circle',
							icon: 'ios-undo',
							title: '撤销订单'
						},
						directives: [
							{
								name:'per',
								value:'offline.delete'
							}
						],
						on: {
							click: () => {
								this.undoImportHour(params.row)
							}
						}
					})
				}
			}
		}
	},
	methods: {
		undoImportHour(row) {
			this.confirm('您确定要删除该订单吗？')
			.then(() => {
				this.$rest('orders')
                .delete(row.oid)
                .success((response)=>{
                    this.$Message.success('删除成功')
                    this.$emit('on-success')
                })
                .error((response)=>{
                    this.error(response.body.message)
                })
			})
		}
	}
}
</script>