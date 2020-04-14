<style scoped>
.student-table >>> .badge-alone {
	background: #2d8cf0 !important;
}
</style>

<template>
	<div>
		<div class="mb-2">
			<!-- <Dropdown placement="bottom-start">
				<Button type="primary" size="small" icon="plus">添加学员</Button>
				<DropdownMenu slot="list">
					<DropdownItem @click.native="addStudent('student')">正式学员</DropdownItem>
					<DropdownItem @click.native="addStudent('leave')">请假学员</DropdownItem>
					<DropdownItem @click.native="addStudent('absence')">缺课学员</DropdownItem>
					<DropdownItem @click.native="addStudent('customer')">意向客户</DropdownItem>
				</DropdownMenu>
			</Dropdown>
			<div class="hide">
				<select-student ref="student" v-model="addData.sids" @on-selected="dealSelectStudent1"></select-student>
				<select-customer ref="customer" v-model="addData.cu_ids" @on-selected="dealSelectCustomer"></select-customer>
				<select-leave ref="leave" v-model="addData.sl_ids" @on-selected="dealSelectStudent2"></select-leave>
				<select-absence ref="absence" v-model="addData.sa_ids" @on-selected="dealSelectStudent3"></select-absence>
			</div> -->
			<!-- <Input size="small" v-model="filterName" placeholder="输入姓名筛选" style="width: 200px" ></Input> -->
		</div>
		<Table class="student-table" :columns="columns" :data="filterData" :height="300"></Table>
	</div>
</template>

<script>
import moment from 'moment'
import modal from '@/libs/modal.mixin'
import common from '@/libs/common.mixin'
import AvatarAndName from 'c%/AvatarAndName.vue'

// import SelectCustomer from 'c%/SelectCustomer.vue'
// import SelectLeave from 'v%/business/makeup/leave-modal.vue'
// import SelectAbsence from 'v%/business/makeup/absence-modal.vue'
// import SelectStudent from 'c%/SelectStudent.vue'

