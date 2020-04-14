<template>
	<Modal v-drag-modal :mask-closable="false" width="600" v-model="modal$.show" :title="modal$.title">
		<Button class="sms-record-btn" type="ghost" @click="getWXHistory">微信发送记录</Button>
		<Form ref="form" :model="info" :label-width="80">
			<Form-item label="接收类型">
				<RadioGroup type="button" v-model="sendType" @on-change="typeChange">
					<Radio :label="0">外部</Radio>
					<Radio :label="1">内部</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="微信模板" class="custom-form-item-required">
				<Select v-model="info.wtd_id" @on-change="selectTpl">
					<Option v-for="item in wx_tpls" :value="item.wtd_id">{{item.name}}</Option>
				</Select>
			</Form-item>
			<Form-item label="接收对象" class="custom-form-item-required" v-help="'接收对象必须绑定微信'">
				<select-employee 
					v-model="select.eids" 
					@on-selected="selectEmployee" 
					v-if="sendType>0">
					<Button type="ghost" size="small">选员工{{eNums||''}}</Button>
				</select-employee>
				<select-student 
					v-model="select.sids" 
					@on-selected="selectStudent"
					v-else>
					<Button type="ghost" size="small">选学员{{sNums||''}}</Button>
				</select-student>
			<Table 
				class="sms-fixed-table" 
				height="250" 
				:columns="columns" 
				:data="info.data" 
				no-data-text="请选择接收对象">
			</Table>
			</Form-item>
			<Form-item label="发送内容" class="custom-form-item-required">
				<div class="wx-send-content" v-if="info.wtd_id>0">
					<div class="line">
						<span>首行：</span>
						<Input v-model="wx_tpl_define.first"></Input>
					</div>
					<div class="line" v-for="item in wx_tpl_define.data">
						<span>{{item.key}}：</span>
						<Input v-model="item.value" :placeholder="item.placeholder"></Input>
					</div>
					<div class="line">
						<span>备注：</span>
						<Input v-model="wx_tpl_define.remark"></Input>
					</div>
					<div class="line">
						<span>链接：</span>
						<select-system-link v-model="wx_tpl_define.url" :forbid-type="['pc']"></select-system-link>
					</div>
				</div>
				<p v-else>请选择微信模板</p>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="send">发送</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectSystemLink from 'c%/SelectSystemLink.vue'

	const emptyObject = {
		type: 2,
		data: [],
		wtd_id: 0,
		content: {}
	}

	export default {
		mixins: [modal,common],
		components: {
			SelectEmployee,
			SelectStudent,
			SelectSystemLink
		},
		data() {
			return {
				info: util.copy(emptyObject),
				wx_tpls: [],
				wx_tpl_define: {},
				select: {
					eids: [],
					sids: []
				},
				sendType: 0,
				columns: [
					{
						title: '姓名',
						width: 140,
						key: 'name',
						render: (h,params) => {
							let map = {sid: '#19be6b',cu_id: '#2d8cf0',mcl_id: '#13c2c2'}
							let id_key = this.getIdKey(params)
							return h('span',{
								style: {
									color: map[id_key] || '#657180'
								}
							},params.row.name)
						}
					},
					{
						title: 'openid',
						key: 'openid'
					},
					{
						title: '操作',
						key: 'del',
						width: 80,
						render: (h,params) => {
							return h('Button',{
								props: {
									type:"ghost",
									size:"small", 
									shape:"circle", 
									icon:"ios-trash",
								},
								on: {
									click:() => {
										let id_key = this.getIdKey(params)
										let index = this.info.data.findIndex(item => item[id_key] === params.row[id_key])
										this.info.data.splice(index,1)
									}
								}
							})
						}
					}
				]
			}
		},
		computed: {
			sNums() {
				return this.info.data.filter(item => item.sid > 0).length
			},
			eNums() {
				return this.info.data.filter(item => item.eid > 0).length
			}
		},
		methods: {
			getWXHistory() {
				this.$Modal.open('app/modal/wx-record-modal.vue')
				.then(modal => {
					modal.show('微信发送记录')
				})
			},
			getSmsTplDefines() {
				this.$rest('wechat_tpl_defines')
				.get({
					pagesize:100,
					bid:-1
				})
				.success(res => {
					this.wx_tpls = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			typeChange(v) {
				this.info.data.splice(0)
			},
			getIdKey(params) {
				let keys = Object.keys(params.row),id_key = ''
				for(let i=0,len=keys.length;i<len;i++) {
					if(keys[i].indexOf('id') > -1) {
						id_key = keys[i]
						break;
					}
				}
				return id_key
			},
			selectTpl(v) {
				let tpl = this.wx_tpls.find(item => item.wtd_id == v)
				this.wx_tpl_define = {}
				this.wx_tpl_define.first = tpl.tpl_define.first[0]

				this.wx_tpl_define.data = []
				tpl.tpl_define.data.forEach(d => {
					let field = d.field.replace(/[\{\}]/g,'')
					this.wx_tpl_define.data.push({
						key: field,
						placeholder: d.label,
						value: ''
					})
				})

				this.wx_tpl_define.remark = tpl.tpl_define.remark[0]
				this.wx_tpl_define.url = ''
			},
			delItem(item) {
				this.info.data.splice(index,1)
			},
			selectStudent(items) {
				items.forEach(item => {
					let index = this.info.data.findIndex(i => i.sid == item.sid)
					if(index === -1 && item.first_openid !== '') {
						this.info.data.push({
							sid: item.sid,
							openid: item.first_openid,
							name: item.student_name
						})
					}
				})
			},
			selectEmployee(items) {
				items.forEach(item => {
					let index = this.info.data.findIndex(i => i.eid == item.eid)
					if(index === -1 && item.openid !== '') {
						this.info.data.push({
							eid: item.eid,
							openid: item.openid,
							name: item.ename
						})
					}
				})
			},
			check() {
				this.info.content = {}
				let isCheck = true, isValid = true
				for(let key in this.wx_tpl_define) {
					if(key == 'data') {
						this.wx_tpl_define[key].forEach(d => {
							this.info.content[d.key] = d.value
							if(isCheck && d.value === '') {
								isCheck = false
							}
							if(isValid && d.value.length>50) {
								isValid = false
							}
						})
					}else{
						let value = this.wx_tpl_define[key]
						this.info.content[key] = value
						if(key !== 'url') {
							if(isCheck && value === '') {
								isCheck = false
							}
							if(isValid && value.length>50) {
								isValid = false
							}
						}
					}
				}
				
				if(this.info.wtd_id == 0) {
					this.$Message.error('请先选择微信模板')
					return false;
				}
				if(this.info.data.length===0) {
					this.$Message.error('请选择接受对象')
					// return false;
				}
				if(!isCheck) {
					this.$Message.error('发送内容有空值')
					return false;
				}
				if(!isValid) {
					this.$Message.error('发送内容有超过50个字符')
					return false;
				}
				return true 
			},
			send() {
				if(!this.check()) {
					return;
				}
				this.$rest('message_group_historys')
				.post(this.info)
				.success(re => {
					this.$Message.success('已加入发送队列，请稍后在微信记录中查询')
				})
				.error(res => {
					this.$Message.error(re.body.message)
				})
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					this.info = util.copy(emptyObject)
					if(this.wx_tpls.length === 0) {
						this.getSmsTplDefines()
					}
				}
			}
		}
	}
</script>
<style lang="less">
	.sms-fixed-table.ivu-table-wrapper {
		min-height: 250px;
		margin-top: 6px;
	}
	.wx-send-content {
		.line {
			display: flex;
			margin-bottom: 6px;
			text-align: center;
			>span{
				flex: 0 0 120px;
			}
			>div{
				flex: 1;
			}
		}
	}
</style>