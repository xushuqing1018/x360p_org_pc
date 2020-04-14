<template>
	<div ref="dragEl" class="x-call-container" :class="callClass" v-if="enableWebCall" v-drag>
		<div class="normal">
			<div class="x-call-left call-member">
				<span class="name">{{caller.info.name?caller.info.name:caller.info.account}}</span>
				<div class="avatar">
					<avatar size="small" icon="person" :src="caller.info.avatar"></avatar>
					<Icon title="隐藏并清除拨号信息" @click.native="clearAndClose" class="avatar-icon" type="minus-circled"></Icon>
				</div>
				<Dropdown v-if="config_caller_number">
					<span>
						{{caller_phone}}
						<Icon type="arrow-down-b"></Icon>
					</span>
					<DropdownMenu slot="list">
						<DropdownItem @click.native="caller_phone=caller.info.mobile">{{caller.info.mobile}}</DropdownItem>
						<DropdownItem @click.native="caller_phone=config_caller_number">{{config_caller_number}}</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				<span v-else>{{caller_phone}}</span>
			</div>
			<div class="x-call-center">				
				<img :src="callStatusImg">
				<span>{{mapStatus[callStatus]}}</span>
			</div>
			<div class="x-call-right call-member">
				<span class="tel">{{receiver.tel}}</span>
				<div class="avatar">
					<avatar size="small" icon="person" :src="receiver.photo_url"></avatar>
					<img @click="emitEvent" class="avatar-icon" :src="operateIcon"/>
				</div>
				<span class="name cursor" @click="chocoseReceiver">
					{{receiver.name}}
					<Icon type="arrow-down-b"></Icon>
				</span>
			</div>
		</div>
		<div class="minimize" @click.stop="toggle">
			<Icon type="ios-telephone"></Icon>
		</div>
		<div style="display: none;">
			<select-customer ref="customer" @on-selected="setReceiver"></select-customer>
			<select-student ref="student" @on-selected="setReceiver"></select-student>
			<select-market ref="market" @on-selected="setReceiver"></select-market>
		</div>
	</div>
</template>

<script>
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import drag from '@/libs/drag.directive'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectCustomer from 'c%/SelectCustomer.vue'
	import SelectMarket from 'c%/SelectMarket.vue'
	
	const emptyObject = {
		name: '请选择',
		tel: 'xxxxxxxxxxx',
		photo_url:''
	}
	
	export default{
		mixins: [ common,modal ],
		directives: {
			drag
		},
		props: {
			caller: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		components: {
			SelectStudent,
			SelectCustomer,
			SelectMarket
		},
		data () {
			return {
				row: {},
				//0：请选择，1:拨号中，2：已结束
				callStatus: '0',		
				//market、customer、student
				mapStatus: {'0':'请选择...','1':'连线中...','2':'已结束'},
				sence: 'customer', 	
				receiver: util.copy(emptyObject),
				interval: null,
				recordTime: 0,
				token: '',
				caller_phone: ''
			}
		},
		mounted() {
			this.caller_phone = this.caller.info.mobile
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {
					this.$refs.dragEl.style.transition = 'all .3s'
					this.$refs.dragEl.style.top = 0
					
					setTimeout(()=>{
						this.$refs.dragEl.style.transition = ''
					},300)
				}
			}
		},
		computed: {
			callStatusImg () {
				let img = `call-status-${this.callStatus}.png`
				if(this.callStatus==1){
					img = `call-status-${this.callStatus}.gif`
				}
				
				return `http://sp1.xiao360.com/static/img/${img}`
			},
			operateIcon () {
				return `http://sp1.xiao360.com/static/img/call-${this.sence}.png`
			},
			callClass () {
				return {
					'min': !this.modal$.show
				}
			},
			enableWebCall(){
				return this.hasPer('app.webcall')
			},
			config_caller_number() {
				return this.$store.state.gvars.configs.app_webcall.calling_number
			}
		},
		methods: {
			clearAndClose () {
				this.callStatus = '0'
				this.receiver = util.copy(emptyObject)
			},
			setCallParams (sence,callback,row) {
				if(this.callStatus == 1){
					this.$Notice.warning({
	                    title: '通话提示',
	                    desc: '当前通话未结束，请在通话结束后在试.'
	                })
					return
				}
				
				this.sence = sence
				this.operateFunc = callback||callback()
				this.setReceiver(row)
				this.show('')
			},
			//接收点击操作时的方法
			operateFunc () {
				
			},
			makeCall (id) {
				//callee_type:1市场名单 ,2客户,3学生
				let params = {
					phone: this.receiver.callee_type == 3 ? this.receiver.real_tel : this.receiver.tel,
					caller_phone: this.caller_phone,
					callee_type: this.receiver.callee_type,
					app_ename: 'webcall'
				}
				this.token = ''
				this.changeCallStatus(1)
				this.$rest('webcall_call_logs').post(Object.assign({},params,id))
				.success(response=>{
					this.token = response.data.token
					this.getCallStatus()
				}).error(response=>{
					this.callStatus = 3
					this.error(response.body.message)
				})
			},
			getCallStatus () {
				if(this.callStatus!=1){
					return
				}				
				
				if(this.interval){ window.clearTimeout(this.interval) }
				
				this.interval = setTimeout(()=>{
					this.$rest(`webcall_call_logs/call_status?token=${this.token}`)
					.get()
					.success(data=>{
						if(data.reasoncode != -10){
							this.changeCallStatus(2)
						}else{
							this.getCallStatus()
						}						
					}).error(response=>{
						this.$Message.error(response.body.message||'获取拨号状态失败~')
					})
				},2000)
			},
			emitEvent () {
				if(_.isEmpty(this.row)){
					return
				}
				
				if(this.sence=='customer'){
					this.$Modal.open('recruiting/following/follow-info-modal.vue',{
						props: {
							token: this.token
						},
						on:{
							'on-success':()=>{
								this.operateFunc()
							}
						}
					})
					.then(modal=>{
						modal
						.set('cu_id',this.row.cu_id)
						.set('customerInfo',this.row)
						.show(`添加跟进记录【${this.row.name}】`,'add')
					})
				}else if(this.sence == 'student') {
					this.$Modal.open('service/aclass/visit/info-modal.vue',{
						props: {
							token: this.token
						}
					})
					.then(modal=>{
						modal
						.set('sid',this.row.sid)
						.show(`添加【${this.row.student_name}】回访`,'add')
					})
				}else{
					this.$Modal.open('recruiting/market/validation-single.vue@modal',{
						props: {
							token: this.token
						},
						on:{
							'on-success': ()=>{
								this.operateFunc()
							}
						}
					})
					.then(modal=>{
						modal.set('info',this.row)
						.show(`确认【${this.row.name}】有效性`,'add')
					})	
				}
				
			},
			//status: 0：请选择，1:连线中，2：已结束
			changeCallStatus (status) {
				this.callStatus = status
			},
			toggle () {
				if(this.modal$.show){
					this.close()
				}else(
					this.show('')
				)
			},
			chocoseReceiver () {
				let ref = this.sence 
				this.$refs[ref].openModal()				
			},
			setReceiver (selected) {
				let sence = this.sence				
				let id = {}
				if(this.callStatus == 1){
					this.$Notice.warning({
	                    title: '通话提示',
	                    desc: '当前通话未结束，请在通话结束后在试.'
	                })
					return
				}
				this.row = selected
				
				if(sence=='customer'){
					this.receiver.name = selected.name
					this.receiver.photo_url = selected.photo_url
					this.receiver.tel = selected.first_tel
					this.receiver.callee_type = 2
					id = {'cu_id':selected.cu_id}

				}else if(sence=='student'){
					this.receiver.name = selected.student_name
					this.receiver.photo_url = selected.photo_url
					this.receiver.tel = selected.first_tel
					this.receiver.real_tel = selected.original_first_tel
					this.receiver.callee_type = 3
					id = {'sid':selected.sid}

				}else{
					this.receiver.name = selected.name
					this.receiver.photo_url = selected.photo_url
					this.receiver.tel = selected.tel
					this.receiver.callee_type = 1
					id = {'mcl_id':selected.mcl_id}

				}
				
				this.makeCall(id)				
			}
		}
	}
