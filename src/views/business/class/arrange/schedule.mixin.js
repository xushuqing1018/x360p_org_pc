import moment from 'moment'
import util,{_} from '@/libs/util'

const emptyObject = {		
	week_days: [1],
	int_start_hour: '',
	int_end_hour: '',
	cr_id: 0,
	teach_eid: 0,	
	second_eid: 0,
	second_eids: [],
	int_start_day: moment(new Date()).format('YYYY-MM-DD'),
	int_end_day: moment(new Date()).format('YYYY-MM-DD'),
	consume_lesson_hour: 0,
	consume_source_type: 1,
	loop_type: 0,
	loop_times: 1,
	end_type: '1',
	is_bk_open: 0
}
	
export default{
	props: {
		list: {
			type: Array,
			default: ()=>{
				return []
			}
		},
		ignore: {
			type: Object,
			default: ()=>{
				return {
					ignore_class_cc: 0,
					ignore_class_ec: 0,
					ignore_student_cc: 0
				}
			}
		},
		item: {
			type: Object,
			default: ()=>{
				return {}
			}
		}
	},
	data () {
		return {
			info: util.copy(emptyObject),
			ts_array: [],
			arrangeList: [],
			errArranges: []
		}
	},
	computed:{
		minLoopTimes () {
			let times = this.info.week_days.length
			return times||1
		},
		enable_money_consume () {
			let result = 0
			
			if(this.$store.state.gvars.configs.params.class_attendance){
				result = this.$store.state.gvars.configs.params.class_attendance.enable_money_consume
			}
			
			return result
		},
	},
	methods: {		
		checkArrange () {
			//是否检测老师，教室冲突
			let allList = this.list,
				list = this.arrangeList
			this.errArranges = []
			return new Promise((resolve,reject)=>{
				if(!list || !list.length){
					resolve()
				}
				
				list.forEach(l=>{
					let condition = (item) => {
						return  item.int_day == l.int_day
								&& item.int_start_hour == l.int_start_hour
						},
						index = allList.findIndex(condition)
					if(index > -1) {
						let err_list = []
						err_list.push('int_hour')
						
						//不忽略老师冲突
						if(this.ignore.ignore_class_ec == 0){
							if(
								(allList[index].teach_eid == l.teach_eid 
								|| allList[index].second_eid == l.teach_eid)
								&& l.teach_eid > 0	
							){
								err_list.push('teach_eid')
							}
							if(
								(allList[index].second_eid == l.second_eid 
								|| allList[index].teach_eid == l.second_eid
								)
								&& l.second_eid > 0
							){
								err_list.push('second_eid')
							}
						}
						//不忽略教室冲突
						if(this.ignore.ignore_class_cc == 0 && allList[index].cr_id == l.cr_id && l.cr_id > 0){
							err_list.push('cr_id')
						}
						
						this.errArranges.push(index)
						this.$set(l,'_error_fields',err_list)
						// console.log(util.copy(l))
					}else{
						this.$set(l,'_error_fields',[])
					}
				})
				if(this.errArranges.length==0){
					resolve()
				}else{
					this.preview(list)
					reject()
				}
			})
		},
		disabled (week_day_item) {
			let index = this.info.week_days.indexOf(week_day_item)
			
			return this.info.end_type == 2
					&& this.info.week_days.length == this.info.loop_times
					&& index == -1				
		},
		preview (list) {					
			this.setList()
			.then(()=>{
				list = list || this.arrangeList	
				
				if(!list || !list.length){
					this.$Message.error('当前条件排课次数为0，请您修改排课条件')
					return
				}
				
				this.$Modal.open('business/class/arrange/schedule-info-modal.vue',{
					props: {
						list: list
					}
				})
				.then(modal=>{
					modal.show()
				})
			})
		},		
		setList () {
			return new Promise((resolve,reject)=>{					
				if(_.isEmpty(this.info)){
					reject()
					return 
				}
				let result = []
				//按日期则获取开始时间-结束时间，获取week_days循环排课
				//按次数则取开始时间与循环类型loop_type
				if(this.info.end_type == 1){
					result = this.setListByDate()
				}else{
					result = this.setListByTimes()
				}
				this.buildListByDate(result)
				resolve()
			})
			
		},
		setListByDate () {
			let start_day 			= this.info.int_start_day,
				end_day 			= this.info.int_end_day,
				week_days 			= this.info.week_days,
				loop_type 			= this.info.loop_type,					
				day_diffs			= util.dateDiff(start_day,end_day),
				result 				= []
							
			for(let i=0;i<day_diffs;i++){
				let temp_date = moment(start_day).add('days',i).format('YYYY-MM-DD'),
					week_no = util.get_date_week_no(util.new_date(temp_date)),
					week_day_no = util.get_week_day(util.new_date(temp_date)),				
					condition = () => {
						//每周循环
						return week_days.indexOf(week_day_no) > -1
					}
				
				//单周循环week_no%2==1
				if(loop_type==1){
					condition = () => {
						return week_days.indexOf(week_day_no) > -1 && week_no%2==1
					}
					
				}//双周循环week_no%2==0 
				else if(loop_type==2){
					condition = () => {
						return week_days.indexOf(week_day_no) > -1 && week_no%2==0
					}
				}
				
				if(condition()){					
					result.push(temp_date)
				}					
				
			}
			return result
		},			
		setListByTimes () {
			//loop_type: 0, 按日期：{0:每周，1：单周,2:双周}  
			//按次数:{0：每天，1：隔天，2:每周,3：单周，4：双周}
			let start_day 			= this.info.int_start_day,
				loop_times 			= this.info.loop_times,
				loop_type 			= this.info.loop_type,
				week_days 			= this.info.week_days,
				result 				= [],
				i					= 0
		
			do{
				let start_date              = util.new_date(start_day),
					week_day_no 			= util.get_week_day(start_date),
					week_no 				= util.get_date_week_no(start_date)
				if(loop_type == 0){
					result.push(start_day)
					i ++ 
					start_day = moment(start_day).add('days',1).format('YYYY-MM-DD')
				}
				else if(loop_type == 1){
					result.push(start_day)
					i ++ 
					start_day = moment(start_day).add('days',2).format('YYYY-MM-DD')
				}
				else if(loop_type > 1){
					if(
						week_days.indexOf(week_day_no) > -1 
						&& result.indexOf(start_day) == -1
						&& (
							(loop_type == 3 && week_no % 2 == 1)
							|| 
							(loop_type == 4 && week_no % 2 == 0)
							|| loop_type == 2
						)
					){
						result.push(start_day)
						i ++ 
					}else{
						start_day = moment(start_day).add('days',1).format('YYYY-MM-DD')
					}
				}
				
			}while(i < loop_times)
				
			return result				
		},			
		buildListByDate (arr) {
			if(!arr || !arr.length){
				return
			}			
			
			this.arrangeList = []				
			arr.forEach(a=>{
				let	obj = {
					int_day: a,
					int_start_hour: this.info.int_start_hour,
					int_end_hour: this.info.int_end_hour,
					week_day: util.get_week_day(util.new_date(a)),
					teach_eid: this.info.teach_eid,
					cid: this.info.cid,
					cr_id: this.info.cr_id,
					second_eid: this.info.second_eid,
					second_eids: this.info.second_eids,
					consume_source_type: this.info.consume_source_type,
					consume_lesson_hour: this.info.consume_lesson_hour,
					consume_lesson_amount: this.info.consume_lesson_amount,
					is_bk_open: this.info.is_bk_open
				}
				
				if(obj.consume_source_type == 1) obj.consume_lesson_amount = 0
				else if(obj.consume_source_type == 2) obj.consume_lesson_hour = 0
				
				this.arrangeList.push(obj)
			})
				
		},
		changeTimeSection (arr) {
			if(arr && arr.length > 0){
				this.info.int_start_hour = arr[0]
				this.info.int_end_hour = arr[1]
				if(this.ignore.cid || this.ignore.lid){
					this.getConsumeHour()					
				}
			}
			this.ts_array = arr
		},
		dateChange (val,field) {
			if(val) {
				this.info[field] = moment(val).format('YYYY-MM-DD')					
			}else{
				this.info[field] = ''
			}
		},
		getConsumeHour () {
			let params = {
				cid: this.ignore.cid,
				int_start_hour: this.info.int_start_hour,
				int_end_hour: this.info.int_end_hour
			}

			if(this.ignore.cid==0){
				delete params.cid
				params.lid = this.ignore.lid
			}

			this.$rest('course_arranges/consume_lesson_hour').get(params)
			.success(data=>{
				this.info.consume_lesson_hour = data.consume_lesson_hour
			}).error(response=>{
				this.$Message.error(response.body.message||'获取扣课时数失败~')
			})
		}
	}
	
}