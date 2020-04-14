<style>	
	.x-modal-table thead th, .x-modal-table tr td{
		border-right: none !important;
	}
</style>
<template>
	<div class="c-grid">		
		<div class="box box-result">
			<div class="content">
				<div class="mb-3">
					<Button type="primary" icon="refresh" @click="init_data" :loading="loading">刷新</Button>
					<Button type="primary" icon="plus" class="ml-3" @click="addInfo" v-per="'type.add'">新增</Button>
				</div>
				<div class="content-body">
					<div class="ivu-table-wrapper">
						<table class="modal-table x-modal-table" v-loading="'tally_types'">
							<thead>
								<th><div class="ivu-table-cell"></div></th>
								<th><div class="ivu-table-cell"></div></th>
								<th><div class="ivu-table-cell">类别 </div></th>
								<th><div class="ivu-table-cell">备注</div></th>
								<th><div class="ivu-table-cell">操作</div></th>
							</thead>
							<template v-for="(item,index) in filter_data()">
								<tr v-if="typeHeader(index)">
									<td colspan="5">
										<div class="ivu-table-cell font-weight-bold">
											{{item.type===1?'收入':'支出'}}
										</div>
									</td>
								</tr>
								<tr>
									<td></td>
									<td>
										<div class="ivu-table-cell">
											<div class="ivu-table-cell-expand" v-if="filter_data(item.tt_id).length>0" @click="toggleExpand(item)">
												<Icon :type="item.expand?'ios-arrow-down':'ios-arrow-right'"></Icon>
											</div>
										</div>
									</td>
									<td>
										<div class="ivu-table-cell">{{item.name}}</div>
									</td>
									<td>
										<div class="ivu-table-cell">{{item.remark}}</div>
									</td>
									<td>
										<div class="ivu-table-cell">									
											<Button 
												type="ghost" 
												shape="circle" 
												size="small" 
												icon="edit" 
												@click="edit(item)">
											</Button>
											
											<Button 
												class="ml-3"
												type="ghost" 
												shape="circle" 
												size="small" 
												icon="ios-trash" 
												@click="del(item)">
											</Button>
										</div>
									</td>
								</tr>
								<tr v-show="item.expand" v-for="sub in filter_data(item.tt_id)">
									<td class="ivu-table-expanded-cell"></td>
									<td class="ivu-table-expanded-cell"></td>
									<td class="ivu-table-expanded-cell"><div class="ivu-table-cell">{{sub.name}}</div></td>
									<td class="ivu-table-expanded-cell">
										<div class="ivu-table-cell">{{sub.remark}}</div>
									</td>
									<td class="ivu-table-expanded-cell">
										<div class="ivu-table-cell">									
											<Button 
												type="ghost" 
												shape="circle" 
												size="small" 
												icon="edit" 
												@click="edit(sub)">
											</Button>
											
											<Button 
												class="ml-3"
												type="ghost" 
												shape="circle" 
												size="small" 
												icon="ios-trash" 
												@click="del(sub)">
											</Button>
										</div>
									</td>
								</tr>
							</template>
							<tr class="text-center" v-if="!filter_data()||!filter_data().length"><td colspan="5">没有数据</td></tr>
						</table>
					</div>
				</div>
			</div>
		</div>
		<type-info ref="info" @on-success="init_data"></type-info>
	</div>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import typeInfo from './type-info.vue'
	
	export default {
		mixins:[grid,common],
		components: {
			typeInfo
		},
		data () {
			return {
				rest_api: 'tally_types',
				pk: 'tt_id',				
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			typeHeader (index) {
				if(index===0){
					return true
				}
				
				return this.filter_data()[index].type !== this.filter_data()[index-1].type
			},
			toggleExpand (row) {
				if(row.expand){
					row.expand = false
				}else{
					Vue.set(row,'expand',true)
				}
			},
			filter_data (id) {
				let data = this.data,
					result = []
				//筛选出父级类别/子级类别  并排序
				if(data.length>0){					
					if(!id){
						result = data.filter(d=>d.pid===0).sort((a,b)=>{return a.type-b.type})
					}else{
						result = data.filter(d=>d.pid===id).sort((a,b)=>{return a.type-b.type})
					}
				}
				return result
			},
			addInfo () {
				this.$r('info')
				.set('list',this.data)
				.show('新增收支分类','add')
			},
			edit (row) {
				this.$r('info')
				.set('list',this.data)
				.set('info',row)
				.show('编辑收支分类','edit')
			},
			del (row) {
				let tip = util.sprintf('确定删除类别【%s】吗',row.name)
				
				this.confirm(tip)
				.then(()=>{
					this.delete(row)
					.then(()=>{
						this.$store.dispatch('updateGlobalVar','tally_types')
					})
				})
			}
		}
	}
</script>
