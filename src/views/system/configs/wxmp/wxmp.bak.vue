<style lang="less">
	.x-tabs{
		.ivu-tabs-tabpane{
			min-height: 300px;
		}
	}
</style>

<template>
	<div class="c-grid" v-loading.like="'configs'">
		<div class="row">
			<div class="col-md-2">
				<Card dis-hover class="x-card">
					<div slot="title" class="clearfloatblock">
						<span style="line-height: 24px;">公众号列表</span>
						
						<Button @click.stop="addInfo()" 
							v-per="'wxmp.list'"
							class="pull-right" 
							type="ghost" 
							shape="circle" 
							size="small" 
							icon="plus" 
							v-if="hasOwnerDefaultWxmp"
							title="新增">
						</Button>							
					</div>
					
					<div class="x-card-body">
						<div class="mb-3" v-if="filter_data.length > 7">
							<Input v-model="data_key" placeholder="请输入公众号名称" icon="ios-search"></Input>
						</div>
						<ul>
							<li v-for="(item,index) in filter_data" 
								class="mb-2 x-li cursor"
								:class="currentIndex===index?'text-primary font-weight-bold':''"
								@click="setCurrentIndex(index)">	
								<div class="notwrap">
									<Icon type="record" :color="currentIndex===index?'#2d8cf0':'transparent'"></Icon>									
									{{index===0?'默认公众号':item.nick_name}}
								</div>
							</li>
						</ul>
					</div>
				</Card>
			</div>
			
			<div class="col-md-10">		
				<!--公众号基本信息-->
				<Card dis-hover>
					<div class="clearfloatblock" slot="title">
						<span style="line-height: 32px;">公众号信息</span>
					</div>
					<Dropdown slot="extra" style="line-height: 32px;">
						<Button type="primary" size="small">操作 <Icon type="arrow-down-b"></Icon></Button>
						<DropdownMenu slot="list">
							<DropdownItem @click.native="bandNew" v-if="currentItem.system_default===1">
								<Icon type="shuffle"></Icon>  更换默认公众号
							</DropdownItem>
							<template v-if="currentItem.system_default!==1">
								<DropdownItem @click.native="refreshInfo">
									<Icon type="refresh"></Icon>  更新公众号信息
								</DropdownItem>
								<DropdownItem @click.native="reset">
									<Icon type="ios-trash"></Icon>  删除默认公众号
								</DropdownItem>
							</template>
						</DropdownMenu>
					</Dropdown>
					<Form :label-width="120" class="row">
						<div class="col-sm-4">
							<div class="qrcode-container m-auto" 
								@click="picturePreview(format_wx_img(currentItem.qrcode_url))">
								<img :src="format_wx_img(currentItem.qrcode_url)||'/static/img/暂无-2.jpg'">									
							</div>
						</div>
						<div class="col-sm-8 row">
							<Form-item label="公众号名称：" class="col-sm-12">
								<span>{{currentItem.nick_name}}</span>								
								<Tag color="green" v-if="currentItem.is_default||currentItem.system_default">默认公众号</Tag>
							</Form-item>		
							<Form-item label="公众号简称：" class="col-sm-12">
								{{currentItem.alias}}
							</Form-item>
							<Form-item label="公众号主体名称：" class="col-sm-12">
								{{currentItem.principal_name}}
							</Form-item>								
						</div>
					</Form>
				</Card>
				<!--公众号相关设置-->
				<Card dis-hover class="mt-3">
			        <span slot="title">微信公众号配置</span>
			        <Tabs type="card" v-model="tab" class="x-tabs">
				        <TabPane label="适用校区" name="schools">
				        	<div v-if="tab=='schools'">
				        		<Alert show-icon v-if="currentItem.is_default||currentItem.system_default">
							        自定义微信公众号开通说明
							        <Icon type="ios-lightbulb-outline" slot="icon"></Icon>
							        <template slot="desc">
							        	系统默认使用「学习管家服务号」作为服务公众号，完成对家长和{{'老师'|translate}}的模板消息的推送及移动端的入口<br>
							        	您可以使用您自己的公众号<br>
							        	默认公众号适用于所有的校区，在设置了您自己的默认公众号以后，还可以给指定的校区开通校区单独的公众号.
							        	<br>
							        	<Tag color="red">注意：公众号必须是已认证的服务号，订阅号不可以使用.</Tag><br>
							        	<a href="https://mp.weixin.qq.com/cgi-bin/readtemplate?t=register/step1_tmpl&lang=zh_CN" target="_blank">前往免费申请微信公众服务号</a>
							        	

							        </template>
							    </Alert>
					        					        										
			        			<CheckboxGroup class="row" :value="bids$" v-else>
			        				<Checkbox class="col-sm-2 mt-2" :label="item.bid" readonly v-for="item in branchs">
			        					{{item.branch_name}}
			        				</Checkbox>
			        			</CheckboxGroup>								
				        	</div>
				        </TabPane>
				        <template v-if="canWxmpEditable">
					        <TabPane label="消息模板设置" name="template">
					        	<message-template ref="template" v-if="tab=='template'" :appId="appId"></message-template>
					        </TabPane>
				        
					        <TabPane label="自定义菜单" name="menu">
					        	<customMenu v-if="tab=='menu'" :appId="appId" :wxmpId="wxmpId"></customMenu>		        	
					        </TabPane>
					        <TabPane label="素材管理" name="source">
					        	<sourceManage v-if="tab=='source'" :appId="appId"></sourceManage>
					        </TabPane>
					        <TabPane label="自动回复" name="reply">
					        	<autoReply v-if="tab=='reply'" :wxmpId="wxmpId"></autoReply>
					        </TabPane>
				        </template>
			        </Tabs>        		       
			    </Card>
			</div>
		</div>
		
	    <public-number-modal ref="public_number" @on-success="init_wx_config"></public-number-modal>	    
	    <wxmp-add-modal ref="add"></wxmp-add-modal>
    </div>
