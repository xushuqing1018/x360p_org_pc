import util,{_} from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'

export default{
	mixins: [globals,common],
	data () {
		return {
			info: {}
		}
	},
	computed: {
		reviewDate () {
			let result = util.sprintf('%s %s~%s',
				this.$filter('int_date')(this.post.int_day),
				this.$filter('int_hour')(this.post.int_start_hour),
				this.$filter('int_hour')(this.post.int_end_hour))
			return result 
		},
		reviewObject () {
			let result = '点评对象'
			
			if(this.post.lesson_type===0){
				
				if(!_.isEmpty(this.info)&&!_.isEmpty(this.info.cls)){
					result = this.info.cls.class_name
				}				
				if(!this.info.cls&&this.info.course_arrange){
					result = this.info.course_arrange.name
				}
				if(this.post._class_name){
					result = this.post._class_name
				}
				if(this.post.one_class){
					result = this.post.one_class.class_name 
				}
				
			}
			if(this.post.lesson_type===1){
				result = '一对一'
			}
			if(this.post.lesson_type===2){
				result = '一对多'
			}
			
			return result
		},
		currentTpl() {
			let defaultTplSetting = this.$store.state.gvars.review_styles[0];
			if(this.post.rts_id == -1) {
				return {
					review_style: 1,
					setting: this.$store.state.gvars.review_styles[1]
				}
			}
			else if(this.post.rts_id == 0) {
				return {
					review_style: 0,
					setting: defaultTplSetting
				}
			}
			else if(this.post.review_tpl_setting) {
				return this.post.review_tpl_setting
			}
			else{
				return {
					review_style: 0,
					setting: defaultTplSetting
				}
			}
		},
		isProReview() {
			return this.currentTpl.review_style === 1
		},
		content_fields () {
			let result = {},
				fields = this.currentTpl.setting?this.currentTpl.setting.common_fields:{}
			if(!this.isProReview) {
				for(let s in fields){
					let obj = fields[s]
					if(obj.enable==1){
						result[s] = {}
						result[s].label = obj.label
						result[s].value = obj.tpl
						result[s].student_view = obj.student_view
					}					
				}
			}
			else {
				for(let i in fields){
					let obj = fields[i]
					if(obj.enable==1){					
						result[obj.field] = {}
						result[obj.field].label = obj.label
						result[obj.field].value = obj.tpl
						result[obj.field].student_view = obj.student_view
					}
				}
			}
			return result
		},
		scores () {
			let result = {},
				fields = this.currentTpl.setting?this.currentTpl.setting.score_fields:{}
			for(let s in fields){
				let obj = fields[s]
				if(obj.enable==1){						
					result[s] = {}
					result[s].label = obj.label
					result[s].value = obj.default
				}					
			}
			
			return result
		},
		honors () {
			let fields = this.currentTpl.setting.student_fields.honor
			
			return fields
		},
		styleScores () {
			let result = {},
				fields = this.currentTpl.setting.student_fields.score
			for(let i in fields){
				let obj = fields[i]
				if(obj.enable==1){						
					result[obj.field] = {}
					result[obj.field].label = obj.label
					result[obj.field].value = obj.default
					result[obj.field].alias = obj.alias
					if(obj.max){
						result[obj.field].max = obj.max
					}else{
						result[obj.field].max = 5
					}
					if(obj.step){
						result[obj.field].step = obj.step
					}else{
						result[obj.field].step = 1
					}
				}					
			}
			
			return result
		},
		weeks () {
			let result = {},
				fields = this.currentTpl.setting.student_fields.weak
			for(let i in fields){
				let obj = fields[i]
				if(obj.enable==1){						
					result[obj.field] = {}
					result[obj.field].label = obj.label
				}					
			}
			return result
		},
		tplNotEmpty() {
			return !_.isEmpty(this.post.review_tpl_setting)
		},
		showSelectScoreStep(){
			if(this.tplNotEmpty && this.post.review_tpl_setting.setting.advance){
				if(this.post.review_tpl_setting.setting.advance.score_show_num){
					return true
				}
			}
			return false
		}
	},
	methods: {		
		getTplId (info) {
			let result = 0
				 
			if(!_.isEmpty(info)){
				let define = this.$store.state.gvars.review_tpl_define
				let setting = this.$store.state.gvars.review_tpl_setting,
					[cid, lid, sj_id, sj_ids] = [info.cid, info.lid, info.sj_id, info.sj_ids||[]]
				if(define && define.length>0){
					let obj1 = define.find(l=>l.cid>0&&l.cid==cid)
					let obj2 = define.find(l=>l.lid>0&&l.lid==lid)
					let obj3 = define.find(l=>l.sj_id>0&&l.sj_id==sj_id)
					let obj4 = define.find(l=>l.sj_id>0&&sj_ids.indexOf(l.sj_id)>-1)
					if(obj1){
						return obj1.rts_id
					}
					else if(obj2) {
						return obj2.rts_id
					}
					else if(obj3) {
						return obj3.rts_id
					}
					else if(obj4) {
						return obj4.rts_id
					}
					else {
						if(setting.length) {
							return setting[0].rts_id
						}
					}
				}
			}
			return result
		},
		getCTpl() {
			return new Promise((resolve,reject) => {
				this.$rest('review_tpl_settings')
				.add_url_param(this.post.rts_id)
				.get()
				.success(res=>{
					if(res) {
						this.post.review_style = res.review_style
						this.post.review_tpl_setting = res
					}
					resolve()
				})
				.error(res=>{
					this.$Message.error(res.body.message)
					reject()
				})
			})
		},
		scoreLabel(review_style, index) {
			if(review_style == 0) {
				let scoreFields = this.currentTpl.setting.score_fields
				return scoreFields['score'+(index>0?index:'')].label
			}
			else {
				let scoreFields = this.currentTpl.setting.student_fields.score;
				let label = '';
				for (let i = 0; i < scoreFields.length; i++) {
					const item = scoreFields[i];
					if(item.field == 'score'+index) {
						label = item.label;
						break;
					}
				}
				return label
			}
		},
		weakLabel(index) {
			let weakFields = this.currentTpl.setting.student_fields.weak;
			let label = '';
			for (let i = 0; i < weakFields.length; i++) {
				const item = weakFields[i];
				if(item.field == 'weak'+index) {
					label = item.label;
					break;
				}
			}
			return label
		},
		setContent () {
			let content = this.content_fields
			if(!_.isEmpty(content)){
				this.post.content = {};
				for(let c in content){
					this.$set(this.post.content,c,content[c].value)
				}
			}
		},
		setFirstStudent() {
			let postStudent = this.studentList('post')
			if(postStudent.length) {
				this.currentStudent = postStudent[0]
			}else{
				this.currentStudent = {}
			}
		},
		studentList (type) {
			let list = this.post.review_student,
				filter = (item) => {
					if(type=='post'){
						return !item.$delete							
					}
					else{
						return item.$delete
					}
				}
				if(list) {
					return list.filter(filter)
				}
			return []
		},
	}
}
