<style lang="less" scoped>
.x-fan-item{
	height: 70px;
	padding: 10px 0;
	display: flex;
	align-items: center;
	.x-fan-item-avatar{
		width: 50px;
		height: 50px;
		display: inline-block;
		img{
			width: 100%;
			height: 100%;
			vertical-align: bottom;
		}
	}
	.x-fan-item-content{		
		margin-left: .5em;
		flex: 1;
	}
	.x-fan-item-right{
		flex: 1;
	}
}
</style>

<template>
	<div class="c-grid bg-white">
		<Alert v-if="!hasOwnWxmp" show-icon>
	        提示：
	        <div slot="desc">
	        	<p>您还没有设置自己的公众号</p>
	        	<p>设置自己公众号后才能进行粉丝管理</p>
	        	<p><a href="/#/system/configs/wxmp">前往设置</a></p>
	        </div>
		</Alert>
		<div class="row" v-if="hasOwnWxmp">
			<div class="col-md-4">
				<Card dis-hover class="x-card">
					<div slot="title" class="clearfloatblock">							
						<span style="line-height: 24px;">分组列表</span>
						
						<Button @click.stop="addGroup()"
							class="pull-right" 
							type="ghost" 
							shape="circle" 
							size="small" 
							icon="plus" 
							title="新增">
						</Button>							
					</div>
					<div class="x-card-body">
						<div class="mb-3" v-if="group.length > 7">
							<Input v-model="group_name" placeholder="请输入分组名称" icon="ios-search"></Input>
						</div>
						<ul>
							<li class="mb-2 row x-li cursor" @click="setCurrentIndex(-1)">
								<div class="col-sm-6 notwrap" :class="currentIndex===-1?'text-primary':''" title="全部">
									<Icon type="record" :color="currentIndex===-1?'#2d8cf0':'transparent'"></Icon>									
									全部
								</div> 
							</li>
							<li v-for="(item,index) in filter_group" 
								class="mb-2 row x-li cursor"
								@click="setCurrentIndex(index)">
								<div class="col-sm-6 notwrap" :class="currentIndex===index?'text-primary':''" :title="item.name">
									<Icon type="record" :color="currentIndex===index?'#2d8cf0':'transparent'"></Icon>									
									{{item.name}}
								</div> 
								<div class="col-sm-3 text-primary text-center">{{item.count}}</div>
								<div class="col-sm-3">
									<Button 
										@click.stop="delGroup(item)" 
										class="pull-right ml-1" 
										type="ghost" 
										shape="circle" 
										size="small" 
										icon="trash-a" 
										title="移除">
									</Button>
									<Button 
										@click.stop="editGroup(item)" 
										class="pull-right" 
										type="ghost" 
										shape="circle" 
										size="small" 
										icon="edit" 
										title="编辑">
									</Button>
								</div>
							</li>
						</ul>
					</div>
				</Card>
			</div>
			<div class="col-md-8">
				<div class="box box-query">			
					<Input v-model="search_value" icon="ios-search" placeholder="请输入用户昵称" style="width: 260px;"></Input>
					<Button type="primary" icon="ios-search" size="large" @click="init_data">搜索</Button>
				</div>
				<div class="box box-result">			
					<div class="content">
			            <div class="content-body">
			            	<div class="ivu-table-wrapper" v-loading="'wxmp_fans'">
			            		<div class="ivu-table ivu-table-stripe">
			            			<div class="ivu-table-body">
			            				<table class="modal-table">
			            					<tr>
			            						<td>
			            							<div class="ivu-table-cell">
			            								<Checkbox class="m-0" v-model="check_all" @on-change="handleCheckAll">全选</Checkbox>
			            								<Button type="primary" icon="bookmark" size="large" class="ml-3" @click="showLabelModal('m')">打标签</Button>
			            								<Button type="primary" icon="refresh" size="large" class="ml-3" @click="updateFans()" :loading="updateTime>0">更新选中粉丝信息</Button>	            								
			            								<Button type="primary" icon="chatbubbles" size="large" class="ml-3" @click="syncWXFans()" :loading="updateTime>0">同步粉丝</Button> 
			            							</div>
			            						</td>
			            					</tr>
			            					<tr v-for="item in filter_data">
			            						<td class="b-r-0">
			            							<div class="review-item ivu-table-cell">
			            								<div class="x-fan-item">
				            								<Checkbox class="mb-0 align-top" :value="fans_id.indexOf(item.fans_id)>-1" readonly @click.native="handleToggle(item.fans_id)"></Checkbox>	            								
				            								<div class="x-fan-item-avatar" @click="$router.push({path: './fans/'+item.fans_id})">
				            									<img :src="item.headimgurl" @error="imgLoadError">
				            								</div>		            								
				            								<div class="x-fan-item-content">
				            									<p>
				            										{{item.nickname}}
				            										<Tag type="border" color="green" v-if="item.uid>0">家长</Tag>
				            										<Tag type="border" color="green" v-if="item.employee_uid>0">员工</Tag>
				            									</p>
				            									<template v-if="item.tagid_list.length">
				            										<Tag @click="showLabelModal(item)" v-for="t in item.tagid_list">{{tagName(t)}}</Tag>	
				            									</template>
					            								<Tag @click="showLabelModal(item)" v-else>无标签</Tag>
				            								</div>
				            								<div class="x-fan-item-right">
				            									<a class="text-primary" @click="$router.push({path: './fans/'+item.fans_id})">
				            										发送消息  <Icon type="ios-arrow-right"></Icon>
				            									</a>
				            									<p>关注时间：{{format_date(item.subscribe_time)}}</p>
				            								</div>
			            								</div>
			            							</div>
			            						</td>
			            					</tr>
			            					<tr v-if="!data||!data.length||!filter_data.length">
			            						<td><div class="ivu-table-cell text-center">{{noDataText}}</div></td>
			            					</tr>
			            				</table>
			            			</div>
			            		</div>
			            	</div>
			            </div>
			            <div class="content-footer">
			                <div class="pagenation">
			                    <Page :total="total" 
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
			        </div>	
			        </div>
		        </div>
			
		</div>
		<label-modal ref="label" :group="group" @on-change="labelChange"  @on-success="init"></label-modal>
		<group-modal ref="group" @on-success="init"></group-modal>
	</div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import LabelModal from './fans/label-modal.vue'
	import GroupModal from './fans/group-modal.vue'
	
	export default{
		mixins: [ grid,globals,common ],
		components: {
			LabelModal,
			GroupModal
		},
		data () {
			return {
				rest_api: 'wxmp_fans',
				search_value: '',
				check_all: false,
				fans_id: [],
				group_name: '',
				currentIndex: -1,
				group: [
					{ id: 1,name:'产品组', count: 0 },
					{ id: 2,name:'星标组', count: 0 }
				],
				updateTime: 0,
			}			
		},
		mounted () {
			this.init()
		},		
		methods: {
			format_date (time) {
				if(time){
					return moment((time*1000)).format('YYYY-MM-DD hh:mm:ss')
				}
				return '-'
			},			
			syncWXFans () {
				this.$rest('wxmps/sync').get()
				.success(data=>{
					this.init()
					this.$Message.success('同步成功！')
				})
			},
			updateFans (ids) {
				let method = 'post',
					params = {fans_id: ids||this.fans_id}
				if(ids=='all'){
					method = 'get'
					params = {}
				}else{					
					if(params.fans_id.length===0){
						this.$Message.error('请先选择粉丝')
						return
					}					
				}
				
				this.$rest('wxmp_fans/sync_fans')[method](params)
				.success(data=>{					
					if(ids=='all'){
						if(data.status==1){
							this.$Message.success('同步成功')
							this.init()
						}else{
							if(this.updateTime>10000){
								this.$Message.error('网络不给力，请重试')
								this.updateTime = 0
							}else{
								this.updateTime += 500
								setTimeout(()=>{
									this.updateFans(ids)	
								},500)	
							}
													
						}
					}else{
						this.$Message.success('同步成功')
						this.init()
					}
				}).error(response=>{
					this.error(response.body.message||'同步失败')
				})
				
			},
			init() {
				this.init_data()
				this.init_group()
			},
			init_group () {
				this.$rest('wxmp_tags').get()
				.success(data=>{
					this.group = data.tags
				})
			},
			tagName (id) {
				let group = this.group,
					obj = group.find(g=>g.id==id)
				if(obj){
					return obj.name
				}
				return '-'
			},
			addGroup () {
				this.$r('group')
				.show('添加分组')
			},
			delGroup (row) {
				let tip = util.sprintf('确定删除分组【%s】吗，删除后该分组下的粉丝将会失去该标签属性',row.name)
				this.confirm(tip).then(()=>{
					this.$rest('wxmp_tags').delete(row.id)
					.success(()=>{
						this.$Message.success('删除成功！')
						if(row.count>0){
							let ids = this.getTagFansId(row.id)
							this.updateFans(ids)
						}else{
							this.init()	
						}						
					}).error(response=>{
						this.$Message.success(response.body.message||'删除失败！')
					})
				})
			},
			getTagFansId (id) {
				let ids = [],
					list = this.data.filter(item=>item.tagid_list.indexOf(id)>-1)
				if(list.length){
					list.forEach(l=>{
						ids.push(l.fans_id)
					})
				}
				return ids
			},
			editGroup (row) {
				this.$r('group')
				.set('info',row)
				.show('编辑分组','edit')
			},
			groupChange (val) {
				
			},
			setCurrentIndex (index) {
				this.currentIndex = index||0
			},
			labelChange (val) {
				this.init_data()
			},
			showLabelModal (row) {				
				if(row=='m'){
					if(this.fans_id.length==0){
						this.$Message.error('请先选择粉丝')
						return 
					}					
					this.$refs['label']
					.set('fans_id',this.fans_id)
					.show('打标签','multiple')					
				}else{
					this.$refs['label']
					.set('fans_id',row.fans_id)
					.set('tag_id',row.tagid_list)
					.show('打标签','single')
				}
				
			},
			handleCheckAll (val) {
				let list = this.data
				this.fans_id = []
			
				if(val&&list.length){
					list.forEach(l=>{
						this.fans_id.push(l.fans_id)
					})					
				}	
			},
			handleToggle (id) {
				let index = this.fans_id.indexOf(id)
				if(index>-1){
					this.fans_id.splice(index,1)
				}else{
					this.fans_id.push(id)
				}
				this.check_all = this.fans_id.length===this.data.length
			},
			hook_get_param (param) {
				if(!/^\s*$/.test(this.search_value)){
					param.nickname = this.search_value
				}
			}
		},
		computed: {
			noDataText () {
				let result = '没有相关数据~'
				
				if(this.data.length&&this.filter_data.length===0){
					result = '无符合条件数据~'
				}
				
				return result
			},
			filter_group () {
				let list = this.group,
					name = this.group_name 
				if(list.length&&/^\s*$/.test(name)){
					return list.filter(l=>l.name.indexOf(name)>-1) 
				}
				return list
			},
			hasOwnWxmp () {
				let data = this.$store.state.gvars.public_accounts
				if(data&&data.length){					
					return data[0].cid>0
				}
				return false
			},
			filter_data () {
				let index = this.currentIndex,
					filter = (item)=>{
						return true
					}
				if(index>-1){
					let id = this.group[index].id
					filter = (item)=>{
						return item.tagid_list.indexOf(id)>-1
					}
				}
				return this.data.filter(filter)
			}
		}
	}
	
</script>
