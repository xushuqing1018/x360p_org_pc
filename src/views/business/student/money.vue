<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">		
		<div class="mb-2">
			<Button type="primary" @click="showOperate" icon="android-remove">余额扣减</Button>
		</div>
		
		<div>
			<table class="modal-table">
				<thead>
					<th width="150"><div class="ivu-table-cell">日期</div></th>
					<th width="110"><div class="ivu-table-cell">校区</div></th>
					<th width="90"><div class="ivu-table-cell">金额</div></th>
					<th width="90"><div class="ivu-table-cell">变动前</div></th>
					<th width="90"><div class="ivu-table-cell">变动后</div></th>
					<th><div class="ivu-table-cell">备注</div></th>
					<th width="80"><div class="ivu-table-cell">操作</div></th>
				</thead>
				<tr v-for="item in data">
					<td><div class="ivu-table-cell">{{item.create_time}}</div></td>
					<td><div class="ivu-table-cell">{{item.bid|branch_name}}</div></td>
					<td>
						<div 
							class="ivu-table-cell" 
							:class="Number(item.before_amount)>Number(item.after_amount)?'text-danger':'text-success'">
							{{Number(item.before_amount)>Number(item.after_amount)?'-':''}}{{Number(item.amount)}}
						</div>
					</td>
					<td><div class="ivu-table-cell">{{Number(item.before_amount)}}</div></td>
					<td><div class="ivu-table-cell">{{Number(item.after_amount)}}</div></td>
					<td><div class="ivu-table-cell">{{item.remark}}</div></td>
					<td>
						<div class="ivu-table-cell" v-if="item.business_type==3">
							<Button 
								type="ghost" 
								size="small" 
								@click="print(item.smh_id)">打印
							</Button>
						</div>
					</td>
				</tr>
				<tr v-if="!data||!data.length">
					<td colspan="7"><div class="ivu-table-cell text-center">没有数据</div></td>
				</tr>
			</table>
			<div class="content-footer text-right mt-3">
                <div class="pagenation">
                    <Page :total="total" 
                    :current="pageIndex" 
                    :show-sizer="true" 
                    :page-size="pageSize" 
                    :show-total="true" 
                    @on-change="pagenation" 
                    @on-page-size-change="pagesize"
                    >
                    </Page>
                </div>
            </div>   
		</div>
		<div slot="footer">			
			<Button type="ghost" @click="close">关闭</Button>
		</div>
		
		<Modal v-drag-modal v-model="modalOperate" :mask-closable="false"  title="余额扣减" v-drag-modal :width="400">		
			<Form :label-width="70">
				<Form-item label="余额扣减">
					<InputNumber v-model="post.amount" :min="1"></InputNumber>
				</Form-item>
				
				<Form-item label="备注">
					<Input v-model="post.remark" placeholder="请输入备注"></Input>
				</Form-item>				
			</Form>
			
			<div slot="footer">
				<Button type="primary" @click="ok">确定</Button>
				<Button type="ghost" @click="closeOperate">关闭</Button>
			</div>
		</Modal>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	
	const emptyObject = {
		sid: 0,
		amount: 0,
		remark: '',
		business_type: 12
	}
	
	export default{
		mixins: [common,grid,modal,globals],
		data () {
			return {
				rest_api: '',
				pk: 'smh_id',
				money: 0,
				sid: 0,
				data: [],
				post: util.copy(emptyObject),
				modalOperate: false				
			}
		},
		watch: {
			sid: function (val) {
				this.rest_api = `student_money_historys?sid=${val}&bid=-1`
				this.init_data()
			},			
		},
		methods: {
			print (id,preview) {
	        	preview = preview || true
				this.showPageSpin('正在获取打印模板...')
				this.$rest('student_money_historys/print?smh_id='+id)
				.get()
				.success(data=>{
					this.printer.printBill(4,data,1,'0 0 0 0',true)
					this.hidePageSpin()
				}).error(body=>{
					this.hidePageSpin()
					this.$Notice.error({
						title: '错误',
						desc: body.message||'获取打印数据错误'
					})
				})
				this.close()
			},
			showOperate () {
				this.modalOperate = true
			},
			closeOperate () {
				this.modalOperate = false
				this.post = util.copy(emptyObject)	
				this.post.sid = this.sid
			},
			ok () {
				this.$rest('student_money_historys')
				.post(this.post)
				.success(data=>{
					this.$Message.success('操作')
					this.$emit('on-success')					
					this.closeOperate()
					this.init_data()
				})
				.error(response=>{
					this.$Notice.error({
						title: '操作失败',
						desc: response.body.message||'操作失败'
					})
				})
			}
		}
	}
</script>

<style>
</style>