<template>
	<Modal v-drag-modal :mask-closable="false" class="x-ivu-modal" width="700" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<template v-if="modal$.show">
			<Tabs v-model="current_tab">
		        <TabPane label="员工信息" name="employee">
		        	<info-tab :info="info" :option-form-items="option_form_items" ref="infotab"></info-tab>
		        </TabPane>
		        <TabPane label="权限信息" name="permission" v-if="is_permission_show">
		        	<permission-tab ref="ref_permission" :info="info" :modal="modal$"></permission-tab>
		        </TabPane>
		        <TabPane label="账号信息" name="account" v-if="modal$.action === 'add'">
		        	<account-tab :info="info"></account-tab>     
		        </TabPane>
		    </Tabs>     
        </template>
    	<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" :loading="saving" @click="save">确定</Button>
        </div>
    </Modal>
</template>

<script>
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	import InfoTab from './info-tab'
	import PermissionTab from './permission-tab'
	import AccountTab from './account-tab'
	
	
	const INFO_NAME = '员工'
	const INFO_PK_ID = 'eid'
	const INFO_URL   = 'employees'

	const emptyObject = {
		open_account: 0,
        employee: {
            eid: 0,
            ename: '',
            nick_name: '',
            sex: '1',
            mobile:'',
            id_card_no: '',
            bank_card_no: '',
            is_part_job: 0,
            is_on_job: 1,
            join_int_day: '',
            official_int_day: '',
            remark: '',
            bids: [],
            com_ids: [],
            rids: [],
            bid: 0,
            email:'',
            birth_time:'',
            departments:[],
            is_fsys: 0,
            college_did: 0,
            major_did: 0,
            degree_did: 0,
            have_cert: 0,
            pj_ids: [],
            pj_id:0
        },
        user: {
            account: '',
            password: '',
            status: 1,
            is_admin: 0                   
        }
	}
	
	export default{
		name:'employeeInfoModal',
		mixins:[modal,common,globals],
		components: {
			InfoTab,
			PermissionTab,
			AccountTab
		},
		props:{
			editMode:{
				type:String,
				default:'all'
			}
		},
		data () {
			return {
				info: util.copy(emptyObject),
				current_tab: '',
                option_form_items:[]
			}
		},
		mounted () {
			
		},
		methods: {
            buildOptionFormItems(){
                this.option_form_items = []
                let default_value = function(type){
                    if(type == 'number'){
                        return 0
                    }else if(type == 'date'){
                        return new Date()
                    }
                    return ''
                }
                let employee_option_fields = this.$store.state.gvars.configs.employee_option_fields
                let employee_option_value  = this.info.employee.option_fields || {}
                for(let i=0;i<employee_option_fields.length;i++){
                    let item = employee_option_fields[i]
                    if(item.enable == 1){
                        this.option_form_items.push({
                            label:item.label,
                            type:item.type,
                            field:item.name,
                            value:employee_option_value[item.name]||default_value(item.type),
                            options:item.option_values
                        })
                    }
                }
                
            },
            getOptionFieldsValue(){
                let obj = {}
                this.option_form_items.forEach(item=>{
                    obj[item.field] = item.value
                })
                return obj
            },
        	save(){
        		if(this.info.employee.ename === '') {
        			this.$Message.error('姓名不能为空')
        			return false
        		}
                if(this.modal$.action === 'add') {
                    if(this.info.employee.mobile === '') {
                        this.$Message.error('电话号码不能为空')
                        return false
                    }else{
                        //if(!(/^1\d{10}|\d{3,4}-?\d{6,8}$/).test(this.info.employee.mobile)) {
                        if(!util.is_valid_phone_no(this.info.employee.mobile)){
                            this.$Message.error('电话号码格式错误')
                            return false
                        }
                    }
                }
        		if(this.info.employee.email  !== '') {
        			let reg = /^([0-9A-Za-z\-_\.]+)@[0-9A-Za-z\-_\.]+\.[a-zA-Z]+$/g
        			if(!reg.test(this.info.employee.email)) {
        				this.$Message.error('邮箱格式错误')
        				return false
        			}
        		} 
        		if(this.info.employee.id_card_no !== '') {
        			let reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
        			if(!reg.test(this.info.employee.id_card_no)) {
        				this.$Message.error('身份证号不合法')
        				return false
        			}
        		}
        		if(this.info.employee.bank_card_no !== '') {
        			let reg = /^([1-9]{1})(\d{15}|\d{16}|\d{18})$/
        			if(!reg.test(this.info.employee.bank_card_no)) {
        				this.$Message.error('银行卡号不合法')
        				return false
        			}
        		}
                if(this.info.employee.rids.length == 0) {
                    this.$Message.error('员工所属角色不能为空')
                    return false
                }
        		if(this.modal$.action === 'add' && this.info.open_account === 1) {
        			if(this.info.user.account === '') {
        				this.$Message.error('账号名不能为空')
        				return false
        			}
        			if(this.info.user.password === '') {
        				this.$Message.error('密码不能为空')
        				return false
        			}else{
        				if(this.info.user.password.length < 6) {
        					this.$Message.error('密码长度不能小于6位')
        					return false
        				}
        			}
        			if(this.info.employee.bids.length === 0 || this.info.employee.rids.length === 0) {
        				this.$Message.error('员工校区权限和角色不能为空')
        				return false
        			}
        		}
                let method = this.modal$.action == 'add'?'post':'put'
                let action = this.modal$.action == 'add'?'添加':'编辑'
                let $rest  = this.$rest(this.info_url$)
                if(this.modal$.action != 'add'){
                    $rest.add_url_param(this.info.employee[this.info_pk_id$])
                }
                this.info.employee.option_fields = this.getOptionFieldsValue()
                $rest[method](this.info)
                .success(response=>{
                    let data = response.data
                    
                    if(this.modal$.action == 'add' && _.isString(data) && /^\d+$/.test(data)){
                        this.info[this.info_pk_id$] = util.int(data)
                    }
                    this.$Message.success(util.sprintf('%s%s成功!',this.info_name$,action))
                    this.$emit('save',{action:this.modal$.action,data:this.info})
                    if(_.isDefined(this.$store.state.gvars[this.info_url$])){
                        this.$store.dispatch('updateGlobalVar',this.info_url$)
                    }
                    this.close()
                })
                .error(response=>{
                    this.error(response.body.message)
                })
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
            is_permission_show() {
                let show = true
                if(
                    this.modal$.action === 'edit' && 
                    this.info.employee.user && 
                    this.info.employee.user.is_admin === 1 &&
                    this.$store.state.user.info.is_admin != 1) {
                    show = false
                }
                return show
            }
		},
		watch: {
			'modal$.show': function(val) {
            	if(val&&this.modal$.action == 'add'){
					this.info = util.copy(emptyObject)
				}
                this.current_tab = 'employee'
                this.buildOptionFormItems();            
	        },
	        'current_tab': function(val) {
	        	if(val == 'permission'&&this.modal$.action == 'edit') {
	        		if(this.info.employee.bids.length == this.branchs.length) {
	        			this.$refs.ref_permission.set('select_all_bids',true)
					}
					if(this.info.employee.rids.length == this.roles.length) {
						this.$refs.ref_permission.set('select_all_rids',true)
					}
                    this.$refs.ref_permission.setCompanySelected()
	        	}
	        }
		}
	}
</script>
<style lang="less">
.permission-tab-form {
    .branchs-group,
    .roles-group {
        float: left;
        margin-bottom: 10px;
        .title {
            line-height: 30px;
            font-weight: 700;
            padding-left: 10px;
            background-color: #c7e3ff;
            color: #356fbe;
        }
        label {
            margin-bottom: 0;
        }
        .checkboxs-group {
            max-height: 250px;
            overflow: auto;
        }
        .main-branch {
            padding: 10px;
        }
    }
}
</style>
