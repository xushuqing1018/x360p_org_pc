<template>
	<div>
		<p class="table-title">课时赠送记录</p>
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
				lesson_hours:{
					title:'赠送课时数',
					show:true
				},
				op_type: {
					title: '操作类型'
				},
				create_uid: {
					title: '操作人',
					show:true
				},
				create_time: {
					title:'操作时间',
					show:true
				},
				remark: {
					title: '备注',
					show: true
				},
				op: {
					title: '操作',
					show: true,
					width: 80
				}
			},
			column_render: {
				op_type(h,params) {
					let map = {1:'手动赠送',4:'购买时赠送'}
					return h('span',map[params.row.op_type])
				},
				unit_price(h,params) {
					return h('span',this.label_currency+params.row.unit_price)
				},
				create_time(h,params) {
					return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
				},
				create_uid(h,params) {
					return h('span',params.row.op_name)
				},
				op(h,params) {
					return h('Button',{
						props: {
							type: 'ghost',
							size: 'small',
							shape: 'circle',
							icon: 'ios-undo',
							title: '撤销赠送'
						},
						directives: [
							{
								name:'per',
								value:'presenthours.undo'
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
		undoTransfer(row) {
			this.confirm('确定要撤销赠送吗？')
			.then(() => {
				this.$http.delete('student_lesson_operates/'+row.slo_id)
				.then(res => {
					this.$Message.success('撤销成功')
					this.$emit('on-success')
				},res => {
					this.error(res.body.message)
				})
			})
		}
	}
}
</script>