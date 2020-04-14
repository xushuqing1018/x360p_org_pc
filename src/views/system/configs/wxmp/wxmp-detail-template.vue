<template>
	<div class="c-grid">
		<Button 
			class="mb-3" 
			type="primary" 
			icon="android-download" 
			@click="syncTemplate" 
			:loading="saving">
			一键自动设置微信模板ID
		</Button>
		<table class="x-modal-table modal-table">
			<thead>
				<th><div class="ivu-table-cell notwrap">业务名称</div></th>
				
				<th><div class="ivu-table-cell notwrap">公众号模板ID获取参考</div></th>
				<th><div class="ivu-table-cell notwrap">配置情况</div></th>				
			</thead>
			<tr v-for="item in templates">
				<td>
					<div class="ivu-table-cell ">
					<strong>{{item.name}}</strong>
					<p class="text-gray">{{item.desc}}</p>
					</div>
				</td>
				
				<td>
					行业:{{item.tpl_industry}}<br>
					标题:{{item.tpl_title}}<br>
					编号:{{item.short_id}}
				</td>
				<td>
					<div class="ivu-table-cell">
						<template  v-if="item.template_id != ''">
							<span class="text-success">
							<Icon							
								type="checkmark-circled">					
							</Icon>	
							已设置
							</span>
							<p>模板ID:{{item.template_id}}</p>
							<p>
								<a href="javascript:;" @click="editWxmpTemplate(item)">修改</a> | 
								<a href="javascript:;" @click="deleteWxmpTemplate(item)">删除</a>
							</p>
						</template>
						<template v-else>
							<span class="text-danger">
							<Icon							
								type="close-circled">					
							</Icon>	
							未设置
							</span>
							<p><a href="javascript:;" @click="editWxmpTemplate(item)">手动设置</a></p>
						</template>
					</div>
				</td>				
			</tr>
			<tr v-if="loading">
				<td colspan="4">
					<p class="text-center">正在加载模板配置...</p>
				</td>
			</tr>
		</table>

		<Modal v-drag-modal v-model="modal$.show" title="修改行业警告" width="680" :mask-closable="false">
			<Alert type="warning" show-icon>微信服务号/公众号模板行业一个月只能设置一次，请谨慎操作！</Alert>			
			<h5>
				继续操作将
				<span class="text-danger">修改</span> 
				微信公众号的
				<span class="text-info">行业</span>				
			</h5>
			<div class="pl-3 mt-2">
				<h5 class="mb-2">原始行业：</h5>
				<h5 class="mb-2" v-for="(item,index) in customer_industry">{{index+1}}、{{item}}</h5>
				
				<h5 class="mb-2">设置行业：</h5>
				<h5 class="mb-2" v-for="(item,index) in default_industry">{{index+1}}、{{item}}</h5>
			</div>
			<h5 v-if="del_templates.length>0">
				并且会
				<span class="text-danger">删除</span>
				公众号中以下
				<span class="text-info">模板</span>：
			</h5>
			<div class="pl-3 mt-2">
				<h5 class="mb-2" v-for="(item,index) in del_templates">{{index+1}}、{{item.title}}</h5>				
			</div>
			
			<div slot="footer">
				<Button type="ghost" @click="close" :loading="saving">取消</Button>
				<Button type="primary" @click="ok" :loading="saving">确定修改</Button>
			</div>
		</Modal>
		
	</div>
</template>

<script>
	
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	
	
	export default{
		mixins: [common,modal],
		
		props: {
			mpinfo: {
				type: Object,
				default: () => {
					return null
				}
			}
		},
		data () {
			return {
				loading:false,
				templates:[],
				del_templates: [],
				customer_industry: [],
				default_industry: []
			}
		},
		methods: {
			init_data(){
				this.loading=true
				this.$rest('wxmps')
				.add_url_param(this.mpinfo.wxmp_id,'templates')
				.get()
				.success(response=>{
					this.loading=false
					this.templates = response.list
				})
				.error(response=>{
					this.loading = false
				})
			},
			editWxmpTemplate(item){
				let info = {
					scene:item.scene,
					name:item.name,
					desc:item.desc,
					tpl_title:item.tpl_title,
					tpl_industry:item.tpl_industry,
					short_id:item.short_id,
					template_id:item.template_id
				}
				info.wxmp_id = this.mpinfo.wxmp_id
				info.appid = this.mpinfo.authorizer_appid
				this.$Modal.open('system/configs/wxmp/wxmp-detail-template-info-modal.vue',{
					on:{
						'on-success':()=>{
							this.init_data()
						}
					}
				}).then(modal=>{
					modal
					.set('info',info)
					.show('配置微信模板消息ID:'+info.name)
				})
			},
			deleteWxmpTemplate(item){
				this.confirm('确认删除模板消息【'+item.name+'】的微信模板ID吗，删除后会导致相关的微信消息无法送达!')
				.then(()=>{
					this.$rest('wxmp_templates')
					.delete(item.wt_id)
					.success(response=>{
						this.$Message.success('已成功删除!')
						this.init_data();
					})
				})
			},
			syncTemplate (confirm) {				
				let uri = confirm?'wxmp_templates/sync?force=1':'wxmp_templates/sync'				
				this.$rest(uri)
				.post({appid:this.mpinfo.authorizer_appid})
				.success(data=>{
					if(!_.isEmpty(data.data.info)){
						this.getDeltemplate(data.data.info)
						this.show()	
					}else{
						this.$Message.success('设置成功')
						this.init_data()
						this.close()
					}					
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'设置失败'
					})
				})
			},		
			getDeltemplate (info) {
				this.customer_industry = info.customer_industry
				this.customer_templates = info.customer_templates.filter(t=>t.delete)
				this.default_industry = info.default_industry
			},
			ok () {
				this.syncTemplate(true)
			}
		},
		mounted () {
			this.init_data()
		},
		computed: {
			wechat_template () {
				return this.$store.state.gvars.wechat_template
			},
			template_data () {
				let data = this.data,
					result = util.copy(this.wechat_template)
				
				if(data.length>0){					
					data.forEach(l=>{
						Vue.set(result[l.scene],'is_set',true)						
					})
				}
				return result
			}
		}
	}
</script>
