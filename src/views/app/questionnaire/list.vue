<template>
	<div class="box">
		<div class="questionnaire-list" :style="{height:height+'px',overflow:'auto'}">
			<div class="condition-filter">
            	<Input size="small" v-model="key" icon="search" placeholder="搜索问卷"></Input>
            </div>
            <Button type="ghost" icon="plus" title="添加问卷" @click="add"></Button>
            <div class="condition-list clearfix">
            	<div class="item" v-for="(item,index) in filterQuestionnaire" :key="index">
		            <a :class="{'selected':current_item.qid == item.qid}" @click="selQuestionnaire(item)">
		            	{{item.name}}
		            	<ButtonGroup>
							<Button 
								type="text" 
								size="small"
								icon="edit" 
								title="编辑"
								@click.stop="editItem(item)">
							</Button>
							<Button 
								type="text"
								size="small" 
								icon="ios-trash" 
								title="删除"
								@click.stop="deleteItem(item)">
							</Button>
						</ButtonGroup>            	
		            </a>
		        </div>
		        <p class="text-center" v-if="filterQuestionnaire.length==0">没有数据</p>
            </div>
		</div>
		<info-modal ref="info" @save="init_data"></info-modal>
	</div>
</template>
<script>
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import InfoModal from './info-modal.vue'
	export default {
		mixins: [grid,common],
		components: {
			InfoModal
		},
		data() {
			return {
				rest_api: 'questionnaires',
				key: '',
				pk: 'qid',
				current_item: {},	// 当前点击的问卷
				operation_item: {}	// 当前操作的问卷 
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			selQuestionnaire(item) {
				this.current_item = util.copy(item)
			},
			editItem(item) {
				this.operation_item = util.copy(item)
				this.$r('info')
				.set('info',item)
				.show(util.sprintf('编辑问卷【%s】',item.name),'edit')
			},
			deleteItem(item) {
				this.confirm(util.sprintf('确定删除问卷【%s】吗？',item.name))
				.then(() => {
					if(item.qid == this.current_item.qid) {
						this.clearItem(this.current_item)
					}
					this.delete(item)
				})
			},
			deal_data(data) {
				if(data.list.length) {
					if(this.current_item.qid) {
						if(this.current_item.qid == this.operation_item.qid) {
							this.current_item = data.list.find(item => item.qid == this.current_item.qid)
						}
						this.clearItem(this.operation_item)
					}else{
						this.current_item = util.copy(data.list[0])
					}
				}else{
					this.$emit('on-clear')
				}
				return data.list
			},
			add() {
				this.$r('info').show('添加问卷','add')
			},
			addItemSuccess() {
				if(this.current_item.qid == this.operation_item.qid) {
					this.$emit('on-add')
				}
				this.clearItem(this.operation_item)
			},
			clearItem(item) {
				for(let key in item) {
					delete item[key]
				}
			},
			hook_get_param(param) {
				param.pagesize = 1000
				param.order_field = 'qid'
                param.order_sort = 'asc'
                param.mode = 1
			},
			toggleBranch(bid) {
				this.clearItem(this.current_item)
			}
		},
		computed: {
			filterQuestionnaire(){
				if(!/^\s*$/.test(this.key)) {
					return this.data.filter(item => item.name.indexOf(this.key)>-1)
				}
				return this.data
			},
			height() {
				let client_height = util.get_client_height()
				return client_height - 230
			}
		},
		watch: {
			'current_item': {
				handler:function(item) {
					this.$emit('on-select',item)
				},
				deep:true
			},
			'$store.state.branch.id':{
	            handler:function(bid,old_bid){
	                this.toggleBranch(bid)
	                this.init_data()
	            },
	            // 深度观察
	            deep:true
	        },
		}
	}
</script>