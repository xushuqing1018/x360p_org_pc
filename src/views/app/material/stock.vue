<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="600" :mask-closable="false">
		<Form ref="form" :label-width="80" :model="info" :rules="rules" v-if="modal$.show">
			<Form-item label="物品">
				{{name}}
			</Form-item>
			<Form-item label="操作日期" prop="int_day">
				<DatePicker 
	                :value="info.int_day" 
	                placeholder="请选择日期"
	                style="width: 200px;"
	                @on-change="info.int_day = $event"
	                >
	            </DatePicker>
			</Form-item>
			<template v-if="modal$.action=='transfer'">
				<div class="row">
					<div class="col-sm-5">
						<Form-item label="调拨仓库" prop="ms_id">
							<Tag>{{storesName(data[0].ms_id)}}</Tag>
						</Form-item>	
					</div>
					<div class="col-sm-2 text-center">
						<Button 
							title="交换调入调拨仓库位置"
							type="ghost" 
							shape="circle" 
							icon="arrow-swap" 
							@click="transferChange">
						</Button>
					</div>
					<div class="col-sm-5">
						<Form-item label="调入仓库" prop="to_ms_id">
							<Tag>{{storesName(info.to_ms_id)}}</Tag>
						</Form-item>	
					</div>
				</div>
				<Form-item label="调拨数量" prop="num">
					<InputNumber v-model="data[0].num" :step="1" :min="1"></InputNumber>
				</Form-item>					
			
			</template>
			<template v-else>
				<Form-item label="分类" prop="cate" v-if="modal$.action=='out'">
					<Select v-model="info.cate">
						<Option :value="2">领用</Option>
						<Option :value="4">破损</Option>
					</Select>
				</Form-item>
				<Form-item style="max-height:300px;overflow: auto;">
					<table class="modal-table">
						<thead>
							<th><div class="ivu-table-cell">仓库</div></th>
							<th><div class="ivu-table-cell">数量</div></th>
							<tr v-for="item in data">
								<td><div class="ivu-table-cell">{{storesName(item.ms_id)}}</div></td>
								<td>
									<div class="ivu-table-cell">
										<InputNumber v-model="item.num" :step="1" :min="1"></InputNumber>
									</div>
								</td>
							</tr>
						</thead>
					</table>			
				</Form-item>
			</template>
			<Form-item label="备注" prop="remark">
				<Input v-model="info.remark" placeholder="请输入备注"></Input>
			</Form-item>		
			<Form-item label="经手人" prop="">
				{{ename}}
			</Form-item>
		</Form>		
		
		<div slot="footer">
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>	
	import Vue from 'vue'
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	const emptyObject = {
		mt_id: 0,
		ms_id: 0,			//挑拨仓库Id
		to_ms_id: 0,		//入库仓库Id
		num: 0,				//数量
		eid: 0,				//经手人eid
		type: 0,			//1、入库，2、出库
		cate: 0,			//分类：1进货、2领用、3调拔、4报损
		int_day: '',		//操作日期
		remark: ''
	}
	
	export default{
		mixins: [common,modal],
		data () {
			return {
				data: [],
				name: '',
				info: util.copy(emptyObject),
				stores: [],
				rules: {
					int_day:[
						{ required: true, type: 'string', message: '请选择日期', trigger: 'change' }
					]
				}
			}
		},
		methods: {
			transferChange () {
				let temp = util.copy(this.data[0].ms_id)
				this.data[0].ms_id = this.info.to_ms_id
				this.info.to_ms_id = temp
			},
			storesName (ms_id) {
				let store = this.stores.find(s=>s.ms_id===ms_id)
				if(store){
					return store.name
				}
				return ''
			},
			cancel () {
				this.info = util.copy(emptyObject)
				this.$form('form').reset()
				this.close()
			},
			init_post (action) {
				let params = util.copy(this.info)
				Vue.delete(params,'num')
				Vue.delete(params,'ms_id')
				if(action=='in'||action=='out'){					
					Vue.delete(params,'to_ms_id')
				}
				
				params.data = this.data
				
				if(params.data.filter(d=>d.num<1).length>0){
					this.$Message.error('物品数量必须大于0')
					return false
				}
				
				params.eid = this.$store.state.user.info.employee.eid				
				
				return params
			},			
			ok () {
				this.$form('form').check()
				.then(()=>{
					let action = this.modal$.action,
						[method,uri,msg] = ['post','materials/'+this.info.mt_id+'/history','添加成功'],
						params = this.init_post(action)
					if(params){						
						this.$rest(uri)[method](params)
						.success(data=>{
							this.$Message.success(msg)
							this.$emit('on-success')
							this.cancel()
							this.$store.dispatch('updateGlobalVar','branchs')
						}).error(body=>{
							this.$Notice.error({
								title: '失败',
								desc: body.message||'添加失败'
							})
						})
					}
				})
			}
		},
		computed: {
			ename () {
				return this.$store.state.user.info.employee.ename
			}
		}
	}
	
</script>
