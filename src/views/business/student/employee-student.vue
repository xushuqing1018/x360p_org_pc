
<style>
.student-list {
	width: 60%;
	float: right;
	position: relative;
}

.student-item {
	width: 100%;
	height: 130px;
	margin-bottom: 10px;
	position: relative;
	cursor: pointer;
}

.student-item:hover .right-icon {
	display: inline-block;
}

.right-icon {
	position: absolute;
	top: 42px;
	right: 15px;
	display: none;
}

.select-item {
	border-width: 2px;
	border-color: #39f;
}

.select-item .right-icon {
	display: inline-block;
}

.class-table {
	width: 35%;
	float: left;
	padding-right: 5%;
	border-right: 1px dashed #CCC;
}

.clear {
	clear: both;
}

.head-img {
	display: inline-block;
	height: 100px;
	margin-left: 20px;
}

.head-img img{
	width: 100px;
	height: 100px;
}

.item-info {
	display: inline-block;
	height: 100px;
	margin-left: 20px;
	vertical-align: top;
}
.pager {
	float: right;
}

.class-list {
	margin-top: 5px;
}

.class-list .ivu-table-row {
	cursor: pointer !important;
}

.table-title {
	color: #464c5b;
	font-size: 15px;
	font-weight: bold;
	margin-left: 5px;
}
.role-tab {
	float: right;
	margin-right: 5px;
}

.name_underline {
	border-bottom: 1px dotted #555555;
}
</style>

<template>
	<div class="c-grid">
		<div class="box">
			<RadioGroup v-model="searchModel.rid" type="button" @on-change="roleChange">
				<Radio :label="4">{{'学管师'|translate}}=>学员</Radio>
				<Radio :label="1">{{'老师'|translate}}=>学员</Radio>
				<!--
				<Radio :label="2">{{'咨询师'|translate}}=>学员</Radio>
				-->
			</RadioGroup>
		</div>
		
		<div class="box box-result">
            <div class="class-table">
				<Tooltip content="点击员工，在右侧显示该员工分配的学员" placement="right-start">
					<p class="table-title" style="margin-bottom: 10px;">{{roleName}}列表</p>
				</Tooltip>
				
				<Input style="width:180px" type="text" v-model="searchModel.ename" :placeholder="searchEpTip" size="small"></Input>
				<Button type="primary" @click="searchEp" size="small"><Icon type="search"></Icon> 搜索</Button>
				<span v-if="searchMode"><Button type="primary" @click="searchEpReset" size="small"><Icon type="arrow-right-c"></Icon> 清除</Button> 搜索：{{searchModel.ename}}</span>
                <Table :columns="columns2" :data="employeeList" highlight-row :loading="loading1" @on-row-click="selectEp" class="class-list"></Table>
                <Page class="pager" show-total :total="total1" :current="page1" :page-size="pageSize" @on-change="changePage1" style="margin: 10px 5px 0px 0px;"/>
            </div>
            <div class="student-list" style="z-index:998">
				<span class="table-title" v-html="studentListLabel"></span>
				
				<span style="margin:5px 8px 0px 5px;float:right">
					<Button 
						type="primary" 
						icon="plus"
						@click="assignStudent" 
						v-per="'assign.add'" 
						:disabled="!perCheckAllStudent||!isSelectEp">
						分配学员
					</Button>
					<Button 
						type="primary" 
						icon="android-cancel"
						@click="cancelAssign" 
						v-per="'assign.cancel'">
						批量取消分配
					</Button>
					<Button 
						type="primary" 
						icon="shuffle"
						@click="adjustAssign" 
						v-per="'assign.batch'">
						批量调整
					</Button>
				</span>

				<Table :columns="columns1" :data="studentList" style="margin-top:10px" :loading="loading2" @on-selection-change="selectChange"></Table>
				<Page class="pager" show-total :total="total2" :page-size="pageSize" :current="page2" @on-change="changePage2" style="margin: 10px 5px 0px 0px;"/>
			</div>
			<div class="clear"></div>
		</div>
	</div>
</template>

<script>
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import SelectStudent from 'c%/SelectStudent.vue'
import AvatarAndName from 'c%/AvatarAndName.vue'

const roleMap = {
	1:'老师',
	2:'助教',
	4:'学管师',
	7:'咨询师'
}

