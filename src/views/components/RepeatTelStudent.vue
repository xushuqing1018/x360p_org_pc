<template>
	<div>
		<Input v-model="model" :readonly="readonly" :placeholder="placeholder" @on-blur="inputBlur"></Input>
		
		<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" @on-close="notRepeat" :mask-closable="false" :width="800">
			<table class="modal-table" v-if="modal$.show">
				<thead>
					<th><div class="ivu-table-cell">姓名</div></th>
					<th><div class="ivu-table-cell">性别</div></th>
					<th><div class="ivu-table-cell">手机号</div></th>
					<th><div class="ivu-table-cell">所属校区</div></th>
					<th><div class="ivu-table-cell">录入时间</div></th>
					<!-- 新加两列名 -->
					<th><div class="ivu-table-cell">跟进人</div></th>
					<th><div class="ivu-table-cell">来源渠道</div></th>
				</thead>
				<tr v-for="(item,index) in dataList" :key="index">
					<td>
						<div class="ivu-table-cell">
							<tag :color="getTag(item).color">{{getTag(item).label}}</tag>
							<span v-if="item.sid">{{item.student_name}}</span>
							<span v-else>{{item.name}}</span>
						</div>					
					</td>
					<td><div class="ivu-table-cell">{{item.sex==1?'男':'女'}}</div></td>				
					<td>
						<div class="ivu-table-cell">
							<span v-if="item.mcl_id">{{item.tel}}</span>
							<span v-else>{{item.first_tel}}</span>
						</div>
					</td>
					<td><div class="ivu-table-cell">{{item.bid|branch_name}}</div></td>
					<td><div class="ivu-table-cell">{{item.create_time}}</div></td>
					<!-- 新加值 -->
					<td><div class="ivu-table-cell">{{item.follow_eid|ename('-')}}</div></td>
					<td><div class="ivu-table-cell">{{item.mc_id|channel_name('-')}}</div></td>
				</tr>
			</table>
			
			<div slot="footer">
				<Button type="primary" @click="repeat">是重复学员</Button>
				<Button type="ghost" @click="notRepeat">不是重复学员</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default{
		mixins: [ common, modal, globals ],
		props: {
			idField: {
				type: String,
				default: ''		//cu_id:客户id,sid:学员id
			},
			idNumber: {
				type: Number,
				default: 0
			},
			readonly: {
				type: Boolean,
				default: false
			},
			value: {
				type: String,
				default: ''
			},
			placeholder: {
				type: String,
				default: '请输入手机号码'
			}
		},
		data () {
			return {
				model: this.value,
				dataList: [],
				temp_tel: '',
				isChecked: false,
				activeId: 0
			}
		},
		watch: {
			model: function (val) {				
				this.$emit('input', val)
				this.dispatch('FormItem', 'on-form-change', val)
			},
			value: function (val){
				this.model = val
			},
			isChecked: function (val) {
				this.$emit('on-checked',val)
			}
		},
		created () {
			if(/^\d{8,11}$/.test(this.value)){
				this.temp_tel = this.value	
				this.isChecked = true
			}
		},
		methods: {
			inputBlur () {
				if(this.readonly){
					return
				}
				let model = this.model
				if(/^\d{8,11}$/.test(model)&&this.temp_tel!=model){
					this.temp_tel = ''
				}				
				
				if(/^\d{8,11}$/.test(model)&&this.temp_tel!=model){
					this.getStudentsByTel()					
				}
			},
			getTag (item) {
				let result = {
					color: 'blue',
					label: '学员'
				}
				if(item.cu_id){
					result.color = 'green'
					result.label = '客户'
				}else if(item.mcl_id){
					result.color = 'yellow'
					result.label = '市场名单'
				}
				return result
			},
			getStudentsByTel () {
				let url = `students/query_by_tel?tel=${this.model}`
				if(this.idField=='cu_id'&&this.idNumber) { //编辑排除自身
					url += `&cu_id=${this.idNumber}`					
				}
				this.$rest(url).get()
				.success(data=>{								
					this.dataList = data
					if(data&&data.length){
						this.isChecked = false
						this.show('发现手机号重复名单')
					}else{
						this.isChecked = true
						this.$emit('on-repeat',0)
					}
				}).error(response=>{
					this.$Message.error(response.body.message||'获取同名学员失败~')
					
				})
			},
			isFamily () {
				this.temp_tel = this.model
				this.isChecked = true
				this.$emit('on-family',this.activeId)
				this.close()
			},
			repeat () {
				this.temp_tel = ''
				this.model = ''
				this.isChecked = false
				this.$emit('on-repeat',0)
				this.close()
			},
			notRepeat () {				
				this.temp_tel = this.model
				this.isChecked = true
				this.$emit('on-repeat',1)
				this.close()
			}			
		}
	}
</script>

<style>
</style>