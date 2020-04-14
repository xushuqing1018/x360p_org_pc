<template>
	<div class="c-grid">
		<div class="padder-sm row">
			<div class="col-sm-12">
				<Button type="primary" icon="reply" size="small" @click="back"></Button>
				<Button type="primary" icon="refresh" size="small" @click="refreshData"></Button>
				<operation-franchisee class="pull-right" placement="bottom-end" :info="data" :is-detail="true" @on-success="refreshData"></operation-franchisee>
			</div>		
			<data-ready ref="dr" :cache="false" :data="[info_url]" @refresh="refresh" @ready="dataReady" class="col-sm-12 mt-3">
				<Card dis-hover>
					<div slot="title">
						<Icon size="24" type="ios-person" style="vertical-align: middle;"></Icon>
						加盟商信息
					</div>
					<Row type="flex" justify="center" align="middle">
						<Col span="8">
							<Row type="flex" justify="center" align="middle">
								<Col span="12">
									<letterAvatar 
										:name="data.org_name" 
										:src="''" 
										size='120' 
										:rounded="true">
									</letterAvatar>
								</Col>
								<Col span="12">
									<h3>{{data.org_name}}</h3>
									<p class="mt-2">状态：{{data.status|franchisee_status}}</p>
								</Col>
							</Row>
						</Col>
						<Col span="16">
							<Card dis-hover>
								<div slot="title">
									<Icon type="information-circled" style="vertical-align: middle;" size="20"></Icon>
									基本信息
								</div>
								<Form :label-width="120" class="row">
									<Form-item label="联系电话：" class="mb-0 col-sm-4">
										{{data.mobile||'-'}}
									</Form-item>
									<Form-item label="地址：" class="mb-0 col-sm-4">
										{{data.org_address||'-'}}
									</Form-item>
									<Form-item label="营业执照：" class="mb-0 col-sm-4">
										{{data.business_license||'-'}}
									</Form-item>
									<Form-item label="合同开始：" class="mb-0 col-sm-4">
										{{data.contract_start_int_day||'-'}}
									</Form-item>
									<Form-item label="合同结束：" class="mb-0 col-sm-4">
										{{data.contract_end_int_day||'-'}}
									</Form-item>
									<Form-item label="开业日期：" class="mb-0 col-sm-4">
										{{data.open_int_day||'-'}}
									</Form-item>
									<Form-item label="销售员工：" class="mb-0 col-sm-4">
										{{data.sale_eid|ename('-')}}
									</Form-item>
									<Form-item label="督导员工：" class="mb-0 col-sm-4">
										{{data.service_eid|ename}}
									</Form-item>									
								</Form>
							</Card>
							<Card dis-hover class="mt-3">
								<div slot="title">
									<Icon type="person" style="vertical-align: middle;" size="20"></Icon>
									系统信息
								</div>
								<div style="font-size: 12px;">
									<table class="modal-table" v-if="data.org">
										<thead>
											<tr>
												<th><div class="ivu-table-cell">域名</div></th>
												<th><div class="ivu-table-cell">账号数上限</div></th>
												<th><div class="ivu-table-cell">校区数上限</div></th>
												<th><div class="ivu-table-cell">学员数上限</div></th>
												<th><div class="ivu-table-cell">状态</div></th>
												<th><div class="ivu-table-cell">到期日期</div></th>
												<th><div class="ivu-table-cell">操作</div></th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td><div class="ivu-table-cell">{{host}}</div></td>
												<td><div class="ivu-table-cell">{{data.org.account_num_limit}}</div></td>
												<td><div class="ivu-table-cell">{{data.org.branch_num_limit}}</div></td>
												<td><div class="ivu-table-cell">{{data.org.student_num_limit}}</div></td>
												<td>
													<div class="ivu-table-cell">
														<Icon 
															:type="data.org.is_frozen?'close-circled':'checkmark-circled'"
															:color="data.org.is_frozen?'#999999':'#006600'"
															>
														</Icon>
														{{data.org.is_frozen?'已锁定':'已开启'}}
													</div>
												</td>
												<td>
													<div class="ivu-table-cell">
														<p>{{data.org.expire_day|int_date}}</p>
														<p :class="remain_days>15?'text-success':'text-danger'">
															{{remain_days>0?`剩余 ${remain_days} 天`:`已过期 ${-remain_days} 天`}}
														</p>
													</div>
												</td>
												<td>
													<div class="ivu-table-cell">
														<operation-account :info="data.org" @on-success="refreshData"></operation-account>
													</div>
												</td>
											</tr>
										</tbody>
									</table>
									<p class="text-center" v-else>未开通校360系统</p>
								</div>
							</Card>
						</Col>
					</Row>
				</Card>
			</data-ready>
			<div class="col-sm-12 mt-3">	
				<menu-page parent-name="app_franchisees_archive_info" nav-from="router" sub-class="sub-nav-content"></menu-page>
			</div>

		</div>
	</div>
</template>

<script>
	import moment 		  	from 'moment'	
	import util,{_} 		from '@/libs/util'
	import common 		  	from '@/libs/common.mixin'
	import globals 		  	from '@/libs/globals.mixin'
	
	import MenuPage 		from 'c%/MenuPage.vue'
	import dataReady 	  	from 'c%/DataReady.vue'
	import LetterAvatar 	from 'c%/LetterAvatar.vue'
	import OperationAccount from './operation-account.vue'
	import OperationFranchisee from './operation-franchisee.vue'
	
	export default{
		mixins: [globals,common],
		components: {
			dataReady,
			MenuPage,
			LetterAvatar,
			OperationAccount,
			OperationFranchisee
		},
		data () {
			return {
				data: {},
				fc_id: this.$route.params.id
			}
		},
		mounted () {			
			
		},
		methods: {
			back() {
				this.$store.commit('setSearchDetail',true)
				this.$router.push('/app/franchisees/archive')
			},
			dataReady (rs) {	
				this.data = rs[0]				
			},
			refresh (rs) {
				this.data = rs.response 
			},
			refreshData () {
				this.$r('dr').refreshData(this.info_url)
			}
		},
		computed: {
			info_url(){
				return `franchisees/${this.fc_id}`
			},
			remain_days() {
				return moment(util.format_int_day(this.data.org.expire_day)).diff(moment(new Date()),'days')
			},
			host() {
				return util.sprintf('https://%s.%s',this.data.org.host,this.$store.state.user.info.product_url.split('//')[1])
			}
		}
	}
</script>
