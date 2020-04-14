<template>
	<div>
		<div class="mp-detail-title">
			<strong>管理公众号:{{info.nick_name}}</strong>
			<a @click="backList"><Icon type="reply"></Icon>返回公众号列表</a>
		</div>
		<table class="table-list table-list-wxmp">
			<tbody>
				<tr>
					<td width="160">
						<div class="qrcode-container-small" 
							@click="viewQrcode(info.qrcode_url)">
							<img :src="wximage(info.qrcode_url)">									
						</div>
					</td>
					<td width="300">
						<ul class="no-li">
							<li><label>名称:</label>{{info.nick_name}}</li>
							<li><label>微信号:</label>{{info.alias}}</li>
							<li><label>主体:</label>{{info.principal_name}}</li>
							<li><label>原始ID:</label>{{info.user_name}}</li>
							<li><label>AppID:</label>{{info.authorizer_appid}}</li>
						</ul>
					</td>
					<td>
						<p><Tag color="green" v-if="info.is_default||info.system_default">默认公众号</Tag></p>

						<p v-if="info.is_default||info.system_default">
							<span>适用所有校区</span>
						</p>
						<p v-else>
							<Tag color="default" v-for="b in info.branchs">{{b.branch_name}}</Tag>
						</p>
					</td>
					
					<td width="140">
						<template v-if="info.system_default !== 1">
							<p>
								<Button 
								@click="updateMp(info)"
								type="primary"
								size="small"
								icon="refresh"
								>
								更新公众号信息
								</Button>
							</p>
							<p class="m-t">
								<Button 
								@click="deleteMp(info)"
								type="error"
								size="small"
								icon="ios-trash"
								>
								删除
								</Button>
							</p>
						</template>
					</td>
				</tr>
			</tbody>
		</table>
		<Tabs type="card" v-model="tab" class="m-t">
	        <TabPane label="模板消息设置" name="template">
	        	<wxmp-detail-template 
	        	ref="template" 
	        	:mpinfo="info"
	        	v-if="tab=='template'">
	        	</wxmp-detail-template>
	        </TabPane>
        
	        <TabPane label="自定义菜单" name="menu">
	        	<wxmp-detail-menu
	        	ref="menu"
	        	:mpinfo="info"
	        	v-if="tab=='menu'"
	        	>
	        	</wxmp-detail-menu>		        	
	        </TabPane>
	        <TabPane label="素材管理" name="material">
	        	<wxmp-detail-material
	        	ref="material"
	        	:mpinfo="info"
	        	v-if="tab=='material'"
	        	>
	        	</wxmp-detail-material>
	        </TabPane>
	        <TabPane label="自动回复" name="reply">
	        	<wxmp-detail-reply
	        	ref="reply"
	        	:mpinfo="info"
	        	v-if="tab=='reply'"
	        	>
	        	</wxmp-detail-reply>
	        </TabPane>
        </Tabs> 
	</div>
</template>
<script>
	import util from '@/libs/util'
	import config from '@/libs/config.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import directive from '@/libs/directive.mixin'

	import wxmpDetailMenu from './wxmp-detail-menu.vue'
	import wxmpDetailReply from './wxmp-detail-reply.vue'
	import wxmpDetailMaterial from './wxmp-detail-material.vue'
	import wxmpDetailTemplate from './wxmp-detail-template.vue'
	
	export default{
		mixins:[common,config,globals,directive],
		props:{
			info: {
				type: Object,
				default(){
					return null
				}
			}
		},
		components: {
			wxmpDetailTemplate,
			wxmpDetailMenu,
			wxmpDetailMaterial,
			wxmpDetailReply
		},
		data () {
			return {
				tab:'template'		
			}
		},
		mounted () {			
			
		},
		methods:{
			backList(){
				this.$emit('on-back-list')
			},
			wximage(value){
				return this.$store.state.user.info.base_url+'/api/open/wximage?url='+value
			},
			viewQrCode(url){
				this.$emit('on-view-qrcode',url)
			},
			updateMp(item){
				this.$emit('on-mp-update',item)
			},
			deleteMp(item){
				this.$emit('on-mp-delete',item)
			}
		}
	}
</script>