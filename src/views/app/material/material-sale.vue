<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<Button type="primary" class="mb-2" icon="plus" @click="add">去开单</Button>
		<div class="content-body">
	        <Table 
		        v-loading="'material_sales'" 
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
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectStudent from 'c%/SelectStudent.vue'

	export default {
		mixins:[globals,common,grid,modal],
		components: {
			DateRangePicker,
			SelectEmployee,
			SelectStudent
		},
		data() {
			return {
				rest_api: 'material_sales',
				search_field: {
					create_time: [],
					eid: 0
				},
				column_keys: {
					name: {
						title:'姓名',
						show:true
					},
					mobile:{
						title:'电话',
						show:true
					},
					material:{
						title:'物品',
						show:true
					},
					create_time: {
						title:'开单时间',
						show:true
					},
					eid: {
						title: '经办人',
						show:true
					},
					op: {
						title: '操作',
						show: true,
						width: 80
					}
				},
				column_render: {
					material(h,params){
						return h('div',[
								h('span',params.row.material.name),
								h('span',{
									class: 'pull-right'
								},' x '+util.float(params.row.nums))
								])
					},
					create_time(h,params) {
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
					},
					eid(h,params) {
						return h('span',this.$filter('ename')(params.row.eid,'-'))
					},
					op(h,params) {
						return h('Button',{
							props: {
								type: 'ghost',
								size: 'small',
								shape: 'circle',
								icon: 'ios-undo',
							},
							attrs: {
								title: '撤销'
							},
							on: {
								click: () => {
									this.undoSale(params.row)
								}
							}
						})
					}
				}
			}
		},
		methods: {
			add() {
				this.$Modal.open('app/material/info-sale.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('开单','add')
				})
			},
			undoSale(row) {
				this.confirm('确定要撤销吗？')
				.then(() => {
					this.$http.delete('material_sales/'+row.mts_id)
					.then(res => {
						this.$Message.success('撤销成功')
						this.init_data()
					},res => {
						this.error(res.body.message)
					})
				})
			},
			onModalOpen() {
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				params.with = 'material'
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			}
		}
	}
</script>