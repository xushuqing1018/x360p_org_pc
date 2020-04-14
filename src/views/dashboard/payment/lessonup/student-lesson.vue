<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<Alert show-icon>请选中要升级的课程，然后点确定</Alert>
		<div class="content-body">
	        <Table 
		        v-loading="'student_lessons'" 
		        highlight-row	
		        :page-size="pageSize" 
		        :page="pageIndex" 	
		        :stripe="true" 
		        :show-header="true" 
		        :data="data" 
		        :columns="columns" 
		        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		        @on-sort-change="sortChange"
		        @on-row-click="selectRow"> 
	        </Table>
	    </div>
	    <div class="content-footer">
	        <div class="clearfix">
	            <Page 
	            	class="pull-right mt-2"
	            	size="small"
		            :total="total" 
		            :current="pageIndex" 
		            :show-sizer="true" 
		            :page-size="pageSize" 
		            :show-total="true" 
		            @on-change="pagenation" 
		            @on-page-size-change="pagesize"
	            >
	            </Page>
	        </div>
	    </div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :disabled="currentRow==null" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [grid,modal,common,globals],
		props: {
			sid: Number
		},
		data() {
			return {
				rest_api: 'student_lessons',
				showIndex: false,
				currentRow: null,
				column_keys: {
					bid: {
						title: '校区',
						show: true
					},
					lid: {
						title: '课程',
						show: true
					},
					sj_ids: {
						title: '科目',
						show: false
					},
					class_name: {
						title: '班级',
						show: true
					},
					lesson_type: {
						title: '课程类型',
						show: false
					},
					lesson_hours: {
						title: '剩余/总课时',
						show: true
					},
					remain_lesson_hours:{
						title:'剩余课时',
						show:false,
						sortable:'custom'
					},
					origin_and_present: {
						title: '导入/赠送',
						show: false
					},
					in_and_out: {
						title: '转入/转出',
						show: false
					},
					consume: {
						title: '结转/退费',
						show: false
					},
					expire_time_text: {
						title: '有效期',
						show: false
					},
					is_package: {
						title: '课时包',
						show: false
					},
					lesson_status: {
						title: '课程状态',
						show: true
					},
					is_stop: {
						title: '是否停课',
						show: false
					},
					last_attendance_time: {
						title: '最后考勤时间',
						sortable: 'custom',
						show: false
					},
					ac_status: {
						title: '分班状态',
						show: false
					}	
				},
				column_render: {
					class_name(h,params) {
						let name = '-'
						if(params.row.one_class) {
							name = params.row.one_class.class_name
						}
						return h('span',name)
					},
					lesson_hours(h,params) {
						let row = params.row,
							percent = 0,
							lesson_hours = row.lesson_hours-row.refund_lesson_hours-row.transfer_lesson_hours,

							label = util.sprintf('%s/%s',row.remain_lesson_hours,lesson_hours)
						if(row.lesson_hours>0){
							percent = parseFloat(row.remain_lesson_hours/lesson_hours).toFixed(2)*100
						}
						return h('Progress',{
							props: {
								percent:percent
							}
						},label)
					},
					lesson_type (h,params) {
						return h('span',this.$filter('lesson_type')(params.row.lesson_type))
					},
					origin_and_present(h,params) {
						let origin = h('p','导入：'+params.row.import_lesson_hours),
                    		present = h('p','赠送：'+params.row.present_lesson_hours)
                		return h('div',{
                			style:style
                		},[origin,present]) 
					},
					in_and_out(h,params) {
						let inhour = h('p','转入：'+params.row.trans_in_lesson_hours),
                    		outhour = h('p','转出：'+params.row.trans_out_lesson_hours)
                		return h('div',{
                			style:style
                		},[inhour,outhour]) 
					},
					consume(h,params) {
                		let transfer = h('p','结转：'+params.row.transfer_lesson_hours),
                    		refund = h('p','退费：'+params.row.refund_lesson_hours)
                		return h('div',{
                			style:style
                		},[transfer,refund])
                    },
					ac_status (h,params) {
						let status_obj = this.ac_status.find(item=>item.value==params.row.ac_status)
						return h('span',{
							attrs: {
								class: status_obj.color
							}
						},status_obj.label)
					},
					lesson_status(h,params) {
                        return h('span',this.$filter('lesson_status_text')(params.row.lesson_status))
                    },
                    is_stop(h,params) {
                    	return h('span',params.row.is_stop == 1 ? '是':'否')
                    },
                    is_package(h,params) {
                    	return h('span',params.row.is_package == 1? '是':'否')
                    },
                    last_attendance_time(h,params) {
                    	let last = params.row.last_attendance_time
                    	return h('span',last?last:'-')
                    },
                    expire_time_text(h,params) {
                    	let expire_time = params.row.expire_time
                    	let text = params.row.expire_time_text
                    	if(expire_time === 0) {
                    		return h('span',params.row.expire_time_text)
                    	}else{
                    		let label = h('span',{
                    			style:{
                    				color:text === '正常'?'#006600':'#c90808'
                    			}
                    		},text)
                    		return h('div',[label,`(${expire_time})`])
                    	}
                    }
				},
			}
		},
		methods: {
			onModalOpen() {
				this.init_data()
			},
			ok() {
				this.$Modal.open('dashboard/payment/lessonup/up-to.vue@modal',{
					props: {
						data: this.currentRow
					},
					on: {
						'on-ok': (data) => {
							this.$emit('on-ok',data)
							this.close()
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('从【%s】升级到',this.$filter('lesson_name')(this.currentRow.lid)))
				})
			},
			selectRow(row) {
				this.currentRow = row
			},
			hook_get_param (params) {
				params.with = 'student,one_class,lesson'
				params.sid = this.sid
				params.lesson_status = '[in,0,1]'
			}
		}
	}
</script>