<style lang="less">
	.service-standard {
		.ivu-card {
			.modal-table tbody tr:nth-child(2n) {
				background-color: #fff;
			}
		}
	}
</style>
<template>
	<div class="c-grid service-standard">
		<Card dis-hover v-for="(cate,i) in data" class="mb-4">
			<p slot="title">{{i=='classroom'?'课堂服务':'学期服务'}}</p>
			<table class="modal-table">
				<thead>
					<tr>
						<th><div class="ivu-table-cell">服务名称</div></th>
						<th><div class="ivu-table-cell">完成角色</div></th>
						<th><div class="ivu-table-cell">服务类型</div></th>
						<th><div class="ivu-table-cell">服务星级</div></th>
						<th><div class="ivu-table-cell">系统内置</div></th>
						<th><div class="ivu-table-cell">是否需要上传附件</div></th>
						<th><div class="ivu-table-cell">启用</div></th>
						<th><div class="ivu-table-cell">操作</div></th>
					</tr>
				</thead>
				<tbody v-for="(item,j) in cate">
					<tr >
						<td colspan="7">
							<div class="ivu-table-cell">
								<Tag color="blue">{{map[j]}}</Tag>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Button 
									type="ghost" 
									shape="circle" 
									size="small" 
									icon="plus"
									@click="add(i,j)">
								</Button>
							</div>
						</td>
					</tr>
					<tr v-for="(service,index) in item">
						<td><div class="ivu-table-cell">{{service.title}}</div></td>
						<td><div class="ivu-table-cell" v-html="formatRoleName(service)"></div></td>
						<td><div class="ivu-table-cell">{{service.object==0?'班级服务':'个性服务'}}</div></td>
						<td>
							<div class="ivu-table-cell">
								<template v-if="service.object==1">
									<Rate 
										v-model="service.service_level" 
										:count="service_level_config" 
										disabled 
										v-if="service.service_level>0">
									</Rate>
									<span v-else>不限</span>
								</template>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Icon 
									color="#39f"
									size="16" 
									:type="service.system?'android-checkbox-outline':'android-checkbox-outline-blank'">
								</Icon>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Icon 
									color="#39f"
									size="16" 
									:type="service.need_attach?'android-checkbox-outline':'android-checkbox-outline-blank'">
								</Icon>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<i-switch 
									v-model="service.enable" 
									:true-value="1" 
									:false-value="0"
									@on-change="switchEnable(i,j,index)">
								</i-switch>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Button 
									type="ghost" 
									shape="circle" 
									size="small" 
									icon="edit"
									@click="edit(i,j,index)">
								</Button>
								<Button
									v-if="service.system==0" 
									type="ghost" 
									shape="circle" 
									size="small" 
									icon="ios-trash"
									@click="delItem(i,j,index)">
								</Button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</Card>
		<Spin size="large" fix v-if="loading"></Spin>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	export default {
		mixins: [common,globals],
		data() {
			return {
				cfg_id: 0,
				cfg_name: 'service_standard',
				data: null,
				map: {
					before: '课前',
					after: '课后',
					in: '课中',
					first: '期初',
					middle: '期中',
					last: '期末'
				},
				loading: true
			}
		},
		mounted() {
			this.init_service_standard()
		},
		methods: {
			init_service_standard() {
				this.loading = true
				this.$rest('configs?cfg_name='+this.cfg_name)
				.get()
				.success(res => {
					this.cfg_id = res.cfg_id
					this.data = res.cfg_value
					this.loading = false
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			add(i,j) {
				this.$Modal.open('system/configs/service-standard/info-modal.vue',{
					on: {
						save: (info) => {
							let data = util.copy(this.data)
							data[i][j].push(info)
							this.ok(data)
						}
					}
				})
				.then(modal => {
					modal
					.show(util.sprintf('添加服务【%s】',this.map[j]),'add')
				})
			},
			edit(i,j,index) {
				this.$Modal.open('system/configs/service-standard/info-modal.vue',{
					on: {
						save: (info) => {
							let data = util.copy(this.data)
							data[i][j].splice(index,1,info)
							this.ok(data)
						}
					}
				})
				.then(modal => {
					modal
					.set('info',this.data[i][j][index])
					.show(util.sprintf('编辑服务【%s】',this.data[i][j][index].title),'edit')
				})
			},
			switchEnable(i,j,index) {
				let data = util.copy(this.data)
				this.ok(data)
			},
			delItem(i,j,index) {
				let data = util.copy(this.data)
				data[i][j].splice(index,1)
				this.ok(data)
			},
			formatRoleName(item) {
				let result = ''
				item.rids.forEach(rid => {
					result += this.$filter('role_name')(rid) + '<br>'
				})
				return result
			},
			ok(data) {
				let params = {
					cfg_name: this.cfg_name,
					cfg_value: data
				}
				let [method,uri] = (this.cfg_id==0?['post','configs']:['put','configs/'+this.cfg_id])
				this.loading = true
				this.$rest(uri)
				[method](params)
				.success(res => {
					this.action = ''
					this.$Message.success('保存成功')
					this.$store.dispatch('updateGlobalVar','configs')
					this.init_service_standard()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>