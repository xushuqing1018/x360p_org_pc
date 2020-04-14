<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<Form ref="form" :label-width="70" :model="info" :rules="rules">
			<Form-item label="账号" prop="account">
				<Input :value="info.account" readonly></Input>
			</Form-item>
			<Form-item label="密码" prop="password">
				<Input v-model="info.password" placeholder="请输入密码"></Input> 
			</Form-item>
			<Form-item>
				<a @click="info.password = random(6)">随机</a>
                <a @click="info.password='123456'">123456</a>
                <a @click="info.password='888888'">6个8</a>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import pinyin from '@/libs/pinyin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	const emptyObject = {
		account: '',
		password: ''
	}
	export default{
		mixins: [pinyin,modal,common],
		data () {
			return {
				uid: 0,
				info: util.copy(emptyObject),
				rules: {
					account: [
						{ required: true, message: '请输入账号', trigger: 'blur' }
					],
					password: [
						{ required: true, message: '请输入密码', trigger: 'blur' },
						{ type: 'string', min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
					]
				}
			}
		},
		methods: {
			random(length){
                return util.random(length)
            },            
			ok () {
				this.$form('form').check()
				.then(()=>{
					this.$rest('users/'+this.uid)
					.put(this.info)
					.success(data=>{
						this.$Message.success('修改成功！')
						this.$emit('on-success')
						this.close()
					}).error(response=>{
						this.$Notice.error({
							title: '失败',
							desc: response.body.message||'修改失败'
						})
					})
				})
			}
		}
	}
</script>

<style>
</style>