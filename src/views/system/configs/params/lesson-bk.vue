<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<div class="mb-2">
			<select-lesson v-model="lid" style="width: auto;" @selected="selectLesson($event,1)">
				<Button type="primary" size="small" icon="plus">添加</Button>
			</select-lesson>
			<Button type="primary" size="small" icon="refresh" @click="search">刷新</Button>
		</div>

		<div class="lesson-list" style="max-height: 500px;overflow: auto">
			<Table 
		        v-loading="'lessons'" 
		        :page-size="pageSize" 
		        :page="pageIndex" 	
		        :stripe="true" 
		        :show-header="true" 
		        :data="data" 
		        :columns="columns" 
		        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		        @on-sort-change="sortChange"> 
	        </Table>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectLesson from 'c%/SelectLesson.vue'

	export default {
		mixins:[grid,modal,common],
		props: {
			limitType: Number
		},
		components: {
			SelectLesson
		},
		data() {
			return {
				lid: 0,
				rest_api: 'lessons?bk_limit_status=1&pagesize=1000',
				column_keys: {
					lesson_name: {
						title:'课程',
						show:true
					},
					operate:{
						title: ' ',
						width: 80,
						show: true
					}
				},
				column_render: {
					operate(h,params) {
						return h('Button',{
							props: {
								type: 'text',
								size: 'small',
								icon: 'close'
							},
							on: {
								click:() => {
									this.removeLimit(params.row)
								}
							}
						})
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			removeLimit(item) {
				this.confirm(util.sprintf('确定将【%s】移出%s',item.lesson_name,this.limitType==1?'可预约课程':'不可预约课程'))
				.then(() => {
					this.selectLesson(item,0)
				})
			},
			selectLesson(selected,value) {
				let row = util.copy(selected)
				row.bk_limit_status = value
				this.$rest('lessons').add_url_param(selected.lid)
				.put(row)
				.success(res => {
					this.$Message.success(value?'添加成功':'移出成功')
					this.init_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>
<style lang="less">
	.lesson-list {
		.lesson-item {
			font-size: 14px;
			height: 24px;
			line-height: 24px;
		}
	}
</style>