export default {
	mixins: [modal, common],
	// components: {
	// 	SelectCustomer,
	// 	SelectLeave,
	// 	SelectAbsence,
	// 	SelectStudent
	// },
	props: {
		tableData: {
			type: Array,
			default: () => {
				return []
			}
		},
		addData: {
			type: Object,
			default: () => {
				return {
					sids: [],
					cu_ids: [],
					sl_ids: [],
					sa_ids: [],
					payType: 1,
					payNum: 0
				}
			}
		}
	},
	data () {
		const vm = this;

		return {
			filterName: '',
			columns: [
				{
					// 操作
					title: ' ',
					width: 60,
					render: (h, params) => {
						return h('Button', {
							props: {
								type: 'ghost',
								shape: 'circle',
								icon: 'ios-trash',
								size: 'small'
							},
							on: {
								click: () => {
									vm.$Modal.confirm({
										content: '确认移除该学员',
										onOk: () => {
											let deleteIndex = vm.tableData.findIndex(item => {
												return item.index == params.row.index
											})
											if(deleteIndex !== -1) {
												vm.tableData.splice(deleteIndex, 1)
											}
										}
									})
								}
							}
						})
					}
				},
				{
					// 学员
					renderHeader: (h, params) => {
						return h('span', [
							h('span', '学员'),
							h('Badge', {
								props: {
									count: vm.totalStudent,
									className: 'badge-alone'
								},
								style: {
									marginLeft: '5px'
								}
							})
						])
					},
					render: (h, params) => {
						let row = params.row,
							data = params.row.data;

						let propsObj = null;
						if(row.type < 4) {
							propsObj = {
								src: data.photo_url,
								name: data.student_name,
								nickname: data.nickname,
								sex: data.sex,
								sid: data.sid,
								detailAction: 2
							}
						}
						else {
							propsObj = {
								name: data.name,
								nickname: data.nickname,
								sex: data.sex,
								cu_id: data.cu_id
							}
						}

						let HeadEl = h(AvatarAndName, {
							style: {
								display: 'inline-block'
							},
							props: propsObj
						})
						
						let type = params.row.type;
						if(type > 1) {
							let label = '',
								color = '';
							if(type == 2) {
								label = '假';
								color = 'yellow';
							}
							else if(type == 3) {
								label = '缺';
								color = 'yellow';
							}
							else if(type == 4) {
								label = '试';
								color = 'green';
							}

							let TagEl = h('Tag', {
								props: {
									color: color
								},
								style: {
									marginLeft: '5px'
								}
							}, label)

							return h('span', [HeadEl, TagEl])
						}
						else {
							return HeadEl
						}
					}
				},
				{
					// 出勤
					width: 190,
					renderHeader: (h, params) => {
						let CheckboxEl = h('Checkbox', {
							props: {
								value: vm.isAllAttend
							},
							on: {
								'on-change': (val) => {
									this.filterData.forEach(item => {
										item.is_attend = val ? 1 : 0;
										item.is_pay = val;
									})
								}
							}
						}, '出勤')

						let BadgeEl = h('Badge', {
							props: {
								count: vm.totalAttend,
								className: 'badge-alone'
							}
						})

						return h('span', [CheckboxEl, BadgeEl])
					},
					render: (h, params) => {
						let row = params.row;
						let RadioGroupEl = h('RadioGroup', {
							props: {
								value: row.is_attend,
								type: 'button',
								size: 'small'
							},
							style: {
								marginTop: '10px'
							},
							on: {
								'on-change': (val) => {
									this.filterData[params.index].is_attend = val;

									if(val == 1) {
										this.filterData[params.index].is_pay = true
									}
									else if(val == 0) {
										this.filterData[params.index].is_pay = false
									}
								}
							}
						}, [
							h('Radio', {
								props: {
									label: 1
								}
							}, '出勤'),
							h('Radio', {
								props: {
									label: 0
								}
							}, '缺勤')
						])

						let InputEl = h('Input', {
							props: {
								value: row.remark,
								placeholder: '缺勤原因'
							},
							style: {
								width: '150px',
								marginTop: '10px',
								marginBottom: '10px'
							},
							on: {
								'on-change': (e) => {
									this.filterData[params.index].remark = e.target.value;
								}
							}
						})

						if(!row.is_leave&&row.is_attend == 0) {
							return h('span', [RadioGroupEl, h('br'), InputEl])
						}
						else {
							return h('span', [RadioGroupEl])
						}
					}
				},
				{
					// 请假
					width: 190,
					renderHeader: (h, params) => {
						let CheckboxEl = h('Checkbox', {
							props: {
								value: vm.isAllLeave
							},
							on: {
								'on-change': (val) => {
									this.filterData.forEach(item => {
										item.is_leave = val;
										if(val) {
											item.is_attend = 0;
										}
									})
								}
							}
						}, '请假')

						let BadgeEl = h('Badge', {
							props: {
								count: vm.totalLeave,
								className: 'badge-alone'
							}
						})

						return h('span', [CheckboxEl, BadgeEl])
					},
					render: (h, params) => {
						let row = params.row;
						let CheckboxEl = h('Checkbox', {
							props: {
								value: row.is_leave
							},
							style: {
								marginTop: '10px'
							},
							on: {
								'on-change': (val) => {
									this.filterData[params.index].is_leave = val;
									if(val) {
										this.filterData[params.index].is_attend = 0;
									}
								}
							}
						})

						let InputEl = h('Input', {
							props: {
								value: row.remark,
								placeholder: '请假理由'
							},
							style: {
								width: '150px',
								marginBottom: '10px'
							},
							on: {
								'on-change': (e) => {
									this.filterData[params.index].remark = e.target.value;
								}
							}
						})

						if(row.is_leave) {
							return h('span', [CheckboxEl, h('br'), InputEl])
						}
						else {
							return h('span', [CheckboxEl])
						}
					}
				},
				{
					// 扣课时/金额
					width: 250,
					renderHeader: (h, params) => {
						let CheckboxEl = h('Checkbox', {
							props: {
								value: vm.isAllPay
							},
							on: {
								'on-change': (val) => {
									this.filterData.forEach(item => {
										if(item.type < 4) {
											item.is_pay = val
										}
									})
								}
							}
						})

						let SelectEl = h('Select', {
							props: {
								value: vm.addData.payType,
								transfer: true
							},
							style: {
								width: '70px'
							},
							on: {
								'on-change': (val) => {
									vm.addData.payType = val
								}
							}
						}, [
							h('Option', {
								props: {
									value: 1,
									key: 1
								}
							}, '扣课时'),
							h('Option', {
								props: {
									value: 2,
									key: 2
								}
							}, '扣金额')
						])

						let BadgeEl = h('Badge', {
							props: {
								count: vm.totalPay,
								className: 'badge-alone'
							},
							style: {
								marginLeft: '5px'
							}
						})

						let InputNumberEl = h('InputNumber', {
							props: {
								min: 0,
								value: vm.addData.payNum
							},
							on: {
								'on-change': (val) => {
									vm.addData.payNum = val
								}
							},
							style: {
								marginLeft: '5px'
							}
						})

						return h('span', [CheckboxEl, SelectEl, BadgeEl, InputNumberEl])
					},
					render: (h, params) => {
						let row = params.row;

						if(row.type == 4) {
							return h('span', {
								style: {
									marginLeft: '50px'
								}
							}, '无')
						}
						else {
							let data = params.row.data,
								num = vm.addData.payType == 1 ? data.remain_lesson_hours : data.money;
							let CheckboxEl = h('Checkbox', {
								props: {
									value: num < vm.addData.payNum ? false : row.is_pay,
									disabled: num < vm.addData.payNum
								},
								on: {
									'on-change': (val) => {
										this.filterData[params.index].is_pay = val
									}
								}
							})

							let color = '#657180';
							if(num < vm.addData.payNum) {
								color = '#ed3f14'
							}

							let RestLabel = h('span', {
								style: {
									color: color
								},
								attrs: {
									title: num < vm.addData.payNum ? '课时数/余额不足' : ''
								}
							}, `剩（${num}）`)
							
							return h('div', {
								style: {
									marginTop: '10px',
									paddingLeft: '50px'
								}
							}, [CheckboxEl, RestLabel])
						}
					}
				}
			]
		}
	},
	computed: {
		totalStudent() {
			return this.filterData.length
		},
		isAllAttend() {
			let filterData = this.filterData.filter(item => {
				return item.is_attend == 1
			})

			if(filterData.length == this.totalStudent) {
				return true
			}
			else {
				return false
			}
		},
		isAllLeave() {
			let filterData = this.filterData.filter(item => {
				return item.is_leave
			})

			if(filterData.length == this.totalStudent) {
				return true
			}
			else {
				return false
			}
		},
		totalAttend() {
			let filterData = this.filterData.filter(item => {
				return item.is_attend == 1
			})

			return filterData.length
		},
		totalLeave() {
			let filterData = this.filterData.filter(item => {
				return item.is_leave
			})

			return filterData.length
		},
		totalPay() {
			let filterData = this.filterData.filter(item => {
				return item.is_pay
			})

			return filterData.length
		},
		isAllPay() {
			let filterData = this.filterData.filter(item => {
				return item.type == 4 ? true : item.is_pay
			})

			if(filterData.length == this.totalStudent) {
				return true
			}
			else {
				return false
			}
		},
		filterData() {
			let filterName = this.filterName,
				tableData = this.tableData;
			if(filterName == '') {
				return tableData
			}
			else {
				return this.tableData.filter(item => {
					if(item.type < 4) {
						return item.data.student_name.indexOf(filterName) !== -1
					}
					else if(item.type == 4) {
						return item.data.name.indexOf(filterName) !== -1
					}
				})
			}
		}
	},
	methods: {
		filterDataAction() {
			let filterName = this.filterName,
				tableData = this.tableData;
			if(filterName == '') {
				return tableData
			}
			else {
				return this.tableData.filter(item => {
					if(item.type < 4) {
						return item.data.student_name.indexOf(filterName) !== -1
					}
					else if(item.type == 4) {
						return item.data.name.indexOf(filterName) !== -1
					}
				})
			}
		},
		dealSelectStudent1(data) {
			this.dealStudent(data, 1);
		},
		dealSelectStudent2(data) {
			this.dealStudent(data, 2);
		},
		dealSelectStudent3(data) {
			this.dealStudent(data, 3);
		},
		dealStudent(data, type) {
			if(data.length > 0) {
				let startIndex = this.tableData.length;
				let existStudnet = '';
				data.forEach(item => {
					let index = this.tableData.findIndex(item2 => {
						return item2.type < 4&&item2.data.sid == item.sid
					})
					if(index !== -1) {
						existStudnet += (type > 1 ? item.student.student_name : item.student_name) + '，'
					}
					else {
						this.tableData.push({
							index: startIndex,
							type: type,
							is_attend: -1,
							is_leave: false,
							is_pay: false,
							data: type > 1 ? item.student : item
						})
						startIndex++;
					}
				})
				if(existStudnet) {
					let text = existStudnet.substr(0, existStudnet.length - 1);
					this.$Message.info(`学员【${text}】已存在，请勿重复添加`);
				}
			}
		},
		dealSelectCustomer(data) {
			if(data.length > 0) {
				let startIndex = this.tableData.length;
				let existStudnet = '';
				data.forEach(item => {
					let index = this.tableData.findIndex(item2 => {
						return item2.type == 4&&item2.data.cu_id == item.cu_id
					})
					if(index !== -1) {
						existStudnet += item.name + '，'
					}
					else {
						this.tableData.push({
							index: startIndex,
							type: 4,
							is_attend: -1,
							is_leave: false,
							is_pay: false,
							data: item
						})
						startIndex++;
					}
				})
				if(existStudnet) {
					let text = existStudnet.substr(0, existStudnet.length - 1);
					this.$Message.info(`学员【${text}】已存在，请勿重复添加`);
				}
			}
		},
		addStudent(ref) {
			let map_title = {'customer':'选择客户','student':'选择学员','leave':'选择请假学员','absence':'选择缺课学员'},
				title = map_title[ref]
			if(ref=='customer'||ref=='student'){
				this.$refs[ref].openModal()
			}else{
				this.$refs[ref].show(title,'add')
			}
		}
	}
	
}
</script>