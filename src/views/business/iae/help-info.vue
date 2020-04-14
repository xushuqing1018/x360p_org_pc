<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="500" :mask-closable="false">
		<Form ref="form" :label-width="70" :model="info" :rules="rules">
			<Form-item label="类别" prop="type" v-if="!type">
				<Select v-model="info.type" style="width:150px;">
					<Option value="">请选择</Option>
					<Option value="client">往来单位</Option>
					<Option value="item">项目</Option>
					<Option value="employee">人员</Option>
				</Select>
			</Form-item>
			<Form-item label="名称" prop="name">
				<Input v-model="info.name" placeholder="请输入名称"></Input>
			</Form-item>
			<Form-item label="备注" prop="remark">
				<Input v-model="info.remark" placeholder="请输入备注"></Input>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import Vue from 'vue'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins: [modal,common],
		data () {
			return {
				type: '',
				info: {
					type: this.type||'',
					name: '',
					remark: ''
				},
				rules: {
					type: [
						{ required: true, message: '请输入名称', trigger: 'change' }
					],
					name: [
						{ required: true, message: '请输入名称', trigger: 'blur' }
					]
				},
				search_field: {
					type: ''
				}
			}
		},
		watch: {
			type: function (val) {
				if(val!=''){
					this.info.type = val
				}
			}
		},
		methods: {
			cancel () {
				this.$form('form').reset()
				this.close()
			},
			ok () {
				let action = this.modal$.action,
					[uri,method,msg] = action=='add'?['tally_helps','post','添加成功']:['tally_helps/'+this.info.th_id,'put','编辑成功']
				
				if(action=='add'){
					Vue.delete(this.info,'th_id')
				}
				
				this.$form('form').check().then(()=>{
					this.$rest(uri)[method](this.info)
					.success(data=>{
						this.$Message.success(msg)
						this.$emit('on-success')
						this.cancel()
						this.$store.dispatch('updateGlobalVar','tally_helps')
					}).error(response=>{
						this.$Notice.error({
							title: '失败',
							desc: response.body.message||'操作失败'
						})
					})
				})
				
			}
		}
	}
	
</script>
