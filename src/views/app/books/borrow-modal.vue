<template>
	<Modal v-model="modal$.show" v-drag-modal :title="modal$.title" :mask-closable="false" :width="600">
		<Form :label-width="80" v-if="modal$.show">
			<Form-item label="书名" prop="bk_id" class="ivu-form-item-required">
	            <select-book ref="selectbook" v-model="info.bk_id" clearable></select-book>
			</Form-item>
			<Form-item label="学员" prop="sid" class="ivu-form-item-required">
				<select-student v-model="info.sid"></select-student>
			</Form-item>
			<Form-item label="申请日期" prop="apply_int_day">
				<DatePicker type="date" placeholder="请选择日期" :value="info.apply_int_day" @on-change="info.apply_int_day=$event"></DatePicker>
			</Form-item>
			<Form-item label="借出日期" prop="lending_int_day" class="ivu-form-item-required">
				<DatePicker type="date" placeholder="请选择日期" :value="info.lending_int_day" @on-change="info.lending_int_day=$event"></DatePicker>
			</Form-item>
			<Form-item label="借出天数" prop="lending_days" class="ivu-form-item-required">
				<InputNumber v-model="info.lending_days" :step="1" :min="0"></InputNumber> 
			</Form-item>
			<!--<Form-item label="借出数量" prop="qty">
				<InputNumber v-model="info.qty" :step="1" :min="1"></InputNumber> 
			</Form-item>-->
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectBook from 'c%/SelectBook.vue'
	
	const emptyObject = {
		bk_id: [],
		qty: 1,
		apply_int_day: moment(new Date()).format('YYYY-MM-DD'),
		apply_way: 0,
		lending_int_day: moment(new Date()).format('YYYY-MM-DD'),
		sid: 0,
		lending_days: 7
	}
	
	export default{
		mixins: [ common, modal ],
		components: {
			SelectBook,
			SelectStudent
		},
		data () {
			return {
				info: util.copy(emptyObject),
				loading: false,
				bookList:[]
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val){
					this.$nextTick(()=>{
						if(this.$refs.selectbook){
							this.$refs.selectbook.openModal()							
						}
					})
				}
			}
		},
		methods: {
			ok () {
				if(this.info.bk_id == 0){
					this.$Message.error('请输入书名')
					return
				}
				if(this.info.lending_int_day == ''){
					this.$Message.error('请选择借书日期')
					return
				}
				if(this.info.sid == 0){
					this.$Message.error('请选择借书学员')
					return
				}				
				
				this.$rest('books/dolending')
				.post(this.info)
				.success(data=>{
					this.$Message.success('操作成功~')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~')
				})
			},
			remoteMethod (query) {
				let params = {
                    	name: query
                    }
				
				if (query !== '') {
                    this.loading = true
                    
                    this.$rest('books/get_list').get(params)
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