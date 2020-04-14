<template>
	<div>
		<div v-if="mode=='list'">
			<div class="box box-query">
				<Row>
					<Col span="6">
						<Input class="input-search" placeholder="搜索菜单..." v-model="params.search_value" size="small" v-focusme="'searchkey'">
							<Select v-model="params.search_field" slot="prepend" style="width: 80px">
	                            <Option value="group_name">菜单名</Option>
	                        </Select>
		                    <Button-group class="input-search-append" slot="append" style="width: 25px;">
		                        <Button class="btn-search" icon="ios-search" v-tooltip="'查询'" @click="search"></Button>
		                    </Button-group>
		               </Input>
					</Col>
					<Col span="8"> 
						<Button type="primary" class="ml-3" icon="plus" @click="add">新增</Button>		      
						<Button type="primary" class="ml-3" icon="ios-download-outline" @click="get_wx_menu">同步微信菜单</Button>
					</Col>
				</Row>		        		
			</div>
			<div class="box box-result">
				<div class="content">
					<table class="modal-table">
						<thead>
							<th><div class="ivu-table-cell">菜单组名</div></th>
							<th><div class="ivu-table-cell">显示对象</div></th>
							<th><div class="ivu-table-cell">是否在微信生效<span class="text-desc">（只能生效一个默认菜单）</span></div></th>
							<th><div class="ivu-table-cell">操作</div></th>
						</thead>
						<tr v-for="(item,index) in data" :key="index">
							<td><div class="ivu-table-cell">{{item.group_name}}</div></td>
							<td><div class="ivu-table-cell">{{getGroupName(item.matchrule)}}</div></td>
							<td>
								<div class="ivu-table-cell">
									<span class="text-success" v-if="item.status==1">菜单生效中</span>
									<a class="text-info" @click="doactive(item.wm_id)" v-else>生效并置顶</a>
								</div>
							</td>
							<td>
								<div class="ivu-table-cell">
									<a class="text-info mr-3" @click="edit(item)">编辑</a>
									<a class="text-info" @click="del_menu(item)">删除</a>		        						
								</div>
							</td>
						</tr>
						<tr v-if="!data.length">
							<td colspan="4"><div class="ivu-table-cell text-center al-c">还没有自定义菜单</div></td>
						</tr>
					</table>
					<div class="content-footer">
			            <div class="pagenation">
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
			</div>
		</div>
		<div v-else>
			<div class="mb-3">				
				<label style="width:100px;">菜单组名称</label>
				<Input v-model="menu.group_name" placeholder="菜单组名称..." style="width:280px"></Input>				
				<Button @click="back" icon="chevron-left" class="ml-3">返回</Button>				
			</div>
			<div class="mb-3">
				<label style="width:100px;">显示对象</label>
				<Select 
					:value="menu.matchrule?menu.matchrule.group_id:0" 
					@on-change="tagChange" 
					style="display: inline-block;width: 280px">
					<Option :value="String(item.id)" v-for="(item,index) in group" :key="index">{{item.name}}</Option>
				</Select>
			</div>
			<div class="menu-content-container box">
				<div class="menu-content-left">
					<div class="mobile-content-left-body">
						<div class="mobile-hd">{{menu.group_name}}</div>
						<ul class="menu-list">
							<li class="menu-item" v-for="(item,index) in menu.buttons" :key="index" @click="setCurrentMenu(item,1,index)">
								<a class="menu-link" :class="active_menu==item?'active':''">									
									<span>
										<i class="icon_menu_dot" v-if="item.sub_button.length>0"></i>
										{{item.name}}
									</span>
								</a>
								<div class="sub-menu-box">
									<ul class="sub-menu-list">
										<li class="sub-menu-item" 
											:class="active_menu==child?'active':''" 
											v-for="(child,childIndex) in item.sub_button" :key="childIndex" 
											@click.stop="setCurrentMenu(child,2,index)">
											<span class="sub-menu-item-inner">{{child.name}}</span>
										</li>
										<li class="sub-menu-item" v-if="item.sub_button.length<5" @click.stop="addSubMenu(item)">
											<span class="sub-menu-item-inner">
												<Icon type="plus"></Icon>
											</span>
										</li>
									</ul>
									<i class="arrow arrow-out"></i>
									<i class="arrow arrow-in"></i>
								</div>
							</li>
							<li class="menu-item" @click="addMenu" v-if="menu.buttons.length<3">
								<a class="menu-link">
									<Icon type="plus"></Icon>
									<span>添加菜单</span>
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div class="menu-content-right">
					<div class="menu-content-right-body">
						<div class="menu-form-hd">
							<span>当前菜单</span>
							<span class="text-info pull-right" @click="del">删除菜单</span>
						</div>
						<div class="mt-4">
							<label style="width:100px;vertical-align: top;">菜单名称</label>
							<div style="display: inline-block;">
								<Input v-model="active_menu.name" placeholder="菜单名称" style="width:280px;"></Input>	<br>
								<p class="mt-2" style="color:#80848f；">字数不超过4个汉字或8个字母</p>
							</div>							
						</div>	
						<template v-if="!active_menu.sub_button||active_menu.sub_button.length===0">							
							<div class="mt-4">
								<label style="width:100px">菜单内容</label>
								<RadioGroup v-model="active_menu.type" @on-change="onchange">
									<Radio class="ml-3" :label="item.value" v-for="(item,index) in menu_type" :key="index">{{item.label}}</Radio>
								</RadioGroup>
							</div>	
							<div class="ivu-card-body mt-4 b-a-1" style="background:#FFFFFF;" v-if="active_menu.type=='view'">
								<p style="color:#80848f" class="mb-4">订阅者点击该子菜单会跳转到以下链接</p>
								<label class="text-gray-dark" style="width: 100px;vertical-align: top;">页面地址</label>
								<div style="display: inline-block;">
									<select-system-link v-model="active_menu.url" :forbid-type="['pc']"></select-system-link>
									<p class="mt-2" style="color:#80848f">指定点击此菜单时要跳转的链接（注：链接需加http://）</p>
								</div>
							</div>
							<Card dis-hover class="mt-4" v-else>
								<span slot="title">回复内容</span>
								<div class="card-body">
									<!--所选回复内容-->
									<ul class="keyword-list">
										<li class="keyword-list-item" v-if="active_menu.media_id">											
											<div class="desc">
												<div class="appmsgSendedItem" v-if="active_item.type=='image'">
													<a class="title-wrap">
														<span class="icon cover" :style="{backgroundImage:'url('+format_wx_img(active_item.url)+')'}"></span>
														<span class="title">[图片]</span>
													</a>
												</div>
												<div class="appmsgSendedItem" v-if="active_item.type=='news'">
													<a class="title-wrap">
														<span class="icon cover" :style="{backgroundImage:'url('+format_wx_img(active_item.items[0].thumb_url)+')'}"></span>
														<span class="title">[图文消息]{{active_item.items[0].title}}</span>
													</a>
													<p class="desc">{{active_item.items[0].digest}}</p>
												</div>
												<div class="audio-msg" v-if="active_item.type=='voice'">
													<div class="icon-audio-wrap">
														<playVoice class="icon-voice-msg"
    														:src="'http://qms.xiao360.com/api/open/wxvoice?media_id='+active_item.media_id"></playVoice>    				
													</div>
													<div class="audio-content">
														<div class="audio-title">
															[语音]
															<p class="text-over-elips">{{active_item.name}}</p>
														</div>
													</div>
												</div>
												<div class="appmsgSendedItem" v-if="active_item.type=='video'">
													<a class="title-wrap">
														<span class="icon over">
															<Icon type="ios-videocam" size="30"></Icon>
														</span>
														<span class="title">[视频]</span>
														<p>{{active_item.name}}</p>
													</a>
													<p class="desc"></p>
												</div>
												<!--<div class="desc" v-else>
													<p>[关键字]{{active_item.keywords[0].content}}</p>
												</div>-->
											</div>
										</li>
									</ul>
									<div class="card-tab-nav-container">
										<ul class="tab-navs">
											<li class="tab-nav-item tab-appimg" 
												@click="choose_file(type)"
												v-for="(type,typeIndex) in type_list" :key="typeIndex">
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
					</div>
					<span class="menu-content-arrow-left">
						<i class="editor-arrow editor-arrow-out"></i>
						<i class="editor-arrow editor-arrow-in"></i>
					</span>
				</div>
				<div style="clear: both;"></div>
			</div>
			<div class="pd-10">
				<Button type="primary" @click="save">保存并关闭</Button>
				<Button type="ghost" @click="preview">预览</Button>
			</div>
		</div>
		<!--选择回复内容-->
		<Modal :mask-closable="false" v-model="modal.show" :title="modal.title" width="900">
			<chooseFile ref="cf" v-if="modal.show" :type="file_type" @getFile="getFile"></chooseFile>
			<div slot="footer">
				<span class="pull-left"></span>
				<Button type="ghost" @click="modal.show=false">取消</Button>
				<Button type="primary" @click="confirm_file">确定</Button>
			</div>
		</Modal>
		
		<!--预览-->
		<div class="custom-modal-mask" v-transfer-dom :data-transfer="true" v-show="mobile_preview">
			<div class="ivu-modal-mask" style="z-index: 2009;"></div>
			<div class="mobile-preview">
				<div class="mobile-preview-hd">
					<strong class="nickname">{{menu.group_name}}</strong>
				</div>
				<div class="mobile-preview-bd"></div>
				<div class="mobile-preview-ft">
					<ul class="pre-menu-list">
						<li class="pre-menu-item" v-for="(item,index) in menu.buttons" :key="index">
							<a>
								<i class="icon_menu_dot" v-if="item.sub_button.length>0"></i>
								{{item.name}}
							</a>
							<div class="sub-pre-menu-box" v-if="item.sub_button.length>0">
								<ul class="sub-pre-menu-list">
									<li v-for="(sub,subIndex) in item.sub_button">
										<a>{{sub.name}}</a>
									</li>
								</ul>
								<i class="arrow arrow-out"></i>
								<i class="arrow arrow-in"></i>
							</div>
						</li>
					</ul>
				</div>
				<button class="mobile-preview-closed" @click="mobile_preview=false">退出预览</Button>
			</div>
		</div>
	</div>
