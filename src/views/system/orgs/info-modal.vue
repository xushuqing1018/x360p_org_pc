<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="700">
        <div class="text-center mb-4">
            <RadioGroup v-model="group" type="button">
                <Radio label="basic">基本信息</Radio>
                <Radio label="system">系统规格</Radio>
                <Radio label="account" v-if="modal$.action=='add'">账号信息</Radio>
            </RadioGroup>
        </div>

        <info-group :info="info" :modal="modal$" v-if="group=='basic'"></info-group>
        <system-group :info="info" :modal="modal$" v-if="group=='system'"></system-group>
        <account-group :info="info" v-if="group=='account'&&modal$.action=='add'"></account-group>
        
    	<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" :loading="saving" @click="save">确定</Button>
        </div>
    </Modal>
</template>

<script>
    import pinyin from '@/libs/pinyin'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
    
    import InfoGroup from './info-group.vue'
    import SystemGroup from './system-group.vue'
    import AccountGroup from './account-group.vue'

	const INFO_NAME = '加盟商'
	const INFO_PK_ID = 'og_id'
	const INFO_URL   = 'orgs'

	const emptyObject = {
        org: {
            og_id: 0,
            parent_og_id: 0,
            org_name: '',
            org_short_name: '',
            areas_arr: [],
	        province_id: 0,
	        city_id: 0,
	        district_id: 0,
	        org_address: '',
	        expire_day: '',
	        account_num_limit: 0,
	        branch_num_limit: 0,
	        student_num_limit: 100,
            account_price: 360,
            branch_price: 3600,
            student_price: 24,
	        mobile: '',
            host: '',
            join_in_day: '',
	    open_in_day: '',
	    org_type: 1
        },
        user: {
            account: '',
            password: '',
            status: 1,
            is_admin: 1                  
        }
	}
	
	export default{
		name:'orgInfo',
		mixins:[modal,common,globals],
        props: {
            franchisee: Object
        },
        components: {
            InfoGroup,
            AccountGroup,
            SystemGroup
        },
		data () {
			return {
                group: 'basic',
				info: util.copy(emptyObject)
			}
		},
		mounted () {
			
		},
		methods: {
            onModalOpen() {
                if(!this.is_empty_franchisee) {
                    this.info.org.org_name = this.franchisee.org_name
                }
            },
        	save(){
        		if(this.info.org.org_name === '') {
        			this.$Message.error('机构名称不能为空')
        			return false
        		}
        		if(this.info.org.org_short_name === '') {
        			this.$Message.error('机构简称不能为空')
        			return false
        		}
        		if(this.info.org.areas_arr.length == 0) {
        			this.$Message.error('机构位置不能为空')
        			return false
        		}
                if(this.info.org.host === '') {
                    this.$Message.error('host域名不能为空')
                    return false
                }else{
                    if(!/^[a-zA-Z]/.test(this.info.org.host)) {
                        this.$Message.error('域名只能以字母开头')
                        return false
                    }
                    if(!/^[a-zA-Z0-9]{4,10}$/g.test(this.info.org.host)) {
                        this.$Message.error('域名不能包含特殊字符，且只能大于(含)四位小于10位')
                        return false
                    }
                }
        		if(this.info.org.org_address === '') {
        			this.$Message.error('机构详细地址不能为空')
        			return false
        		}
        		if(this.info.org.account_num_limit === '') {
        			this.$Message.error('账号数上限不能为0')
        			return false
        		}
        		if(this.info.org.branch_num_limit === '') {
        			this.$Message.error('机构数上限不能为0')
        			return false
        		}
        		if(this.info.org.student_num_limit === '') {
        			this.$Message.error('学员数上限不能为0')
        			return false
        		}
        		if(this.info.org.mobile === '') {
        			this.$Message.error('联系电话不能为空')
        			return false
        		}else{
        			if(!(/^\d{8,11}$/).test(this.info.org.mobile)) {
        				this.$Message.error('电话号码格式错误')
        				return false
        			}
        		}
        		if(this.info.org.expire_day==='') {
        			this.$Message.error('到期日期不能为空')
        			return false
        		}
        		if(this.modal$.action == 'add') {
        			if(this.info.user.account == 0) {
	        			this.$Message.error('账号不能为空')
	        			return false
	        		}
	        		if(this.info.user.password === '') {
	        			this.$Message.error('密码不能为空')
	        			return false
	        		}
        		}
        		let method = this.modal$.action == 'add'?'post':'put'
                let action = this.modal$.action == 'add'?'添加':'编辑'
                let $rest  = this.$rest(this.info_url$)
                if(this.modal$.action != 'add'){
                    $rest.add_url_param(this.info.org[this.info_pk_id$])
                }
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
            is_empty_franchisee() {
                return _.isEmpty(this.franchisee)
            }
		}
	}
</script>
