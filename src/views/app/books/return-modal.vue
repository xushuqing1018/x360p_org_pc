<template>
	<Modal v-model="modal$.show" v-drag-modal :title="modal$.title" :mask-closable="false" :width="600">
		<Form :label-width="80" v-if="modal$.show">
			<Form-item label="书名" prop="bk_id">
				<Select
	                v-model="info.bk_id"
	                filterable
	                remote
	                :remote-method="remoteMethod"
	                :loading="loading">
	                <Option v-for="(option, index) in bookList" :value="option.bk_id" :key="index">{{option.name}}</Option>
	            </Select>	
			</Form-item>
			<Form-item label="学员" prop="sid">
				<select-student v-model="info.sid"></select-student>
			</Form-item>			
			<Form-item label="还书日期" prop="back_int_day">
				<DatePicker type="date" placeholder="请选择日期" :value="info.back_int_day" @on-change="info.back_int_day=$event"></DatePicker> 
			</Form-item>
			<Form-item label="借出数量" prop="qty">
				<InputNumber v-model="info.qty" :step="1" :min="0"></InputNumber> 
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	
	const emptyObject = {
		bk_id: 0,
		qty: 1,
		apply_int_day: moment(new Date()).format('YYYY-MM-DD'),
		apply_way: 0,
		lending_int_day: moment(new Date()).format('YYYY-MM-DD'),
		sid: 0,
		lending_days: 7,
		back_int_day: ''
	}
	
	export default{
		mixins: [ modal ],
		components: {
			SelectStudent
		},
		data () {
			return {
				info: util.copy(emptyObject),
				loading: false,
				bookList:[]
			}
		},
		methods: {
			ok () {
				
			},
			remoteMethod (query) {
				let params = {
                    	name: query
                    }
				
				if (query !== '') {
                    this.loading = true
                    
                    this.$rest('books').get(params)
                    .success(data=>{
                    	this.loading = false
                    	this.bookList = data.list	
                    }).error(response=>{
                    	this.bookList = []
                    })
                } else {
                    this.bookList = []
                }
			}
		}
	}
</script>

<style>
</style>