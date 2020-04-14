<template>
	<Form ref="form_user" clearable="true" class="x-ivu-form" :model="info.user" :label-width="80">
    	<div class="row">
    		<Form-item label="开启账号" class="col-md-12 pr-4">
            	<i-switch 
            	v-model="info.open_account"
            	:true-value="1"
            	:false-value="0"
            	>
			        <Icon type="android-done" slot="open"></Icon>
			        <Icon type="android-close" slot="close"></Icon>
			    </i-switch>
            </Form-item>
    	</div>
        <div v-if="info.open_account === 1">
        	<div class="row">
            	<Form-item label="账号" class="col-md-6 pr-4 custom-form-item-required" prop="account">
                    <Input type="text" value="" autocomplete="off" v-model="info.user.account" placeholder="请输入账号"></Input>
                </Form-item>
                <Form-item label="密码" class="col-md-6 pr-4 custom-form-item-required" prop="password">
                    <Input type="text" value="" autocomplete="off" v-model="info.user.password" placeholder="请输入密码"></Input>
                </Form-item>
            </div>
            <div class="row">
                <div class="ivu-form-item col-md-6 pr-4">
                    <label class="ivu-form-item-label" style="width:80px;">
                    </label>
                    <div class="ivu-form-item-content">
                        <a @click="account_input('pinyin')">拼音</a>
                        <a @click="account_input('mobile')">手机号</a>
                        <a @click="account_input('email')">Email</a>
                    </div>
                </div>
                <div class="ivu-form-item col-md-6 pr-4">
                    <label class="ivu-form-item-label" style="width:80px;">
                    </label>
                    <div class="ivu-form-item-content">
                        <a @click="info.user.password = random(6)">随机</a>
                        <a @click="info.user.password='123456'">123456</a>
                        <a @click="info.user.password='888888'">6个8</a>
                    </div>
                </div>
            </div>
            <Form-item label="账号状态" class="col-md-6 pr-4" prop="status">
            	<Radio-group v-model="info.user.status">
	                <Radio label="1">正常</Radio>
	                <Radio label="0">禁用</Radio>
	            </Radio-group>
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
		methods: {
			random(length){
                return util.random(length)
            },
            account_input(type){
                let account = ''
                if(type == 'pinyin'){
                    account = pinyin.getFirstFull(this.info.employee.ename)
                }else{
                    account =  this.info.employee[type]
                }

                this.info.user.account = account
            }
		}
	}
</script>
