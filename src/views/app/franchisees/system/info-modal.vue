<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="700">
        <div class="text-center mb-4">
            <RadioGroup v-model="group" type="button">
                <Radio label="system">系统规格</Radio>
                <Radio label="account" v-if="modal$.action=='add'">账号信息</Radio>
            </RadioGroup>
        </div>
        <system-group :info="info" :edit="edit" :modal="modal$" v-if="group=='system'"></system-group>
        <account-group :info="info" v-if="group=='account'&&modal$.action=='add'"></account-group>
        
    	<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
            <Button type="primary" :loading="saving" @click="save">{{btn_text}}</Button>
        </div>
    </Modal>
</template>

<script>
    import pinyin from '@/libs/pinyin'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
    
    import SystemGroup from '@/views/system/orgs/system-group.vue'
    import AccountGroup from '@/views/system/orgs/account-group.vue'

	const emptyObject = {
        org: {
        	org_name: '',
        	mobile: '',
	        expire_day: '',
	        account_num_limit: 20,
	        branch_num_limit: 1,
	        student_num_limit: 10,
            account_price: 360,
            branch_price: 3600,
            student_price: 24,
            host: '',
            org_type: 2
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
            franchisee: Object,
            review: {
                type: Boolean,
                defaut: false
            },
            edit: {
                type: Boolean,
                defaut: false
            },
        },
        components: {
            AccountGroup,
            SystemGroup
        },
		data () {
			return {
                group: 'system',
				info: util.copy(emptyObject)
			}
		},
		mounted () {
            if(this.edit) {
                this.info.org = { ...this.franchisee }
            }
            else {
                this.info.org.contract_no = this.franchisee.contract_no
            }
            if(this.modal$.action=='add'&&allow_sub_org_type) {
                this.info.org.org_type = 2;
                this.info.org.student_num_limit = 10;
            }
		},
		methods: {
			onModalOpen() {
                if(_.isEmpty(this.franchisee)) return
                let keys = [
                    'org_name',
                    'mobile',
                    'expire_day',
                    'account_num_limit',
                    'branch_num_limit',
                    'student_num_limit',
                    'account_price',
                    'branch_price',
                    'student_price',
                    'host',
                    'account',
                    'password'
                ]
                keys.forEach(k => {
                    if(this.review) {
                        if(k=='account'||k=='password') {
                            this.info.user['account'] = this.franchisee['init_account']
                            this.info.user['password'] = this.franchisee['init_password']
                        }else{
                             if(k=='expire_day') {
                                this.info.org[k] = this.$filter('int_date')(this.franchisee.expire_day)
                            }else{
                                this.info.org[k] = this.franchisee[k]
                            }
                        }
                    }else{
                        if(k=='org_name'||k=='mobile') {
                            this.info.org[k] = this.franchisee[k]
                        }
                    }
                })
			},
        	save(){
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
        		if(this.info.org.expire_day===''&&this.info.org.org_type == 1) {
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
                let rest = '',
                    method = '',
                    message = ''
                if(this.modal$.action=='add') {
                    rest = this.$rest('franchisees')
                    method = 'post'
                    if(this.review) {
                        rest.add_url_param(this.franchisee.og_id,'doconfirm')
                        message = '校360系统已审核开通'
                    }else{
                        rest.add_url_param(this.franchisee.fc_id,'docreate')
                        message = '校360系统已提交审核'
                    }
                }else{
                    rest = this.$rest('orgs').add_url_param(this.info.org.og_id)
                    message = '校360系统编辑成功'
                    method = 'put'
                }
        		
        		rest[method](this.info)
        		.success(res => {
        			this.$Message.success(message)
        			this.$emit('save')
        			this.close()
        		})
        		.error(res => {
        			this.error(res.body.message)
        		})
	        }
		},
		computed: {
            allow_sub_org_type(){
                return this.modal.action=='add' && this.$store.state.client.allow_sub_org_type == 1
            },
            is_empty_franchisee() {
                return _.isEmpty(this.franchisee)
            },
            btn_text() {
                if(this.modal$.action=='add') {
                    if(this.review) {
                        return '确认开通'
                    }else{
                        return '确认开通'
                    }
                }else{
                    return '确定'
                }
            }
		}
	}
</script>
