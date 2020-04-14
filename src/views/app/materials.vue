<style lang="less">
	.x-card{
		height: 100%;
		.ivu-card-body{
			height: calc(~"100% - 55px");
			width: 100%;
			position: relative;
			overflow: auto;
			& .x-card-body{
				position: absolute;
				height: auto;
				width: calc(~"100% - 30px");
				left: 15px;
				top: 15px;
			}
		}
	}
	.ivu-card-body{
		padding:5px
	}
</style>

<template>
	<div class="c-grid">
		<Card dis-hover>
			<span slot="title">物品管理</span>
			<a href="#" slot="extra" @click.prevent="materialSale">销售开单</a>
			<div class="row">
				<div class="col-md-4">
					<Card dis-hover class="x-card">
						<div slot="title" class="clearfloatblock">							
							<span style="line-height: 24px;">物品列表</span>
						</div>
						<div slot="extra">
							<Input 
								v-model="searchKey" 
								size="small" 
								placeholder="搜索" 
								style="width:120px;margin-right:10px;">
							</Input>
							<Button @click.stop="addInfo()" 
								v-per="'materials.add'"
								type="ghost"
								size="small" 
								icon="plus" 
								title="新增">
							</Button>
						</div>
						<div class="x-card-body">
							<tree-node 
								v-for="(item,index) in initItems" 
								:item="item" 
								:total="initItems.length"
								:index="index"
								@add="addInfo"
								@edit="editInfo"
								@del="delInfo"
								@set-current-item="setCurrentItem" 
								:current-item="currentItem">
							</tree-node>							
						</div>
					</Card>
				</div>
				<div class="col-md-8">
					<Card dis-hover>
						<span slot="title">
							物品信息
						</span>
						<Form :label-width="80" class="row">
							<div class="col-sm-2">
								<div class="img-thumb m-auto" 
									@click="picturePreview(currentItem.image)">
									<img :src="currentItem.image||'http://sp1.xiao360.com/static/img/暂无-2.jpg'">									
								</div>
							</div>
							<div class="col-sm-10 row">
								<Form-item label="所属校区" class="col-sm-12" v-if="currentItem.bid">
									<span>{{currentItem.bid|branch_name}}</span>
								</Form-item>
								<Form-item label="物品名称：" class="col-sm-6">
									<span>{{currentItem.name}}</span>
								</Form-item>							
								<Form-item label="物品数量：" class="col-sm-6">
									<Tag>{{currentItem.num}}</Tag>（{{currentItem.unit}}）
								</Form-item>
								<Form-item label="进货价：" class="col-sm-6">
									<Tag>{{label_currency}}{{currentItem.purchase_price}}</Tag>
								</Form-item>
								<Form-item label="销售价：" class="col-sm-6">
									<Tag>{{label_currency}}{{currentItem.sale_price}}</Tag>
								</Form-item>		
								<Form-item label="物品描述：" class="col-sm-12">
									<span>{{currentItem.desc}}</span>
								</Form-item>

							</div>
						</Form>
					</Card>
					<Tabs>
						<TabPane name="store" label="库存管理">
							<div class="mt-3">
								<Input v-model="store_key" placeholder="请输入仓库名" style="width:260px" icon="ios-search"></Input>
								<Button 
									type="primary" 
									class="ml-3" 
									v-per="'materials.in'"
									@click="showStore('in')" 
									:disabled="disabled()">
									入库
								</Button>
								<Button 
									type="primary" 
									class="ml-3" 
									v-per="'materials.transfer'"
									@click="showStore('transfer')" 
									:disabled="disabled(2)">
									调拨
								</Button>
								<Button 
									type="primary" 
									class="ml-3" 
									v-per="'materials.out'"
									@click="showStore('out')" 
									:disabled="disabled()">
									出库
								</Button>
								<Button 
									v-per="'materials.store'"
									type="primary" 
									class="pull-right" 
									@click="modal_store=true">
									仓库管理
								</Button>
							</div>
							<data-ready 
								ref="dr" 
								:data="['materials/'+currentItem.mt_id+'/store']" 
								@ready="onReady" 
								@refresh="refresh"
								class="mt-3"
								style="max-height:450px;overflow: auto;">
								<table class="modal-table">
									<thead>
										<th align="center">
											<div class="ivu-table-cell">
												<Checkbox v-model="check_all" @on-change="checkAll"></Checkbox>
											</div>
										</th>
										<th>
											<div class="ivu-table-cell">仓库名</div>
										</th>
										<th>
											<div class="ivu-table-cell">剩余数量</div>
										</th>
									</thead>
									<tbody>
										<tr v-for="item in filter_stores" @click="toggleSelected(item)">
											<td width="100">
												<div class="ivu-table-cell">
													<Checkbox :value="ms_ids.indexOf(item.ms_id)>-1" readonly @click.stop="toggleSelected"></Checkbox>
												</div>
											</td>
											<td>
												<div class="ivu-table-cell">
													{{item.name}}
												</div>
											</td>
											<td>
												<div class="ivu-table-cell">
													{{item.num}}
												</div>
											</td>
										</tr>
										<tr v-if="!filter_stores||!filter_stores.length">
											<td colspan="3">
												<div class="ivu-table-cell text-center">暂无数据~</div>
											</td>
										</tr>
									</tbody>
								</table>
							</data-ready>
						</TabPane>
						<TabPane name="record" label="出入库记录">
							<record ref="record" :mt-id="currentItem.mt_id" @on-success="refreshStoreCache"></record>
						</TabPane>
					</Tabs>					
				</div>
			</div>
		</Card>
		<info-modal ref="info" @on-success="init_data"></info-modal>
		<Modal v-model="modal_store" v-drag-modal width="800" title="仓库管理">
			<store @on-success="refreshStoreCache"></store>
			<div slot="footer">
				<Button type="ghost" @click="modal_store=false">关闭</Button>
			</div>
		</Modal>
		<stock ref="stock" @on-success="refreshStoreCache"></stock>
	</div>
