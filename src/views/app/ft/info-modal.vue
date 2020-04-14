<template>
		<Modal v-drag-modal :mask-closabled="false" v-model="modal$.show" :title="modal$.title" :width="450">
			<Form ref="form" :model="info" :rules="rules_channel" :label-width="70">
				<Form-item label="选择员工" prop="eid">
					<select-employee :rid='1' v-model="info.eid" clearable></select-employee>
				</Form-item>
				<Form-item label="来源国家" prop="origin_country">
					<Input v-model="info.origin_country" placeholder="请输入来源国家"></Input>
				</Form-item>
			</Form>
			<div slot="footer">
				<Button type="ghost" @click="close">关闭</Button>
				<Button type="primary" @click="ok" :loading="saving">确定</Button>
			</div>
		</Modal>
</template>

<script>
	import util from  '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import selectEmployee from 'c%/SelectEmployee.vue'

	
	export default {
		mixins: [ common, modal ],
		props: {
		},
		components: {
            selectEmployee
        },
		data () {
            var emptyObject = {
				origin_country: '',
				eid: 0
            };
			return {
                info: util.copy(emptyObject),
                rules_channel: {
					origin_country: [
						{ required: true, type:'string', message: '请输入来源国家', trigger: 'blur' }
					],
					eid: [
						{ required: true, type:'number', min:1, message: '请选择外教员工', trigger: 'change' }
					]
				},
			}
		},
		watch: {
		},
		created(){
        },
		methods: {	
			ok () {
				this.$form('form').check().then(()=>{
					let action = this.modal$.action,
						[method,uri,msg] = action=='add'?['post','ft_employees','添加成功']:['put','ft_employees/'+this.info.mt_id,'修改成功']
					
					this.$rest(uri)[method](this.info)
					.success(data=>{
						this.$Message.success(msg)
						this.$emit('on-success')
						this.close()
					}).error(body=>{
						this.$Notice.error({
							title: '失败',
							desc: body.message||'添加失败'
						})
					})
					
				})
				
			},
		}
	}
</script>

<style>
</style>