<template>
	<Modal v-drag-modal :mask-closable="false" width="480" v-model="modal$.show" :title="modal$.title">
		<Form :label-width="100" label-position="right" ref="form">	
			<Form-item label="选择校区" prop="current_bid">
				<select-branch v-model="current_bid" clearable></select-branch>
			</Form-item>
		</Form>
		<div class="text-center">
			<RadioGroup v-model="number_type" type="button">
				<Radio label="Y">年度序号</Radio>
				<Radio label="YM">月度序号</Radio>
				<Radio label="G">总序号</Radio>
			</RadioGroup>
		</div>
		<table class="modal-table m-t">
			<thead>
				<tr>
					<th><div class="ivu-table-cell">单据</div></th>
					<th><div class="ivu-table-cell">当前序号</div></th>
					<th><div class="ivu-table-cell">操作</div></th>
					
				</tr>
			</thead>
			<tbody>
				<tr 
				v-for="(item,index) in tables"
				:key="index"
				>
					<td>
						<div class="ivu-table-cell">
							{{item.title}}
						</div>
					</td>
					<td>
						<div class="ivu-table-cell" v-if="number_list[number_type][item.table] > 0" >
							<Input v-model="number_list[number_type][item.table]" size="small"></Input>
						</div>
					</td>
					<td>
						<Button v-if="number_list[number_type][item.table] > 0" type="primary" size="small" @click="updateKey(item.table)" :disabled="saving">更新</Button>
					</td>
				</tr>
			</tbody>
		</table>

    	<div slot="footer">
            
        </div>
    </Modal>
</template>
<script>
	
	const EMPTY_NUMBER_LIST = {
		'YM':{
			'order':0,
			'order_receipt_bill':0,
			'order_transfer':0,
			'order_refund':0,
			'student':0
		},
		'Y':{
			'order':0,
			'order_receipt_bill':0,
			'order_transfer':0,
			'order_refund':0,
			'student':0
		},
		'G':{
			'order':0,
			'order_receipt_bill':0,
			'order_transfer':0,
			'order_refund':0,
			'student':0
		}
	}
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectBranch from 'c%/SelectBranch.vue'
	export default {
		mixins: [common,modal,globals],
		components: {
			SelectBranch
		},
		data () {
			return {
				current_bid:0,
				number_list:util.copy(EMPTY_NUMBER_LIST),
				number_type:'Y',
				tables:[
					{title:'订单编号',table:'order'},
					{title:'收据编号',table:'order_receipt_bill'},
					{title:'结转单据',table:'order_transfer'},
					{title:'退费单据',table:'order_refund'},
					{title:'学员学号',table:'student'}
				]
			}
		},
		mounted(){
			this.current_bid = this.$store.state.branch.id
		},
		methods: {
			clear_data(){
				this.number_list = util.copy(EMPTY_NUMBER_LIST)
			},
			init_data(){
				this.clear_data()
				this.$rest('branches')
				.add_url_param(this.current_bid,'maxnumber')
				.get()
				.success(data=>{
					this.number_list = data
					
				})
				.error(response=>{
					console.log(response)
				})
			},
			updateKey(table){
				let params ={}
				params.bid = this.current_bid
				params.table = table
				params.dtype = this.number_type
				params.max = this.number_list[this.number_type][table]
				if(!/^\d+$/.test(params.max)){
					return false
				}
				this.$rest('branches')
				.add_url_param(this.current_bid,'maxnumber')
				.post(params)
				.success(response=>{
					console.log(response)
					this.$Message.success('更新成功!');
				})
				.error(response=>{

				})
			}
		},
		watch: {
			current_bid(val,oldVal){
				this.init_data()
			}
        },
        computed: {
			
		}
	}
</script>