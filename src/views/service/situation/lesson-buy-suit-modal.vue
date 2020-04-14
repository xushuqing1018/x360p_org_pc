<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="550">
		<template v-if="modal$.show">
			<Form ref="form" :model="info" :label-width="80">
				<Form-item label="方案对象" prop="title">
					<span v-if="sid>0||cuId>0">{{name}}</span>
					<Input 
						v-else
						v-model="service.name" 
						readonly
						placeholder="请选择">
						<Dropdown slot="append">
							<Button type="ghost" icon="arrow-down-b">请选择</Button>		        
					        <DropdownMenu slot="list">
					            <DropdownItem>
						            <select-student 
						            	v-model="info.sid" 
						            	@on-selected="selectS">
						            	<Button type="ghost">正式学员</Button>
						            </select-student>
						        </DropdownItem>
					            <DropdownItem>
						            <select-customer 
						            	v-model="info.cu_id" 
						            	@on-selected="selectC">
						            	<Button type="ghost">意向客户</Button>
						            </select-customer>
						        </DropdownItem>
					        </DropdownMenu>
						</Dropdown>
					</Input>
				</Form-item>
				<Form-item label="方案名称">
					<Input 
						v-model="info.title" 
						clearable 
						placeholder="请输入">
					</Input>
				</Form-item>
				<Form-item label="学习套餐">
					<select-learn-package v-model="info.lsd_id" @selected="selectPackage"></select-learn-package>
				</Form-item>
				<Form-item label="方案内容" prop="define">
					<table class="modal-table">
						<thead>
							<tr>
								<th><div class="ivu-table-cell">课程等级</div></th>
								<th><div class="ivu-table-cell">课程</div></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="item in info.define">
								<td>
									<div class="ivu-table-cell">
										{{item.product_level_did|dict_title('product_level')}}<br/>
										{{item.must?'必报':'非必报'}}<br/>
										课程数{{item.nums}}
									</div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<div style="margin-top: 4px;" v-for="(lesson,index) in item.lessons">
											<span>{{lesson.lid|lesson_name}}</span>,课时数
											<InputNumber 
												v-model="lesson.nums" 
												size="small" 
												:min="1" 
												style="width: 60px;">
											</InputNumber>&nbsp;&nbsp;
											<Icon 
												type="minus-circled" 
												color="#ed3f14" 
												@click.native="delLesson(item.lessons,index)">
											</Icon>
										</div>
										<select-lesson 
											v-if="item.nums>item.lessons.length"
											v-model="lid" 
											style="width: auto;"
											:condition="{product_level_did:item.product_level_did,lesson_type: [0,1,2]}"
											@selected="selectLesson(item)">
											<Icon type="plus" title="添加课程" style="cursor: pointer;"></Icon>
										</select-lesson>
									</div>
								</td>
							</tr>
							<tr v-if="info.define.length==0">
								<td class="text-center empty" colspan="2">
									<div class="ivu-table-cell">请先选择学习套餐</div>
								</td>
							</tr>
						</tbody>
					</table>
				</Form-item>
			</Form> 
		</template>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin' 
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectCustomer from 'c%/SelectCustomer.vue'
	import SelectLearnPackage from 'c%/SelectLearnPackage.vue'

	const INFO_NAME  = '学习方案'
	const INFO_PK_ID = 'lbs_id'
	const INFO_URL   = 'lesson_buy_suits'

	const emptyObject = {
		title: '',
		define: [],
		sid: 0,
		cu_id: 0,
		lsd_id: 0
	}

	export default {
		mixins: [modal,common,globals],
		props: {
			name: {
				type: String,
				default: ''
			},
			sid: {
				type:Number,
				default:0
			},
			cuId: {
				type:Number,
				default:0
			}
		},
		components: {
			SelectLesson,
			SelectCustomer,
			SelectStudent,
			SelectLearnPackage
		},
		data() {
			return {
				info: util.copy(emptyObject),
				lsd_id: 0,
				service: {
					name: ''
				},
				lid: 0
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					if(this.modal$.action == 'add') {
						this.info = util.copy(emptyObject)
						if(this.sid > 0 || this.cuId) {
							this.info.sid = this.sid
							this.info.cu_id = this.cuId
							this.service.name = this.name
						}else{
							this.service.name = ''
						}
					}else{
						let data = this.info.student || this.info.customer
						this.select(data)
					}
				}
			}
		},
		methods: {
			selectS(data) {
				this.info.cu_id = 0
				this.info.sid = data.sid
				this.select(data)
			},
			selectC(data) {
				this.info.sid = 0
				this.info.cu_id = data.cu_id
				this.select(data)
			},
			select(data) {
				if(this.info.sid > 0) {
					this.service.name = data.student_name + ' (正式学员)'
				}else{
					this.service.name = data.name + ' (意向客户)'
				}
			},
			selectPackage(data) {
				let learnPackage = util.copy(data)
				this.info.define.splice(0)
				learnPackage.define.forEach(d => {
					this.info.define.push(Object.assign(d,{lessons:[]}))
				})
			},
			selectLesson(item) {
				let lesson = item.lessons.find(lesson => lesson.lid == this.lid)
				if(lesson) {
					this.$Message.error('请不要重复选择课程')
				}else{
					let obj = this.$store.state.gvars.lessons.find(l => l.lid==this.lid)
					item.lessons.push({
						lid: this.lid,
						nums: parseFloat(obj.lesson_nums)
					})
					this.lid = 0
				}
			},
			delLesson(lessons,index) {
				lessons.splice(index,1)
			},
			ok() {
				if(this.info.title === '') {
					this.$Message.error('方案名称不能为空')
					return false
				}
				if(this.service.name === '') {
					this.$Message.error('方案对象不能为空')
					return false
				}
				if(this.info.define.length == 0) {
					this.$Message.error('方案内容不能为空')
					return false
				}
				for(let i=0,len=this.info.define.length;i<len;i++) {
					let item = this.info.define[i]
					if(item.must&&item.lessons.length==0) {
						this.$Message.error(`${this.$filter('dict_title')(item.product_level_did,'product_level')}的课程不能为空`)
						return false
					}
				}
				this.save()
			}
		},
		computed: {
			info_url$(){
            	return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        }
		}
	}
</script>