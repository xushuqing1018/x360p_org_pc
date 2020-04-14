<template>
	<Form :label-width="100" ref="form_org" class="row" :model="info.org">
        <Form-item prop="host" class="col-md-10 pr-4 custom-form-item-required" label="域名" v-help="'只能以字母开头，大于(含)四位小于10位'">
            <Input v-model="info.org.host">
                <span slot="prepend">http://</span>
                <span slot="append">{{append}}</span>
            </Input>
        </Form-item>
        <Form-item class="col-md-2 pr-4" label="" :label-width="10">
            <Button type="info" size="small" @click="accountInput">拼音</Button>
        </Form-item>
        <Form-item prop="account_num_limit" class="col-md-4 pr-4 custom-form-item-required" label="账号数上限">
        	<InputNumber :min="0" :step="1" v-model="info.org.account_num_limit"></InputNumber>
        </Form-item>
        <Form-item prop="branch_num_limit" class="col-md-4 pr-4 custom-form-item-required" label="校区数上限">
        	<InputNumber :min="0" :step="1" v-model="info.org.branch_num_limit"></InputNumber>
        </Form-item>
        <Form-item prop="student_num_limit" class="col-md-4 pr-4 custom-form-item-required" label="学员数上限">
        	<InputNumber :min="orgStudentNumLimit" :step="1" v-model="info.org.student_num_limit"></InputNumber>
        </Form-item>
        <Form-item label="类型" prop="org_type" class="col-md-6 pr-4 custom-form-item-required" v-if="allow_sub_org_type">
        	<RadioGroup v-model="info.org.org_type" @on-change="orgTypeChange">
                <Radio :label="2">督导沟通版</Radio>
                <!-- <Radio :label="1">正式版</Radio> -->
            </RadioGroup>
        </Form-item>
        <Form-item label="到期日期" prop="expire_day" class="col-md-6 pr-4 custom-form-item-required" v-if="modal.action=='add'&&(!allow_sub_org_type||(allow_sub_org_type&&info.org.org_type == 1))">
        	<DatePicker 
            	type="date" 
            	:value="info.org.expire_day" 
            	:transfer="true"
            	style="width:210px"
            	:options="options"
            	@on-change="info.org.expire_day = $event"
            	placeholder="请选择到期日期">
            </DatePicker>
        </Form-item>
    </Form>
</template>
<script>
    import util from '@/libs/util'
    import pinyin from '@/libs/pinyin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [globals],
		props: {
			info: {
				type: Object,
				default() {
					return {}
				}
			},
			modal: {
				type: Object,
				default() {
					return {}
				}
            },
            edit: {
                type: Boolean,
                default: false
            }
		},
		data() {
			return {
				options: {
                    disabledDate (date) {
                        return date && date.valueOf() < Date.now() - 86400000;
                    }
                }
			}
        },
        mounted() {
            if(!this.edit) {
                this.getUrlPrefix();
            }
        },
        methods: {
            getUrlPrefix() {
                this.$http.get('configs',{
                    params: {
                        cfg_name: 'franchisee_params'
                    }
                })
                .then(res => {
                    let fc_prefix = res.body.data.cfg_value.fc_prefix;
                    if(!fc_prefix) {
                        fc_prefix = 'smart'
                    }
                    this.info.org.host = fc_prefix + (this.info.org.contract_no ? this.info.org.contract_no:'')
                },res => {
                    this.$Message.error(res.body.message)
                })
            },
            orgTypeChange(value) {
                if(value == 1) {
                    this.info.org.student_num_limit = 200;
                }
                else {
                    this.info.org.student_num_limit = 10;
                }
            },
            accountInput(){
                let host = ''
                host = pinyin.getFirstFull(this.info.org.org_name)
                this.info.org.host = host
            }
        },
		computed: {
            product_url() {
                return this.$store.state.user.info.product_url.split('//')[1]
            },
            append() {
                return util.sprintf('.%s',this.product_url)
            },
            allow_sub_org_type(){
                return this.modal.action=='add' && this.$store.state.client.allow_sub_org_type == 1
            },
            orgStudentNumLimit(){
                let limit = 100
                if(this.allow_sub_org_type){
                    limit = 1 
                }
                return limit
            }
		}
	}
</script>