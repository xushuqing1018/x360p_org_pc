<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="850">
		<div class="content-body">
            <Table 
	            height="400"
	            :data="data" 
	            :columns="columns" 
	            @on-select="selectOne"
            	@on-select-cancel="cancelSelect"
            	@on-select-all="selectAll"
            	@on-selection-change="selectChange"
	            >
            </Table>
        </div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :disabled="data.length==0">确定删除</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	export default {
		mixins: [common,globals,grid,modal],
		props: {
			sid: {
				type: Number,
				default: 0
			},
			lid: {
				type: Number,
				default: 0
			},
			startDate: {
				type: String,
				default: ''
			},
			endDate: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				data: [],
				showCheckbox:true,
				cas_ids: [],
				column_keys: {
					student_name: {
	            		title: '学员',
	            		show: true
	            	},
	                bid:{
	                    title:'校区',
	                    show: false,
	                },
	                cid: {
	                	title: '班级',
	                	show: false
	                },
	                lesson_type: {
	                	title: '类型',
	                	show: false
	                },
	                int_day:{
	                	title:'日期',
	                	show:true
	                },				
	                time_section:{
	                	title:'时段',
	               		show:true
	                },
	                lid:{
	                    title:'课程',
	                    show:true
	                },
	                sj_id:{
	                    title:'科目',
	                    show:false
	                },
	                teach_eid:{
	                    title:this.$filter('translate')('老师'),
	                    show:true,
	                },
	                second_eids:{
	                    title:this.$filter('translate')('助教'),
	                    show:false,
	                },
	                cr_id:{
	                    title:'教室',
	                    show:false
	                }
				},
				column_render: {
	            	student_name(h,params) {
	            		return h('span',params.row.student?params.row.student.student_name:'-')
	            	},
	            	teach_eid (h,params) {
	            		return h('span',this.$filter('ename')(params.row.course_arrange.teach_eid,'-'))
	            	},
	            	second_eids (h,params) {
	            		return h('span',this.$filter('enames')(params.row.course_arrange.second_eids,'-'))
	            	},
	            	cr_id (h,params) {
	            		return h('span',this.$filter('classroom_name')(params.row.course_arrange.cr_id,'-'))
	            	},
	            	cid (h,params) {
	            		let result = '-'
	            		let course_arrange = params.row.course_arrange
	            		let lesson_type = course_arrange.lesson_type
	            		if(lesson_type == 0) {
	            			result = params.row.one_class?params.row.one_class.class_name:'-'
	            		}
	            		return h('span',result)
	            	},
	            	lesson_type (h,params) {
	            		let lesson_type = params.row.course_arrange.lesson_type
	            		return h('span',this.$filter('lesson_type')(lesson_type))
	            	}
	            },
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			ok() {
				if(this.cas_ids.length == 0) {
					this.$Message.error('请勾选至少一次排课')
					return
				}
				this.confirm(util.sprintf('确定要删除这【%s】次排课吗?',this.cas_ids.length))
				.then(() => {
					this.$rest('course_arrange_students').add_url_param('batch_delete')
					.post({cas_ids:this.cas_ids})
					.success(res => {
						this.$Message.success('删除成功')
						this.close()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			selectOne (selection,row) {
				this.addCasIds(row.cas_id)
			},
			cancelSelect (selection,row) {
				this.removeCasIds(row.cas_id)
			},
			selectAll (selection) {
				selection.forEach(item => {
					this.addCasIds(item.cas_id)
				})
			},
			selectChange (selection) {
				if(selection.length == 0){
					this.data.forEach(item => {
						this.removeCasIds(item.cas_id)
					})
				}
			},
			addCasIds(id) {
	        	let index = this.cas_ids.indexOf(id)
	        	if(index==-1) {
	        		this.cas_ids.push(id)
	        	}
	        },
	        removeCasIds(id) {
	        	let index = this.cas_ids.indexOf(id)
	        	this.cas_ids.splice(index,1)
	        },
			init_data() {
				let params = {
					sid: this.sid,
					is_attendance: 0,
					pagesize:1000,
					order_field: 'int_day',
					order_sort: 'asc',
					bid: -1,
					with: 'one_class,student,course_arrange'
				}
				let start = this.$filter('format_int_day')(this.startDate)
				let end = this.$filter('format_int_day')(this.endDate)
				if(this.startDate && this.endDate) {
					params.int_day = util.sprintf('[between,%s,%s]',start,end)
				}
				if(this.startDate && !this.endDate) {
					params.int_day = util.sprintf('[>,%s]',start)
				}
				if(this.lid) {
					params.lid = this.lid
				}
				this.$rest('course_arrange_students')
				.get(params)
				.success(res => {
					res.list.forEach(item => {
						item._checked = true
						this.cas_ids.push(item.cas_id)
					})
					this.data = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			}
		}
	}
</script>