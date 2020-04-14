<template>
	<Modal v-drag-modal :mask-closable="false" width="750" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<template v-if="modal$.show">
        	<Form :label-width="100" ref="form" :model="info" :rules="rules" class="sms-tpl-info">
        		<Form-item prop="business_type" label="业务类型">
        			<Select v-model="info.business_type" placeholder="请选择业务类型" clearable @on-change="selectBusinessType">
						<Option value="">自由模板</Option>
        				<Option :value="item.business_type" v-for="(item,index) in sms_tpls" :key="index">{{item.name}}</Option>
        			</Select>
        		</Form-item>
        		<Form-item prop="name" label="模板名称">
        			<Input v-model="info.name" placeholder="模板名称，例：订单支付成功通知 (自定义)"></Input>
        		</Form-item>
        		<Form-item prop="service_name" label="短信服务商">
        			<p class="info-tip">请先至『短信接口设置』页面设置好短信服务商的接口信息 (保存后不可修改)</p>
        			<RadioGroup v-model="info.service_name" v-if="sms_clounds.length>0">
        				<Radio 
        					:label="item.key" 
        					v-for="(item,index) in sms_clounds" 
        					:disabled="modal$.action=='edit'"
							:key="index"
        					>{{item.value}}
        				</Radio>
        			</RadioGroup>
        		</Form-item>
        		<Form-item prop="apply_tpl" label="运营商短信模板">
        			<Input type="textarea" :rows="3" v-model="info.apply_tpl"></Input>
        		</Form-item>
        		<Form-item prop="tpl_define" label="变量替换" class="define">
        			<p class="info-tip">系统变量替换模板变量，例：模板变量=ddbh 系统变量=订单编号</p>
        			<div class="row" style="margin-left: 0">
	        			<table class="col-sm-8">
	        				<tbody>
	        					<tr>
	        						<td>模板变量</td>
	        						<td>系统变量</td>
	        						<td>操作</td>
	        					</tr>
	        					<tr v-for="(item,index) in info.tpl_define" :key="index">
	        						<td>{{item.r}}</td>
	        						<td>{{item.l}}</td>
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
	        						<td>
	        							<Input size="small" v-model="define.r" style="width: 120px;"></Input>
	        						</td>
	        						<td>
	        							<Input size="small" v-model="define.l" style="width: 120px;"></Input>
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
	        					<tr v-else>
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
	        			<div class="define-vars col-sm-4">
		        			<Card dis-hover v-if="sms_tpl_vars.length>0">
		        				<span slot="title">选择系统变量：</span>
		        				<Tag v-for="(item,index) in sms_tpl_vars" @click.native="selectVar(item)" :key="index">{{item}}</Tag>
		        			</Card>
		        		</div>
	        		</div>
        		</Form-item>
				<Form-item prop="tpl_id" label="服务商模板ID">
        			<Input 
        				v-model="info.tpl_id" 
        				placeholder="例：SMS_12345 (短信服务商提供的模板ID)"
        				style="width: 300px;">
    				</Input>
					<p>
					有的短信服务商可以直接发送短信，不需要模板ID,可以留空
					</p>
        		</Form-item>
        	</Form>
        </template>
	    
    	<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" @click="ok" :loading="saving">确定</Button>
        </div>
    </Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import pinyin from '@/libs/pinyin'

	const INFO_NAME = '短信模板'
	const INFO_PK_ID = 'std_id'
	const INFO_URL   = 'sms_tpl_defines'

	const emptyObject = {
		name: '',
		service_name: '',
		tpl_id: '',
		tpl_define: [],
		business_type: '',
		apply_tpl: ''
	}
	
	export default{
		name:'smsInfoModal',
		mixins:[modal,common],
		data () {
			return {
				canChange:false,
				info: util.copy(emptyObject),
				copy_info: util.copy(emptyObject),
				define: {
					r: '',
					l: '',
				},
				action: 'add',
				rules: {
					name: [
						{ required: true, type:'string', message:'请输入模板名称', trigger: 'blur' }
					],
					service_name: [
						{ required: true, type:'string', message:'请选择短信服务商',trigger: 'change'}
					]
				}
			}
		},
		methods: {
			selectBusinessType(value) {
				if(!this.canChange && this.modal$.action == 'edit'){
					this.canChange = true
					return false
				}
				let tpl = this.sms_tpls.find(item => item.business_type==value)
				if(tpl) {
					if(tpl.apply_tpl) {
						this.info.apply_tpl = this.buildApplyTpl(tpl.apply_tpl)
						this.info.name = tpl.name
					}else{
						this.info.apply_tpl = ''
					}
				}
			},
			buildApplyTpl(tpl){
				let reg = /\[[^\]]+\]/g
				let matches = tpl.match(reg)
				let result  = tpl
				if(!matches){
					return
				}
				this.info.tpl_define = []
				function build_define(input){
					let result = {}
					result.r = pinyin.getFirstFull(input.replace(/[\[\]]/g,''))
					result.l = input
					return result
				}
				if(matches.length > 0){
					matches.forEach(m=>{
						let df = build_define(m)
						this.info.tpl_define.push(df)
						result = result.replace(m,'{'+df.r+'}')
					})
				}
				return result
			},
			selectVar(item) {
				let v = pinyin.getFirstFull(item.replace(/[\[\]]/g,''))
				let has_v = false
				this.info.tpl_define.forEach(item=>{
					if(item.r == v){
						has_v = true
					}
				})
				if(!has_v){
					this.info.tpl_define.push({
						r:v,
						l:item
					})
				}
			},
			saveDefine() {
				if(this.define.r === '' || this.define.l === '') return false; 
				this.info.tpl_define.push({
					r: this.define.r,
					l: this.define.l
				})
				this.define.r = ''
				this.define.l = ''
				this.action = ''
			},
			addDefine() {
				this.action = 'add'
			},
			delDefine(index) {
				this.info.tpl_define.splice(index,1)
			},
			ok() {
				this.$form('form').check().then(form=>{
	                if(this.info.tpl_define.length == 0){
	                    this.$Message.error('请至少添加一条数据值')
	                    return false
	                }
	                let method = this.modal$.action == 'add'?'post':'put'
	                let action = this.modal$.action == 'add'?'添加':'编辑'
	                let $rest  = this.$rest(this.info_url$)
	                if(this.modal$.action != 'add'){
	                    $rest.add_url_param(this.info[this.info_pk_id$])
	                }else{
                        if(this.info && this.info_pk_id$ && this.info[this.info_pk_id$]){
                            delete this.info[this.info_pk_id$]
                        }
                    }
	                $rest[method](this.info)
	                .success(response=>{
	                    let data = response.data
	                    
	                    if(this.modal$.action == 'add' && _.isString(data) && /^\d+$/.test(data)){
	                        this.info[this.info_pk_id$] = util.int(data)
	                    }
	                    this.$Message.success(util.sprintf('%s%s成功!',this.info_name$,action))
	                    this.$emit('save',{action:this.modal$.action,data:this.info})
	                    if(_.isDefined(this.$store.state.gvars[this.info_url$])){
	                        this.$store.dispatch('updateGlobalVar',this.info_url$)
	                    }
	                    this.close()
	                })
	                .error(response=>{
	                    this.error(response.body.message)
	                })
	            })
			}
		},
		watch: {
			'modal$.show': function(val) {
            	if(val&&this.modal$.action == 'add'){
					this.info = util.copy(emptyObject)
		        	if(this.sms_clounds.length > 0) {
		        		this.info.service_name = this.sms_clounds[0].key
		        	}
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
	        },
	        sms_clounds() {
	        	let sms_clound = this.$store.state.gvars.sms_clound,
	        		data = []
	        	for(let key in sms_clound) {
	        		if(sms_clound[key].enable == 1) {
	        			data.push({
	        				key: key,
	        				value: sms_clound[key].name
	        			})
	        		}
	        	}
	        	return data
	        },
	        tpl_id_text() {
	        	let text = '请先至短信接口设置页面配置相关参数并启用短信服务商'
	        	if(this.service_name!=='') {
	        		text = `请至${this.info.service_name}官网申请模板`
	        	}
	        	if(this.info.business_type) {
	        		let tpl = this.sms_tpls.find(item => item.business_type==this.info.business_type)
	        		if(tpl&&tpl.apply_tpl) {
	        			text += `，<br/>根据您选的业务类型，参考以下模板并按需修改`
	        		}else{
	        			text +='，<br/>您选的业务类型没有对应的参考模板'
	        		}
	        	}else{
	        		text += '，<br/>根据您选的业务类型，参考对应的模板并按需修改'
	        	}
	        	return text
	        }
		}
	}
</script>
<style lang="less">
	.sms-tpl-info {
		.ivu-form-item.define {
			min-height: 200px;
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
		p.info-tip {
			color: #c3cbd6;
		}
	}
</style>
