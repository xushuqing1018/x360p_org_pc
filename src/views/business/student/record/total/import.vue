<template>
	<div>
		<p class="table-title">课时导入记录</p>
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
					title:'导入课时数',
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
							title: '撤销导入'
						},
						directives: [
							{
								name:'per',
								value:'importhour.undo'
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
			this.confirm('确定要撤销导入课时记录吗？')
			.then(() => {
				this.$http.delete('student_lesson_import_logs/'+row.slil_id)
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