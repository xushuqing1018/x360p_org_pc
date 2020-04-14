<template>
	<div class="c-grid" v-loading.like="'review_tpl_settings'">
		<div class="row">
			<tpl-list class="col-lg-12 col-xl-12" 
				v-show="action=='list'"
				:list="data"
				:total-num="total"
				@on-select="selectItem"
				@on-add="addItem"
				@pagenation="pagenation"
				@search="searchData"
				@on-cancel="cancel"
				@on-delete="deleteItem"
				@on-copy="copyItem">
			</tpl-list>
			<tpl-content
				v-if="action=='edit'&&currentItem.review_style === 0"
				class="col-lg-12 col-xl-12"
				:data="currentItem" 
				@on-success="addSuccess" 
				@on-cancel="cancel">
			</tpl-content>
			<style-tpl-content
				v-else-if="action=='edit'&&currentItem.review_style === 1"
				class="col-lg-12 col-xl-12"
				:currentData="currentItem" 
				@on-success="addSuccess" 
				@on-cancel="cancel">
			</style-tpl-content>
		</div>
	</div>
</template>

<script>	
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import tplList from './tpl-list.vue' 
	import tplContent from './tpl-content.vue'
	import styleTplContent from './style-tpl-content.vue'
	
	export default{
		mixins: [grid,common],
		components: {
			tplList,
			tplContent,
			styleTplContent
		},
		data () {
			return {
				rest_api: 'review_tpl_settings',
				pk: 'rts_id',
				data: [],
				currentIndex: 0,
				action: 'list',
				currentItem: {},
				search_field: {
					name: ''
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			selectItem(index) {
				this.currentItem = this.data[index];
				this.action = 'edit'
				this.currentItem.setting = this.buildReviewStyle(this.currentItem.setting)
			},
			deleteItem(row) {
				this.$rest('review_tpl_settings')
				.delete(row.rts_id)
				.success(data=>{
					this.$Message.success('删除成功！')
					this.init_data();
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			addItem(type) {
				if(type == 'custom') {
					this.currentItem = {
						setting: util.copy(this.$store.state.gvars.configs.review_tpl),
						name: '普通模板名称',
						review_style: 0
					};
				}
				else {
					this.currentItem = {
						setting: this.buildReviewStyle(this.$store.state.gvars.review_styles[1]),
						name: '专业模板名称',
						review_style: 1
					}
				}
				this.action = 'edit'
			},
			buildReviewStyle(rs){
				let ret = util.copy(rs)
				if(!ret.advance){
					ret.advance = {
						allow_empty_honor:0,
						score_show_num:0,
						allow_score_step:0
					}
					ret.student_fields.score.forEach(item=>{
						item.step = 1
						item.max  = 5
					})
					
				}
				if(ret.student_fields.score.length < 6){
					ret.student_fields.score.push({
						field:'score5',
						label:'专业表现5',
						default:5,
						enable:0,
						step:1,
						max:5,
						alias:{
							'1':'较简单',
							'2':'简单',
							'3':'一般',
							'4':'较难',
							'5':'难'
						}
					})
				}
				return ret
			},
			copyItem(index) {
				let copyData = util.copy(this.data[index]);
				let	[method,uri,msg] = ['post','review_tpl_settings','复制模板成功'];
				
				let formatData = {
					name: copyData.name + ' - 副本',
					review_style: copyData.review_style,
					setting: copyData.setting
				}
				this.$rest(uri)[method](formatData)
				.success(data=>{
					this.$Message.success(msg)
					this.$store.dispatch('updateGlobalVar','review_tpl_setting')
					this.init_data();
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'操作失败'
					})
				})
			},
			searchData({name,rtc_id}) {
				this.search_field.name = name;
				this.search_field.rtc_id = rtc_id;
				this.search();
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
				params.with = 'review_tpl_cate'
			},
			addSuccess () {
				this.init_data()
			},
			cancel (index) {
				this.action = 'list'
			}
		}
	}
</script>

<style>
</style>