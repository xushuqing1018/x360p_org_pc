<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">
		<div class="ivu-table-wrapper" style="max-height:550px;overflow-y:auto;overflow-x:hidden">
			<Table 
				:border="true"
            	:data="data" 
            	:columns="columns" 
            	:show-header="true" 
            	> 
            </Table>
            <Spin fix v-if="loading">
            	<Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            	<div><span v-if="branchs.length>10">当前校区过多，</span>正在努力生成报表</div>
            </Spin>
			<div class="mt-3 clearfix">
                <Page 
                	transfer
	                size="small"
	                class="pull-right"
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
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<export-button :res="rest_api" :params="params" v-per="'reports.export'"></export-button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default {
		mixins: [ grid,modal,globals,common ],
		props: {
			search_field: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		components: {
			ExportButton
		},
		data() {
			return {
				rest_api: '',
				column_keys: {
					student_name: {
						title: '学员',
						show: true,
					},
					bid: {
                        title: '所属校区',
                        show: true
					},
					first_tel: {
						title: '联系电话',
						show: true,
					},
					sex: {
						title: '性别',
						show: true,
					},
					age: {
						title: '年龄',
						show: true,
					},
					status: {
						title: '状态',
						show: true
					}
				},
				column_render: {
					sex (h,params) {
						let map_sex = {0:'-',1:'男',2:'女'}
						return h('span',map_sex[params.row.sex])
					},
					age (h,params) {
						return h('span',util.age(params.row.birth_time))
					},
					status(h,params) {
						let tag =  h('Tag',{
								props:{
									type:'border',
									color:this.ss_map[params.row.status].color
								}
							},
							this.ss_map[params.row.status].text
						)
						let result = [tag]
						if(params.row.status === 30) {
							let reason = params.row.stop_reason || '-'
							result.push(h('p','原因:'+reason))
						}
						return h('div',result)
					}
				}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val){
					this.init_data()
				}
			}
		},
		methods: {
			hook_get_param(params) {
				let search_field = this.search_field
				for(let i in search_field) {
					let p = search_field[i]
					if(i == 'int_day') {
						if(p.length) {
							params.start_date = p[0]
							params.end_date = p[1]
						}
					}else{
						if(p!==-1&&p) {
							params[i] = p
						}
					}
				}
			}
		}
	}
</script>