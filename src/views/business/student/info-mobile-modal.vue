<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="680">
		<template v-if="modal$.show">
			<Form :label-width="70" ref="form" :model="info" :rules="rules">
				<Form-item label="手机号" prop="tel">
					<Input v-model="info.tel" placeholder="请输入手机号"></Input>
				</Form-item>
				<Form-item label="关系" prop="family_rel">
					<Select v-model="info.family_rel">
						<Option :value="index+1" v-for="(val,key,index) in rel_list">{{val}}</Option>
					</Select>
				</Form-item>
				<Form-item label="姓名" prop="family_name" v-if="info.family_rel!==1">
					<Input v-model="info.family_name" placeholder="请输入姓名"></Input>
				</Form-item>
			</Form>		
			
			<div slot="footer">
				<Button type="ghost" @click="close" :loading="saving">取消</Button>
				<Button type="primary" @click="ok" :loading="saving">确定</Button>
			</div>
			<search-modal ref="search" :data="students" @on-change="changeTel"></search-modal>
		</template>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import searchModal from './search-same-modal.vue'
	
	const emptyObject = {
		tel: '',
		family_name: '',
		family_rel: 0,
	}
	
	export default{
		mixins: [modal,common],
		components: {
			searchModal
		},
		data () {
			return {
				info: util.copy(emptyObject),	
				data: {},
				type: 'first',	//first or second 
				rules: {
					tel: [
						{ require: true, message: '请输入手机号', trigger: 'blur' }
					],
					family_name: [
						{ require: true, message: '请输入联系人姓名', trigger: 'blur' }
					]
				}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val){
					this.init_model('set')	
				}
			}
		},
		computed: {
			students () {
				let fieldName = this.type+'_user'
				if(this.data[fieldName]){
					return this.data[fieldName].students	
				}
				return []
			}
		},
		methods: {
			init_model (action) {
				let type = this.type,
					info = this.info
				for(let k in info){
					if(action=='set'){
						this.info[k] = this.data[util.sprintf('%s_%s',type,k)]										
					}else{
						this.data[util.sprintf('%s_%s',type,k)] = info[k]		
					}
					
				}
			},
			ok () {
				if(this.students.length>1){
					this.$refs['search'].show('检测到您手机号下有多个学员')
				}else{
					this.changeTel()
				}
			},
			changeTel () {
				//type: 'single' / 'all'
				this.data.type = 'single'
				this.$form('form').check()
				.then(()=>{
					this.init_model('get')
					this.$rest('students/'+this.data.sid)
					.put(this.data)
					.success(response=>{
						this.$Message.success('操作成功')
						this.$emit('on-success')
						this.close()
					}).error(response=>{
						this.error(response.body.message||'添加失败')
					})
				})
			}
		},		
	}
</script>
