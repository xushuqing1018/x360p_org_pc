<template>
	<div class="menu-content-right">
		<div class="menu-content-right-body">
			<template v-if="buttonIndex == -1 && subButtonIndex == -1">
				<div class="empty">
					<p class="text-center" style="margin-top:200px;">点击左侧菜单进行编辑操作</p>
				</div>
			</template>
			<template v-else>
				<div class="menu-form-hd">
					<span>当前菜单</span>
					<span class="text-info pull-right" @click="deleteButton" v-if="subButtonIndex == -1">删除菜单</span>
					<span class="text-info pull-right" @click="deleteButton" v-else>删除子菜单</span>
				</div>
				<div class="mt-4">
					<label style="width:100px;vertical-align: top;">菜单名称</label>
					<div style="display: inline-block;">
						<Input v-model="button.name" placeholder="菜单名称" style="width:280px;"></Input>	<br>
						<p class="mt-2" style="color:#80848f；">字数不超过4个汉字或8个字母</p>
					</div>							
				</div>	
				<template v-if="!button.sub_button||button.sub_button.length===0">							
					<div class="mt-4">
						<label style="width:100px">菜单内容</label>
						<RadioGroup v-model="button.type">
							<Radio 
							class="ml-3" 
							:label="item.value" 
							v-for="(item,index) in button_types" 
							:key="index">
							{{item.label}}
							</Radio>
						</RadioGroup>
					</div>	
					<div class="ivu-card-body mt-4 b-a-1" style="background:#FFFFFF;" v-if="button.type=='view'">
						<p style="color:#80848f" class="mb-4">订阅者点击该子菜单会跳转到以下链接</p>
						<label class="text-gray-dark" style="width: 100px;vertical-align: top;">页面地址</label>
						<div style="display: inline-block;">
							<select-system-link v-model="button.url" :forbid-type="['pc']"></select-system-link>
							<p class="mt-2" style="color:#80848f">指定点击此菜单时要跳转的链接（注：链接需加http://）</p>
						</div>
					</div>
					<div class="ivu-card-body mt-4 b-a-1" style="background:#FFFFFF;" v-if="button.type=='miniprogram'">
						<p style="color:#80848f" class="mb-4">订阅者点击该子菜单会跳转到以下小程序</p>
						<div class="m-t">
							<label class="text-gray-dark" style="width: 100px;vertical-align: top;">小程序AppId</label>
							<div style="display: inline-block;">
								<Input v-model="button.appid" placeholder="小程序AppId" style="width:300px;"></Input>
							</div>
						</div>
						<div class="m-t">
							<label class="text-gray-dark" style="width: 100px;vertical-align: top;">页面路径</label>
							<div style="display: inline-block;">
								<Input v-model="button.pagepath" placeholder="小程序页面路径" style="width:300px;"></Input>
							</div>
						</div>
					</div>
					<Card dis-hover class="mt-4" v-if="button.type=='click'">
						<span slot="title">回复内容</span>
						<div class="card-body">
							<!--所选回复内容-->
							<ul class="keyword-list">
								<li class="keyword-list-item" v-if="button.media_id && button.media_id != ''">
									<div class="desc">
										<div class="appmsgSendedItem" v-if="material.type=='image'">
											<a class="title-wrap">
												<span class="icon cover" :style="{backgroundImage:'url('+wximage(material.url)+')'}"></span>
												<span class="title">[图片]</span>
											</a>
										</div>
										<div class="appmsgSendedItem" v-if="material.type=='news'">
											<a class="title-wrap">
												<span class="icon cover" :style="{backgroundImage:'url('+wximage(material.items[0].thumb_url)+')'}"></span>
												<span class="title">[图文消息]{{material.items[0].title}}</span>
											</a>
											<p class="desc">{{material.items[0].digest}}</p>
										</div>
										<div class="audio-msg" v-if="material.type=='voice'">
											<div class="icon-audio-wrap">
												<play-voice class="icon-voice-msg"
													:src="'http://pro.xiao360.com/api/open/wxvoice?media_id='+material.media_id">
													
												</play-voice>    				
											</div>
											<div class="audio-content">
												<div class="audio-title">
													[语音]
													<p class="text-over-elips">{{material.name}}</p>
												</div>
											</div>
										</div>
										<div class="appmsgSendedItem" v-if="material.type=='video'">
											<a class="title-wrap">
												<span class="icon over">
													<Icon type="ios-videocam" size="30"></Icon>
												</span>
												<span class="title">[视频]</span>
												<p>{{material.name}}</p>
											</a>
											<p class="desc"></p>
										</div>
									</div>
								</li>
							</ul>
							<div class="card-tab-nav-container">
								<ul class="tab-navs">
									<li class="tab-nav-item tab-appimg" 
										@click="selectMediaContent(type)"
										v-for="(type,typeIndex) in media_list" :key="typeIndex">
										<a>
											<Icon :type="type.icon"></Icon>
											<span class="msg-tab-item-title">{{type.text}}</span>
										</a>
									</li>											
								</ul>
							</div>
						</div>							
					</Card>
				</template>
			</template>
		</div>
		<span class="menu-content-arrow-left">
			<i class="editor-arrow editor-arrow-out"></i>
			<i class="editor-arrow editor-arrow-in"></i>
		</span>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'

	import selectSystemLink from 'c%/SelectSystemLink.vue'
	import playVoice from 'c%/playVoice.vue'
		
	export default{
		mixins: [common],
		props: {
			button:{
				type: Object,
				default:()=>{
					return null
				}
			},
			buttonIndex:{
				type:Number,
				default:0
			},
			subButtonIndex:{
				type:Number,
				default:-1
			}
		},
		components:{
			selectSystemLink,
			playVoice
		},
		data () {
			return {
				material:{

				},
				button_types: [
					{value:'click',label:'发送消息'},
					{value:'view',label:'跳转网页'},
					{value:'miniprogram',label:'跳转小程序'}
				],
				media_list: [
					{type:'news',icon:'images',text:'图文消息'},
					{type:'image',icon:'image',text:'图片'},
					{type:'voice',icon:'mic-a',text:'语音'},
					{type:'video',icon:'ios-videocam',text:'视频'}
				]
			}
		},
		watch: {
			button(val){
				if(!val.media_id){
					return
				}
				let media_id = val.media_id
				if(media_id.length>0&&this.material.media_id!=media_id){
					this.get_wx_file(media_id)					
				}
			}
		},
		methods: {
			deleteButton(){
				this.$emit('on-menu-button-delete')
			},
			wximage(value){
				return this.$store.state.user.info.base_url+'/api/open/wximage?url='+value
			},
			get_wx_file (media_id) {
				let param = { media_id:media_id }
				this.$http.post('open/get_material',param)
				.then(response=>{
					this.material = response.body.data	
				},response=>{
					this.$Notice.warning({
						title: '错误',
						desc: response.body.message||'获取微信文件错误'
					})
				})
			},
			setSelectContentType (item) {
				let map_title = {'news':'选择图文','image':'选择图片','voice':'选择语音','video':'选择视频','keyword':'选择关键字'} 
				this.file_type = item.type
				this.content.title = map_title[this.file_type]
				this.content.show = true
			},
			selectMediaContent(type){
				let map_title = {'news':'选择图文','image':'选择图片','voice':'选择语音','video':'选择视频','keyword':'选择关键字'} 
				let title = map_title[type]
				this.$Modal.open('system/configs/wxmp/menu-button-content-modal.vue',{
					on:{
						'on-select':(content)=>{
							console.log('--on-select')
						}
					}
				}).then(modal=>{
					modal
					.setType(type)
					.show(title)
				})
			},
			getFile (item) {
				this.get_wx_file(item.media_id)
				this.active_menu.media_id = item.media_id
			},
		}
	}
</script>