<template>
	<Modal v-drag-modal :mask-closable="false" width="600" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<template v-if="modal$.show">
        	<Form :label-width="80" ref="form" :model="post" class="sms-tpl-info">
        		<Form-item prop="mobile" label="手机号" class="required-icon">
        			<Input v-model="post.mobile" placeholder="请输入被发送手机号"></Input>
        		</Form-item>
				<!--
        		<Form-item prop="data" label="数据值" class="required-icon">
        			<Input 
        				class="mb-2" 
        				v-model="post.tpl_data[key]" 
        				placeholder="请输入变量" 
        				v-for="(value,key) in post.tpl_data"
						:key="key"
						>
        				<span slot="prepend">{{key}}{{value}}</span>
        			</Input>
        		</Form-item>
				-->
				<Form-item prop="data" label="短信内容" class="required-icon">
        			<div class="sms-content" v-if="texts.length > 0">
						<span v-for="(item,index) in texts" :key="index">
							<template v-if="item.type == 'text'">
								{{item.text}}
							</template>
							<template v-if="item.type == 'input'">
								<input type="text" 
								v-model="post.tpl_data[item.v]" 
								class="sms-input-val-input"
								:placeholder="'请输入:变量'+item.v"
								>
							</template>
						</span>
					</div>
					<Input v-else type="textarea" v-model="post.content"></Input>
        		</Form-item>
        	</Form>
        </template>
	    
    	<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" :loading="saving" @click="ok">确定</Button>
        </div>
    </Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'

	const emptyObject = {
		tpl_id: 0,
		tpl_data: {},
		mobile: '',
		content:''
	}

	const VREG = /\{[^\}]+\}/g
	export default{
		mixins:[modal,common],
		data () {
			return {
				info: {},
				post: util.copy(emptyObject),
				texts:[]
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					this.init_post_data()
					this.build_text_input()
				}
			}
		},
		methods: {
			init_post_data(){
				this.post = util.copy(emptyObject)
				this.post.std_id = this.info.std_id
				this.post.tpl_id = this.info.tpl_id
				this.post.tpl    = this.info.apply_tpl
				this.info.tpl_define.forEach(item => {
					if(this.post.tpl.indexOf('{'+item.r+'}') !== -1){
						this.post.tpl_data[item.r] = ''
					}
				})
			},
			build_text_input(){
				let texts = []
				let vreg = VREG
				let matches = this.info.apply_tpl.match(vreg)

				function build_node(input,type){
					if(type == 'text'){
						return {
							type:type,
							text:input
						}
					}
					return {
						type:type,
						v:input.replace(/[\{\}]/g,'')
					}
				}

				if(!matches){
					texts.push(this.info.apply_tpl,'textarea')
				}else{
					if(matches.length > 0){
						let pos = 0;
						let t = this.info.apply_tpl
						matches.forEach(m=>{
							let p = t.indexOf(m)
							let len = p - pos
							
							texts.push(build_node(t.substr(pos,len),'text'))
							texts.push(build_node(t.substr(p,m.length),'input'))
							pos = p + m.length
						})
						if(pos <= t.length-1){
							texts.push(build_node(t.substr(pos,t.length - pos),'text'))
						}
					}
				}

				this.texts = texts
			},
			complie_sms_content(tpl,tpl_data){
				let vreg = VREG
				let matches = tpl.match(vreg)

				if(!matches){
					return tpl
				}

				let content = tpl
				let data = tpl_data

				matches.forEach(m=>{
					let v = m.replace(/[\{\}]/g,'')
					content = content.replace(m,data[v])
				})

				return content
			},
			ok () {
				if(this.post.mobile === '') {
					this.$Message.error('手机号不能为空')
					return false
				}else{
					if(!/^\d{8,11}$/.test(this.post.mobile)) {
						this.$Message.error('手机号格式错误')
						return false
					}
				}
				if(!_.isEmpty(this.post.tpl_data)){
					for(let o in this.post.tpl_data){
						if(this.post.tpl_data[o] == ''){
							this.$Message.error('请输入变量:'+o)
							return false
						}
					}
					this.post.content = this.complie_sms_content(this.post.tpl,this.post.tpl_data)
				}

				this.$rest('messages/send_sms')
				.post(this.post)
				.success(res => {
					this.$Message.success('发送成功')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>
<style lang="less">
	.ivu-form-item.required-icon{
		>label.ivu-form-item-label:before {
		    content: "*";
		    display: inline-block;
		    margin-right: 4px;
		    line-height: 1;
		    font-family: SimSun;
		    font-size: 12px;
		    color: #f30;
		}
	}
	.sms-content{
		padding:10px;
		border:1px solid #f2f2f2;
		border-radius:5px;
	}
	.sms-input-val-input{
		border:none;
		border-bottom:1px solid #f2f2f2;
		line-height:20px;
		height:20px;
		min-width:140px;
	}
</style>
