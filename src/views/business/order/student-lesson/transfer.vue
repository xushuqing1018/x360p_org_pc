<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="学员姓名" prop="sid" class="col-sm-4">
				<select-student v-model="search_field.sid" clearable></select-student>
			</Form-item>
			<Form-item label="操作时间" prop="create_time" class="col-sm-4">
				<date-range-picker 
					v-model="search_field.create_time" 
					@on-change="search" 
					placement="bottom"
					style="width:100%">
				</date-range-picker>					
			</Form-item>
			<Form-item label="经办人" prop="create_uid" class="col-sm-4">
				<select-employee v-model="search_field.create_uid" mode="user" clearable></select-employee>
			</Form-item>
		</Form>
		<Row class="basic">
            <Col span="24" class="mt-2 mb-2">
            	<Button class="ml-2" type="primary" size="small" icon="ios-search" @click="search">查询</Button>
            	<Button class="ml-2" type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
            </Col>
        </Row>      
		<div class="content-body" v-loading="'order_transfers'">
	        <table class="modal-table">
				<thead>
					<th><div class="ivu-table-cell">学员</div></th>
					<th><div class="ivu-table-cell">结转项目</div></th>
					<th><div class="ivu-table-cell">结转日期</div></th>
					<th><div class="ivu-table-cell">结转金额</div></th>
					<th><div class="ivu-table-cell">扣款详情</div></th>
					<th><div class="ivu-table-cell">经办人</div></th>
					<th><div class="ivu-table-cell">操作</div></th>
				</thead>
				<tr v-for="(item,index) in data" :key="index">
					<td><div class="ivu-table-cell">{{item.student?item.student.student_name:'-'}}</div></td>
					<td><div class="ivu-table-cell" v-html="getItems(item)"></div></td>
					<td><div class="ivu-table-cell">{{item.create_time.substring(0,10)}}</div></td>
					<td><div class="ivu-table-cell" v-html="getTransferAmount(item)"></div></td>
					<td><div class="ivu-table-cell" v-html="getCutAmount(item)"></div></td>
					<td><div class="ivu-table-cell">{{item.employee?item.employee.ename:'-'}}</div></td>
					<td>
						<div class="ivu-table-cell">
							<Button 
								type="ghost" 
								size="small" 
								shape="circle" 
								icon="ios-undo" 
								title="撤销结转" 
								v-per="'transfer.undo'"
								@click="undoTransfer(item)"
								>
							</Button>
						</div>
					</td>
				</tr>
				<tr v-if="!data.length">
					<td colspan="7">
						<div class="ivu-table-cell text-center">没有数据</div>
					</td>
				</tr>
			</table>
	    </div>
	    <div class="content-footer">
	        <div class="clearfix">
	            <Page 
	            	class="pull-right mt-2"
	            	size="small"
		            :total="total" 
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
		<div slot="footer">
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectStudent from 'c%/SelectStudent.vue'

	export default {
		mixins:[modal,globals,common,grid],
		components: {
			DateRangePicker,
			SelectEmployee,
			SelectStudent
		},
		data() {
			return {
				rest_api: 'order_transfers',
				search_field: {
					create_time: [],
					create_uid: 0,
					sid: 0
				}
			}
		},
		methods: {
			onModalOpen() {
				this.init_data()
			},
			undoTransfer(item) {
				this.confirm('确定要撤销结转吗？')
				.then(() => {
					this.$rest('order_transfers').add_url_param('undo_transfer')
					.post({
						ot_id:item.ot_id
					})
					.success(res => {
						this.$Message.success('撤销成功')
						this.init_data()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			getTransferAmount (item) {
				let cut = item.order_cut_amount,
					cut_amount = 0
				cut.forEach(item => {
					cut_amount = util.add(cut_amount,item.amount)
				})
				return `结转金额:${this.label_currency}${item.transfer_amount}<br>
						扣款总金额:${this.label_currency}${cut_amount}<br>
						实际结转:${this.label_currency}${item.transfer_amount-cut_amount}`
			},
			getCutAmount (item) {
				let result = ''
				if(item.order_cut_amount.length>0) {
					item.order_cut_amount.forEach(item => {
						result += `${this.labelDicts(item.cutamount_did,'cutamount')}:${this.label_currency}${item.amount}<br>`
					})
				}else{
					result = '-'
				}
				return result
			},
			getItems (item) {
				let [result,refund_items] = [[],item.order_transfer_item]
				if(refund_items.length>0){
					refund_items.forEach(b=>{
						let present = Number(b.present_nums)
						if(present>0) {
							result.push(`<p>${b.order_item.item_name} x ${util.float(b.nums)} (+${present}) = ${this.label_currency}${b.amount}</p>`)
						}else{
							result.push(`<p>${b.order_item.item_name} x ${util.float(b.nums)} = ${this.label_currency}${b.amount}</p>`)
						}
					})
				}
				return result.join('')
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				params.with = 'student'
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			}
		}
	}
</script>
