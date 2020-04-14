<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false">
		
		<div class="mb-3" v-if="arrangeType=='normal'">
			<select-object v-model="params" :lid="lid" :list="students"></select-object>
		</div>
		<div style="max-height: 500px;overflow: auto">
			<table class="x-modal-table modal-table">
				<thead>
					<th><div class="ivu-table-cell">学员</div></th>
					<th><div class="ivu-table-cell">联系电话</div></th>
					<th><div class="ivu-table-cell">学员类型</div></th>
					<th><div class="ivu-table-cell">操作</div></th>
				</thead>
				<tr v-for="(item,index) in students" :key="index">
					<td>
						<div class="ivu-table-cell">
							<avatar-and-name :src="getListObj(item).photo_url" :name="getListObj(item).name" :sex="getListObj(item).sex"></avatar-and-name>						
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">{{getListObj(item).first_tel}}</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<Tag :color="item.sid>0?'blue':'yellow'">{{getTagName(item)}}</Tag>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<Button type="ghost" shape="circle" icon="ios-trash" @click="delStudent(item)"></Button>
						</div>
					</td>
				</tr>
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
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving" v-if="arrangeType=='normal'">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	import SelectObject from './select-object.vue'
	
	const emptyObject = {
		cu_ids: [],
		sa_ids: [],
		slv_ids: [],
		sids: []
	}
	
	export default{
		mixins: [ common, modal ],
		components: {
			SelectObject
		},
		props: {
			arrangeType: {
				type: String,
				default: 'normal'
			}
		},
		data () {
			return {
				ca_id: 0,
				lid: 0,
				students: [],
				search_value:'',
				params: util.copy(emptyObject),
				map_field_type: {'cu_ids': '试听','sids':'临加','sa_ids':'补课','slv_ids':'补课'}
			}
		},		
		watch: {
			ca_id: function (val) {
				if(val){
					this.getStudents()
				}
			},
			'modal$.show': function (val){
				if(!val){
					this.ca_id = 0
					this.clear()
				}
			}
		},
		computed: {
			filter_data () {
				let search_value = this.search_value
				if(!/^\s*$/.test(search_value)){
					filter = (item)=>{
						return item.student.student_name.indexOf(search_value)>-1
					}
				}
			}
		},
		methods: {
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
			getTagName (item) {
				let result = '班'
				if(item.is_trial==1){
					result = '试'
				}
				if(item.is_makeup==1){
					result = '补'
				}
				
				return result
			},
			delStudent (item) {
				let tip = util.sprintf('确定将学员【%s】从本次排课中移除吗？',this.getListObj(item).name),
					params = {
						ca_id: this.ca_id,
						list: [
							{
								sid: item.sid,
								cu_id: item.cu_id
							}
						]
					}
				
				this.confirm(tip)
				.then(()=>{					
					this.$rest('course_arrange_students/delete_student')
					.post(params)
					.success(data=>{
						this.$Message.success('移除成功！')
						this.getStudents()
						this.$emit('on-success')
					}).error(response=>{
						this.error(response.body.message||'操作失败~')
					})
				})
			},
			ok () {
				let params = this.initParams(),
					uri = util.sprintf('course_arrange_students?ca_id=%s',this.ca_id)
				
				this.$rest(uri).post(params)
				.success(data=>{
					this.$Message.success('操作成功~')
					this.close()
					this.$emit('save')
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
							obj.sid = tempObj.sid
							result.list.push(obj)
						})
					}
				})
				
				return result
			},
			getStudents () {
				let uri = util.sprintf('course_arrange_students?pagesize=50&with=student,customer&ca_id=%s',this.ca_id)
				this.$rest(uri).get()
				.success(data=>{
					this.students = data.list.filter(l=>l.sid>0||l.cu_id>0)
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			}
		}
	}
</script>

<style>
</style>