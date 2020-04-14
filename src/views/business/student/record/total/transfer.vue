<template>
	<div>
		<p class="table-title">课时结转记录</p>
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
					title:'结转课时数',
					show:true,
					width: 130
				},
				unit_price: {
					title: '结转单价',
					show: true
				},
				amount: {
					title:'结转金额',
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
					divs.push(h('p','-'+params.row.nums))
					if(Number(params.row.present_nums)>0) {
						divs.push(h('p','-'+params.row.present_nums+' (扣除赠送)'))
					}
					return h('span',divs)
				},
				amount(h,params) {
					return h('span',this.label_currency+params.row.amount)
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
							title: '撤销结转'
						},
						directives: [
							{
								name:'per',
								value:'transfer.undo'
							}
						],
						on: {
							click: () => {
								this.undoTransfer(params.row)
							}
						}
					})
				}
			}
		}
	},
	methods: {
		undoTransfer(item) {
			this.confirm('确定要撤销结转吗？')
			.then(() => {
				this.$rest('order_transfers').add_url_param('undo_transfer')
				.post({
					ot_id:item.ot_id
				})
				.success(res => {
					this.$Message.success('撤销成功')
					this.$emit('on-success')
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			})
		}
	}
}
</script>