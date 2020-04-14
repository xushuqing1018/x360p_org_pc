<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="700" :mask-closable="false">
		<Alert show-icon>当前预警剩余课时{{lesson_warn_nums}}(含)以下的学员，如需修改请前往『系统』『系统设置』『系统参数』进行设置</Alert>
		<template v-if="modal$.show">
	        <div class="cast-record clearfix">
	        	<div class="p-2">
					<Table 
			        	v-loading.like="'student_lesson_warn'" 
			        	:data="data" 
			        	:stripe="true" 
			        	:page="pageIndex" 
			        	:columns="columns" 
			        	:show-header="true" 
			        	:page-size="pageSize"
			        	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
			        	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
			        	@on-sort-change="sortChange"> 
			        </Table>
			    </div>
			    <div class="pull-right">
			        <Page 
			        	:total="total" 
			        	:current="pageIndex" 
			        	:show-sizer="true" 
			        	:page-size="pageSize" 
			        	:show-total="true" 
			        	@on-change="pagenation" 
			        	@on-page-size-change="pagesize">
			        </Page>
			    </div>
			</div>
		</template>
		<div slot="footer">
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import modal 	 from '@/libs/modal.mixin'
	import grid 	 from '@/libs/grid.mixin'
	import common 	 from '@/libs/common.mixin'
	import globals 	 from '@/libs/globals.mixin'
	import util 	 from '@/libs/util'
	export default{
		mixins: [modal,grid,common,globals],
		data () {
			return {
				rest_api: '',
				column_keys: {
					name: {
						title: '姓名',
						show: true,
					},
					ename: {
						title: '学管师',
						show: true
					},
					lid: {
						title: '课程',
						show: true
					},
					remain_lesson_hours: {
						title: '剩余课时',
						show: true
					}
				},
				column_render: {
					name(h, params) {
						let name = params.row.student.student_name
						let map = {0:{icon:'help'},1:{icon:'male'},2:{icon:'female'}}
						return h('span',[h('Icon',{
							props: {
								type: map[params.row.student.sex].icon
							}
						}),' '+name] )
					},
					ename(h, params) {
						return h('span',params.row.student.ename?params.row.student.ename:'-')
					},
					lid(h, params) {
						return h('span',params.row.lesson.lesson_name)
					}
				}
			}
		},
		methods: {
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			init() {
				this.rest_api = 'dashboard/student_lesson_warn'
				this.init_data()
				return this
			}
		},
	}
</script>
<style lang="less">
	.cast-record {
		.ivu-btn {
			padding: 2px 7px;
		}
	}
</style>