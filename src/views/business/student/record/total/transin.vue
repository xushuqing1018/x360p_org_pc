<template>
	<div>
		<p class="table-title">课时转入记录</p>
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
					title:'转入课时数',
					show:true
				},
				from_student_name: {
					title:'转出学员',
					show:true
				},
				op_name: {
					title: '操作人',
					show: true
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
				lesson_hours(h,params) {
					return h('div',params.row.lesson_hours)
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
							title: '撤销转让'
						},
						directives: [
							{
								name:'per',
								value:'transferhours.undo'
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
			this.confirm('确定要撤销转让吗？')
			.then(() => {
				this.$http.delete('transfer_hour_historys/'+row.thh_id)
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