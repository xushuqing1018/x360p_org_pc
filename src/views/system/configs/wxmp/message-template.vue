<template>
	<div class="c-grid">
		<Button 
			class="mb-3" 
			type="primary" 
			icon="android-download" 
			@click="syncTemplate()" 
			:loading="saving">
			一键设置微信模板
		</Button>
		<table class="x-modal-table modal-table">
			<thead>
				<th><div class="ivu-table-cell notwrap">模板名称</div></th>
				<th><div class="ivu-table-cell notwrap">是否配置</div></th>				
			</thead>
			<tr v-for="item in template_data">
				<td><div class="ivu-table-cell ">{{item.name}}</div></td>
				<td>
					<div class="ivu-table-cell" :class="item.is_set?'text-success':'text-danger'">						
						<Icon							
							:type="item.is_set?'checkmark-circled':'close-circled'">					
						</Icon>		
						{{item.is_set?'已配置':'未配置'}}
					</div>
				</td>				
			</tr>
		</table>
		<info-modal ref="info"></info-modal>
		
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
	import Vue from 'vue'
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import InfoModal from './template-info-modal.vue'
	
	export default{
		mixins: [grid,modal,common],
		components: {
			InfoModal
		},
		props: {
			appId: {
				type: [Number,String],
				default: () => {
					return 0 
				}
			}
		},
		data () {
			return {
				rest_api: 'wxmp_templates?appid='+this.appId,
				pk: 'wt_id',
				del_templates: [],
				customer_industry: [],
				default_industry: []
			}
		},
		watch: {
			appId: function (val) {
				this.rest_api = 'wxmp_templates?appid='+val
				this.init_data()
			}
		},
		methods: {
			syncTemplate (confirm) {				
				let uri = confirm?'wxmp_templates/sync?force=1':'wxmp_templates/sync'				
				this.$rest(uri)
				.post({appid:this.appId})
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
			},
			editInfo (row) {				
				this.$r('info')
				.set('info',row)
				.show('编辑模板','add')
			},
			switchStatus (row) {
				let map_status = {1:'禁用',0:'启用'},
					tip = util.sprintf('确定%s【%s】',map_status[row.status],row.title)
					
				this.confirm(tip).then(()=>{
					row.status = row.status===1?0:1
				})
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
