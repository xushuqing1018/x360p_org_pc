<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="550" :mask-closable="false">
		<Form :label-width="100" ref="form" :model="sqb_config">
    		<Form-item label="是否启用">
	            <i-switch v-model="sqb_config.is_enable" :true-value="1" :false-value="0" size="large">
	                <span slot="open" :value="true">启用</span>
	                <span slot="close" :value="false">禁用</span>
	            </i-switch>
	        </Form-item>
	        <Form-item label="配置名称" prop="name" class="ivu-form-item-required">
    			<Input v-model="sqb_config.name" placeholder="输入一个名称便于区分"></Input>
    		</Form-item>
	        <Form-item label="绑定账户" class="ivu-form-item-required">
	        	<Select v-model="sqb_config.aa_id" style="width:260px;">
	        		<Option :value="item.aa_id" v-for="(item,index) in account" :key="index" :disabled="item.cp_id>0" :label="item.name">	        			
	        			<span>{{item.name}}</span>
						<span style="float:right;color:#c3cbd6" v-if="item.cp_id">已绑定配置</span>
	        		</Option>
	        	</Select>
	        	<Button type="ghost" icon="plus" @click="addAccount"></Button>
	        </Form-item>
	        <Form-item label="AppID" prop="appid" class="ivu-form-item-required">
    			<Input v-model="sqb_config.appid" placeholder="请输入AppID"></Input>
    		</Form-item>
    		<!-- <Form-item label="终端号" prop="terminal_sn">
    			<Input v-model="sqb_config.config.terminal_sn" placeholder="请输入终端号"></Input>
    		</Form-item>
    		<Form-item label="终端密钥" prop="terminal_key">
    			<Input v-model="sqb_config.config.terminal_key" placeholder="请输入终端密钥"></Input>
    		</Form-item>
    		<Form-item label="商家号" prop="merchant_sn">
    			<Input v-model="sqb_config.config.merchant_sn" placeholder="请输入商家号"></Input>        			
    		</Form-item>
    		<Form-item label="商户号" prop="store_sn">
    			<Input v-model="sqb_config.config.store_sn" placeholder="请输入商户号"></Input>
    		</Form-item> -->
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
		type: 3,
		is_enable: 1,
		aa_id: 0,
		appid: ''
	}
	
	export default{
		mixins: [ modal,common ],
		components: {
			AccountInfo
		},
		data () {
			return {
				sqb_config: util.copy(emptyObject),
			}
		},
		methods: {
			ok () {
				if(this.sqb_config.name==='') {
					this.$Message.error('请输入配置名称')
					return
				}
				if(this.sqb_config.aa_id==='') {
					this.$Message.error('请输入绑定账户')
					return
				}
				if(this.sqb_config.appid==='') {
					this.$Message.error('请输入AppID')
					return
				}

				let action = this.modal$.action
				let [method,uri,msg] = action=='add'?
					['post','config_pays/post_sqb','添加成功！']:
					['put','config_pays/put_sqb?id='+this.sqb_config.cp_id,'修改成功！']
				
				if(this.sqb_config.aa_id==0){
					delete this.sqb_config.aa_id 
				}
				
				this.$rest(uri)[method](this.sqb_config)
				.success(()=>{
					this.$Message.success(msg)
					this.$emit('success')	
					this.$store.dispatch('updateGlobalVar','config_pay').then(()=>{
						this.$store.dispatch('updateGlobalVar','accounts')
					})
					this.close()
					
				})
				.error(res => {
					this.error(res.body.message)
				})			
			},
			addAccount () {
				this.$r('account')
				.set('disableOption',true)
				.setType(2)
				.show('添加账户')
			},
			addAccountSucccess () {
				this.sqb_config.aa_id = this.account[this.account.length-1].aa_id				
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