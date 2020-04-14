<template>
	<div class="c-grid">	
		<div class="row">	
			<div class="col-md-6">
				<Card>
					<div slot="title">我的角色列表</div>	
					<Tag v-for="(item,index) in roleList" color="blue">
						{{item.role_name}}
					</Tag>
				</Card>
				<Card class="mt-3">
					<div slot="title">我的资源权限</div>
					<table class="modal-table b-a-1">				
						<thead>
							<th class="b-r-1"><div class="ivu-table-cell">资源</div></th>
							<th class="b-r-1"><div class="ivu-table-cell">我的</div></th>
							<th class="b-r-1"><div class="ivu-table-cell">所有</div></th>
						</thead>
						<template v-for="item in resouceList">
							<tr>
								<td class="b-r-1">
									<div class="ivu-table-cell">							  										  		
								  		{{item.text}}							  	
									</div>
								</td>
								<td class="b-r-1">
									<div class="ivu-table-cell">
										<!--<Tag color="green">-->
											<Icon class="text-success" type="checkmark-circled"></Icon>
										<!--</Tag>-->
									</div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<!--<Tag :color="hasPer(item.uri)?'green':'default'">-->
											<Icon  :class="hasPer(item.uri)?'text-success':''" :type="hasPer(item.uri)?'checkmark-circled':'close-circled'"></Icon>
										<!--</Tag>-->
									</div>
								</td>
							</tr>					
						</template>
					</table>
				</Card>
			</div>
			<div class="col-md-6">
				<Card>
					<div slot="title">我的功能权限</div>
					<div :style="{maxHeight: tableHeight+'px',overflow: 'auto'}">
						<table class="modal-table b-a-1">				
							<thead>
								<th class="b-r-1"><div class="ivu-table-cell">权限项目</div></th>
								<th class="b-r-1"><div class="ivu-table-cell">超级管理员</div></th>
								<th class="b-r-1"><div class="ivu-table-cell">我</div></th>
							</thead>
							<template v-for="item in perList">
								<tr>
									<td class="b-r-1">
										<div class="ivu-table-cell">							  										  		
									  		<Icon type="network"></Icon> {{item.text}}							  	
										</div>
									</td>
									<td  class="b-r-1">
										<div class="ivu-table-cell">
											<!--<Tag color="green">-->
												<Icon class="text-success" type="checkmark-circled"></Icon>
											<!--</Tag>-->
										</div>
									</td>
									<td>
										<div class="ivu-table-cell">
											<!--<Tag :color="hasPer(item.uri)?'green':'default'">-->
												<Icon  :class="hasPer(item.uri)?'text-success':''" :type="hasPer(item.uri)?'checkmark-circled':'close-circled'"></Icon>
											<!--</Tag>-->
										</div>
									</td>
								</tr>
								<template v-for="sub in item.sub">
									<tr>
										<td class="b-r-1">							
											<div class="ivu-table-cell lv1">
												<Icon type="usb"></Icon> {{sub.text}}
											</div>
										</td>
										<td class="b-r-1">							
											<div class="ivu-table-cell">
												<!--<Tag color="green">-->
													<Icon class="text-success" type="checkmark-circled"></Icon>
												<!--</Tag>-->
											</div>
										</td>
										<td>							
											<div class="ivu-table-cell">
												<!--<Tag :color="hasPer(sub.uri)?'green':'default'">-->
													<Icon :class="hasPer(sub.uri)?'text-success':''" :type="hasPer(sub.uri)?'checkmark-circled':'close-circled'"></Icon>
												<!--</Tag>-->
											</div>
										</td>						
									</tr>
									<template v-if="sub.sub">
										<template v-for="s in sub.sub">
											<tr>
												<td class="b-r-1">							
													<div class="ivu-table-cell lv2">
														<Icon type="usb"></Icon> {{s.text}}
													</div>
												</td>
												<td class="b-r-1">							
													<div class="ivu-table-cell">
														<!--<Tag color="green">-->
															<Icon class="text-success" type="checkmark-circled"></Icon>
														<!--</Tag>-->
													</div>
												</td>
												<td>							
													<div class="ivu-table-cell">
														<!--<Tag :color="hasPer(sub.uri)?'green':'default'">-->
															<Icon :class="hasPer(s.uri)?'text-success':''" :type="hasPer(s.uri)?'checkmark-circled':'close-circled'"></Icon>
														<!--</Tag>-->
													</div>
												</td>						
											</tr>
											<template v-if="s.sub">
												<template v-for="ss in s.sub">
													<tr>
														<td class="b-r-1">							
															<div class="ivu-table-cell lv3">
																<Icon type="usb"></Icon> {{ss.text}}
															</div>
														</td>
														<td class="b-r-1">							
															<div class="ivu-table-cell">
																<!--<Tag color="green">-->
																	<Icon class="text-success" type="checkmark-circled"></Icon>
																<!--</Tag>-->
															</div>
														</td>
														<td>							
															<div class="ivu-table-cell">
																<!--<Tag :color="hasPer(sub.uri)?'green':'default'">-->
																	<Icon :class="hasPer(ss.uri)?'text-success':''" :type="hasPer(ss.uri)?'checkmark-circled':'close-circled'"></Icon>
																<!--</Tag>-->
															</div>
														</td>						
													</tr>
												</template>	
											</template>
										</template>
									</template>
								</template>
							</template>
						</table>
					</div>
				</Card>
			</div>
		</div>
	</div>
</template>

<script>
	import util from '@/libs/util'
	
	export default{
		data () {
			return {
				
			}
		},
		mounted () {
			
		},		
		methods: {
			hasPer (per) {
				let pers = this.$store.state.user.info.pers
				
				return pers.indexOf(per) > -1				
			},
		},		
		computed: {	
			resouceList () {
				return this.$store.state.gvars.res_pers
			},
			roleList () {
				let rids = this.$store.state.user.info.employee.rids,
					list = this.$store.state.gvars.roles,
					result = []
					
					if(rids.length){
						rids.forEach(r=>{
							let obj = list.find(l=>l.rid==r)
							if(obj){
								result.push(obj)
							}
						})
					}					
				return result
			},
			perList () {
				
				return this.$store.state.gvars.pers
			},
			tableHeight () {
				let client_height = util.get_client_height()
				
				//表格高度： 窗口高度 - header - breadcrub -  CardHeader - footer - 间隙 
				return client_height - 280 
			}
		}
	}
</script>

<style lang="less" scoped>
	.b-r-1,.b-a-1{
		border-color: #e9eaec!important
	}
	.lv1{
		padding-left:40px;
	}
	.lv2{
		padding-left:60px;
	}
	.lv3{
		padding-left:80px;
	}
</style>