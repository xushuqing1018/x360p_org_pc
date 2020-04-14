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

.class-list .ivu-table-row {
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
				<FormItem prop="class_name">
					<Input style="width:280px" type="text" v-model="searchModel.class_name" placeholder="请输入班级名称"></Input>
				</FormItem>
				<FormItem>
					<Button type="primary" @click="initSearchInfo" size="large"><Icon type="search"></Icon> 搜索</Button>
					<Button type="primary" @click="searchReset" size="large"><Icon type="refresh"></Icon> 重置</Button>
				</FormItem>
			</Form>
		</div>
		<div class="box box-result">
            <div class="class-table">
				<Tooltip content="点击班级，在右侧显示该班级学员" placement="right-start">
					<p class="table-title" style="margin-bottom: 10px;"><Badge dot>班级列表</Badge></p>
				</Tooltip>
                <Table :columns="columns2" :data="classData" highlight-row :loading="loading1" @on-row-click="selectClass" class="class-list"></Table>
                <Page class="pager" show-total :total="total1" :current="page1" :page-size="pageSize" @on-change="changePage1" style="margin: 10px 5px 0px 0px;"/>
            </div>
            <div class="student-list" style="z-index:998">
				<span class="table-title">学员列表</span>
				<export-button :res="exportApi" style="margin:5px 8px 0px 5px;float:right" :disabled="!isSelectClass" :params="params"></export-button>
				<Button type="primary" icon="plus" style="margin:5px 5px 0px 5px;float:right" @click="addStudent" :disabled="!isSelectClass">添加学员</Button>
				<Table :columns="columns1" :data="studentList" style="margin-top:10px" :loading="loading2"></Table>
				<Page class="pager" show-total :total="total2" :page-size="pageSize" :current="page2" @on-change="changePage2" style="margin: 10px 5px 0px 0px;"/>
			</div>
			<div class="clear"></div>
		</div>
	</div>
</template>

<script>
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import grid from '@/libs/grid.mixin'
import globals from '@/libs/globals.mixin'
import studentOP from './student-op.vue'
import ExportButton from 'c%/ExportButton.vue'

	export default {
		mixins: [ common,globals,grid ],
		components: {
			ExportButton
		},
		data () {
			var vm = this;
			return {
				pageSize: 10,
				classInfo: {
					cid: 0,
				},
				isSelectClass: false,
				page1: 1,
				page2: 1,
                total1: 0,
                total2: 0,
				loading1: false,
				loading2: false,
				studentList: [],
				classData: [],
				searchModel: {
					class_name: "",
				},
				columns1: [
					{
                        type: 'index',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '姓名',
						key: 'student_name',
						render: (h, params) => {
                            return h('span',params.row.student.student_name);
                        }
                    },
                    {
                        title: '年龄',
						key: 'age',
						render: (h, params) => {
                            return h('span', util.age(params.row.student.birth_time));
                        }
                    },
                    {
                        title: '年级',
						key: 'school_grade',
						render: (h, params) => {
                            return h('span', this.labelDicts(params.row.student.school_grade,'grade')||'-');
                        }
                    },
                    {
                        title: '余额',
						key: 'money',
						render: (h, params) => {
                            return h('span',Number(params.row.student.money))
                        }
                    },
                    {
                        title: '剩余/总课时',
						key: '',
						render: (h, params) => {
                            return h('span', params.row.student.student_lesson_remain_hours+'/'+ params.row.student.student_lesson_hours);
                        }
                    },
                    {
                    	title: '入班日期',
                    	key: 'in_time',
                    	render:(h,params) => {
                    		return h('span',params.row.in_time)
                    	}
                    },
                    {
                        title: '操作',
                        width: 80,
						key: '',
						render: (h, params) => {
                            return h(studentOP,{
								props: {
									item: params.row
								},
								on: {
									'on-student-delete-success': function() {
										vm.studentList.splice(params.index,1)
									},
									'on-student-update-success': function() {
										vm.selectClass(params.row)
									},
								}
							});
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
						key: 'class_name'
                    },
                    {
                        title: '开班时间',
						key: 'start_lesson_time'
                    }
                ]
			}
		},
		mounted() {
			this.initInfo(true);
		},
		methods: {
			addStudent() {
				this.$Modal.open('business/class/assign-student.vue@modal',{
					props: {
						'class-info': this.classInfo,
						max: this.max
					},
					on: {
						'on-success': () => {
							this.selectClass(this.classInfo)
						}
					}
				})
                .then(modal=>{
                    modal.show('选择分班学员','add')
                })
			},
			changePage1(n) {
				this.page1 = n;
				this.initInfo(false);
			},
			changePage2(n) {
				this.page2 = n;
				this.getStudentInfo();
			},
			getStudentInfo() {
				this.loading2 = true;
				var page = this.page2;
				var pageSize = this.pageSize;
				this.$http.get("classes/"+this.classInfo.cid+"/students",{
					params: {
						page: page,
						pagesize: pageSize
					}
				})
				.then(function(res) {
					this.studentList = res.body.data.list;
					this.total2 = res.body.data.total;
					this.loading2 = false;
				})
			},
			selectClass(row,index) {
				this.isSelectClass = true;
				this.classInfo = row;
				this.page2 = 1;
				this.getStudentInfo();
			},
			initSearchInfo() {
				this.initInfo(true);
			},
			initInfo(resetPage) {
				this.loading1 = true;
				this.total2 = 0;
				this.page2 = 1;
				this.studentList = [];
				this.isSelectClass = false;
				if(resetPage) {
					this.page = 1;
				}
				var page = this.page1;
				var pageSize = this.pageSize;
				var class_name = this.searchModel.class_name;
				this.$http.get('classes',{
					params: {
						page: page,
						pagesize: pageSize,
						class_name: class_name
					}
				})
				.then(function(res) {
					this.classData = res.body.data.list;
					this.loading1 = false;
					this.total1 = res.body.data.total;
				})
			},
			searchReset() {
				this.$refs['searchForm'].resetFields();
				this.initInfo(true);
			},
		},
		computed: {
			exportApi() {
				return 'class_students'
			},
			max () {
				let num = 0
				if(this.classInfo){
					num = this.classInfo.plan_student_nums - this.classInfo.student_nums
				}
				return num
			}
		}
	}
</script>
