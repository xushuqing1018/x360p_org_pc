<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="600" :mask-closable="false">
		<Form :label-width="80" :rules="rules" ref="form" :model="wx_config.config">
    		<Form-item label="是否启用">
	            <i-switch v-model="wx_config.is_enable" :true-value="1" :false-value="0" size="large">
	                <span slot="open" :value="true">启用</span>
	                <span slot="close" :value="false">禁用</span>
	            </i-switch>
	        </Form-item>
	        <Form-item label="配置名称" prop="name">
    			<Input v-model="wx_config.name" placeholder="输入一个名称便于区分"></Input>
    		</Form-item>
	        <Form-item label="绑定账户">
	        	<Select v-model="wx_config.aa_id" style="width:260px;">
	        		<Option :value="item.aa_id" v-for="(item,index) in account" :key="index" :disabled="item.cp_id>0" :label="item.name">	        			
	        			<span>{{item.name}}</span>
						<span style="float:right;color:#c3cbd6" v-if="item.cp_id">已绑定配置</span>
	        		</Option>
	        	</Select>
	        	<Button type="ghost" icon="plus" @click="addAccount"></Button>
	        </Form-item>
	        <Form-item label="AppID" prop="appid">
    			<Input v-model="wx_config.config.appid" placeholder="请输入AppID"></Input>
    		</Form-item>
    		<Form-item label="商户ID" prop="merchant_id">
    			<Input v-model="wx_config.config.merchant_id" placeholder="请输入支付商户号"></Input>
    		</Form-item>
    		<Form-item label="支付密钥" prop="key">
    			<Input v-model="wx_config.config.key" placeholder="请输入支付密钥"></Input>
    		</Form-item>
    		<Form-item prop="cert_path">
    			<span slot="label" class="pb-2 d-inline-block" v-help="'1、从微信支付后台下载证书  <br>2、解压后用文本编辑器打开apiclient_cert.pem文件  <br>3、全选复制文本内容后粘贴到下面的输入框'">支付证书</span>
    			<Input v-model="wx_config.config.cert_path" type="textarea" :autosize="{minRows: 4,maxRows: 4}" placeholder="1、从微信支付后台下载证书  2、解压后用文本编辑器打开apiclient_cert.pem文件  3、全选复制文本内容后粘贴到下面的输入框"></Input>        			
    		</Form-item>
    		<Form-item prop="key_path">
    			<span slot="label" class="pb-2 d-inline-block" v-help="'1、从微信支付后台下载证书  <br>2、解压后用文本编辑器打开apiclient_key.pem文件  <br>3、全选复制文本内容后粘贴到下面的输入框'">证书私钥</span>
    			<Input v-model="wx_config.config.key_path" type="textarea" :autosize="{minRows: 4,maxRows: 4}" placeholder="1、从微信支付后台下载证书  2、解压后用文本编辑器打开apiclient_key.pem文件  3、全选复制文本内容后粘贴到下面的输入框"></Input>
    		</Form-item>
        </Form>
		<account-info ref="account" @on-success="addAccountSucccess"></account-info>
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import AccountInfo from '@/views/business/iae/accounting-info.vue'
	
	const emptyObject = {
		name: '',
		type: 1,
		is_enable: 1,
		aa_id: 0,
		config: {		
			appid: '',
			merchant_id: '',
			key: '',
			cert_path: '',
			key_path: ''
		}	
	}
	
	export default{
		mixins: [ modal,common ],
		components: {
			AccountInfo
		},
		data () {
			return {
				wx_config: util.copy(emptyObject),
				rules: {
					name: [
						{ required: true, message: '请输入配置名称', trigger: 'blur' }
					],			
					appid: [
						{ required: true, message: '请输入AppId', trigger: 'blur' }
					],
					merchant_id: [
						{ required: true, message: '请输入商户ID', trigger: 'blur' }
					],
					key: [
						{ required: true, message: '请输入支付密钥', trigger: 'blur' }
					],
					cert_path: [
						{ required: true, message: '请输入支付证书', trigger: 'blur' }
					],
					key_path: [
						{ required: true, message: '请输入证书私钥', trigger: 'blur' }
					]				
				}
			}
		},
		watch: {
			'wx_config.name': function (val) {
				this.wx_config.config.name = val
			},
			'modal$.show': function (val) {
				if(val&&this.modal$.action=='add'){
					this.wx_config = util.copy(emptyObject)
				}
			}
		},
		methods: {
			ok () {
				let action = this.modal$.action
				let [method,uri,msg] = action=='add'?['post','config_pays','添加成功！']:['put','config_pays/'+this.wx_config.cp_id,'修改成功！']
				
				if(this.wx_config.aa_id==0){
					delete this.wx_config.aa_id 
				}
				
				this.$form('form').check().then(()=>{
					this.$rest(uri)[method](this.wx_config)
					.success(()=>{
						this.$Message.success(msg)
						this.close()
						this.$store.dispatch('updateGlobalVar','config_pay').then(()=>{
							this.$store.dispatch('updateGlobalVar','accounts')
							.then(()=>{
								this.$emit('on-success')							
							})
						})
						
					})
				})				
			},
			addAccount () {
				this.$r('account')
				.set('disableOption',true)
				.setType(2)
				.show('添加账户')
			},
			addAccountSucccess () {
				this.wx_config.aa_id = this.account[this.account.length-1].aa_id				
			}
		},
		computed: {
			account () {
				let list = this.$store.state.gvars.accounts
				let filter = (item)=>{
					return (item.bids.indexOf(this.bid$)>-1||item.is_public===1)&&item.type==2
				}
				return list.filter(filter)
			}
		}
	}
</script>

<style>
</style>