</script>

<style lang="less" scoped>
.x-call-container{
    position: fixed !important;
    left: calc(~"50% - 250px");
    top: 0px;
    width: 500px;
    height: 75px;
    z-index: 99009;
	
	.minimize{
	    position: absolute;
		top: 60px;
		left: 50%;
		margin-left: -12px;
		z-index: 2;
		transition: all .3s;
		width: 30px;
	    height: 30px;
	    background: #fff;
	    text-align: center;
	    border-radius: 50%;
	    box-shadow: 0 0 3px 3px #d0e7ff;
	    line-height: 30px;
        color: #3694fe;
        font-size: 20px;
        cursor: pointer;
	}
	&.min{
		transition: all .3s;
		left: calc(~"50% - 250px") !important;
		top: -75px !important;
		
		.normal{
					    	
		}
		.minimize{
		    top: 65px;
    		transform: rotate(-45deg);
		}
	}
	
	.normal{
		position: absolute;
		z-index: 1;
		top: 0;
		left: 0;
		width: 500px;
		height: 75px;		
		padding: 11px 20px;
		background: #fff;
		box-shadow: 0 0 3px 3px #C9E4FF;
		border-radius: 5px;
	    display: flex;
    	align-items: baseline;
    	transition: all .3s;
	    justify-content: center;
		.call-member {
		    display: flex;
		    align-items: baseline;
		    color: #657180;
		    .avatar{
    	        margin: 0 5px;
	            text-align: center;
	            .avatar-icon{
	            	margin-top: 12px;
	            	color: #FF9125;
	            	font-size: 17px;
	            	cursor: pointer;
	            }
		    }
		    .name {
			    font-size: 12px;
			    width: 48px;
			    white-space: nowrap;
			    text-overflow: ellipsis;
			    overflow: hidden;
			}
		}
		.x-call-left {
			position:relative;
			.ivu-dropdown {
				cursor: pointer;
			}
		}
		.x-call-center{
		    display: flex;
		    flex-direction: column;
		    justify-content: center;
		    align-items: center;
		    margin: 0 20px;
			img{
				margin-bottom: 10px;
			}
		}
		
	}
}
</style>