</template>

<script>
	import Vue from 'vue'
	import grid from '@/libs/grid.mixin'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import chooseFile from './choose-file.vue'
	import playVoice from 'c%/playVoice.vue'
	import directive from '@/libs/directive.mixin'
	import TransferDom from '@/libs/transfer-dom'
	import SelectSystemLink from 'c%/SelectSystemLink.vue'
	
	const emptyMenu = {
		group_name: '默认菜单',
		matchrule: null,
		wxmp_id: 0,
		buttons: [{
			name: '菜单名称',
			type: 'media_id',
			sub_button: [],
			index: 'button_1'			
		}]
	}
	
	export default{
		mixins: [directive,grid,common],
		directives: { TransferDom },
		props: {
			appId: {
				type: [Number,String],
				default: () => {
					return 0 
				}
			},
			wxmpId: {
				type: [Number,String],
				default: () => {
					return 0 
				}
			}
		},
		components:{
			SelectSystemLink,
			playVoice,
			chooseFile
		},
		data () {
			return {
				action: 'add',
				mode: 'list',
				file_type: '',
				active_item_type: 1,
				active_index: 0,
				active_item: {},
				mobile_preview: false,
				rest_api: 'wxmp_menus?appid='+this.appId,
				pk: 'wm_id',
				modal: {
					show: false,
					title: ''
				},
				group: [],
				type_list: [
					{type:'news',icon:'images',text:'图文'},
					{type:'image',icon:'image',text:'图片'},
					{type:'voice',icon:'mic-a',text:'语音'},
					{type:'video',icon:'ios-videocam',text:'视频'},
//					{type:'keyword',icon:'ios-folder',text:'触发关键字'},
				],
				active_menu: {},
				menu: util.copy(emptyMenu),
				data: [],
				menu_type: [
					{value:'media_id',label:'发送消息'},
					{value:'view',label:'跳转网页'},
				]
			}
		},
		watch: {
			'active_menu.media_id':function(val){
				if(val&&val.length>0&&this.active_item.media_id!=val){
					this.get_wx_file(val)					
				}
			},
			'active_menu': function (item) {
				if(item.sub_button&&item.sub_button.length > 0){
					let obj = this.menu.buttons.find(b=>b==item)
					Vue.delete(obj,'type')
					Vue.delete(obj,'media_id')
					Vue.delete(obj,'url')
				}
			},
			appId: function (val) {
				this.rest_api = 'wxmp_menus?appid='+val
				this.init_data()
				this.init_group()
			}
		},
		mounted () {
			this.active_menu = this.menu.buttons[0]
			this.params.search_field = 'group_name'
			this.init_data()
			this.init_group()
		},
		methods: {
			setCurrentMenu (menu,type,index) {
				
				if(typeof index != 'undefined') {
					this.active_index = index 
				}
				
				this.active_menu = menu
				this.active_item_type = type
			},
			tagChange (val) {
				if(!this.menu.matchrule){
					this.menu.matchrule = {}
				}
				this.$set(this.menu.matchrule,'group_id',val)
			},
			getGroupName (matchrule){
				let result = '所有粉丝'
				let group = this.group
				if(matchrule&&matchrule.group_id){
					let obj = group.find(g=>g.id==matchrule.group_id)
					if(obj){
						result = obj.name						
					}
				}
				return result
			},
			init_group () {
				this.$rest('wxmp_tags').get()
				.success(data=>{
					this.group = data.tags
				})
			},
			get_wx_menu () {
				this.showPageSpin()
				this.$http.get('wxmp_menus/sync?appid='+this.appId)
				.then(response=>{
					this.init_data()
					this.hidePageSpin()
				},response=>{
					this.hidePageSpin()
					this.$Notice.error({
						title: '错误',
						desc: response.body.message||'同步微信出错~'
					})
				})
			},
			get_wx_file (media_id) {
				let param = { media_id:media_id }
				this.$http.post('open/get_material',param)
				.then(response=>{
					this.active_item = response.body.data	
				},response=>{
					this.$Notice.warning({
						title: '错误',
						desc: response.body.message||'获取微信文件错误'
					})
				})
			},
			format_wx_img (src) {
				return this.$store.state.user.info.base_url+'/api/open/wximage?url='+src
			},
			getFile (item) {
//				if(this.file_type=='keyword'){
//					this.active_menu.media_id = item.rule_id
//					this.active_item = item
//				}else{
					this.get_wx_file(item.media_id)
					this.active_menu.media_id = item.media_id
//				}
			},
			confirm_file () {
				this.$refs['cf'].getFile()
				this.modal.show = false
			},
			choose_file (item) {
				let map_title = {'news':'选择图文','image':'选择图片','voice':'选择语音','video':'选择视频','keyword':'选择关键字'} 
				this.file_type = item.type
				this.modal.title = map_title[this.file_type]
				this.modal.show = true
			},
			onchange (val) {
				if(val=='view'){
					this.active_item.media_id = ''
					Vue.delete(this.active_item,'media_id')
				}else{
					this.active_item.url = ''
					Vue.delete(this.active_item,'url')
				}
			},
			showMenuLink () {
				this.$r('link').show('系统链接')
			},
			setUrl (url) {
				Vue.set(this.active_menu,'url',url)				
			},
			add () {
				this.mode = 'add'
			},
			edit (item) {
				this.mode = 'edit'
				this.menu = item
			},
			del_menu (item) {
				this.confirm('您确定删除菜单组['+item.group_name+']吗？删除后将无法恢复！')
				.then(response=>{					
					this.$rest('wxmp_menus')
					.delete(item[this.pk])
					.success(()=>{
						this.$Message.success('删除成功！')	
						this.init_data()
						this.init_group()
					})
				})
			},
			save () {
				let params = this.menu
				let [method,uri,msg] = ['post','wxmp_menus','添加成功']
				if(this.mode=='edit'){
					[method,uri,msg] = ['put','wxmp_menus/'+params.wm_id,'修改成功']
				}
				params.wxmp_id = this.wxmpId
				
				this.$http[method](uri,params)
				.then(response=>{
					this.$Message.success(msg)
					this.back()
				},response=>{
					this.$Notice.error({
						title: '错误',
						desc: response.body.message||'添加自定义菜单错误'
					})
				})
			},
			doactive (wm_id) {
				this.$http.post('wxmp_menus/'+ wm_id +'/doactive')
				.then(response=>{
					this.$Message.success('启用成功')
					this.init_data()
				},response=>{
					this.$Notice.error({
						title: '错误',
						desc: response.body.message||'启用失败'
					})
				})
			},
			preview () {
				this.mobile_preview = true
			},
			del () {
				let [active_menu,index] = [this.active_menu,-1]
				if(this.active_item_type == 2){
					index = this.active_index
					let item_index = this.menu.buttons[index].sub_button.indexOf(active_menu)
					if(item_index > -1){
						this.menu.buttons[index].sub_button.splice(item_index,1)
					}
					this.active_menu = this.menu.buttons[index]
				}else{
					index = this.menu.buttons.indexOf(active_menu)
					if(index > -1){
						this.menu.buttons.splice(index,1)
					}					
				}
			},
			back () {				
				this.menu = util.copy(emptyMenu)
				this.active_menu = {}
				this.init_data()
				this.init_group()
				this.mode = 'list'
			},
			addMenu () {
				let length = this.menu.buttons.length,
					menu = {
						name: '菜单名称',
						type: 'media_id',
						media_id: '',
						sub_button: []
					}
				this.menu.buttons.push(menu)
				this.setCurrentMenu(menu,1,length)
			},
			addSubMenu (item) {
				let length = item.sub_button.length,
					sub_button = {
					type: 'media_id',
					name: '子菜单名称',
					media_id: ''
				}
				item.sub_button.push(sub_button)
				this.setCurrentMenu(sub_button,2)
			}
			
		}
	}
</script>
