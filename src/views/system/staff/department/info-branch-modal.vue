<template>
	<Modal v-drag-modal :mask-closable="false" width="480" v-model="modal$.show" :title="modal$.title" @on-cancel="cancel">
		<template v-if="modal$.show">
        	<Form :label-width="80" ref="form" :model="info" :rules="rules">
        		<Form-item prop="branch_name" label="校区名称">
                    <span>{{info.branch_name}}</span>                    
                </Form-item>
                <Form-item prop="short_name" label="校区简称">
                    <Input type="text" v-model="info.short_name" placeholder="校区简称"></Input>
                </Form-item>
				<Form-item prop="bill_prefix" label="校区编号">
                    <Input type="text" v-model="info.bill_prefix" placeholder="校区编号"></Input>
					<p>校区编号用于单据(订单号,收据，退费，结转)的前缀,变量是<code>{BNO}</code></p>
                </Form-item>
                <Form-item label="校区类型">
                	<Select v-model="info.branch_type">
                		<Option value="1">直营</Option>
                		<Option value="2">加盟</Option>
                	</Select>
                </Form-item>
                <Form-item prop="branch_area" label="校区位置">
                    <Cascader trigger="hover" :data="areas" v-model="branch_area"></Cascader>
                </Form-item>
                <Form-item prop="address" label="详细地址">
                	<Input type="text" v-model="info.address" placeholder="请输入详细地址" ></Input>
                </Form-item>
                <Form-item prop="branch_tel" label="校区电话">
                	<Input type="text" v-model="info.branch_tel" placeholder="校区电话"></Input>
                </Form-item>
        	</Form>
        </template>
	    
    	<div slot="footer">
            <Button type="ghost" @click="cancel">取消</Button>
            <Button type="primary" :loading="saving" @click="save_branchs">确定</Button>
        </div>
    </Modal>
</template>
<script>
	const INFO_NAME = '校区'
	const INFO_PK_ID = 'bid'
	const INFO_URL   = 'branches'

	const emptyObject = {
		bid: 0,
        branch_name: '',
		short_name: '',
		bill_prefix:'',
        branch_type: '1',
        branch_tel: '',
        branch_area: [],
        province_id: 0,
        city_id: 0,
        district_id: 0,
        area_id: 0,
        address: ''
	}
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [common,modal,globals],
		data () {
			return {
				info: util.copy(emptyObject),
				rules:{
                    short_name: [
                        { required: true, message: '请输入校区简称', trigger: 'blur' }
                    ],
                    branch_tel: [
                        { required: true, message: '请输入校区电话', trigger: 'blur' },
                        { pattern:/^(([0-9]{3,4}(-)?)?[0-9]{7,8}|(1\d{10}))$/, message: '电话格式不正确', trigger: 'blur' }
                    ],
                    address: [
                        { required: true, message: '请输入校区具体位置', trigger: 'blur' }
                    ],
                    branch_area: [
                        { required: true, type:'array', message: '请选择校区位置', trigger: 'change' }
                    ]
                }
			}
		},
		methods: {
			cancel() {
				this.$form('form').reset()
				this.close()
			},
			save_branchs () {
				this.save()
				.then(()=>{
					this.$store.dispatch('updateGlobalVar','branchs')
				})
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
	        },
	        branch_area:{
                get:function(){
                    let arr = [this.info.province_id,this.info.city_id,this.info.district_id]
                    if(arr[0]==0){
                    	this.info.branch_area = []	
                    }else{
                    	this.info.branch_area = arr
                    }
                    
                    return arr
                },
                set:function(value){
                    this.info.province_id = value[0]
                    this.info.city_id = value[1]
                    this.info.district_id = value[2]
                    this.info.area_id = value[2]  
                    this.info.branch_area = value
                }
            }
		}
	}
</script>