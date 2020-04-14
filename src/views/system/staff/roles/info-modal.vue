<template>
	<Modal v-drag-modal :mask-closable="false" width="480" v-model="modal$.show" :title="modal$.title" @on-cancel="cancel">
		<template v-if="modal$.show">
        	<Form :label-width="60" ref="form" :model="info" :rules="rules">
        		<Form-item prop="role_name" label="组名">
        			<Input type="text" v-model="info.role_name" placeholder="请输入角色组名"></Input>
        		</Form-item>
        		<Form-item prop="role_desc" label="描述">
        			<Input type="text" v-model="info.role_desc" placeholder="请输入角色组描述"></Input>
        		</Form-item>
        	</Form>
        </template>
	    
    	<div slot="footer">
            <Button type="ghost" @click="cancel">取消</Button>
            <Button type="primary" :loading="saving" @click="save">确定</Button>
        </div>
    </Modal>
</template>
<script>
	const INFO_NAME = '角色组'
	const INFO_PK_ID = 'rid'
	const INFO_URL   = 'roles'

	const emptyObject = {
		rid: 0,
		role_name: '',
		role_desc: ''	
	}
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [common,modal],
		data () {
			return {
				info: util.copy(emptyObject),
				rules: {
					role_name: [
						{ required: true, message: '角色名不能为空', trigger: 'blur' }
					]
				}
			}
		},
		methods: {
			cancel() {
				this.$form('form').reset()
				this.close()
			}
		},
		watch: {
			'modal$.show': function(val) {
            	if(val&&this.modal$.action == 'add'){
					this.info = util.copy(emptyObject)
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
	        }
		}
	}
</script>