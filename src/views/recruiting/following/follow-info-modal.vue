<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" @on-cancel="cancel" :title="modal$.title" width="850">
		<template v-if="modal$.show">
			<Row class="mb-3" type="flex" justify="center" align="middle" v-if="list.length>0">
				<Col span="4">
					<span>
						上一位：
						<span class="text-info cursor" v-if="customerInfo._prev" @click="prevCustomer">{{customerInfo._prev.name}}</span>
						<span v-else>无</span>
					</span>
				</Col>
				<Col span="16">
					<Card>
						<div class="col-md-12 row">
							<div class="col-md-6">
								客户姓名：
								<span @click="showCustomerInfo()" class="text-info cursor" title="点击查看客户详情">
								<Icon :type="map_sex[customerInfo.sex].icon"></Icon> {{customerInfo.name}}</span> 
								<span style="font-size: 12px;">· {{getAge(customerInfo)}}</span>
							</div>
							<div class="col-md-6">手机号：{{customerInfo.first_tel}}</div>
							<div class="col-md-6">招生来源：{{labelDicts(customerInfo.from_did,'from')}}</div>
							<div class="col-md-6">跟进次数：{{customerInfo.follow_times}}</div>
						</div>
					</Card>
				</Col>
				<Col span="4" class="text-right">
					<span>
						下一位：
						<span class="text-info cursor" v-if="customerInfo._next" @click="nextCustomer">{{customerInfo._next.name}}</span>
						<span v-else>无</span>
					</span>
				</Col>
			</Row>
			<Alert show-icon v-if="list.length>0">
				无效号码？点击此处
				<code class="cursor text-info" @click="delCustomer">删除并跟进下一位</code>
				即可删除此客户，删除后将无法恢复，请谨慎操作！
			</Alert>
			<div class="text-center" v-if="customerInfo.is_public==0">
				<RadioGroup v-model="tabs" type="button" size="small" class="mb-3">
			        <Radio label="basic_information">沟通信息</Radio>
			        <Radio label="follow_record">沟通历史</Radio>       
			    </RadioGroup>
		    </div>
			<div v-show="tabs=='basic_information'&&showInfoTab">					
				<follow-info-tab 
					ref="ref_follow_up" 
					:cu-id="cu_id" 
					:modal="modal$" 
					:info="info" 
					@on-success="handleSuccess">
				</follow-info-tab>
			</div>
			<div v-if="cu_id>0&&tabs=='follow_record'">
				<follow-up-record-tab 
					@on-success="handleSuccess" 
					ref="ref_record" 
					:cu-id="cu_id" 
					:is-public="customerInfo.is_public">
				</follow-up-record-tab>	
			</div>		
			
			<div slot="footer">
				<Button type="ghost" @click="cancel" v-if="tabs=='follow_record'">关闭</Button>
				<template v-else>
					<Button type="ghost" :disabled="saving" @click="cancel">取消</Button>
					<Button type="primary" :loading="saving" @click="ok(false)">确定</Button>
					<Button type="primary" :loading="saving" @click="ok(true)" v-if="customerInfo._next&&token==''">保存并下一个</Button>
				</template>
			</div>
		</template>	
	</Modal>	
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import followInfoTab from './follow-info-tab.vue'
	import followUpRecordTab from './follow-record-tab.vue'
	
	const emptyObject = {	
		bid: 0,
		cu_id: 0,				//客户ID
		is_connect: 1,			//是否有效沟通0：无效， 1：有效
		followup_did: 0,		//跟进方式 字典ID（QQ、电话等）
		content: '',			//跟进内容
		is_promise: 0,			//是否承诺到访
		promise_did: 0,			//承诺到访类型 字典ID
		promise_int_day: '', 	//承诺到访日期
		is_visit: 0,			//是否到访
		visit_int_day: '',		//实际到访日期
		next_follow_time: '', 	//下次跟进日期  0为待定
		intention_level: 0,		//意向级别
		customer_status_did: 0,  //客户状态字典ID	
		is_sync_mc: 1,
		mcl_id: 0				//市场名单id
	}
	
	export default{
		mixins: [modal,common],		
		components: {
			followInfoTab,
			followUpRecordTab
		},
		props: {
			list: {
				type: Array,
				default: () => {
					return []
				}
			},
			pageSize: {
				type: Number,
				default: () => {
					return 0
				}
			},
			token: {
				type: String,
				default: ''
			}
		},
		data () {
			return {
				tabs: 'basic_information',
				cu_id: 0,
				customerInfo: {},
				currentIndex: 0,
				info: util.copy(emptyObject),
				saveAndNext: false,
				turnType: 'next',
				refreshListByPage: true,
				map_sex: {0:{icon:'help',text:'未设置'}, 1:{icon:'male',text:'男'},2:{icon:'female',text:'女'}}
			}
		},	
		watch: {
			'list':function(list) {
				if(list.length == 0) {
					return
				}
				if(this.refreshListByPage){
					if(this.turnType == 'next') {
						this.currentIndex = 0
					}else{
						this.currentIndex = this.pageSize - 1
					}
					this.customerInfo = util.copy(list[this.currentIndex])
				}
			},
			customerInfo(val,oldVal){
				this.cu_id = val.cu_id
				this.info.followup_did = 122
				this.info.cu_id = val.cu_id
				this.info.mcl_id = val.mcl_id
				this.info.intention_level = val.intention_level
				this.info.customer_status_did = val.customer_status_did
			}
		},
		computed: {
			showInfoTab () {
				//添加时，或者客户为公海客户
				return _.isEmpty(this.customerInfo)||(this.customerInfo && this.customerInfo.is_public==0)
			}
		},
		methods: {
			showCustomerInfo () {
				this.$Modal.open('components/CustomerInfoModal.vue@modal',{
					props: {
						info: this.customerInfo
					}
				}).then(modal=>{
					modal.show(`查看客户【${this.customerInfo.name}】详情`)
				})
			},
			getAge (item) {
				return util.age(item.birth_time)
			},
			prevCustomer() {
				this.turnType = 'prev'
				if(this.customerInfo._prev) {
					let index = --this.currentIndex
					if(index < 0) {
						this.refreshListByPage = true
						this.$emit('on-prevpage')
						this.currentIndex = 0
						return
					}
					this.customerInfo = util.copy(this.list[index])
				}
			},
			nextCustomer() {				
				this.turnType = 'next'
				if(this.customerInfo._next) {
					let index = ++this.currentIndex
					if(index >= this.pageSize) {
						this.refreshListByPage = true
						this.$emit('on-nextpage')
						this.currentIndex = 0
						return
					}
					this.customerInfo = util.copy(this.list[index])
				}
			},
			//添加记录成功后刷新列表
			handleSuccess () {
				this.$emit('on-success')
				
				if(this.saveAndNext){
					this.refreshListByPage = false
					this.nextCustomer()
				}else{
					this.cancel()
				}
			},
			isBeforeNow (val) {
				if(val!=0&&moment(val).add(1,'days').isBefore(moment(new Date()))){
					this.$Message.error('所选时间不能小于当前时间')
					return true
				}
				return false
			},
			ok (saveAndNext) {
				if(typeof saveAndNext != 'undefined'){
					this.saveAndNext = saveAndNext					
				}
				this.$r('ref_follow_up').submit(this.token)	
			},
			cancel () {
				this.info = util.copy(emptyObject)
				if(this.$refs['ref_follow_up']){
					this.$r('ref_follow_up').reset()					
				}
				this.close()
			},
			delCustomer () {
				this.confirm(`确认将【${this.customerInfo.name}】删除?删除后将无法恢复,请您谨慎操作!`)
				.then(()=>{
					this.$rest('customers/confirmUselessCustomer').post({
						cu_id: this.customerInfo.cu_id
					}).success(data=>{
						this.$Message.success('操作成功！')
						this.nextCustomer()
					}).error(response=>{
						this.error(response.body.message||'操作失败~')
					})
				})
			}
		}
	}
</script>
