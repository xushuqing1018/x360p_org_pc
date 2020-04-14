<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="600" :mask-closable="false">
		<Form :label-width="120" :rules="rules" ref="form" :model="fy_config.config">
    		<Form-item label="是否启用">
	            <i-switch v-model="fy_config.is_enable" :true-value="1" :false-value="0" size="large">
	                <span slot="open" :value="true">启用</span>
	                <span slot="close" :value="false">禁用</span>
	            </i-switch>
	        </Form-item>
	        <Form-item label="配置名称" prop="name`">
    			<Input v-model="fy_config.name" placeholder="输入一个名称便于区分"></Input>
    		</Form-item>
	        <Form-item label="绑定账户">
	        	<Select v-model="fy_config.aa_id" style="width:260px;">
	        		<Option :value="item.aa_id" v-for="(item,index) in account" :key="index" :disabled="item.cp_id>0" :label="item.name">	        			
	        			<span>{{item.name}}</span>
						<span style="float:right;color:#c3cbd6" v-if="item.cp_id">已绑定配置</span>
	        		</Option>
	        	</Select>
	        	<Button type="ghost" icon="plus" @click="addAccount"></Button>
	        </Form-item>
	        <Form-item label="富友商户号" prop="fy_mchnt_cd">
    			<Input v-model="fy_config.config.fy_mchnt_cd" placeholder="请输入富友商户号"></Input>
    		</Form-item>
    		<Form-item label="富友机构号" prop="ins_cd">
    			<Input v-model="fy_config.config.ins_cd" placeholder="请输入富友机构号"></Input>
    		</Form-item>
    		<Form-item prop="encrypt">
    			<span slot="label" class="pb-2 d-inline-block" v-help="'通过富友入网审核的商户，可以联系富友方获取'">签名用的加密串</span>
    			<Input v-model="fy_config.config.encrypt" type="textarea" :autosize="{minRows: 4,maxRows: 4}" placeholder="通过富友入网审核的商户，可以联系富友方获取"> </Input>      			
    		</Form-item>
    		<Form-item prop="redirect_url">
    			<span slot="label" class="pb-2 d-inline-block" v-help="'设置路径，支付成功将直接同步返回数据'">同步通知的路径</span>
    			<Input v-model="fy_config.config.redirect_url" type="textarea" :autosize="{minRows: 4,maxRows: 4}" placeholder="设置路径，支付成功将直接同步返回数据"></Input>
    		</Form-item>
			<Form-item prop="notify_url">
    			<span slot="label" class="pb-2 d-inline-block" v-help="'设置路径，支付结果将异步通知'">同步通知的路径</span>
    			<Input v-model="fy_config.config.notify_url" type="textarea" :autosize="{minRows: 4,maxRows: 4}" placeholder="设置路径，支付结果将异步通知"></Input>
    		</Form-item>
			<Form-item prop="x360p_public_path">
    			<span slot="label" class="pb-2 d-inline-block" v-help="'通过富友入网审核的商户，可以联系富友方获取'">平台方公钥</span>
    			<Input v-model="fy_config.config.x360p_public_path" type="textarea" :autosize="{minRows: 4,maxRows: 4}" placeholder="通过富友入网审核的商户，可以联系富友方获取"></Input>
    		</Form-item>
			<Form-item prop="x360p_private_path">
    			<span slot="label" class="pb-2 d-inline-block" v-help="'通过富友入网审核的商户，可以联系富友方获取'">平台方私钥</span>
    			<Input v-model="fy_config.config.x360p_private_path" type="textarea" :autosize="{minRows: 4,maxRows: 4}" placeholder="通过富友入网审核的商户，可以联系富友方获取"></Input>
    		</Form-item>
			<Form-item prop="fy_public_path">
    			<span slot="label" class="pb-2 d-inline-block" v-help="'通过富友入网审核的商户，可以联系富友方获取'">富友方公钥</span>
    			<Input v-model="fy_config.config.fy_public_path" type="textarea" :autosize="{minRows: 4,maxRows: 4}" placeholder="通过富友入网审核的商户，可以联系富友方获取"></Input>
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
		type: 5,
		is_enable: 1,
		aa_id: 0,
		config: {		
			fy_mchnt_cd: '',
			ins_cd: '',
			encrypt: '',
			redirect_url: '',
			notify_url: '',
			x360p_public_path: '',
			x360p_private_path: '',
			fy_public_path: '',
		}	
	}
	
	export default{
		mixins: [ modal,common ],
		components: {
			AccountInfo
		},
		data () {
			return {
				fy_config: util.copy(emptyObject),
				rules: {
					name: [
						{ required: true, message: '请输入配置名称', trigger: 'blur' }
					],			
					fy_mchnt_cd: [
						{ required: true, message: '请输入富友商户号', trigger: 'blur' }
					],
					ins_cd: [
						{ required: true, message: '请输富友机构号', trigger: 'blur' }
					],
					encrypt: [
						{ required: true, message: '请输入签名用的加密串', trigger: 'blur' }
					],
					redirect_url: [
						{ required: true, message: '请输入同步通知的路径', trigger: 'blur' }
					],
					notify_url: [
						{ required: true, message: '请输入异步消息的路径', trigger: 'blur' }
					],	
					x360p_public_path: [
						{ required: true, message: '请输入平台方公钥', trigger: 'blur' }
					],
					x360p_private_path: [
						{ required: true, message: '请输入平台方私钥', trigger: 'blur' }
					],	
					fy_public_path: [
						{ required: true, message: '请输入富友方公钥', trigger: 'blur' }
					],			
				}
			}
		},
		watch: {
			'fy_config.name': function (val) {
				this.fy_config.config.name = val
			},
			'modal$.show': function (val) {
				if(val&&this.modal$.action=='add'){
					this.fy_config = util.copy(emptyObject)
				}else{
					console.log(this.fy_config)
				}
			}
		},
		methods: {
			ok () {
				let action = this.modal$.action
				let [method,uri,msg] = action=='add'?['post','config_pays/0/fy','添加成功！']:['post','config_pays/put_fy/?id='+this.fy_config.cp_id,'修改成功！']
				
				if(this.fy_config.aa_id==0){
					delete this.fy_config.aa_id 
				}
				
				this.$form('form').check().then(()=>{
					this.$rest(uri)[method](this.fy_config)
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
				this.fy_config.aa_id = this.account[this.account.length-1].aa_id				
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