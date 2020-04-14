<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<div class="content-body">
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
		</div>
		<Modal v-drag-modal v-model="modalShow" title="设置预约间隔时间" :mask-closable="false" width="500">
			<div>间隔 <InputNumber v-model="space" :min="0"></InputNumber> 天预约 (0为不限制)</div>
			<div slot="footer">
				<Button type="ghost" @click="modalShow=false">关闭</Button>
				<Button type="primary" @click="ok">确定</Button>
			</div>
		</Modal>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins:[grid,modal,common],
		data() {
			return {
				rest_api: 'lessons',
				space: 0,
				modalShow: false,
				currentLesson: {},
				column_keys: {
					lesson_name: {
						title:'课程',
						show:true
					},
					bk_space_days: {
						title: '预约间隔时间'
					},
					operate:{
						title: ' ',
						width: 120,
						show: true
					}
				},
				column_render: {
					bk_space_days(h,params) {
						return h('span',params.row.bk_space_days?'间隔'+params.row.bk_space_days+'天预约':'不限制')
					},
					operate(h,params) {
						let btns = []
						btns.push(h('Button',{
							props: {
								type:'text',
								size:'small',
								icon: 'edit'
							},
							on: {
								click:() => {
									this.editLimit(params.row)
								}
							}
						}))
						return h('ButtonGroup',btns)
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			editLimit(item) {
				this.currentLesson = item
				this.space = item.bk_space_days
				this.modalShow = true
			},
			ok() {
				let row = util.copy(this.currentLesson)
				row.bk_space_days = this.space
				this.$rest('lessons').add_url_param(this.currentLesson.lid)
				.put(row)
				.success(res => {
					this.$Message.success('设置成功')
					this.modalShow = false
					this.init_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>