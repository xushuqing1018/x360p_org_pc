<template>
	<Form ref="form_user" clearable="true" :model="info.user" :label-width="100">
    	<div class="row">
        	<Form-item label="账号" class="col-md-6 pr-4 custom-form-item-required" prop="account">
                <Input type="text" value="" autocomplete="off" v-model="info.user.account" placeholder="请输入账号"></Input>
            </Form-item>
            <div class="ivu-form-item col-md-6 pr-4">
                <label class="ivu-form-item-label" style="width:40px;"></label>
                <div class="ivu-form-item-content">
                    <Button type="info" size="small" @click="accountInput('pinyin')">拼音</Button>
                    <Button type="info" size="small" @click="accountInput('mobile')">手机号</Button>
                </div>
            </div>
            <Form-item label="密码" class="col-md-6 pr-4 custom-form-item-required" prop="password">
                <Input type="text" value="" autocomplete="off" v-model="info.user.password" placeholder="请输入密码"></Input>
            </Form-item>
            <div class="ivu-form-item col-md-6 pr-4">
                <label class="ivu-form-item-label" style="width:40px;"></label>
                <div class="ivu-form-item-content">
                    <Button type="info" size="small" @click="info.user.password = random(6)">随机</Button>
                    <Button type="info" size="small" @click="info.user.password='123456'">123456</Button>
                    <Button type="info" size="small" @click="info.user.password='888888'">6个8</Button>
                </div>
            </div>
            <Form-item label="账号状态" class="col-md-6 pr-4" prop="status">
	        	<RadioGroup v-model="info.user.status" type="button">
	                <Radio :label="1">正常</Radio>
	                <Radio :label="0">禁用</Radio>
	            </RadioGroup>
	        </Form-item>
        </div>
    </Form> 
</template>
<script>
    import pinyin from '@/libs/pinyin'
    import util from '@/libs/util'
	export default {
		props: {
			info:{
				type:Object,
				default() {
					return {}
				}
			}
        },
        mounted() {
            this.accountInput('mobile');
            this.info.user.password='123456';
        },
		methods: {
			random(length){
                return util.random(length)
            },
            accountInput(type){
                let account = ''
                if(type == 'pinyin'){
                    account = pinyin.getFirstFull(this.info.org.org_name)
                }else{
                    account =  this.info.org[type]
                }

                this.info.user.account = account
            }
		}
	}
</script>
