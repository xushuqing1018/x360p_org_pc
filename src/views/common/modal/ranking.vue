<style>
.rank-type-bar {
	text-align: center;
	padding: 10px 0px;
}

.rank-type-bar .ivu-radio-group-item {
	padding: 0px 20px;
}

.rank-type-bar .ivu-radio-wrapper-checked {
	color: white;
	background-color: #39f;
}

.rank-content {
	padding: 0px 20px;
}

.time-type {
	float: right;
}

.rank-content-head {
	margin-bottom: 10px;
}
</style>


<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="700">
		<div class="rank-type-bar">
			<RadioGroup v-model="rankType" type="button">
				<Radio label="p">业绩排行榜</Radio>
				<Radio label="l">课时排行榜</Radio>
			</RadioGroup>
		</div>
		<div class="rank-content">
			<div class="rank-content-head clearfix">
				<Dropdown trigger="click" v-if="rankType == 'p'" style="margin-right: 10px;">
					<a href="javascript:void(0)">
						按{{pTypeText}}
						<Icon type="arrow-down-b"></Icon>
					</a>
					<DropdownMenu slot="list">
						<DropdownItem @click.native="changePType('money')">按业绩金额</DropdownItem>
						<DropdownItem @click.native="changePType('num')">按签单数量</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				<Dropdown trigger="click">
					<a href="javascript:void(0)">
						{{timeTypeText}}
						<Icon type="arrow-down-b"></Icon>
					</a>
					<DropdownMenu slot="list">
						<DropdownItem @click.native="changeTimeType(1)">本月</DropdownItem>
						<DropdownItem @click.native="changeTimeType(2)">本年</DropdownItem>
						<DropdownItem @click.native="changeTimeType(3)">上月</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				<RadioGroup class="time-type" v-model="ogType" type="button" size="small" @on-change="initTableData">
					<Radio :label="0">校区</Radio>
					<Radio :label="1">机构</Radio>
				</RadioGroup>
			</div>
			<Table :columns="columns" :data="tableData" :loading="loading"></Table>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import modal 			from '@/libs/modal.mixin'
	import common 			from '@/libs/common.mixin'
	import guanjun			from '@/img/ranking/guanjun.png'
	import yajun			from '@/img/ranking/yajun.png'
	import jijun			from '@/img/ranking/jijun.png'
	import AvatarAndName	from 'c%/AvatarAndName'

	export default {
		mixins: [modal,common],
		data() {
			var vm = this;
			return {
				rankType: 'p',
				pType: 'money',
				timeType: 1,
				ogType: 0,
				dataLabel: '业绩金额',
				loading: false,
				columns: [
					{
						title: '排名',
						width: 80,
						align: 'center',
						render: (h, params) => {
							let rankIndex = params.index;
							if(rankIndex < 3) {
								let src = '';
								if(rankIndex == 0) {
									src = guanjun;
								}
								else if (rankIndex == 1) {
									src = yajun;
								}
								else if (rankIndex == 2) {
									src = jijun;
								}
								return h('img', {
									attrs: {
										src: src
									},
									style: {
										height: '26px'
									}
								})
							}
							else {
								return h('span', '#' + (params.index + 1))
							}
						}
					},
					{
						title: '姓名',
						render: (h, params) => {
							return h(AvatarAndName, {
								props: {
									src: params.row.employee.photo_url,
									name: params.row.employee.ename,
									size: 'small'
								}
							})
						}
					},
					{
						title: '所属校区',
						render: (h, params) => {
							return h('span', this.labelBranch(params.row.employee.bid))
						}
					},
					{
						render: (h, params) => {
							let total = '';
							if(this.rankType == 'p'&&this.pType == 'money') {
								total = this.label_currency + params.row.total;
							}
							else {
								total = params.row.total;
							}
							return h('span', {
								style: {
									color: 'red',
									fontSize: '13px'
								}
							}, total)
						},
						renderHeader: (h, params) => {
							return h('span', vm.dataLabel)
						}
					}
				],
				tableData: []
			}
		},
		mounted() {
			this.initTableData();
		},
		methods: {
			changePType(type) {
				this.pType = type
			},
			changeTimeType(type) {
				this.timeType = type
			},
			initTableData() {
				let url = '';
				if(this.rankType == 'p'&&this.pType == 'money') {
					url = `dashboard/receipt_ranking?ds=${this.timeType}&scope=${this.ogType}`
				}
				else if(this.rankType == 'p'&&this.pType == 'num') {
					url = `dashboard/receipt_nums?ds=${this.timeType}&scope=${this.ogType}`
				}
				else {
					url = `dashboard/class_hour_ranking?ds=${this.timeType}&scope=${this.ogType}`
				}

				this.loading = true;
				this.$http.get(url)
				.then(res => {
					var list = res.body.data.list;
					this.tableData = list;
					this.loading = false;
				},res => {
					this.$Message.error(res.body.message);
				})
			}
		},
		watch: {
			rankType(val) {
				if(val == 'p'&&this.pType == 'money') {
					this.dataLabel = '业绩金额';
				}
				else if(val == 'p'&&this.pType == 'num') {
					this.dataLabel = '签单数量';
				}
				else {
					this.dataLabel = '消耗课时';
				}
				this.initTableData();
			},
			pType(val) {
				if(this.rankType == 'p'&&val == 'money') {
					this.dataLabel = '业绩金额';
				}
				else if(this.rankType == 'p'&&val == 'num') {
					this.dataLabel = '签单数量';
				}
				else {
					this.dataLabel = '消耗课时';
				}
				this.initTableData();
			},
			timeType() {
				this.initTableData();
			}
		},
		computed: {
			pTypeText() {
				if(this.pType == 'money') {
					return '业绩金额'
				}
				else {
					return '签单数量'
				}
			},
			timeTypeText() {
				if(this.timeType == 1) {
					return '本月'
				}
				else if(this.timeType == 2){
					return '本年'
				}
				else {
					return '上月'
				}
			}
		}
	}
</script>