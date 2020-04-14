<template>
	<div>
		<table class="table-list table-list-wxmp">
			<thead>
				<tr>
					<th colspan="2">公众服务号</th>
					<th>适用校区</th>
					<th>操作</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(item,index) in list">
					<td width="160">
						<div class="qrcode-container-small" 
							@click="viewQrcode(item.qrcode_url)">
							<img :src="wximage(item.qrcode_url)">									
						</div>
					</td>
					<td width="300">
						<ul class="no-li">
							<li><label>名称:</label>{{item.nick_name}}</li>
							<li><label>微信号:</label>{{item.alias}}</li>
							<li><label>主体:</label>{{item.principal_name}}</li>
							<li><label>原始ID:</label>{{item.user_name}}</li>
							<li><label>AppID:</label>{{item.authorizer_appid}}</li>
						</ul>
					</td>
					<td>
						<p><Tag color="green" v-if="item.is_default||item.system_default">默认公众号</Tag></p>

						<p v-if="item.is_default||item.system_default">
							<span>适用所有校区</span>
						</p>
						<p v-else>
							<Tag color="default" v-for="b in item.branchs">{{b.branch_name}}</Tag>
						</p>
					</td>
					<td width="140">
						<p v-if="item.system_default">
							<Button 
							@click="changeDefaultMp(item)"
							type="primary"
							size="small"
							>
							更换默认公众号
							</Button>
						</p>
						<p class="m-t" v-if="canWxmpEditable(item)">
							<Button 
							@click="manageMp(item)"
							type="primary"
							size="small"
							>
							设置
							</Button>
						</p>
					</td>
				</tr>
				
			</tbody>
		</table>
		<div class="m-t" v-if="canAddWxmp">
			<Button 
				@click="addWxmp" 
				type="primary" 
				size="small" 
				icon="plus" 
				>
				为其他校区添加公众服务号
			</Button>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import config from '@/libs/config.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import directive from '@/libs/directive.mixin'
	
	export default{
		mixins:[common,config,globals,directive],
		props:{
			list: {
				type: [Array],
				default(){
					return []
				}
			}
		},
		data () {
			return {
						
			}
		},
		mounted () {			
		},
		computed:{
			hasOwnWxmp(){
				let has = false 
				this.list.forEach(item=>{
					if(item.system_default !== 1){
						has=true
					}
				})
				return has
			},
			canAddWxmp(){
				if(this.hasOwnWxmp && this.$store.state.gvars.branchs.length > 1){
					return true
				}
				return false
			}
		},
		methods:{
			canWxmpEditable(item){
            	return item.system_default !==1 || (this.$store.state.user.info.is_admin === 1 && this.$store.state.user.info.client.domain == 'base')
            },
			wximage(value){
				return this.$store.state.user.info.base_url+'/api/open/wximage?url='+value
			},
			viewQrCode(url){
				this.$emit('on-view-qrcode',url)
			},
			changeDefaultMp(item){
				this.$emit('on-change-default-mp',item)
			},
			manageMp(item){
				this.$emit('on-manage-mp',item)
			},
			addWxmp(){
				this.$emit('on-add-mp')
			}
		}
	}
</script>