</template>

<script>
	import Vue from 'vue'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import store from './material/store.vue'
	import stock from './material/stock.vue'
	import infoModal from './material/info-modal.vue'
	import dataReady from 'c%/DataReady.vue'
	import record from './material/record.vue'
	import TreeNode from './material/tree-node.vue'
	
	const emptyObject = {
		mt_id: 0,
		ms_id: 0,			//挑拨仓库Id
		to_ms_id: 0,		//入库仓库Id
		num: 0,				//数量
		eid: 0,				//经手人eid
		type: 0,			//1、入库，2、出库
		cate: 0,			//分类：1进货、2领用、3调拔、4报损
		int_day: '',		//操作日期
	}
	
	
	export default{
		mixins: [grid,common,globals],
		components: {
			store,
			stock,
			record,
			dataReady,
			TreeNode,
			infoModal
		},
		data () {
			return {
				rest_api: 'materials',
				pk: 'mt_id',
				store_key: '',
				material_key: '',
				check_all: false,
				modal_store: false,
				currentIndex: 0,
				data: [],
				ms_ids: [],
				stores: [],
				initItems: [],
				currentItem: {},
				searchKey: ''
			}
		},	
		created(){
			if(this.enable_material_bid){
				this.$store.commit('branchSingleMode')
			}
		},
		mounted () {
			this.init_data()			
		},
		watch: {
			'searchKey': function(v) {
				this.throttle(this.init_data,window)
			}
		},
		methods: {
			throttle(method,context) {
				clearTimeout(method.tId);
	            method.tId = setTimeout(function(){
	                method.call(context)
	            },1000)
			},
			setCurrentItem (item) {
				this.currentItem = item
			},
			hook_get_param (params) {
				params.with = 'children_num'
				params.pagesize = 1000
			},
			deal_data (data) {				
				let result = [],
					list = data.list		
				
				this.initItems = this.initData(0,1,list)
				this.refreshCurrentItem(list)
				return list
			},
	        initData(parent_id,level,list) {
	            let items = util.copy(list.filter(d=>d.parent_id==parent_id))
	            
	            if(items.length>0){
	            	items.forEach(i=>{
	            		this.$set(i,'level',level)
	            		if(i.children_num>0){
	            			this.$set(i,'expanded',true)	            			
	            			this.$set(i,'children',this.initData(i.mt_id,level+1,list))
	            		}
	            	})
	            }
	            
	            return items
	        },
			refresh ({url,response}) {
				this.stores = response.list
			},
			refreshStoreCache(){ 
				this.init_data()
				
				this.$r('dr').refreshData('materials/'+this.currentItem.mt_id+'/store')
				this.$r('record').init_data()
			},
			refreshCurrentItem (list) {
				let currentItem = this.currentItem
				if(/^\s*$/.test(this.searchKey)) {
					if(!_.isEmpty(currentItem)){
						this.currentItem = util.copy(list.find(d=>d.mt_id==currentItem.mt_id))					
					}else{
						this.currentItem = util.copy(list.find(d=>d.is_cate==0))||{}
					}
				}else{
					let item = list.find(d=>d.name.indexOf(this.searchKey)>-1&&d.is_cate==0)
					if(item) {
						document.getElementById(item.mt_id).scrollIntoView(true)
						this.currentItem = util.copy(item)
					}else{
						this.$Message.error('没有符合的物品')
					}
				}
			},
			showStore (type) {
				let ms_ids = this.ms_ids,
					data = [],
					title = '入库',
					info = util.copy(emptyObject)
				info.mt_id = this.currentItem.mt_id
				
				ms_ids.forEach(m=>{
					data.push({						
						ms_id: m,
						num: 0
					})
				})
				
				if(type=='in'){	
					info.type = 1
					info.cate = 1
				}else if(type=='transfer'){
					info.type = 2
					info.cate = 3
					data = [{
						ms_id: this.ms_ids[0],
						num: 0
					}]
					title = '调拨'
					
					info.to_ms_id = this.ms_ids[1]
				}else{
					info.type = 2
					title = '出库'
				}
				this.$r('stock')
				.set('info',info)
				.set('data',data)
				.set('stores',this.stores)
				.set('name',this.currentItem.name)
				.show(title+'【'+this.currentItem.name+'】',type)
			},
			onReady (rs) {
				this.stores = rs[0].list
			},
			setCurrentIndex (index) {
				this.currentIndex = index||0
			},
			addInfo (row) {
				let parent_id = 0,
					level = 1
				if(!_.isEmpty(row)){
					parent_id = row.mt_id
					level = row.level
				}
				
				this.$r('info')
				.set('parent_id',parent_id)
				.set('level',level)
				.show('添加物品','add')
			},
			editInfo (row) {				
				row.purchase_price = parseFloat(row.purchase_price)
				row.sale_price = parseFloat(row.sale_price)
				
				this.$r('info')
				.set('info',row)
				.set('level',row.level)
				.show('修改物品',row)
			},
			delInfo (row) {
				this.confirm('确定删除物品【'+row.name+'】')
				.then(()=>{
					this.delete(row)
				})
			},
			checkAll (val) {
				let stores = this.stores
				this.ms_ids = []
				if(val){					
					stores.forEach(s=>{
						this.ms_ids.push(s.ms_id)
					})
				}
			},
			toggleSelected (row) {
				let ms_ids = this.ms_ids,
					index = ms_ids.indexOf(row.ms_id) 
				if(index>-1){
					this.ms_ids.splice(index,1)
				}else{
					this.ms_ids.push(row.ms_id)
				}				
				
				this.check_all = this.ms_ids.length===this.stores.length
			},
			disabled (num) {				
				return num?this.ms_ids.length!==num:this.ms_ids.length===0
			},
			materialSale () {
				this.$Modal.open('app/material/material-sale.vue@modal')
				.then(modal => {
					modal.show('销售开单')
				})
			}
		},
		computed: {
			filter_stores () {
				let store_key = this.store_key,
					stores = this.stores
				
				if(!/^\s*$/.test(store_key)){
					return stores.filter(s=>s.name.indexOf(store_key)>-1)
				}				
				return stores				
			}
		}
	}
</script>
