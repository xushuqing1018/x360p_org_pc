<template>
	<div class="padder-sm">
		<div v-if="mode=='list'">
			<div class="box box-query mb-3">
				<Row :gutter="16">
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
	        	<div class="content">
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
	    	
	    	<Card dis-hover class="mt-3">
	    		<span slot="title">添加处理接口</span>
	    		<Form label-position="left" :label-width="120">
	    			<Form-item label="远程地址">
	    				<Input style="width:380px" v-model="keyword.interface_url" placeholder="请输入远程地址..."></Input>
	    				<p class="text-desc">
							使用远程地址接口，你可以兼容其他的微信公众平台管理工具。<br>
							你应该填写其他平台提供给你保存至公众平台的URL和Token<br>
							添加此模块的规则后，只针对于单个规则定义有效，如果需要全部路由给接口处理，则修改该模块的优先级顺序。<br>
							具体请查看“自定义接口回复”文档<br>
						</p>
	    			</Form-item>
	    			<Form-item label="Token">
	    				<Input style="width:380px" v-model="keyword.token" placeholder="请输入Token..."></Input>
	    				<p class="text-desc">与目标平台接入设置值一致，必须为英文或者数字，长度为3到32个字符.</p>
	    			</Form-item>
	    			<Form-item label="默认回复文字">
	    				<Input style="width:380px" v-model="keyword.reply_content" placeholder="请输入Token..."></Input>
	    				<p class="text-desc">当接口无回复时，则返回用户此处设置的文字信息，优先级高于“默认回复URL”.</p>
	    			</Form-item>
	    			<Form-item label="缓存时间">
	    				<InputNumber style="width:380px" v-model="keyword.cache_time" :step="1" :min="0" placeholder="请输入Token..."></InputNumber>
	    				<p class="text-desc">接口返回数据将缓存在系统中的时限，默认为0不缓存.</p>
	    			</Form-item>
	    		</Form>
	    	</Card>
	    	
	    	<div class="footer-btn" style="padding-left: 0;">
		        <Button type="primary" :disabled="disabled_submit" @click="save">提交</Button>    
		        <Button type="ghost" @click="back">返回</Button>
			</div>  
		</div>		
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import directive from '@/libs/directive.mixin'
	
	export default{
		mixins: [grid,directive],
		data () {
			return {
				mode: 'list',
				show_advance: false,
				rest_api: 'wxmp_rules',
				pk: 'rule_id',
				rule_ids: [],
				keyword: {
					keywords: [],
					name: '',
					interface_url: '',
					token: '',
					reply_content: '',
					cache_time: 0,
					is_top: 0,
					status: 1,
					displayorder: 0,
				},
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
		computed: {
			disabled () {
				return this.rule_ids.length === 0
			},
			disabled_submit () {
				let [keyword,result] = [this.keyword,true]
				if(keyword.keywords.length>0&&keyword.interface_url.length>0&&keyword.token.length>0){
					result = false
				}
				return result
			}
		},
		mounted () {
			this.init_data()
			this.params.search_field = 'keyword'
		},
		methods: {
			add () {
				this.mode = 'add'
			},
			save () {
				this.mode = 'list'
			},
			back () {
				this.mode = 'list'
			},
			edit_keyword (item) {
				this.mode = 'list'
			},
			del_keyword (item) {
				this.confirm('删除后无法恢复，确认删除吗?')
				.then(response=>{
					this.delete(item)
				})
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
		}
	}
</script>

<style>
</style>