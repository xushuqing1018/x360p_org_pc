<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="500" :mask-closable="false">
		<Form ref="form" :label-width="70" :model="info" :rules="rules">
			<Form-item label="类型" prop="type" v-if="modal$.action=='add'">
				<RadioGroup v-model="info.type">
					<Radio label="1">收入</Radio>
					<Radio label="2">支出</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="选项" prop="pid" v-if="modal$.action=='add'">
				<p class="text-danger">请确保每个大类包含一个小类。</p>
				<RadioGroup v-model="is_parent">
					<Radio :label="0">添加为大类</Radio><br>
					<Radio :label="1">添加为</Radio>
					<Select 
						v-model="info.pid" 
						class="ml-3 x-ivu-select" 
						:disabled="is_parent===0"
						style="width:120px">
						<Option v-for="item in typeList" :value="item.tt_id">{{item.name}}</Option>
					</Select>
					<span class="ml-3">的小类</span>
				</RadioGroup>
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
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins: [modal,common],
		data () {
			return {
				is_parent: 0,
				list: [],
				info: {
					pid: 0,
					type: '',
					name: '',
					remark: '',					
				},
				rules: {
					type: [
						{ required: true, message: '请选择类型', trigger: 'change' }						
					],
					name: [
						{ required: true, message: '请选输入名称', trigger: 'change' },
					]
				}
			}
		},
		watch: {
			is_parent: function (val) {
				if(val===0){
					this.info.pid = 0
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
					[uri,method,msg] = action=='add'?['tally_types','post','添加成功']:['tally_types/'+this.info.tt_id,'put','编辑成功']
				
				if(action=='add'){
					delete this.info.tt_id
				}
				
				this.$form('form').check()
				.then(()=>{					
					this.$rest(uri)[method](this.info)
					.success(data=>{
						this.$Message.success(msg)
						this.$store.dispatch('updateGlobalVar','tally_types')
						this.$emit('on-success')
						this.cancel()
					}).error(response=>{
						this.$Notice.error({
							title: '失败',
							desc: response.body.message||'操作失败'
						})
					})
				})
			}
		},
		computed: {
			typeList () {
				return this.list.filter(l=>l.type==this.info.type&&l.pid===0)
			}
		}
	}
</script>
