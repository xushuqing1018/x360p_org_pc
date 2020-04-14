<template>
	<div class="situation-page">
		<template v-if="!is_empty">
			<div class="situation-page-title">
				<input v-model="data.title"></input>
				<Tag 
					class="speak-tag" 
					type="border" 
					color="blue" 
					@click.native="speakingGuide(data.qt_did,213)">话术指引
				</Tag>
			</div>
			<div class="situation-page-items">
				<div class="situation-item" v-for="(item,index) in data.questions">
					<div class="detail">
						<span>{{index+1}}、</span>
						<p>{{item.title}}</p>
						<span class="mr-1"> ({{item.is_multi>0?'多选':'单选'}})</span>
						<div class="choices">
							<Checkbox 
								class="choice" 
								v-model="choice.select$"
								v-for="choice in item.choices"
								@on-change="changeChoice(item,choice,$event)">{{choice.value}}
							</Checkbox>
						</div>
					</div>
					<div class="other">
						<Checkbox 
							v-model="item.is_unknown" 
							@on-change="changeUnknown(item,$event)">未知
						</Checkbox>
						<DatePicker 
							:value="item.next_int_day" 
							size="small"
							style="width: 120px;"
							@on-change="item.next_int_day=$event"
							placeholder="新的约定日期">
						</DatePicker>
						<Checkbox 
							v-model="item.is_parent_focus" 
							class="pull-right">
							家长关注
						</Checkbox>
					</div>
				</div>
				<div class="nothing-item" v-if="data.questions.length==0">该学情类型没有条目</div>
			</div>
			<div class="situation-page-footer">
				<div class="remark remark-wrapper">
					<label>{{data.title}}小结</label>
					<Input 
						type="textarea" 
						v-model="data.remark" 
						:rows="3"
						:placeholder="'请输入'+data.title+'小结...'">
					</Input>
				</div>
				<div class="intday-wrapper">
					<label>日期</label>
					<DatePicker 
						:value="data.int_day" 
						@on-change="data.int_day=$event"
						style="width: 120px;">
					</DatePicker>
				</div>
				<div class="eid-wrapper">
					<label>{{data.sid>0?'学管师':'咨询师'}}</label>
					<select-employee 
						v-model="data.create_eid" 
						style="width: 120px;">
					</select-employee>
				</div>
			</div>
		</template>
	</div>
</template>
<script>
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	export default {
		mixins: [common,globals],
		components: {
			SelectEmployee
		},
		props: {
			data: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		data() {
			return {
				
			}
		},
		methods: {
			changeUnknown(item,e) {
				item.answer.splice(0)
				item.choices.forEach(ch => {
					ch.select$ = false
				})
			},
			speakingGuide(qt_did,ktype_did) {
				let classList = document.body.classList,
					appAside = this.$store.state.layout.$refs['appAside']
				if(classList.contains('aside-menu-hidden')) {
                    classList.toggle('aside-menu-hidden')
                    this.$store.commit('changeAside')
                }
                appAside.tab = 'knowledge'
                appAside.$refs.knowledge.search(qt_did,ktype_did)
			},
			changeChoice(item,choice,e) {
				item.is_unknown = false
				if(item.is_multi) {
					if(e) {
						item.answer.push(choice.value)
					}else{
						let index = item.answer.indexOf(choice.value)
						item.answer.splice(index,1)
					}
				}else{
					if(e) {
						item.answer.splice(0,item.answer.length,choice.value)
						item.choices.forEach(ch => {
							if(ch.value !== choice.value) {
								ch.select$ = false
							}
						})
					}else{
						item.answer.splice(0)
					}
				}
			}
		},
		computed: {
			is_empty() {
				return _.isEmpty(this.data)
			}
		}
	}
</script>