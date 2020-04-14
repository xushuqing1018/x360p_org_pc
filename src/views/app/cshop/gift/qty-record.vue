<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :width="900" :mask-closable="true">		
		<div class="mb-2">
			<select-gift v-model="search_field.cg_id" placeholder="礼品" style="width:280px" @keyup.enter.native="search"></select-gift>
			<select-student v-model="search_field.sid" placeholder="学员" style="width:280px" @keyup.enter.native="search"></select-student>
			<Button type="primary" @click="search" icon="ios-search">搜索</Button>
			<Button type="primary" @click="resetSearch" icon="refresh">重置</Button>
		</div>
		
		<div class="box box-result">
			<div class="content-body">
	            <Table 
	            	v-loading="rest_api" 
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
	    	<div class="content-footer mt-3">
	            <div class="pagenation text-right">
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
		</div>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent'
	import SelectGift from 'c%/SelectGift'
	
	export default{
		mixins: [ grid, common, modal, globals ],
		components: {
			SelectGift,
			SelectStudent
		},
		data () {
			return {
				rest_api: 'credit_qty_historys',
				pk: 'cqh_id',
				search_field: {
					cg_id: 0,
					sid: 0
				},
				column_keys: {
					gift_name: {
						title: '礼品',
						show: true
					},
					qty: {
						title: '变动数量',
						show: true
					},
					student_name: {
						title: '兑换学员',
						show: true
					},
					int_day: {
						title: '日期',
						show: true
					},
					create_uid: {
						title: '经办人',
						show: true
					},
					remark: {
						title: '备注',
						width: 220,
						show: true
					}
				},
				column_render: {
					gift_name(h,params) {
						return h('span',params.row.credit_gift.gift_name)
					},
					qty(h,params) {
						let tag = {color: 'red',label:'+ '+params.row.qty}
						if(params.row.type===1){
							tag.color = '#0c6'
							tag.label = '- '+params.row.qty
						}
						return h('span',{
							style: {
								color: tag.color
							}							
						},tag.label)
					},
					student_name(h,params) {
						let result = '-'
						if(params.row.student) {
							result = params.row.student.student_name
						}
						return h('span',result)
					},
					create_uid(h,params) {
						return h('span',params.row.create_uid.ename)
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			resetSearch () {
				this.search_field.sid = 0
				this.search_field.cg_id = 0
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = this.search_field
				for(let o in search_obj) {
                    let property = search_obj[o]
                    if(property&&property!=-1){
                        params[o] = property    
                    }
                }
                params.with = 'credit_gift,student,create_uid'
			}
		}
	}
	
</script>

<style>
</style>