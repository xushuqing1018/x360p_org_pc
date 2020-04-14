<style lang="less">
	.x-ivu-input{
		.ivu-input{
			color: inherit !important;	
		}
	}
	.table-config{
		width:100%;
		border-collapse:collapse;
		thead{
			th{
				font-weight:bold;
				background:#f2f2f2;
				padding:10px;
			}
		}
		tbody{
			td{
				padding:10px;
				border-right:1px solid #f2f2f2;
				border-left:1px solid #f2f2f2;

				.empty{
					text-align:center;
					padding-top:60px;
				}
			}
			tr.note{
				td:nth-child(2){
					border-top: 1px solid #f2f2f2;
				}
				border-bottom:1px solid #ccc;
			}
		}
	}

</style>

<template>
	<div class="c-grid">
		<table class="table-config">
			<thead>
				<th class="text-center">业务名称</th>
				<th>微信配置</th> 
				<th>短信配置</th>

			</thead>
			<tbody>
				<template v-for="(item,key) in config">
					<tr>
						<td class="text-center">{{item.name}}</td>
						<td valign="top">
							<p class="empty" v-if="!item.weixin">无</p>
							<template v-else>
								<Form :label-width="100">
									<Form-item label="微信通知：">
										<i-switch 
											:true-value="1" 
											:false-value="0" 
											v-model="item.weixin_switch" 
											@click="switchStatus(item,'weixin_switch')" 
											readonly>
										</i-switch>
									</Form-item>
									<Form-item label="消息头：">
										<Input 
											v-model="item.weixin.data.first[0]" 
											class="x-ivu-input"
											placeholder="请输入..."
											:style="{color:item.weixin.data.first[1]}"
											style="width:300px">
										</Input>
										<ColorPicker v-model="item.weixin.data.first[1]" recommend/>
										{{item.weixin.data.first[1]}}
									</Form-item>
									<Form-item label="备注：">
										<Input 
											v-model="item.weixin.data.remark[0]" 
											class="x-ivu-input" 
											placeholder="请输入..."
											:style="{color:item.weixin.data.remark[1]}"
											style="width:300px">
										</Input>
										<ColorPicker v-model="item.weixin.data.remark[1]" recommend/>
										{{item.weixin.data.remark[1]}}
									</Form-item>
									<Form-item label="自定义链接：">
										<Input 
											v-model="item.weixin.url"
											class="x-ivu-input" 
											placeholder="请输入..."
											:style="{color:item.weixin.url}"
											style="width:300px">
										</Input>
									</Form-item>
								</Form>
							</template>
						</td>
						<td valign="top">
							
							<template v-if="item.sms">
								<Form :label-width="80">
									<Form-item label="短信通知：">
										<i-switch 
											:true-value="1" 
											:false-value="0" 
											v-model="item.sms_switch" 
											@click="switchStatus(item,'sms_switch')" 
											readonly>
										</i-switch>
									</Form-item>
									<Form-item label="消息模板：">
										<Select v-model="item.sms.std_id" clearable placeholder="请选择短信消息模板">
											<Option :value="tpl.std_id" v-for="tpl in filter_sms_tpls(key)">{{tpl.name}}</Option>
										</Select>			
									</Form-item>
								</Form>
							</template>
							<p class="empty" v-else>无</p>
						</td>
					</tr>
					<tr class="note">
						<td></td>
						<td colspan="2">
								<span class="font-weight-bold text-primary">可用模板变量</span>						
								<span class="text-danger ml-2" v-for="field in item.tpl_fields">
									{{field}}
								</span>					
						</td>
					</tr>
				</template>
			</tbody>
		</table>
		 
		<Button type="primary" class="mt-3" @click="handleSubmit">保存配置</Button>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import config from '@/libs/config.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [grid,common,config,globals],
		components: {
		},
		data () {
			return {
				tpls_data: [{
					std_id:1,
					name:'学情服务报告1'
				}],
				cfg_name: 'wechat_template',
				config: util.copy(this.$store.state.gvars.wechat_template)
			}
		},
		created() {
			this.get_sms_tpls()
		},
		methods: {
			filter_sms_tpls(key) {
				return this.tpls_data.filter(data => data.business_type == key)
			},
			switchStatus (item,type) {
				let map_operate = {1:'禁用',0:'启用'},
					map_type = {'weixin_switch':'微信通知','sms_switch':'短信通知'},
					tip = util.sprintf('确定%s【%s】%s',map_operate[item[type]],item.name,map_type[type])
				this.confirm(tip).then(()=>{
					item[type] = item[type]===1?0:1
				})
			},
			get_sms_tpls() {
				this.$rest('sms_tpl_defines')
				.get({
					pagesize:1000
				})
				.success(res => {
					this.tpls_data = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			}
		}
	}
</script>