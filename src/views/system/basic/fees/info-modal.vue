<template>
	<Modal v-drag-modal :mask-closable="false" width="550" v-model="modal$.show" :title="modal$.title">
		<Form :label-width="100" ref="form" :model="info" :rules="rules">
    		<Form-item prop="name" label="杂费名称">
    			<Input type="text" v-model="info.name" placeholder="请输入杂费名称"></Input>
    		</Form-item>
    		<Form-item prop="unit_price" label="价格">
    			<InputNumber v-model="info.unit_price" :min="0"></InputNumber> 元
    		</Form-item>
    		<Form-item v-help="'弹性价格：缴费时可修改价格'" prop="is_flex_price" label="是否弹性价格">
    			<i-switch v-model="info.is_flex_price" :true-value="1" :false-value="0"></i-switch>
    		</Form-item>
    		<Form-item label="是否算业绩">
    			<i-switch v-model="info.is_performance" :true-value="1" :false-value="0"></i-switch>
    		</Form-item>
    		<Form-item label="描述">
    			<Input type="text" v-model="info.desc" placeholder="请输入描述"></Input>
    		</Form-item>
    	</Form>
	    
    	<div slot="footer">
            <Button type="ghost" @click="close" :disabled="saving">取消</Button>
            <Button type="primary" @click="save" :loading="saving">确定</Button>
        </div>
    </Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	const INFO_NAME = '杂费项'
	const INFO_PK_ID = 'pi_id'
	const INFO_URL   = 'pay_items'

	const emptyObject = {
		name: '',
		desc: '',
		unit_price: 0,
		is_flex_price: 0,
		is_performance: 0
	}
	
	export default{
		mixins:[modal,common],
		data () {
			return {
				info: util.copy(emptyObject),
				rules: {
					name: [
						{ required: true, message:'请输入杂费名称', trigger: 'blur' }
					],
					unit_price: [
						{ required: true, type: 'number',min: 0.01, message:'请输入价格', trigger: 'change' }
					]
				}
			}
		},
        methods: {
        	       	
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
