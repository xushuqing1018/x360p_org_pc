<template>
	<div>
		<div v-if="mode=='list'">
			<div class="box box-query mb-3">
				<Row class="mb-3">
					<Col span="6">
						<Button-group>
				            <Button size="small" :type="reply_type===1?'primary':'ghost'" icon="key" @click="change_status(1)">关键字回复</Button>
				            <Button size="small" :type="reply_type===2?'primary':'ghost'" icon="ios-clock" @click="change_status(2)">首次访问回复</Button>
				            <Button size="small" :type="reply_type===3?'primary':'ghost'" icon="chatbubbles" @click="change_status(3)">默认回复</Button>
				        </Button-group>
					</Col>				
				</Row>		
				<Row :gutter="16" v-if="reply_type===1">
					<Col span="6">
						<Input class="input-search" size="small" v-model="params.search_value" v-focusme="'searchkey'"> 
	                        <Select v-model="params.search_field" slot="prepend" style="width: 80px">
	                            <Option value="keyword">关键字</Option>
	                        </Select>
	                        <Button-group class="input-search-append" slot="append" style="width: 25px;">
	                            <Button class="btn-search" icon="ios-search" v-tooltip="'查询'" @click="search"></Button>
	                        </Button-group>
	                    </Input>
					</Col>
					<Col span="6">
						<Button type="primary" size="small" icon="plus" @click="add">添加</Button>
						<Button :disabled="disabled" type="error" size="small" icon="ios-trash" @click="del_multi">批量删除</Button>
					</Col>
				</Row>
	        </div>
	        <div class="box box-result">
	        	<div class="content" v-if="reply_type===1">
	                <div class="content-body">
	                    <Table v-loading.like="'wxmp_rules'" @on-selection-change="selectionChange" :border="true" :stripe="true" :show-header="true" :data="data" :columns="columns" :no-data-text="$store.state.config.EMPTY_DATA_TEXT" :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" @on-sort-change="sortChange"> 
	                    </Table>
	                </div>
	                <div class="content-footer">
	                    <div class="pagenation">
	                        <Page :total="total" :current="pageIndex" :show-sizer="true" :page-size="pageSize" :show-total="true" @on-change="pagenation" @on-page-size-change="pagesize"></Page>
	                    </div>
	                </div>    
	            </div>
	            <Card dis-hover v-if="reply_type===2">
	            	<span slot="title">首次访问后自动回复</span>
	            	<Alert>用户关注公众号时，发送的欢迎信息。</Alert>
	            	<div class="padder-sm mb-3" v-if="reply.welcome.keywords">
	            		<div style="display: inline-block;line-height: 40px;">
	            			<span>[关键字]</span><br>
	            			<span>{{reply.welcome.keywords.join('　　')}}</span>
	            		</div>
	            	</div>
	            	<ul class="tab-navs">
	            		<li class="tab-nav-item">
	            			<a @click="modal_choose_word=true">
								<Icon type="ios-folder"></Icon>
								<span class="msg-tab-item-title">触发关键字</span>
							</a>
	            		</li>
	            	</ul>
	            </Card>
	            <Card dis-hover v-if="reply_type===3">
	            	<span slot="title">触发后自动回复</span>
	            	<Alert>当系统不知道该如何回复粉丝的消息时，默认发送的内容。</Alert>
	            	<div class="padder-sm mb-3" v-if="reply.default.keywords">
	            		<div style="display: inline-block;line-height: 40px;">
	            			<span>[关键字]</span><br>
	            			<span>{{reply.default.keywords.join('　　')}}</span>
	            		</div>
	            	</div>
	            	<ul class="tab-navs">
	            		<li class="tab-nav-item">
	            			<a @click="modal_choose_word=true">
								<Icon type="ios-folder"></Icon>
								<span class="msg-tab-item-title">触发关键字</span>
							</a>
	            		</li>
	            	</ul>
	            </Card>
	        </div>
	    </div>
	    
	    <div v-else>
	    	<table class="modal-table">
	    		<thead>
	    			<th><div class="ivu-table-cell">关键字</div></th>
	    			<th><div class="ivu-table-cell">触发类型</div></th>
	    			<th><div class="ivu-table-cell">操作</div></th>
	    		</thead>
	    		<tr v-for="(item,index) in keyword.keywords">
	    			<td><div class="ivu-table-cell">{{item.content}}</div></td>
	    			<td><div class="ivu-table-cell">{{key_type(item.type)}}</div></td>
	    			<td><div class="ivu-table-cell"><a class="text-info" @click="del_keywords(item)">删除</a></div></td>
	    		</tr>
	    		<tr>
	    			<td colspan="3">
	    				<div class="ivu-table-cell">
	    					<Button type="primary" icon="plus" @click="modal_keyword=true">添加关键字</Button>
	    				</div>
	    			</td>
	    		</tr>
	    	</table>
	    	
	    	<p class="text-info mt-3">
	    		<a @click="show_advance=!show_advance">
	    			<span v-if="show_advance">
	    				收起高级设置<Icon type="chevron-up"></Icon>
	    			</span>
	    			<span v-else>
	    				展开高级设置<Icon type="chevron-down"></Icon>	    				
	    			</span>
	    		</a>
	    	</p>
	    	
	    	<!--高级设置-->
	    	<Card v-if="show_advance" dis-hover class="mt-3">
	    		<Form :label-width="120" label-position="left">
	    			<Form-item label="规则名称">
	    				<Input placeholder="请输入回复规则的名称" v-model="keyword.name" style="width:380px"></Input>
	    				<p class="text-desc">您可以给这组触发关键字规则起一个名字, 方便下次修改和查看.</p>
	    			</Form-item>
	    			<Form-item label="全局置顶">
	    				<RadioGroup v-model="keyword.is_top">
	    					<Radio label="1">是</Radio>
	    					<Radio label="0">否</Radio>
	    				</RadioGroup>
	    			</Form-item>
	    			<Form-item label="回复优先级">
	    				 <InputNumber :max="254" :min="1" :step="1" v-model="keyword.displayorder" style="width:260px"></InputNumber>
	    				 <p class="text-desc">规则优先级，越大则越靠前，最大不得超过254.</p>
	    			</Form-item>
	    			<Form-item label="是否开启">
	    				<i-switch v-model="keyword.status" :true-value="1"></i-switch>
	    			</Form-item>
	    		</Form>
	    	</Card>
	    	
	    	<!--回复内容-->
			<Card dis-hover class="mt-3">
	    		<div slot="title">
	    			<span>触发后恢复内容</span>
	    			<span class="pull-right">添加多条回复内容时, 随机回复其中一条</span>
	    			<div style="clear:both"></div>
	    		</div>
	    		<div class="card-tab-nav-container">
	    			<!--所选回复内容-->
					<ul class="keyword-list">
						<li class="keyword-list-item b-b-1" v-if="keyword.replys.length>0" v-for="(item,index) in keyword.replys" :key="index">											
							<div class="desc">
								<div v-if="item.type=='text'">
									<div class="desc">
										<Tooltip :content="item.content">
											{{item.content}}
										</Tooltip>
									</div>
								</div>
								<div class="appmsgSendedItem" v-if="item.type=='image'">
									<a class="title-wrap">
										<span class="icon cover" :style="{backgroundImage:'url('+format_wx_img(item.url)+')'}"></span>
										<span class="title">[图片]</span>
									</a>
								</div>
								<div class="appmsgSendedItem" v-if="item.type=='news'">
									<a class="title-wrap">
										<span class="icon cover" :style="{backgroundImage:'url('+format_wx_img(item.items[0].thumb_url)+')'}"></span>
										<span class="title">[图文消息]{{item.items[0].title}}</span>
									</a>
									<p class="desc">{{item.items[0].digest}}</p>
								</div>
								<div class="audio-msg" v-if="item.type=='voice'">
									<div class="icon-audio-wrap">
										<playVoice
											:active="active_voice===index"
											@click="active_voice=index"
											class="icon-voice-msg"
											:src="'http://qms.xiao360.com/api/open/wxvoice?media_id='+item.media_id"></playVoice>    				
									</div>
									<div class="audio-content">
										<div class="audio-title">
											[语音]
											<p class="text-over-elips">{{item.name}}</p>
										</div>
									</div>
								</div>
								<div class="appmsgSendedItem" v-if="item.type=='video'">
									<a class="title-wrap">
										<span class="icon over"></span>
										<span class="title">[视频]</span>
										<p>{{item.name}}</p>
									</a>
									<p class="desc"></p>
								</div>
								<div class="pull-right">
									<a class="text-info" @click="del_replys(item)">删除</a>
								</div>
								<div style="clear:both"></div>
							</div>							
						</li>
					</ul>
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
	    	</Card>
	    	
	    	<div class="footer-btn mt-3" style="padding-left: 0;">
		        <Button type="primary" @click="save">提交</Button>    
		        <Button type="ghost" @click="back">返回</Button>
			</div>  
	    </div>
	    
	    <!--添加关键字-->
	    <Modal v-model="modal_keyword" title="添加关键字" :mask-closable="false" width="680" @on-cancel="close_keyword">
	    	<Form :label-width="150" label-position="left">
	    		<Form-item label="触发关键字">
	    			<RadioGroup v-model="key_item.type">
	    				<Radio :label="item.value" v-for="(item,index) in key_item_types" :key="index">{{item.text}}</Radio>
	    			</RadioGroup>
	    			<Input style="width:380px" v-model="key_item.content" placeholder="请输入关键字..."></Input>
	    		</Form-item>
	    		<Form-item>	    			
	    			<span class="text-desc" v-if="key_item.type==3">
	    				用户进行交谈时，对话内容符合述关键字中定义的模式才会执行这条规则。<br>
						注意：如果你不明白正则表达式的工作方式，请不要使用正则匹配<br>
						注意：正则匹配使用MySQL的匹配引擎，请使用MySQL的正则语法<br>
						示例：<br>
						^微信匹配以“微信”开头的语句<br>
						微信$匹配以“微信”结尾的语句<br>
						^微信$匹配等同“微信”的语句<br>
						微信匹配包含“微信”的语句<br>
						[0-9.-]匹配所有的数字，句号和减号<br>
						^[a-zA-Z_]$所有的字母和下划线<br>
						^[[:alpha:]]{3}$所有的3个字母的单词<br>
						^a{4}$aaaa<br>
						^a{2,4}$aa，aaa或aaaa<br>
						^a{2,}$匹配多于两个a的字符串
	    			</span>
	    			<span class="text-desc" v-else>多个关键字请使用逗号隔开，如天气，今日天气</span>
	    		</Form-item>
	    	</Form>	    	
	    	<div slot="footer">
	    		<Button type="ghost" @click="close_keyword">取消</Button>
	    		<Button :disabled="key_item.content==''" type="primary" @click="add_keywords">确定</Button>
	    	</div>
	    </Modal>
	    
	    <!--选择回复内容-->
		<Modal :mask-closable="false" v-model="modal.show" :title="modal.title" width="900">
			<chooseFile ref="cf" v-if="modal.show" :type="file_type" @getFile="getFile"></chooseFile>
			<div slot="footer">
				<span class="pull-left"></span>
				<Button type="ghost" @click="modal.show=false">取消</Button>
				<Button type="primary" @click="confirm_file">确定</Button>
			</div>
		</Modal>
    	
    	<!--选择关键字-->
    	<Modal :mask-closable="false" v-model="modal_choose_word" width="680" title="选择关键字">
    		<Row :gutter="10">
    			<Col span="6" v-for="(item,index) in data" :key="index">
    				<a class="keyword-item" @click="rule_id=item.rule_id" :class="rule_id==item.rule_id?'active':''">
    					<span class="mr-2">
    						<template v-for="(words,wordsIndex) in item.keywords">
    							{{words.content}}  
    						</template>    						
    					</span>
    				</a>
    			</Col>
    		</Row>
    		<div slot="footer">
    			<Button type="ghost" @click="modal_choose_word=false;rule_id=0">取消</Button>
    			<Button type="primary" @click="set_reply_message" :disabled="rule_id===0">确认</Button>
    		</div>
    	</Modal>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import chooseFile from './choose-file.vue'
	import directive from '@/libs/directive.mixin'
	import playVoice from 'c%/playVoice.vue'
	export default{
		mixins: [grid,directive],
		components: {
			chooseFile,
			playVoice
		},
		props: {
			wxmpId: {
				type: [Number,String],
				default: () => {
					return 0 
				}
			}
		},
		data () {
			return {
				reply_type: 1,
				active_voice: -1,
				rule_id: 0,
				rule_ids: [],
				mode: 'list',
				rest_api: 'wxmp_rules?wxmp_id='+this.wxmpId,
				pk: 'rule_id',
				data: [],
				modal_keyword: false,
				show_advance: false,
				modal_choose_word: false,
				modal:{
					show: false,
					title: '选择文件'
				},
				reply: {
					default: {},
					welcome: {}
				},
				key_item_types: [
					{value:1,text:'精准触发'},
					{value:2,text:'包含关键字触发'},
					{value:3,text:'正则匹配关键字触发'},
				],
				keyword: {
					keywords: [],
					replys: [],
					name: '',
					is_top: 0,
					status: 1,
					displayorder: 0,
					wxmp_id: this.wxmpId
				},
				key_item: {
					type:1,
					content: '',
				},
				type_list: [
					{type:'text',icon:'edit',text:'文字'},
					{type:'news',icon:'image',text:'图文'},
					{type:'image',icon:'image',text:'图片'},
					{type:'voice',icon:'mic-a',text:'语音'},
					{type:'video',icon:'ios-videocam',text:'视频'},
				],
				column_keys: {
					ck_box: {
						type: 'selection',
                        width: 60,
                        align: 'center'
					},
					content: {
						title:'内容',
                        show:true
					},
					status: {
						title: '是否开启',
						show: true
					},
					operate: {
						title: '操作',
						show: true
					}
				},
				column_render:{
					content(h,params) {			
						let [keywords,keys_html,content,count,result] = [params.row.keywords,[],'',0,[]]
						let map_type = {'images_count':'图片','news_count':'图文','texts_count':'文字','videos_count':'视频','voices_count':'语音'}
						let map_type2 = {1:'精准触发',2:'包含触发',3:'正则匹配触发'}
						if(keywords.length>0){
							keywords.forEach(k=>{								
							let item = h('Tooltip',{
										props:{
											content: '此关键字为'+map_type2[k.type],
											placement: 'bottom',										
										},										
									},	
									[h('a',{
										attrs:{
											'class':'keys-item mr-3',
										},
										domProps:{
											innerHTML: k.content
										}
									})]
								)
								keys_html.push(item)
							})
						}
						
						['images_count','news_count','texts_count','videos_count','voices_count'].forEach(k=>{
							count += params.row[k]
							if(params.row[k]){
								content += params.row[k]+'条'+ map_type[k] +'  '
							}
						})		
						if(params.row.displayorder>0){
							result.push(h('Tag','优先级 '+params.row.displayorder))
						}
						if(params.row.name.length>0){							
							result.push(h('p',{style:{'line-height':'30px'}}, `规则名:　${params.row.name}`))
						}
						result.push(h('div',keys_html),h('p', `回复内容:　共${count}条( ${content} )`))
						return h('div', {
							attrs: {
								class: 'name-cls'
							}
						}, result)
					},
					status (h,params) {
						return h('div',[
							h('i-switch',{
								props:{
									value: params.row.status,
									'true-value': 1,
									'false-value': 0,
								},
								on: {
									input: (val)=>{
										this.operate_keyword(val,params.row)
									}									
								}
							})
						])
					},
					operate(h,params){
						return h('div',[
							h('a',{
								attrs:{class:'mr-3 text-info'},
								on: {
									click: ()=>{
										this.edit_keyword(params.row)
									}
								}
							},'编辑'),
							h('a',{
								attrs:{class:'mr-3 text-info'},
								on: {
									click: ()=>{
										this.del_keyword(params.row)
									}
								}
							},'删除')
						])
					}
				}
			}
		},
		watch: {
			wxmpId: function (val) {
				this.rest_api = 'wxmp_rules?wxmp_id='+val
				this.init_data()
			}
		},
		computed: {
			disabled () {
				return this.rule_ids.length === 0
			}
		},
		mounted () {
			this.init_data()
			this.params.search_field = 'keyword'
		},
		methods: {
			set_reply_message () {
				let map_uri = {2:'wxmps/welcome_message',3:'wxmps/default_message'}
				let params = {
					rule_id: this.rule_id,
					wxmp_id: this.wxmpId
				}
				this.$http.post(map_uri[this.reply_type],params)
				.then(response=>{
					this.$Message.success('设置成功！')
					this.rule_id = 0
					this.modal_choose_word = false
					this.init_data()
				},response=>{
					this.$Notice.error({
						title: '错误',
						desc: response.body.message||'设置失败'
					})
				})
			},
			deal_data (data) {
				this.reply.default = data.default
				this.reply.welcome = data.welcome
				return data.list
			},
			hook_get_param (params) {
				if(this.params.search_value != ''){
					params.keyword = this.params.search_value
				}
			},
			selectionChange (items) {
				this.rule_ids = []
				if(items.length>0){					
					items.forEach(i=>{ this.rule_ids.push(i.rule_id) })
				}				
			},
			del_multi () {
				let params = {ids: this.rule_ids}
				this.confirm('确定删除所选关键字吗？删除后将无法恢复！')
				.then(response=>{
					this.$http.post('wxmp_rules/batch_delete',params)
					.then(response=>{
						this.init_data()
						this.rule_ids = []
					},response=>{
						this.$Notice.error({
							title: '错误',
							desc: response.body.message||'删除失败，请重试'
						})
					})
				})				
			},
			reset_modal () {
				let keyword = this.keyword
				keyword.keywords = []
				keyword.replys = []
				keyword.name = ''
				keyword.is_top = 0
				keyword.status = 1
				keyword.displayorder = 1
			},
			back () {
				this.mode = 'list'
				this.reset_modal()
				this.init_data()
			},
			edit_keyword (item) {
				this.mode = 'edit'
				this.$http.get('wxmp_rules/'+item.rule_id)
				.then(response=>{
					this.keyword = response.body.data
					if(this.keyword.name.length>0){
						this.show_advance = true
					}
				},response=>{
					this.$Notice.error({
						title: '错误',
						desc: response.body.message||'编辑错误'
					})
				})
			},
			del_keyword (item) {
				this.confirm('删除后无法恢复，确认删除吗?')
				.then(response=>{
					this.delete(item)
				})
			},		
			save () {
				let [method,uri,msg] = ['post','wxmp_rules','添加成功！']
				if(this.mode=='edit'){
					[method,uri,msg] = ['put','wxmp_rules/'+this.keyword.rule_id,'修改成功！']
				}
				if(this.keyword.keywords.length===0){
					this.$Notice.warning({
						title: '提示',
						desc: '请输入关键字'
					})
					return false
				}
				
				if(this.keyword.replys.length===0){
					this.$Notice.warning({
						title: '提示',
						desc: '请选择回复内容'
					})
					return false
				}
				this.$http[method](uri,this.keyword)
				.then(response=>{
					this.$Message.success(msg)
					this.back()
				},response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'添加失败'
					})
				})
			},
			choose_file (item) {
				let map_title = {'text':'输入文字','news':'选择图文','image':'选择图片','voice':'选择语音','video':'选择视频'} 
				this.file_type = item.type
				this.modal.title = map_title[this.file_type]
				this.modal.show = true
			},
			getFile (item) {
				let obj = {}
				obj.type = this.file_type
				
				if(this.file_type=='text'){
					Object.assign(obj,{content:item})
				}else{
					Object.assign(obj,item)
				}
				this.keyword.replys.push(obj)
			},
			confirm_file () {
				this.$refs['cf'].getFile()
				this.modal.show = false
			},
			format_wx_img (src) {
				return this.$store.state.user.info.base_url+'/api/open/wximage?url='+src
			},
			key_type (val) {
				return this.key_item_types.find(k=>k.value==val).text
			},
			del_keywords (item) {
				let index = this.keyword.keywords.indexOf(item)
				if(index>-1){
					this.keyword.keywords.splice(index,1)
				}
			},
			del_replys (item) {
				let index = this.keyword.replys.indexOf(item)
				if(index>-1){
					this.keyword.replys.splice(index,1)
				}
			},
			add_keywords () {
				let item = util.copy(this.key_item)
				this.keyword.keywords.push(item)
				this.close_keyword()
			},
			close_keyword () {
				this.key_item.content = ''
				this.key_item.type = 1
				this.modal_keyword = false
			},
			change_status (val) {
				this.reply_type = val
			},
			operate_keyword (status,row) {
				let msg = status==1?'启用成功！':'禁用成功！'
				this.$http.post('wxmp_rules/'+row.rule_id+'/dochange_status',{status:status})
				.then(response=>{
					this.$Message.success(msg)
					this.init_data()
				},response=>{
					this.$Notice.error({
						title: '错误',
						desc: response.body.message||'操作失败'
					})
				})
			},
			add () {
				this.show_advance = false
				this.mode = 'add'
			}
		}
	}
</script>