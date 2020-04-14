<style>
.student-list1 {
	width: 55%;
	float: left;
	position: relative;
	padding-right: 5%;
	border-right: 1px dashed #CCC;
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

.class-table1 {
	width: 40%;
	float: right;
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

.studnet-table1 .ivu-table-row {
	cursor: pointer !important;
}

.table-title {
	color: #464c5b;
	font-size: 15px;
	font-weight: bold;
	margin-left: 5px;
}
</style>


<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="searchForm" :model="searchModel" inline style="padding-left: 10px;">
				<FormItem prop="student_name">
					<Input style="width:280px" type="text" v-model="searchModel.student_name" placeholder="请输入学员姓名"></Input>
				</FormItem>
				<FormItem>
					<Button type="primary" @click="initSearchInfo" size="large"><Icon type="search"></Icon> 搜索</Button>
					<Button type="primary" @click="searchReset" size="large"><Icon type="refresh"></Icon> 重置</Button>
				</FormItem>
			</Form>
		</div>
		<div class="box box-result">
			<div class="student-list1" style="z-index:997">
				<Tooltip content="点击学员，在右侧显示该学员所属班级" placement="right-start">
					<span class="table-title" style="margin-bottom: 10px;margin-right: 10px;"><Badge dot>学员列表</Badge></span>
				</Tooltip>
				<RadioGroup type="button" v-model="list_type" size="small" @on-change='listTypeChange'>
					<Radio label="已分班学员"></Radio>
					<Radio label="未分班学员"></Radio>
				</RadioGroup>
				<Table :columns="columns1" :data="studentList" style="margin-top:10px" @on-row-click="selectStudent" highlight-row :loading="loading1" class="studnet-table1"></Table>
				<Page class="pager" show-total :total="total" :current="page" :page-size="pageSize" @on-change="changePage" style="margin: 10px 5px 0px 0px;"/>
			</div>
			<Affix :offset-top="90">
				<div class="class-table1" style="margin-top: 5px;">
					<p class="table-title" style="margin-bottom: 10px;">班级列表</p>
					<Table :columns="columns2" :data="classData" :no-filtered-data-text="'该学员没有加入班级'" :loading="loading2"></Table>
				</div>
			</Affix>
			<div class="clear"></div>
		</div>
	</div>
</template>

<script>
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'

	export default {
		mixins: [ common,globals ],
		data () {
			return {
				list_type: '已分班学员',
				pageSize: 10,
				page: 1,
				total: 0,
				loading1: false,
				loading2: false,
				studentList: [],
				classData: [],
				searchModel: {
					student_name: "",
				},
				columns1: [
					{
                        type: 'index',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '姓名',
                        key: 'student_name'
                    },
                    {
                        title: '年龄',
						key: 'age',
						render: (h, params) => {
                            return h('span', util.age(params.row.birth_time));
                        }
                    },
                    {
                        title: '年级',
						key: 'school_grade',
						render: (h, params) => {
                            return h('span', this.labelDicts(params.row.school_grade,'grade')||'-');
                        }
                    },
                    {
                        title: '余额',
                        key: 'money',
                    },
                    {
                        title: '剩余/总课时',
						key: '',
						render: (h, params) => {
                            return h('span', params.row.student_lesson_remain_hours+'/'+ params.row.student_lesson_hours);
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
                        title: '班级名称',
						key: 'class_name',
						render: (h, params) => {
                            return h('span', params.row.one_class.class_name);
                        }
                    },
                    {
                        title: '入班日期',
						key: 'in_time',
						render: (h, params) => {
                            return h('span', params.row.in_time.split(" ")[0]);
                        }
                    },
                    {
                        title: '开班日期',
						key: '',
						render: (h, params) => {
                            return h('span', params.row.one_class.start_lesson_time);
                        }
                    },
                ]
			}
		},
		mounted() {
			this.initInfo(true);
		},
		methods: {
			assignClass() {
				this.$Modal.open('c%/AssignStudent.vue')
                .then(modal=>{
                    modal.show('分配学员','view')
                })
			},
			changePage(n) {
				this.page = n;
				this.initInfo(false);
			},
			listTypeChange() {
				this.searchModel.student_name = '';
				this.initInfo(true);
			},
			selectStudent(row,index) {
				if(this.list_type == '已分班学员') {
					this.loading2 = true;
					this.$http.get('students/'+row.sid+'/classes',{
						params: {
							page: 1,
							pagesize: 10
						}
					})
					.then(function(res) {
						this.loading2 = false;
						this.classData = res.body.data.list;
					})
				}
			},
			initSearchInfo() {
				this.initInfo(true);
			},
			searchReset() {
				this.$refs['searchForm'].resetFields();
				this.initInfo(true);
			},
			initInfo(resetPage) {
				this.loading1 = true;
				if(resetPage) {
					this.page = 1;
				}
				var page = this.page;
				var pageSize = this.pageSize;
				var student_name = this.searchModel.student_name;
				var isAssignFlag = this.list_type == '已分班学员'?true:false;
				var get_url = '';
				if(isAssignFlag) {
					get_url = 'students/get_class_students'
				}
				else {
					get_url = 'students/get_noclass_students'
				}
				this.$http.get(get_url,{
					params: {
						page: page,
						pagesize: pageSize,
						student_name: student_name
					}
				})
				.then(function(res) {
					this.loading1 = false;
					this.studentList = res.body.data.list;
					this.total = res.body.data.total;
					this.classData = [];
				})
			}
		}
	}
</script>
