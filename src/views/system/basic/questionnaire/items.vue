<template>
	<div>
		<RadioGroup type="button" v-model="type" class="mb-2" v-if="data.length>0">
			<Radio :label="0">全部</Radio>
			<Radio v-for="q in qt" :label="q.did">{{q.title}}</Radio>
		</RadioGroup>
		<div 
			:class="['questionnaire-items',filterDataByType.length==0?'no-items':'']" 
			:style="{height:height+'px',overflow:'auto'}">
			<div 
				class="questionnaire-item" 
				v-for="(item,index) in filterDataByType">
				<div class="detail">
					<span>{{index+1}}、</span>
					<p>{{item.title}}</p>
					<span class="mr-1"> ({{item.is_multi>0?'多选':'单选'}})</span>
					<Tag type="border" color="blue">{{item.qt_did|dict_title('questionnaire_type')}}</Tag>
					<div class="choices">
						<RadioGroup>
							<Radio 
								class="choice" 
								v-for="choice in item.choices" 
								:label="choice" 
								readonly>
							</Radio>
						</RadioGroup>
					</div>
				</div>
				<div class="btn-wrapper">
					<ButtonGroup>
						<Button 
							type="text" 
							size="small" 
							icon="edit"
							title="编辑条目"
							v-per="'quesitem.edit'"
							@click="edit(item)">
						</Button>
						<Button 
							type="text" 
							size="small" 
							icon="close"
							title="删除条目"
							v-per="'quesitem.delete'"
							@click="del(item)">
						</Button>
					</ButtonGroup>
				</div>
			</div>
			<item-modal ref="item" @save="init_data"></item-modal>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin' 
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ItemModal from './item-modal.vue'
	export default {
		mixins: [modal,common,globals],
		components: {
			ItemModal
		},
		props: {
			questionnaire: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		data() {
			return {
				rest_api: 'questionnaire_items',
				pk: 'qi_id',
				type: 0,
				data: []
			}
		},
		methods: {
			edit(item) {
				let copy_item = util.copy(item)
				copy_item.qt_did = copy_item.qt_did.toString()
				this.$r('item')
				.set('questionnaire',this.questionnaire)
				.set('info',copy_item)
				.show('编辑问卷条目','edit')
			},
			del(item) {
				this.confirm(util.sprintf('确认删除问卷条目【%s】吗？',item.title))
				.then(() => {
					this.$rest('questionnaire_items')
					.delete(item.qi_id)
					.success(res => {
						this.$Message.success('删除成功')
						this.init_data()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			clearData() {
				this.data.splice(0)
			},
			init_data() {
				let param = {
					pagesize:1000,
					qid:this.questionnaire.qid,
					order_field:'qi_id',
					order_sort:'asc'
				}
				this.$rest(this.rest_api)
				.get(param)
				.success(res => {
					this.data = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			}
		},
		computed: {
			height() {
				let client_height = util.get_client_height()
				return client_height - 250
			},
			qt() {
	        	let ques = []
	        	if(this.questionnaire.qt_dids && this.questionnaire.qt_dids.length>0) {
	        		this.questionnaire.qt_dids.forEach(item => {
		        		let qobj = this.dicts('questionnaire_type').find(q => q.did == item)
		        		if(qobj) {
		        			ques.push(qobj)
		        		}
		        	})
	        	}
	        	return ques
	        },
	        filterDataByType() {
	        	if(this.type > 0) {
	        		return this.data.filter(item => item.qt_did == this.type)
	        	}
	        	return this.data
	        }
		},
		watch: {
			'questionnaire':function() {
				this.type = 0
				this.init_data()
			}
		}
	}
</script>