<template>
	<Modal v-drag-modal :mask-closable="false" width="750" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<template v-if="modal$.show">
        	<Form :label-width="100" ref="form" :model="info" class="wechat-tpl-info pr-4 mr-4">
        		<Form-item prop="business_type" label="业务类型">
        			<Select v-model="info.business_type" placeholder="请选择业务类型">
        				<Option :value="''">不限</Option>
        				<Option :value="item.business_type" v-for="item in sms_tpls">{{item.name}}</Option>
        			</Select>
        		</Form-item>
        		<Form-item label="模板名称" class="define">
        			<Input v-model="info.name" placeholder="模板名称，例：订单完成模板 (自定义)"></Input>
        		</Form-item>
        		<Form-item label="模板消息ID" class="define">
        			<Input v-model="info.tpl_id" placeholder="微信模板ID,例:47KVWOqduxGHwJ8HnxCRSr4KoUmaMKUnvkvjxoVMU7M"></Input>
        		</Form-item>
        		<Form-item label="头部标题" class="define">
        			<Input v-model="info.tpl_define.first[0]" :placeholder="first_place" style="width: 85%"></Input>
        			<ColorPicker v-model="info.tpl_define.first[1]" recommend/>
        		</Form-item>
        		<Form-item label="自定义键" class="define">
        			<div class="row" style="margin-left: 0">
	        			<table class="col-sm-9">
	        				<tbody>
	        					<tr>
	        						<td>变量名</td>
	        						<td>标签</td>
	        						<td>键值</td>
	        						<td>操作</td>
	        					</tr>
	        					<tr v-for="(item,index) in info.tpl_define.data">
	        						<td>{{item.field}}</td>
	        						<td>{{item.label}}</td>
	        						<td><div :style="{color: item.color}">{{item.value}}</div></td>
	        						<td>
	    								<Button 
	        								type="text" 
	        								size="small" 
	        								icon="minus-circled" 
	        								title="删除" 
	        								@click="delDefine(index)">
	    								</Button>
	        						</td>
	        					</tr>
	        					<tr v-if="action == 'add'">
	        						<td>{{define.field}}</td>
	        						<td>
	        							<Input size="small" v-model="define.label" style="width: 90px;" placeholder="标签"></Input>
	        						</td>
	        						<td>
	        							<Input size="small" v-model="define.value" style="width: 90px;" placeholder="键值"></Input>
	        							<ColorPicker v-model="define.color" size="small" recommend/>
	        						</td>
	        						<td>
	        							<Button 
	        								type="text" 
	        								size="small" 
	        								icon="checkmark" 
	        								title="保存" 
	        								@click="saveDefine">
	    								</Button>
	        						</td>
	        					</tr>
	        					<tr v-if="action === ''&&info.tpl_define.data.length<4">
	        						<td class="text-center" colspan="3">
	        							<Button 
	        								type="text" 
	        								size="small" 
	        								icon="plus" 
	        								@click="addDefine">添加
	        							</Button>
	        						</td>
	        					</tr>
	        				</tbody>
	        			</table>
	        			<div class="define-vars col-sm-3">
		        			<Card dis-hover v-if="sms_tpl_vars.length>0">
		        				<span slot="title">选择模板变量：</span>
		        				<Tag v-for="item in sms_tpl_vars" @click.native="selectVar(item)">{{item}}</Tag>
		        			</Card>
		        		</div>
	        		</div>
        		</Form-item>
        		<Form-item label="尾部描述" class="define">
        			<Input v-model="info.tpl_define.remark[0]" :placeholder="remark_place" style="width:85%"></Input>
        			<ColorPicker v-model="info.tpl_define.remark[1]" recommend/>
        		</Form-item>
        	</Form>
        </template>
	    
    	<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" @click="ok">确定</Button>
        </div>
    </Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'

	const INFO_NAME = '短信模板'
	const INFO_PK_ID = 'wtd_id'
	const INFO_URL   = 'wechat_tpl_defines'

	const emptyObject = {
		business_type: '',
		name: '',
		tpl_id: '',
		tpl_define: {
			first: [
				'',
				'#000000'
			],
			data: [],
			remark: [
				'',
				'#000000'
			]
		}
	}
	
	export default{
		name:'wechatInfoModal',
		mixins:[modal,common],
		data () {
			return {
				info: util.copy(emptyObject),
				canChange: false,
				define: {
					field: '{{keyword1.DATA}}',
					label: '',
					value: '',
					color: '#000000'
				},
				action: 'add',
				rules: {
					name: [
						{ required: true, type:'string', message:'请输入模板名称', trigger: 'blur' }
					],
					template_id: [
						{ required: true, type:'string', message:'请输入模板ID', trigger: 'blur' }
					]
				}
			}
		},
		methods: {
			selectVar(item) {
				this.define.value = item
			},
			saveDefine() {
				if(this.define.key === '' || this.define.value === '') return false; 
				this.info.tpl_define.data.push(this.define)
				this.define = {
					label: '',
					value: '',
					color: '#000000'
				}
				this.action = ''
			},
			addDefine() {
				let index = this.info.tpl_define.data.length+1
				this.define.field = '{{keyword'+index+'.DATA}}'
				this.action = 'add'
			},
			delDefine(index) {
				this.info.tpl_define.data.splice(index,1)
				let cursor = this.info.tpl_define.data.length+1
				this.define.field = '{{keyword'+cursor+'.DATA}}'
				for(let i=0,len=this.info.tpl_define.data.length;i<len;i++) {
					let item = this.info.tpl_define.data[i],
						cursor = i + 1
					item.field = '{{keyword'+cursor+'.DATA}}'
				}
			},
			ok() {
				if(this.info.name === '') {
					this.$Message.error('模板名称不能为空')
					return false
				}
				if(this.info.template_id === '') {
					this.$Message.error('模板ID不能为空')
					return false
				}
				if(this.info.tpl_define.first[0] === '') {
					this.$Message.error('请填充模板{{first.DATA}}的值')
					return false
				}
				if(this.info.tpl_define.data.length == 0) {
					this.$Message.error('请添加一条键')
					return false
				}
				if(this.info.tpl_define.remark[0] === '') {
					this.$Message.error('请填充模板{{remark.DATA}}的值')
					return false
				}
				this.save()
			}
		},
		watch: {
			'modal$.show': function(val) {
            	if(val&&this.modal$.action == 'add'){
					this.info = util.copy(emptyObject)
				}          
	        }
        },
		computed: {
			info_url$(){
            	return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        },
	        remark_place(){
	        	return '{{remark.DATA}}'
	        },
	        first_place(){
	        	return '{{first.DATA}}'
	        },
	        sms_tpl_vars(){
	        	let data = []
	        	let tpl = this.sms_tpls.find(item => item.business_type==this.info.business_type)
	        	if(tpl) {
	        		data = tpl.vars
	        	}
	        	return data
	        },
	        sms_tpls() {
	        	return this.$store.state.gvars.sms_tpls
	        }
		}
	}
</script>
<style lang="less">
	.wechat-tpl-info {
		.ivu-form-item.define {
			>label.ivu-form-item-label:before {
			    content: "*";
			    display: inline-block;
			    margin-right: 4px;
			    line-height: 1;
			    font-family: SimSun;
			    font-size: 12px;
			    color: #f30;
			}
			.define-vars {
				.ivu-card-head {
					padding: 9px 8px;
					font-size: 12px;
				}
				.ivu-card-body {
					padding: 8px 12px ;
				}
			}
		}
	}
</style>
