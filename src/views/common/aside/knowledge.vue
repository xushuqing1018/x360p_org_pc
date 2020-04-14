<template>
	<div class="aside-knowledge">
		<div class="kl-search-wrapper">
			<div class="kl-box">
				<Input v-model="search_field.keywords" placeholder="请输入关键词..." @on-enter="search">
					<Button type="primary" slot="append" icon="search" @click="search"></Button>
				</Input>
			</div>
		</div>
		<template v-if="action == 'list'">
			<div class="kl-list-wrapper">
				<div class="kl-item" v-for="item in data" @click="clickItem(item)">
					<Icon type="record" size="12" color="#00CCCB"></Icon>
					<p>【{{item.ktype_did|dict_title('knowlege_type')}}】{{item.title}}</p>
				</div>
				<div class="kl-empty" v-if="data.length==0">没有关联的知识点</div>
				<div class="kl-add-btn">
					<Button type="ghost" @click="addKnowledge" v-per="'knowledge.add'">我要补充</Button>
				</div>
				<Page 
					v-if="total>10"
					simple
					class="mt-4 text-center"
		            :total="total" 
		            :current="pageIndex" 
		            :page-size="pageSize" 
		            @on-change="pagenation"
		            >
	            </Page>
			</div>
		</template>
		<template v-else>
			<div class="kl-detail-wrapper" :style="{height:detailHeight+'px',overflow:'auto'}">
				<div class="current-title">{{current_item.title}}</div>
				<div class="current-info">
					<Row type="flex" justify="center" align="middle">
						<Col span="8">
							<Icon type="ios-person-outline"></Icon>
							{{current_item.create_employee_name}}
						</Col>
						<Col span="8" class="text-center">
							<Icon type="ios-clock-outline"></Icon>
							{{moment(current_item.create_time).format('YYYY-MM-DD')}}
						</Col>
						<Col span="8" class="text-center">
							<Icon type="ios-heart"></Icon>
							{{current_item.stars}}
						</Col>
					</Row>
					<mavon-editor 
						class="mavon-editor"
						:value="content" 
						:boxShadow="false" 
						:subfield="false" 
						:toolbarsFlag="false" 
						:editable="false" 
						defaultOpen="preview">
					</mavon-editor>
					<template v-if="current_item.knowledge_item_file&&current_item.knowledge_item_file.length>0">
						<p>附件:</p>
						<div class="row">
							<file-item class="col-sm-4" v-for="item in current_item.knowledge_item_file" :item="item"></file-item>
						</div>
					</template>
				</div>
				<div class="text-center mb-4">
					<Button 
						type="text"
						size="small" 
						:icon="current_item.my_like==null?'heart':'heart-broken'" 
						@click="likeOrUnlike">
						{{current_item.my_like==null?'点赞':'取消点赞'}}
					</Button>
					<Button 
						type="text"
						size="small" 
						icon="ios-arrow-back" 
						@click="goBack">返回
					</Button>
				</div>
			</div>
		</template>
	</div>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import { mavonEditor } from 'mavon-editor'
	import FileItem from './file-item.vue'
	
	export default {
		mixins: [grid,common,globals],
		components: {
			mavonEditor,
			FileItem
		},
		data() {
			return {
				rest_api: 'knowledge_items',
				search_field: {
					keywords:'',
					router_uri:'',
					ktype_did: 0
				},
				action:'list',
				current_item: {},
				moment: moment
			}
		},
		mounted() {
			this.search_field.router_uri = this.$route.path
			this.init_data()
		},
		watch: {
			'$route.path':function(uri) {
				this.search_field.router_uri = uri
				this.search_field.keywords = ''
				this.init_data()
			}
		},
		computed: {
			detailHeight() {
				let client_height = util.get_client_height()
				return client_height - 220
			},
			content() {
				return this.current_item.content +'\n' + '(来自'+ this.$filter('branch_name')(this.current_item.bid) + ')'
			}
		},
		methods: {
			clickItem(item) {
				this.current_item = item
				this.action = 'view'
			},
			likeOrUnlike() {
				let [method,message,$rest] = this.current_item.my_like==null?['post','点赞成功','']:['delete','取消点赞成功','']
				if(this.current_item.my_like==null) {
					$rest = this.$rest('knowledge_items').add_url_param(this.current_item.ki_id,'my_like')[method]({eid:this.eid$})
				}else{
					$rest = this.$rest('knowledge_items')[method](this.current_item.ki_id+'/my_like',{params:{eid:this.eid$}})
				}
				$rest.success(res => {
					// this.$Message.success(message)
					this.refreshItem()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			refreshItem() {
				this.$rest('knowledge_items')
				.get({
					ki_id:this.current_item.ki_id,
					with_my_like:1
				})
				.success(res => {
					this.current_item = res.list[0]
					let index = this.data.findIndex(item=>item.ki_id==this.current_item.ki_id)
					if(index) {
						this.data.splice(index,1,res.list[0])
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			goBack() {
				this.action = 'list'
			},
			search(qt_did,ktype_did) {
				qt_did = qt_did || 0
				ktype_did = ktype_did || 0
				if(qt_did > 0) {
					let qtype = this.labelDicts(qt_did,'questionnaire_type')
					if(qtype) {
						this.search_field.keywords = qtype
					}
				}
				if(ktype_did > 0) {
					this.search_field.ktype_did = ktype_did
				}else{
					this.search_field.ktype_did = 0
				}
				if(this.search_field.keywords!=='') {
					this.search_field.router_uri = ''
				}else{
					this.search_field.router_uri = this.$route.path
				}
				this.pagenation(1)
			},
			hook_get_param(params) {
				let search_obj = util.copy(this.search_field)				
				for(let o in search_obj) {
					let property = search_obj[o]	
					if(property!=''){
						params[o] = property
					}			
				}
				params.with_my_like = 1
				params.order_field = 'stars'
				params.order_sort = 'desc'
				params.bid = -1
			},
			addKnowledge() {
				this.$Modal.open('common/aside/kl-info-modal.vue',{
					autoShow:false,
					on: {
						save:()=>{
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.vuec.show('添加知识点','add')
				})
			}
		},
	}
</script>
<style lang="less">
	.aside-knowledge {
		position: relative;
		padding: 15px;
		height: 100%;
		.kl-search-wrapper 
		.ivu-input-group-append 
		.ivu-btn {
			border-color: #39f; 
     		background-color: #39f; 
     		color: #fff; 
		}
		.kl-hot {
			margin-top: 5px;
			margin-left: 15px;
		}
		.kl-detail-wrapper {
			&::-webkit-scrollbar {
		      	display: none;
	      	}
			margin: 35px 10px 10px 10px;
			.current-title {
				font-size: 16px;
			}
			.current-info {
				color: #aaa;
				margin-top: 4px;
				.mavon-editor{
					margin-top: 10px;
					font-size: 12px;
					line-height: 1.8;
					color: #5d5959;
					&.v-note-wrapper {
						min-width: 260px;
						.v-note-panel .v-note-show .v-show-content {
							padding: 8px;
						}
						.v-note-panel {
							border: 0;
						}
					}
				}
			}
		}
		.kl-detail-footer {
			text-align: center;
		}
		.kl-list-wrapper {
			font-size: 14px;
			margin: 35px 10px 10px 10px;
			.kl-empty {
				color: #999;
				text-align: center;
				margin-top: 15px;
			}
			.kl-item {
				display: flex;
				cursor: pointer;
				padding-top: 5px;
				padding-bottom: 5px;
				&:hover {
					background: #f2f2f5;
				}
				&:last-child {
					border-bottom: 0;
				}
				> p {
					display: inline-block;
					flex: 1;
				}
				> i {
					flex: 0 0 16px;
					line-height: 24px;
				}
			}

		}
		.kl-add-btn {
			text-align: center;
			margin-top: 35px;
			.ivu-btn {
				border-color: #39f;
				color: #39f;
				&:hover {
					border-color: #2d8cf0;
					color: #2d8cf0;
				}
			}
		}
		.v-note-wrapper {
			min-height: 0;
		}
	}
</style>