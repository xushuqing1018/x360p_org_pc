<template>
	<div>
        <Button v-if="questionnaire.qid > 0" type="primary" icon="plus" title="添加条目" @click="addQuestionnaireItem" style="margin: 10px 0px;">添加条目</Button>
		<div 
			:class="['questionnaire-items',data.length==0?'no-items':'']" 
			:style="{height:height+'px',overflow:'auto'}">
			<div 
				class="questionnaire-item" 
                style="border-radius: 10px;"
				v-for="(item,index) in data" :key="index">
				<div class="detail">
					<span style="font-weight: bold;font-size: 16px;">{{index+1}}、</span>
					<p style="font-weight: bold;font-size: 16px;">{{item.title}}</p>
					<div class="choices">
                        <template v-if="item.stype == 0">
                            <RadioGroup>
							    <Radio 
							    	v-for="(choose,index) in item.questionnaire_subject_choice" 
							    	:label="choose.qsc_id"
                                    :key="index"
                                >
                                    <template v-if="choose.content_type == 0">
                                        <span>{{choose.content}}</span>
                                    </template>
                                    <template v-if="choose.content_type == 1">
                                        <img :src="choose.content" width="100"/>
                                    </template>
                                    <template v-if="choose.content_type == 2">
                                        <div v-html="choose.content" style="display:inline-flex;"></div>
                                    </template>
							    </Radio>
						    </RadioGroup>
                        </template>
                        <template v-if="item.stype == 1">
                            <CheckboxGroup>
							    <Checkbox 
							    	v-for="(choose,index) in item.questionnaire_subject_choice" 
							    	:label="choose.qsc_id"
                                    :key="index"
                                >
                                    <template v-if="choose.content_type == 0">
                                        <span>{{choose.content}}</span>
                                    </template>
                                    <template v-if="choose.content_type == 1">
                                        <img :src="choose.content" width="100"/>
                                    </template>
                                    <template v-if="choose.content_type == 2">
                                        <div v-html="choose.content" style="display:inline-flex;"></div>
                                    </template>
							    </Checkbox>
						    </CheckboxGroup>
                        </template>
                        <template v-if="item.stype == 2">
                            <Input readonly style="width: 400px;" placeholder="请输入"></Input>
                        </template>
                        <template v-if="item.stype == 3">
                            <Input readonly type="textarea" style="width: 400px;" :rows="4" placeholder="请输入"></Input>
                        </template>
					</div>
				</div>
				<div class="btn-wrapper">
					<ButtonGroup>
						<Button 
							type="text" 
							size="small" 
							icon="edit"
							title="编辑条目"
							@click="edit(item)">
						</Button>
						<Button 
							type="text" 
							size="small" 
							icon="close"
							title="删除条目"
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
				rest_api: 'questionnanire_subjects',
				data: []
			}
        },
		methods: {
            addQuestionnaireItem(){
				this.$r('item')
				.set('questionnaire',this.questionnaire)
				.show(util.sprintf('添加问卷条目【%s】',this.questionnaire.name),'add')
            },
			edit(item) {
				let copy_item = util.copy(item)
				this.$r('item')
				.set('questionnaire',this.questionnaire)
				.set('info',copy_item)
				.show('编辑问卷条目','edit')
			},
			del(item) {
				this.confirm(util.sprintf('确认删除问卷条目【%s】吗？',item.title))
				.then(() => {
					this.$rest('questionnanire_subjects')
					.delete(item.qs_id)
					.success(res => {
						this.$Message.success('删除成功')
						this.init_data()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			init_data() {
				let param = {
					pagesize:1000,
					qid:this.questionnaire.qid,
					order_field:'qs_id',
                    order_sort:'asc',
                    with:'questionnaire_subject_choice'
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
            init_stype(){
                return function(stype){
                    let stype_title = { 0:'单选',1:'多选',2:'单行文本',3:'多行文本' }
                    return stype_title[stype]
                }
            }
		},
		watch: {
			'questionnaire':function() {
				this.init_data()
			}
		}
	}
</script>

<style scoped>
</style>