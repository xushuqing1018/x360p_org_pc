<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="600" :mask-closable="false">
		<div v-if="intDay.length">{{intDay.join('~')}}</div>
		<div>
			<span>课时：{{info.sum_lesson_hours}}</span>
			<span>人次：{{info.sum_student_nums}}</span>
		</div>
		<Table :columns="columns" :data="data" height="500"></Table>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ExpandRow from './expand-row.vue'
	export default {
		mixins: [modal,common,globals],
		components: {
			ExpandRow
		},
		props: {
			info:{
				type: Object,
				default:() => {
					return {}
				}
			},
			intDay: {
				type: Array,
				default:() => {
					return []
				}
			}
		},
		data() {
			return {
				data: [],
				columns: [
					{
						type: 'expand',
						width: 60,
						render:(h,params) => {
							return h(ExpandRow,{
								props: {
									rows: params.row.children
								}
							})
						}
					},
					{
						title: '授课对象',
						render:(h,params) => {
							let name = ''
							let row = params.row
							let second = ''
							let divs = []
							if(row.cid) {
								name = row.course_name
								second = `${row._total_times}次课(共${row._total_hours}课时 到课${row._total_nums}人次)`
								divs.push(h('div',second))
							}else{
								name = row.student_name_list.join(',')
								second = h('Row',[
									h('Col',{
										props: {
											span:10
										}
									},`${this.$filter('int_date')(row.int_day)} ${this.$filter('int_hour')(row.int_start_hour)}~${this.$filter('int_hour')(row.int_end_hour)}`),
									h('Col',{
										props: {
											span:10
										}
									},`${row._total_hours}课时 到课${row._total_nums}人`)])
								divs.push(second)
							}
							divs.unshift(h('div',name))
							return h('div',divs)
						}
					}
				]
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			init_data() {
				let params = {}
				params.eid = this.info.eid
				params.pagesize = 1000
				if(this.intDay.length) {
					params.start_date = this.intDay[0]
					params.end_date = this.intDay[1]
				}
				this.$rest('report_employee_output_details')
				.get(params)
				.success(res => {
					this.buildData(res.list)
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			buildData(data) {
				let ret = [],ret1 = [],ret2 = []
				if(data) {
					let copy = util.copy(data)
					copy.forEach(ca => {
						if(ca.cid>0) {
							let index = ret1.findIndex(r=>r.cid==ca.cid)
							if(index>-1) {
								ret1[index].children.push(ca)
							}else{
								ca.children = [util.copy(ca)]
								ret1.push(ca)
							}
						}else{
							ca.children = []
							ca._disableExpand = true
							ret2.push(ca)
						}
					})
				}
				ret2 = this.orderBy(ret2,'int_day',-1)
				ret = ret1.concat(ret2)
				ret.forEach(d => {
					if(d.cid) {
						d._total_times = d.children.length
						d._total_hours = 0
						d._total_nums = 0
						d.children.forEach(child => {
							d._total_hours += child.total_lesson_hours
							d._total_nums += child.total_in_nums
						})
					}else{
						d._total_hours = d.total_lesson_hours
						d._total_nums = d.total_in_nums
					}
				})
				this.data = ret
			}
		}
	}
</script>