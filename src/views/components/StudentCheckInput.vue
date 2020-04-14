<template>
	<Input :placeholder="placeholder" v-model="model" @on-blur="get_students">
		<Modal ref="ref_student_check" transfer v-drag-modal :mask-closable="false" title="发现同名学员" v-model="modalShow">
			<table class="modal-table">
				<thead>
					<th><div class="ivu-table-cell">姓名</div></th>
					<th><div class="ivu-table-cell">性别</div></th>
					<th><div class="ivu-table-cell">年龄</div></th>
					<th><div class="ivu-table-cell">手机号</div></th>
					<th><div class="ivu-table-cell">公立学校</div></th>
					<th><div class="ivu-table-cell">年级</div></th>
					<th><div class="ivu-table-cell">所属校区</div></th>
					<th><div class="ivu-table-cell">录入时间</div></th>
				</thead>
				<tr v-for="(item,index) in data" :key="index">
					<td><div class="ivu-table-cell">{{item.student_name}}</div></td>
					<td><div class="ivu-table-cell">{{item.sex}}</div></td>
					<td><div class="ivu-table-cell">{{item.birth_year}}</div></td>
					<td><div class="ivu-table-cell">{{item.first_tel}}</div></td>
					<td><div class="ivu-table-cell">{{item.school_id}}</div></td>
					<td><div class="ivu-table-cell">{{item.school_grade}}</div></td>
					<td><div class="ivu-table-cell">{{item.bid}}</div></td>
					<td><div class="ivu-table-cell">{{item.create_time}}</div></td>
				</tr>
			</table>
			
			<div slot="footer">
				<Button type="primary" @click="ok">是重复学员</Button>
				<Button type="ghost" @click="cancel">不是重复学员</Button>
			</div>
		</Modal>
	</Input>
</template>

<script>
	import $rest from '@/libs/rest'
	export default{
		props: {
			value: [String,Number],
			placeholder: {
				type: String,
				default: '请输入'
			},
			prop: {
				type: String,
				required: true
			},
		},
		data () {
			return {
				model: this.value,
				modalShow: false,
				params: {
					student_name: '',
					first_tel: ''
				},
				data: [],
				choosed: false,
			}
		},
		methods: {
			get_students () {
				this.$emit('input',this.model)
				this.params[this.prop] = this.model
												
				$rest('students').get(this.params)
				.success(data=>{
					this.data = data.list
					if(data.list.length>0){
						this.modalShow = true						
					}else{
						this.cancel()
					}
				}).error(body=>{
					this.$Message.error(body.message||'查询失败')
				})
			},
			ok () {
				this.model = ''
				this.$emit('input',this.model)
				this.modalShow = false				
			},
			cancel () {
				this.modalShow = false
				this.$emit('input',this.model)
			}
		},
		watch: {
			value: function (val) {
				this.model = val
			}
		}
	}
</script>