</template>

<script>
	import util from '@/libs/util'
	import config from '@/libs/config.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import directive from '@/libs/directive.mixin'
	import customMenu from './custom-menu.vue'	
	
	import autoReply from './auto-reply.vue'
	import sourceManage from './source-manage.vue'
	import publicNumberModal from './public-number-modal.vue'
	import messageTemplate from './message-template.vue'
	import wxmpAddModal from './wxmp-add-modal.vue'
	
	export default{
		mixins:[common,config,globals,directive],
		components: {
			autoReply,
			customMenu,
			sourceManage,
			wxmpAddModal,
			messageTemplate,
			publicNumberModal
		},
		computed:{
			isBase () {
				let user = this.$store.state.user.info				
				return user.x_sub_host!='base'
			},
			data () {
				let data = this.$store.state.gvars.public_accounts
				if(data.length>1){
					data = data.filter(d=>!d.system_default)
				}
				return data
			},
			currentItem () {
				let index = this.currentIndex||0
				return this.data[index]||{}
			},
			filter_data () {
				let list = this.data,
					keys = this.data_key,
					condition = (item) => {
						if(!/$\s*^/.test(keys)){
							return item.alias.indexOf(keys)>-1
						}
						return true
					}
				return list.filter(condition)
			},
           	branchs () {
           		let list = this.$store.state.gvars.branchs
           		return list.filter(l=>l.appid==this.appId)
           	},
           	bids$ () {
           		let branchs = this.$store.state.gvars.branchs,
           			list = branchs.filter(l=>l.appid==this.appId), 
           			bids = []
           			
           		list.forEach(l=>{
           			bids.push(l.bid)
           		})
           		
           		return bids
           	},
            wxmp_url(){
            	return this.$store.state.user.info.base_url+'/wxapi/wxmessage/server'
            },
            appId () {            	
            	return this.currentItem.authorizer_appid
            },
            wxmpId () {
            	return this.currentItem.wxmp_id
            },
            hasOwnerDefaultWxmp(){
            	if(this.filter_data && this.filter_data[0].alias == 'guanjiaxuexi'){
            		return false
            	}
            	return true
            },
            canWxmpEditable(){
            	return this.currentItem.system_default !==1 || (this.$store.state.user.info.is_admin === 1 && this.$store.state.user.info.client.domain == 'base')
            }
        },
		data () {
			return {
				data_key: '',
				tab: 'schools',
				currentIndex: 0				
			}
		},
		watch: {
			'$store.state.branch.id':{
				handler:function(bid,old_bid){
                    this.init_wx_config()
	            },
				deep: true
			}
		},
		mounted () {			
			this.init()
		},
		methods:{
			init () {
				this.$store.dispatch('updateGlobalVar','public_accounts')
				.then(()=>{
					this.init_wx_config()	
				})
			},
			refreshInfo () {
				this.$rest('wxmps').add_url_param(this.wxmpId).put()
				.success(response=>{
					this.$Message.success('更新成功！')
					this.init()
				}).error(response=>{
					this.$Message.error(response.body.message||'更新失败')
				})
			},
			setCurrentIndex (index) {
				this.currentIndex = index||0
			},
			addInfo () {
				this.$refs['add'].show('添加公众号授权','add')
			},
			bandNew () {
				this.confirm('更换默认公众号操作很简单，用个人微信扫个码就可以了，前提是您现在需要先准备好 <strong color="red">拥有公众号管理权限</strong> 的个人微信，并且公众号必须是服务号，不能是订阅号，您确定已经准备好了吗？')	
				.then(()=>{
					let href = location.href,
						base_url = this.$store.state.user.info.product_url,
						cid = this.$store.state.user.info.client.cid,
						token = this.$store.state.user.token,
						uri = util.sprintf('%s/api/authorize?token=%s&cid=%s&href=%s',base_url,token,cid,href)
					uri = uri.replace(/#/g,'$')
					location.href = uri
				})			
				
			},	
			init_wx_config () {				
				let appid = this.$route.query.appid
				if(appid){
					this.currentIndex = this.data.findIndex(d=>d.authorizer_appid==appid)
					this.tab = 'template'
					this.confirm('新的公众号已经授权，设置模板消息后即可正常使用')
					.then(()=>{
						this.$r('template').syncTemplate()						
					})
				}
			},
			format_wx_img (src) {
				return this.$store.state.user.info.base_url+'/api/open/wximage?url='+src
			},
			reset() {
				this.confirm('确认删除默认公众号吗？')
				.then(() => {
					this.$rest('wxmps')
					.delete(this.wxmpId)
					.success(res => {
						this.$Message.success('删除成功')
						this.init()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			}
		}
	}
</script>

<style lang="less">
	@import '~@/style/wxmp.less';
</style>