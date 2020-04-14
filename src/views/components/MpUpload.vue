<template>
	<Button :size="btnSize" :type="btnType" @click="openModal" :icon="icon"><slot>{{btnText}}</slot>
		<Modal v-drag-modal :mask-closable="false" v-model="modal" :title="modalTitle" @on-cancel="closeModal">
            <Steps :current="step">
                <Step title="进入公众号" icon="ios-people"></Step>
                <Step title="发送媒体文件" icon="paper-airplane"></Step>
                <Step title="等待处理" icon="loop"></Step>
                <Step title="上传完成" icon="checkmark-circled"></Step>
            </Steps>
            <div class="import-wrap">
                <div class="down-desc" v-if="step==0">
		    		<p><strong>进入公众号提示</strong></p>
		    		<span>您可以通过扫描二维码进入公众号或搜索公众号名称 <code v-if="mpname != ''">{{mpname}}</code> 进入</span>
                    <div class="qrcode-img" v-if="qrcode_url != ''">
                        <img :src="qrcode_url">
                    </div>
		    		<div v-if="!isWeixinBind">
		        		<Alert type="error">检测到您的账号未绑定微信，点击确定去个人设置绑定！</Alert>
						<button @on-ok="$router.push({path:'/profile'})">确定</button>
					</div>
		    	</div>
		    	<div class="down-desc" v-if="step==1">
		    		<p><strong>发送媒体文件</strong></p>
		    		<span>在公众号的聊天对话框中，直接发送语音或小视频给公众号，稍后系统会自动将文件传送到这个界面来</span>
		    	</div> 
		    	<div class="down-desc" v-if="step==2">
		    		
		    		<span>公众号已收到您发送的文件,后台正在处理您发送的媒体文件，请耐心等待，不要关闭窗口!</span>

		    		<Alert>{{business.status}}:{{business.msg}}</Alert>
		    	</div> 
		    	<div class="down-desc" v-if="step==3">
		    		<p><strong>上传完成</strong></p>
		    		<p>文件URL:{{business.file_url}}</p>
		    		<p>可直接右上角关闭窗口</p>
		    	</div> 
            </div>
            <div slot="footer">
                <div v-if="step != 3">
                    <Button :disabled="prev_disabled" @click="go_prev" v-if="step > 0">上一步</Button>
                    <Button type="primary" :disabled="next_disabled" @click="go_next">下一步</Button>
                </div>
            </div>
        </Modal>
	</Button>
</template>

<script>
import globals from '../../libs/globals.mixin'

export default {
		name:'MpUpload',
		mixins: [globals],
		props:{
			btnSize:{
				type:String,
				default:'small'
			},
			btnType:{
				type:String,
				default:'primary'
			},
			icon:{
				type:String,
				default:'upload'
			},
			btnText:{
				type:String,
				default:'公众号上传媒体文件'
			},
			modalTitle:{
				type:String,
				default:'通过公众号上传媒体文件'
			}
		},
        data () {
        	return {
	        	modal:false,
	            step:0,
	            prev_disabled:false,
	            next_disabled:false,
	            business:{
	            	file_url:'',
	            	file_type:'',
	            	status:0,
	            	msg:''
	            }
	        }
        },
        created () {        	
			this.initGlobal('configs')
        },
        methods:{
        	create_session(){
        		this.$ws.sendEvent('create_business_session',this.bsData)
                if(!this.$options.sockets.onmessage){
            		this.$options.sockets.onmessage = (event)=>{
    			      let data = JSON.parse(event.data)
    			      if(data.event == 'push_media:status'){
    			        this.push_media_status(data.data)
    			      }
    			    }
                }
        	},
        	end_session(){
        		this.$ws.sendEvent('finish_business_session',this.bsData)
        	},
        	push_media_status(session){
        		this.business.status = session.status
        		if(session.status > 0 && session.status < 100){
        			this.step = 2
        			this.business.msg = session.msg
        			this.business.status = session.status
        			this.next_disabled = true
        			this.prev_disabled = true
        		}else if(session.status == 100){
        			//完成
        			this.$emit('on-upload-finish',session.data)
        			this.business.file_url = session.data.file_url
        			this.business.file_type = session.data.file_type
        			this.business.status = 2

        			this.step = 3
        			this.next_disabled = true
        			this.prev_disabled = true
        		}
        	},
        	openModal(){
            	this.create_session()
                this.modal = true
                this.reset_data()
            },
            closeModal(){
            	this.modal = false
            	this.end_session()
            },
            reset_data(){
                this.step = 0
                this.next_disabled = false
                this.prev_disabled = false                
                this.business.file_url = ''
                this.business.file_type = ''
                this.business.status = 0
                this.business.msg = ''
            },
           
            go_step(step){
                this.step = step
                if(step == 0){
                    this.reset_data()
                }
            },
            go_prev(){
                this.step = this.step - 1
                if(this.step == 0){
                    this.next_disabled = false
                }
                if(this.step == 1){
                    this.next_disabled = true
                }
            },
            go_next(){
                if(this.step == 0){
                    this.step = this.step+1
                } 
                if(this.step == 1){
                    this.next_disabled = true
                }
            }
        },
        computed:{
        	isWeixinBind(){
        		return this.$store.state.user.info.is_weixin_bind
        	},
        	bsData(){
        		return {
        			uid:this.$store.state.user.info.uid,
        			token:this.$store.state.user.token,
        			bs_type:'push_media'
        		}
        	},
            qrcode_url(){
                return this.$store.state.gvars.configs?this.$store.state.gvars.configs.wxmp.qrcode_url:''
            },
            mpname(){
                return this.$store.state.gvars.configs?this.$store.state.gvars.configs.wxmp.name:''
            }
        }
}
</script>