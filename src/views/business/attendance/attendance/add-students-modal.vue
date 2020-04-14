<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false">
		
		<div class="mb-3">
			<Dropdown class="x-drop-menu">
				<Button type="ghost" icon="plus">添加学员</Button>		        
		        <DropdownMenu slot="list">
		        	<DropdownItem @click.native="chooseStudent('student')">正式学员</DropdownItem>
		            <DropdownItem @click.native="chooseStudent('leave')">请假学员</DropdownItem>
		            <DropdownItem @click.native="chooseStudent('absence')">缺课学员</DropdownItem>
		            <DropdownItem @click.native="chooseStudent('customer')">意向客户</DropdownItem>
		        </DropdownMenu>
		        
		        <div class="hide">
		        	<select-student ref="student" v-model="params.sids" :disabled-ids="sids"></select-student>
		        	<select-customer ref="customer" v-model="params.cu_ids" :disabled-ids="cu_ids"></select-customer>
		        	<select-leave 
		        		ref="leave" 
		        		:lid="lid" 
		        		:sj-id="sj_id"
		        		v-model="params.slv_ids" 
		        		:slv-ids="params.sa_ids" 
		        		:sids="sids"
		        		>
	        		</select-leave>
		        	<select-absence 
		        		ref="absence" 
		        		:lid="lid" 
		        		:sj-id="sj_id"
		        		v-model="params.sa_ids" 
		        		:slv-ids="params.slv_ids" 
		        		:sids="sids"
		        		>
	        		</select-absence>
		        </div>
		    </Dropdown>
		</div>
		
		<table class="x-modal-table modal-table">
			<thead>
				<th><div class="ivu-table-cell">学员</div></th>
				<th><div class="ivu-table-cell">联系电话</div></th>
				<th><div class="ivu-table-cell">学员类型</div></th>
				<th><div class="ivu-table-cell">操作</div></th>
			</thead>			
			<template v-for="field in ['cu_ids','sids','sa_ids','slv_ids']" v-if="params[field].length>0">
				<tr v-for="(item,index) in params[field]">
					<td>
						<div class="ivu-table-cell">
							<avatar-and-name :src="getStudentObj(item,field).photo_url" :name="getStudentObj(item,field).name" :sex="getStudentObj(item,field).sex"></avatar-and-name>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">{{getStudentObj(item,field).first_tel}}</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<Tag color="yellow">{{map_field_type[field]}}</Tag>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<Button type="ghost" shape="circle" icon="ios-trash" @click="delParams(item,field)"></Button>
						</div>
					</td>
				</tr>
			</template>
		</table>		
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="joinArrange">确定</Button>
			<!--<Button type="primary" @click="joinClass" v-if="cid>0">加入此班</Button>-->
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	import SelectCustomer from 'c%/SelectCustomer.vue'
	import SelectLeave from 'v%/business/makeup/leave-modal.vue'
	import SelectAbsence from 'v%/business/makeup/absence-modal.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	
	const emptyObject = {
		cu_ids: [],
		sids: [],
		sa_ids: [],
		slv_ids: []
	}
	
	export default{
		mixins: [ common, modal ],
		components: {
			SelectCustomer,
			SelectLeave,
			SelectAbsence,
			SelectStudent
		},
		props: {
			list: {
				type: Array,
				default: ()=>{
					return []
				}
			}
		},
		data () {
			return {
				ca_id: 0,
				lid: 0,
				sj_id: 0,
				cid: 0,
				students: [],
				search_value:'',
				params: util.copy(emptyObject),
				map_field_type: {'cu_ids': '试听','sids':'临加','sa_ids':'补课','slv_ids':'补课'}
			}
		},		
		watch: {
			'modal$.show': function (val){
				if(!val){
					this.ca_id = 0
					this.clear()
				}
			}
		},
		computed: {
			sids () {
				let result = [],
					list = this.list.filter(l=>l.sid>0)
				list.forEach(l=>{
					result.push(l.sid)
				})				
				return result
			},
			cu_ids () {
				let result = [],
					list = this.list.filter(l=>l.cu_id>0)
				list.forEach(l=>{
					result.push(l.cu_id)
				})
				return result
			}
		},
		methods: {		
			chooseStudent (ref) {
				let map_title = {'customer':'选择客户','student':'选择学员','leave':'选择请假学员','absence':'选择缺课学员'},
					title = map_title[ref]
				if(ref=='customer'||ref=='student'){
					this.$refs[ref].openModal()
				}else{
					this.$refs[ref].show(title,'add')					
				}
			},
			getListObj (item) {
				if(item.sid>0){
					item.student.name = item.student.student_name
					return item.student
				}else{
					return item.customer
				}
			},
			clear () {
				let arr = ['cu_ids','sids','sa_ids','slv_ids']
				arr.forEach(a=>{
					this.params[a].splice(0,this.params[a].length)
				})
			},
			getStudentObj (id,field) {
				let map_obj_name = {'cu_ids':'customer','sids':'student','slv_ids':'student_leave','sa_ids':'student_absence'},
					obj = {},
					method = (field=='cu_ids'||field=='sids'?'getMapObject':'getMapText')
				
				obj = this[method](id,map_obj_name[field])||{
						name: '',
						sex: '1',
						first_tel: ''
					}
				
				if(field != 'cu_ids'){
					obj.name = obj.student_name
				}
				
				return obj
			},
			getMapObject (id,name) {
				return this.$store.getters.getMapObject(id,name)
			},
			getMapText(id,name) {
				let result = this.$store.getters.getMapText(id,name)
				return this.$store.getters.getMapText(id,name)
			},	
			delParams (id,type) {
				let list = this.params[type],
					index = list.indexOf(id)
				if(index>-1){
					list.splice(index,1)
				}
			},
//			joinClass () {
//				if(this.check()){
//					let params = {
//						sids: this.sids,
//						cu_ids: [],					
//						in_time: moment(new Date()).format('YYYY-MM-DD')		
//					}
//					
//					this.$rest('classes/'+this.cid+'/doassign').post(params)
//					.success(data=>{
//						this.$Message.success('分班操作成功')
//						this.$emit('on-success')
//						this.close()
//					}).error(response=>{
//						this.$Notice.error({
//							title:'分班操作失败',
//							desc:response.body.message||'分班失败'
//						})
//					})
//				}
//			},
			joinArrange () {
				let params = this.initParams(),
					uri = util.sprintf('course_arrange_students?ca_id=%s',this.ca_id)
				
				this.$rest(uri).post(params)
				.success(data=>{
					this.$Message.success('操作成功~')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~')
				})
				
			},
			initParams () {
				let params = this.params,					
					result = {
						ca_id: this.ca_id,
						list: []
					},
					map = {
						'cu_ids':{
							idField: 'cu_id',
							mapName: 'customer',
							method: 'getMapObject'
						},
						'sids': {
							idField: 'sid',
							mapName: 'student',
							method: 'getMapObject'
						},
						'sa_ids':{
							idField: 'sa_id',
							mapName: 'student_leave',
							method: 'getMapText'
						},
						'slv_ids':{
							idField: 'slv_id',
							mapName: 'student_absence',
							method: 'getMapText'
						}
					},
					arr = ['cu_ids','sids','sa_ids','slv_ids']
					
				arr.forEach(i=>{
					if(params[i].length>0){
						params[i].forEach(p=>{
							let tempObj = this[map[i].method](p,map[i].mapName)||{},
								obj = {}
							obj[map[i].idField] = p
							// 	obj.sid = tempObj.sid
							result.list.push(obj)
						})
					}
				})
				
				return result
			}
		}
	}
</script>

<style>
</style>