export default {
	mixins: [ common,globals ],
	components: {
		SelectStudent,
		AvatarAndName
	},
	data () {
		var vm = this;
		return {
			pageSize: 10,
			classInfo: {
				cid: 0,
			},
			isSelectEp: false,
			page1: 1,
			page2: 1,
			total1: 0,
			total2: 0,
			loading1: false,
			loading2: false,
			studentList: [],
			classData: [],
			searchModel: {
				sid: "",
				ename: '',
				rid: 4
			},
			searchMode: false,
			employeeList: [],
			eid: 0,
			ename: '',
			studentListLabel: '所有学员列表',
			columns1: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					type: 'selection',
					width: 60,
					align: 'center'
                },
				{
					title: '学员',
					key: 'student_name',
					render: (h, params) => {
						return h('avatar-and-name',{
							props: {
								src: params.row.student.photo_url,
								name: params.row.student.student_name
							}
						});
					}
				},
				{
					title: '性别',
					key: 'sex',
					render: (h, params) => {
						return h('span',this.$options.filters.sex(params.row.student.sex));
					}
				},
				{
					title: '年龄',
					key: 'age',
					render: (h, params) => {
						return h('span', vm.getAge(params.row.student.birth_time));
					}
				},
				{
					title: '电话',
					key: 'first_tel',
					render: (h, params) => {
						return h('span', params.row.student.first_tel);
					}
				},
				{
					title: '状态',
					key: 'stutas',
					render: (h, params) => {
						return h('span', this.$options.filters.s_status(params.row.student.status));
					}
				},
				{
					title: '分配给',
					key: 'eid',
					render: (h, params) => {
						return h('span', this.$options.filters.ename(params.row.eid));
					}
				},
				{
					title: '分配时间',
					key: 'create_time',
					render: (h, params) => {
						return h('span', params.row.create_time.split(' ')[0]);
					}
				},
			],
			columns2: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					title: '员工姓名',
					key: 'ename'
				},
				{
					title: '角色名称',
					key: 'rid',
					render: (h, params) => {
						return h('span',vm.roleName);
					}
				}
			],
			isInit: false,
			sids: []
		}
	},
	mounted() {
		this.getEpList(true)
	},
	watch: {
		'$store.state.gvars.employees': function() {
			if(!this.isInit) { this.getEpList(true) }
			this.isInit = true;
		}
	},
	computed: {
		roleName() {
			return this.$filter('translate')(roleMap[this.searchModel.rid]);
		},
		searchEpTip() {
			return '请输入姓名'
		},
	},
	methods: {
		selectChange(data) {
			var sids = [];
			data.forEach(item => {
				sids.push(item.sid)
			});
			this.sids = sids;
		},
		assignStudent() {
			this.$Modal.open('business/student/assign-teacher/add-student-modal.vue',{
				props:{
					eid: this.eid
				},
				on:{
					'on-success':(e)=>{
						this.getStudentList(true)
					}
				}
			}).then(modal=>{
				modal.show('给【'+this.ename+'】分配学员')
			})
		},
		cancelAssign() {
			if(this.sids.length == 0) {
				this.$Message.error('请先勾选要操作的学员')
				return false
			}
			this.confirm('确认取消选中学员的学管师吗？')
			.then(() => {
				this.$rest('employee_students/delete_students')
				.post({
					sids: this.sids
				})
				.success(res => {
					this.$Message.success('取消成功')
					this.getStudentList(true)
				})
				.error(res => {
					this.error(res.body.message)
				})
			})
		},
		adjustAssign() {
			if(this.sids.length == 0) {
				this.$Message.error('请先勾选要操作的学员')
				return false
			}
			this.$Modal.open('business/student/assign-teacher/batch-student-modal.vue',{
				props:{
					sids: this.sids
				},
				on:{
					'on-success':(e)=>{
						this.getStudentList(true)
					}
				}
			}).then(modal=>{
				modal.show('批量调整')
			})
		},
		getEpList(init) {
			var employeeList = this.$store.state.gvars.employees;
			if(!employeeList) return;
			if(init) {
				this.total1 = employeeList.length;
			}
			if(this.searchModel.ename != '') {
				employeeList = employeeList.filter((item) => {
					return item.ename.indexOf(this.searchModel.ename) != -1
				})
			}
			if(this.searchModel.rid != 0) {
				employeeList = employeeList.filter((item) => {
					return item.rids.indexOf(this.searchModel.rid) != -1
				})
			}
			employeeList = employeeList.slice((this.page1-1)*this.pageSize,this.page1*this.pageSize);
			this.employeeList = employeeList;
			this.total2 = 0;
			this.page2 = 1;
		},
		searchEp() {
			this.searchModel.rid = 0;
			this.searchMode = true;
			this.getEpList();
		},
		searchEpReset() {
			this.searchModel.rid = 1;
			this.searchModel.ename = '';
			this.searchMode = false;
			this.getEpList();
		},
		selectEp(row,index) {
			this.eid = row.eid;
			this.ename = row.ename;
			this.isSelectEp = true;
			this.studentListLabel = '<span class="name_underline">'+row.ename+'</span>的学员列表';
			this.getStudentList(true);
		},
		roleChange(val) {
			this.getEpList();
		},
		getStudentList(init) {
			this.loading2 = true;
			var params = {
				with: 'student',
				page: this.page2,
				pagesize: this.pageSize
			}
			if(this.eid != 0) {
				params.eid = this.eid;
			}
			if(this.searchModel.sid != 0) {
				params.sid = this.searchModel.sid;
			}
			this.$http.get('employee_students',{
				params
			})
			.then(res => {
				this.studentList = res.body.data.list;
				if(init) {
					this.total2 = res.body.data.total;
				}
				this.loading2 = false;
			})
		},
		changePage1(n) {
			this.page1 = n;
			this.getEpList();
		},
		changePage2(n) {
			this.page2 = n;
			this.getStudentList();
		},
		searchStudentReset() {
			this.isSelectEp = false;
			this.getEpList();
			this.studentListLabel = '所有学员列表';
			this.searchModel.sid = 0;
			this.studentList = [];
		},
		searchStudent() {
			if(this.searchModel.sid == 0) {
				this.$Message.info('请先选择学员');
				return;
			}
			this.eid = 0;
			this.studentListLabel = '搜索学员列表';
			this.getStudentList();
		}
	}
}
</script>
