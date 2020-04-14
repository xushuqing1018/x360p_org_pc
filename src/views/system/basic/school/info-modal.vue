<template>
	<Modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="680">
		<div v-if="modal$.show">
			<Form :label-width="80" ref="form" :model="info" :rules="rules">
				<Form-item label="学校名称" prop="school_name">
					<Input v-model="info.school_name" placeholder="请输入校区名称"></Input>
				</Form-item>
				<Form-item label="学校位置" prop="areas_arr">
					<Cascader trigger="hover" :data="areas" v-model="branch_area"></Cascader>
				</Form-item>
				<Form-item label="详细地址" prop="address">
					<Input v-model="info.address" placeholder="请输入详细地址"></Input>
				</Form-item>
			</Form>
		</div>
		
		<div slot="footer">
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	
	const emptyObject = {
		province_id: 0,
		city_id: 0,
		district_id: 0,
		area_id: 0,
		areas_arr: [],
		school_name: ''
	}
	
	export default{
		mixins: [common,modal,globals],
		data () {
			return {
				info:util.copy(emptyObject),
				rules: {
					school_name: [
						{ required: true, message: '请输入学校名称', trigger: 'blur' }
					]
				}
			}
		},
		
		methods: {
			cancel () {
				this.$form('form').reset()
				this.info = util.copy(emptyObject)
				this.close()
			},
			ok () {
				this.$form('form').check()
				.then(()=>{
					let action = this.modal$.action,
						[method,uri,msg] = action=='add'?['post','public_schools','添加成功']:['put','public_schools/'+this.info.ps_id,'编辑成功']
					this.$rest(uri)[method](this.info)
					.success(data=>{
						this.$store.dispatch('updateGlobalVar','public_schools')
						this.$Message.success(msg)
						this.$emit('on-success')
						this.cancel()
					}).error(body=>{
						this.$Notice.error({
							title: '失败',
							desc: body.message||'添加失败'
						})
					})
				})
			}
		},
		computed: {
			branch_area: {
                get:function(){
                    let arr = [this.info.province_id,this.info.city_id,this.info.district_id]
                    return this.info.areas_arr||arr
                },
                set:function(value){
                    this.info.province_id = value[0]
                    this.info.city_id = value[1]
                    this.info.district_id = value[2]
                    this.info.area_id = value[2]  
                    this.info.areas_arr = value
                }
            }
		}
	}
</script>

<style>
</style>