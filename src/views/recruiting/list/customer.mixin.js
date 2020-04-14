import moment 				from 'moment'
import util,{_} 			from '@/libs/util'
import TagLabel 			from 'c%/TagLabel.vue'

export default{
	data () {
		return {
			search_field:{
				name: '',
				intention_level: [],
				follow_eid: 0,
				is_reg: 0,
				age: [0,0],
				first_tel: '',
				second_tel: '',
				second_eid: 0,
				sex: -1,
				customer_status_did: 0,
				next_follow_time: [],
				school_grade: 0,
				school_class: '',
				birth_time: '',
				trial_time: [],
				lid: 0,
				eid: 0,
				create_time: [],
				school_id: 0,
				un_follow_days: -2,
				is_distribution: [0,1],
				create_uid: 0,
				get_time: [],
				from_did: [],
				mc_id: 0,
				get_eid: 0,
				get_address_did: 0,
				assign_time: []
			},
			next_follow_time_nums: 0,
			starList: [
				{
					label: '★',
					value: 1
				},
				{
					label: '★★',
					value: 2
				},
				{
					label: '★★★',
					value: 3
				},
				{
					label: '★★★★',
					value: 4
				},
				{
					label: '★★★★★',
					value: 5
				}
			],
			column_keys_ready:false,
			column_keys:　{
				
				name: {
					title: '姓名',
					width: 180,
					show: true,
					fixed: 'left'
				},
				cu_id:{
					title:'ID',
					width:80,
					show:false
				},
				nick_name: {
					title: '昵称',
					width: 100,
					show: false
				},
				sex: {
					title: '性别',
					show: false,
					width: 80
				},
				age: {
					title: '年龄',
					show: true,
					width: 100,
					sortable: 'custom'
				},
				birth_time: {
					title: '出生日期',
					show: false,
					width: 120,
					sortable: 'custom'
				},
				first_tel: {
					title: '手机号码',
					width: 160,
					show: true
				},
				second_tel: {
					title: '第二手机号码',
					show: false,
					width: 160
				},					
				home_address: {
					title: '家庭住址',
					show: false,
					width: 120
				},
				follow_times: {
					title: '跟进次数',
					show: true,
					sortable: 'custom',
					width: 110
				},
				trial_listen_times: {
					title: '试听次数',
					show: false,
					width: 100
				},
				visit_times: {
					title: '到访次数',
					show: false,
					width: 100
				},
				last_customer_follow_up: {
					title: '最后跟进',
					show: true,
					width: 200
				},		
				un_follow_days: {
					title: '未跟进天数',
					sortable: 'custom',
					show: true,
					width: 120
				},
				customer_status_did: {
					title: '客户状态',
					show: true,
					width: 100
				},
				signup_int_day: {
					title: '报名时间',
					width: 110,
					show: false
				},
				signup_amount: {
					title: '报名金额',
					show: false,
					width: 100
				},
				performance_eid: {
					title: '录单人',
					show: false,
					width: 100						
				},
				channel_name:{
					title:'市场渠道',
					show:true,
					width: 100
				},
				from_did: {
					title: '招生来源',
					show: true,
					width: 100
				},
				intention_level: {
					title: '意向程度',
					width: 180,
					show: true
				},
				school_id_text: {
					title: '公立学校',
					show: false,
					width: 100
				},
				school_grade: {
					title: '年级',
					show: false,
					width: 100
				},
				school_class: {
					title: '班级',
					show: false,
					width: 100
				},
				id_card_no:{
					title:'身份证号',
					show:false,
					width:100
				},
				last_follow_time: {
					title: '最后跟进时间',
					show: false,
					width: 160
				},
				next_follow_time: {
					title: '下次跟进时间',
					show: false,
					width: 120
				},
				trial_time: {
					title: '方便试听时间',
					show: false,
					width: 120
				},
				create_time: {
					title: '录入时间',
					show: false,
					sortable: 'custom',
					width: 150
				},				
				remark: {
					title: '备注',
					show: false,
					width: 160
				},
				referer_sid: {
					title: '介绍人',
					show: true,
					width: 100
				},
				follow_eid: {
					title: '责任人',
					show: true,
					width: 100
				},
				assign_time: {
					title: '分配时间',
					sortable: 'custom',
					show: true,
					width: 120
				},
				get_time: {
					title: '获取时间',
					sortable: 'custom',
					show: true,
					width: 120
				},
				get_eid: {
					title: '采单人',
					show: true,
					width: 120
				},
				get_address_did: {
					title: '采单地点',
					show: true,
					width: 120
				},
				bid:{
					title:'校区',
					show: false,
					width:120
				},
				pj_ids:{
					title:'归属项目',
					show: false,
					width:140
				}
			},
			operation_keys: {
				edit: {
					title: '编辑',
					type: 'edit',
					per: 'customer.edit'						
				},
				add: {
					title: '跟单',
					type: 'plus',
					per: 'customer.follow'
				},
				audition: {
					title: '试听',
					type: 'headphone',
					per: 'customer.audition'
				},
				signup: {
					title: '报名',
					type: 'android-person-add',
					per: 'customer.signup'
				},
				delete: {
					title: '删除',
					type: 'ios-trash',
					per: 'customer.delete'
				},
				share_shuffle: {
					title: '共享给其他项目',
					type: 'ios-shuffle'
				},
				send_sms:{
					title: '发送短信',
					type:'chatbubble',
					per: 'dashboard.sendsms'
				}
			},
			operation_func: {
				signup (params) {
					this.signup(params.row)
				},
				add (params) {
					this.followAdd(params.row)
				},
				audition (params) {
					this.addAudition(params.row)
				},
				edit (params) {						
					this.$r('ref_modal_recruiting')
					.set('info',params.row)
					.edit(params.row.cu_id)
				},
				delete (params) {						
					this.batchDelete(1,params.row)
				},
				share_shuffle (params) {
					this.share_shuffle(params.row)
				},
				send_sms(params){
					this.sendSms(params.row)
				}
			},
			column_render: {
				name (h,params) {
					let map = {0:{icon:'help',text:'未设置'}, 1:{icon:'male',text:'男'},2:{icon:'female',text:'女'}},
						classes = 'x-a-link' ,
						un_follow_days = params.row.un_follow_days
						
					if(un_follow_days + this.before_remind_days > this.un_follow_days - 1){
						classes += ' text-red'
					} 
					else if(un_follow_days > this.follow_warning_days){
						classes += ' text-orange'
					}	 
					else{
						classes += ' text-info'
					}
					
					if(params.row.sid > 0){
						classes = 'x-a-link text-info'
					}

					let nameElement = h('a',{
						attrs: {
							'class': classes,
							title: params.row.sex>0?map[params.row.sex].text:'',
							style: 'margin-right: 5px'
						},
						on: {
							click: ()=>{
								this.customerDetail(params.row.cu_id)
					 		}
					 	}
					},params.row.sex>0?[h('Icon',{
						props: {
							type: map[params.row.sex].icon
						}
					}),' '+params.row.name]:params.row.name);
					
					return h('span',[nameElement,h(TagLabel, {
						props: {
							type: 3,
							id: params.row.cu_id,
							list: params.row.tags,
							objName: params.row.name
						},
						on: {
							update: () => {
								this.init_data();
							}
						}
					})])
				},
				school_id_text (h,params) {
					return h('span',params.row.school_id_text||'-')
				},
				age (h,params) {
					return h('span',util.age(params.row.birth_time))
				},
				from_did (h,params) {
					return h('span',this.labelDicts(params.row.from_did,'from'))
				},
				intention_level (h,params) {
					return h('Rate',{
						props:{
							value: params.row.intention_level,
							disabled: true
						}
					})
				},
				signup_int_day (h,params) {
					return h('span',this.$filter('int_date')(params.row.signup_int_day||0)||'-')
				},
				performance_eid (h,params) {
					return h('span',params.row.user?params.row.user.name:'-')
				},
				school_grade (h,params) {
					return h('span',this.labelDicts(params.row.school_grade,'grade')||'-')
				},
				school_class (h,params) {
					return h('span',params.row.school_class||'-')
				},
				follow_eid (h,params) {
					let result = this.mapGvarsText('employees','eid',params.row.follow_eid,'ename')||'-'
					return h('span',result)
				},
				referer_sid (h,params) {
					let result = '-'
					if(params.row.referer_sid>0&&!_.isEmpty(params.row.referer_student)){
						result = params.row.referer_student.student_name 
					}
					return h('span',result)
				},
				follow_times (h,params) {
					return h('a',{
						attrs: {
							'class': 'x-a-link text-info'
						},
						on: {
							click: ()=>{
								let row = params.row
								this.$r('ref_follow')
								.set('cu_id',row.cu_id)
								.set('customerInfo',row)
								.set('currentIndex',row._index)
								.set('tabs','follow_record')
								.show(`沟通记录【${row.name}】`)
							}
						}
					},params.row.follow_times)
				},
				last_customer_follow_up (h,params) {
					let obj = params.row.last_customer_follow_up,
						result = '-',
						tool_tip = null,
						add_btn = null
					if(obj){
						result = obj.content
					}
					
					add_btn = h('Button',{
						'class': {
							'pull-right': true
						},
						attrs: {
							'title': '添加跟进'								
						},
						props: {
							type: 'text',
							size: 'small',
							icon: 'plus'
						},
						on: {
							'click': () => {
								this.followAdd(params.row)
							}
						}
					})
					
					tool_tip = h('Tooltip',{
						'class':'x-tooltip',
						props: {
							content: result								
						}
					},[
						h('p',{
							'class': 'text-over-elips',
							style: {
								width: '150px'
							},
						},result)
					])
					
					return h('div',[tool_tip,add_btn])
					
				},
				customer_status_did (h,params) {
					let result = this.labelDicts(params.row.customer_status_did,'customer_status')||'-'
					return h('span',result)
				},
				first_tel (h,params) {
					let label = util.sprintf("%s(%s)",
									params.row.first_tel,
									this.$filter('family_rel')(params.row.first_family_rel))
					return h('rich-tel',{
						props: {
							row: params.row,
							sence: 'customer'
						},
						on: {
							'on-success': ()=>{				
								this.init_data()
							}
						}							
					},label)
				},
				second_tel (h,params) {
					
					if(params.row.second_tel==''){
						return h('span','-')
					}						
					return h('span',
						util.sprintf('%s(%s)',
						params.row.second_tel,
						this.$filter('family_rel')(params.row.second_family_rel))
						)
				},
				next_follow_time (h,params) {
					return h('span',params.row.next_follow_time||'-')
				},
				trial_time (h,params) {
					let result = []
					params.row.trial_time.forEach(item => {
						let time = this.trial_times.find(t=>t.value==item)
						if(time) {
							result.push(time.label)
						}
					})
					return h('span',result.join(','))
				},
				assign_time (h,params) {
					let time = params.row.assign_time
					if(time === 0) {
						return h('span','-')
					}else{
						return h('span',moment(time).format('YYYY-MM-DD'))
					}
				},
				remark (h,params) {
					let tool_tip = h('Tooltip',{
						'class':'x-tooltip',
						props: {
							content: params.row.remark								
						}
					},[
						h('p',{
							'class': 'text-over-elips',
							style: {
								width: '150px'
							},
						},params.row.remark)
					])
					return h('div',[tool_tip])
				},
				get_time (h,params) {
					let result = '',
						get_time = params.row.get_time
					
					if(get_time && get_time.indexOf('1970') == -1){
						result = params.row.get_time
					}
					
					return h('span',result)
				},
				get_eid (h,params) {
					return h('span',this.$filter('ename')(params.row.get_eid,'-'))
				},
				get_address_did (h,params) {
					return h('span',this.$filter('dict_title')(params.row.get_address_did,'get_address'))
				}
			}
			
		}
	},
	created(){
		if(!this.enable_project){
			delete this.column_keys['pj_ids']
			delete this.operation_keys['share_shuffle']
		}
	},
	computed: {
   		follow_warning_days () {
   			let result = 7
   			
   			if(this.$store.state.gvars.configs.params.customer){
   				result = this.$store.state.gvars.configs.params.customer.follow_warning_days       				
   			}
   			
   			return result
   		},
   		un_follow_days () {
   			let result = 15
   			
   			if(this.$store.state.gvars.configs.params.customer){
   				result = this.$store.state.gvars.configs.params.customer.pc_un_follow_days       				
   			}
   			
   			return result
   		},
   		before_remind_days () {
   			let result = 2
   			
   			if(this.$store.state.gvars.configs.params.customer){
   				result = this.$store.state.gvars.configs.params.customer.pc_before_remind_days       				
   			}
   			
   			return result
   		},
   		follow_customers () {
   			return this.$store.state.follow_customers.list
   		}
    },
	methods: {
		changeFollow(val) {
			if(val) {
				let today = moment().format('YYYY-MM-DD')
				this.search_field.next_follow_time = [today, today]
			}
			else {
				this.search_field.next_follow_time = []
			}
			this.init_data();
		},
		audition() {
			let map = this.$store.state.maps;
			let cu =this.follow_customers;
			map.customer= {};
			var cu_ids = [];
			for(var i in cu) {
				map.customer[cu[i].cu_id] = cu[i].name;
				cu_ids.push(cu[i].cu_id);
			}

			this.$Modal.open('recruiting/audition/info-modal.vue',{
				on: {
					'on-save-success': () => {
						this.clearFollow()
					}
				}
			})
			.then(modal => {
				modal
				.set('params',{
					sids: [],
					cu_id: cu_ids
				})
				.show('添加试听安排')
			})
		},
		intoCommonCustomer () {
			let cu_ids = [],
				list = this.follow_customers,
				tip = `是否将所选【${list.length}】位客户转为公海客户,转入后,原负责人将无法继续跟进!`
			
						
			if(list && list.length){
				list.forEach(l=>{
					cu_ids.push(l.cu_id)
				})
			}
			
			this.confirm(tip).then(()=>{
				this.$rest('customers/intoPublicSea')
				.post({cu_ids:cu_ids})
				.success(data=>{
					this.$Message.success('操作成功!')
					this.clearFollow()
				}).error(response=>{
					this.error(response.body.message||'转出失败~')
				})
			})
			
		},
		batchDelete (type,row) {
			let cu_ids = [],
				list = this.follow_customers,
				names = []
			
			if(type==1) {
				cu_ids.push(row.cu_id)
				names.push(row.name)
			}else{
				if(list && list.length){
					list.forEach(l=>{
						cu_ids.push(l.cu_id)
						names.push(l.name)
					})
				}
			}		
			this.$Modal.open('recruiting/customer/batch-delete.vue@modal',{
				on: {
					'on-success':() => {
						this.search()
						this.clearFollow()
					}
				},
				props: {
					cuIds: cu_ids,
					names: names
				}
			})
			.then(modal => {
				modal.show('删除确认')
			})
		},
		commonCustomer () {
			this.$Modal.open('recruiting/list/common-customer.vue@modal',{
				props: {
					parent$: this
				},
				on: {
					'on-success': ()=>{
						this.init_data()
					}
				}
			})
			.then(modal=>{
				modal.show('客户公海')
			})
		},
		followAdd (row) {
			this.$Modal.open('recruiting/following/follow-info-modal.vue',{
				props: {
					'list': this.data,
					'page-size': this.pageSize
				},
				on: {
					'on-prevpage':() => {
						this.prev_page()
					},
					'on-nextpage':() => {
						this.next_page()
					},
					'on-success': () => {
						this.init_data()
					}
				}
			})
			.then(modal => {
				modal
				.set('cu_id',row.cu_id)
				.set('customerInfo',row)
				.set('tabs','basic_information')
				.set('currentIndex',row._index)
				.show('添加跟进记录','add')
			})
		},
		prev_page () {
			this.pageIndex--
			this.init_data()
		},
		next_page () {
			this.pageIndex++
			this.init_data()
		},
		addAudition (row) {
			let map = this.$store.state.maps;
			map.customer= {};
			map.customer[row.cu_id] = row.name;
			this.$Modal.open('recruiting/audition/info-modal.vue',{
				on: {
					'on-save-success': () => {
						this.init_data()
					}
				}
			})
			.then(modal => {
				modal
				.set('params',{
					sids: [],
					cu_id: [row.cu_id]
				})
				.show('添加试听安排')
			})
		},
		perScopeChange(value) {
            this.type_customer = value
        },
		deal_data(data){
			let option_fields = this.$store.state.gvars.configs.customer_option_fields
			let fields = []
			option_fields.forEach(f=>{
				if(f.enable == 1){
					fields.push(f.name)
				}
			})
			function get_option_fields_default_value(obj,f){
				if(obj && obj[f]){
					return obj[f]
				}
				return ''
			}
			this.next_follow_time_nums = data.next_follow_time_nums;
			data.list.forEach(item=>{
				if(this.is_in_store(item.cu_id)){
					item._checked = true;
				}
				fields.forEach(f=>{
					item[f] = get_option_fields_default_value(item.option_fields,f)
				})
			})
			
			return data.list
		},
		is_in_store(cu_id){
			return !!this.$store.state.follow_customers.list.find(item=>item.cu_id==cu_id)
		},
		signup (row) {
			let params = {}
			
			if(row.sid > 0){
				params = {sid: row.sid}
				this.$router.push({name:'dashboard_payment',params:params})
			}else if(row.cu_id > 0){
				params = {cu_id: row.cu_id}
				this.$router.push({name: 'dashboard_signup',params: params})
			}
		},
		customerDetail (id) {
			this.setStateSearchInfo()
			this.$router.push({path: `/recruiting/list/${id}/following`})
		},
		customerAdd () {
			this.$r('ref_modal_recruiting')
			.set('cu_id',0)
			.show('添加意向客户','add')
		},
		resetSearch () {
			if(this.tag_id > 0) {
				this.$router.replace('/recruiting/list/customer')
			}else{
				this.search_field.follow_eid = 0
				this.search_field.second_eid = 0
				this.search_field.trial_time = []
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		},
		hook_get_param (params) {
			let search_obj = util.copy(this.search_field)
			
			let user = this.$store.state.user.info
			
			if(user.is_admin===0&&this.eid$===0){
				return 
			}
			
			if(this.type_customer=='my'&&this.eid$>0){
				params.follow_eid = this.eid$
			}else{
				delete params.follow_eid
			}

			if(params.order_field=='un_follow_days') {
				params.order_field = 'last_follow_time'
			}
			if(params.order_field=='age') {
				params.order_field = 'birth_time'
			}
			if(this.tag_id > 0) {
				params.tag_id = this.tag_id
			}
			for(let o in search_obj) {
				let property = search_obj[o]
				if(o=='trial_time'){
					if(property.length > 0 && property[0] != ''){
						params[o] = util.sprintf('%s',property.join(','))							
					}
				}
				else if(o=='create_time'||o=='next_follow_time'||o=='get_time'||o=='assign_time'){
					if(property.length > 0) {
						params[o] = util.sprintf('[Between,%s]',property.join(','))
					}
				}else if(o=='age'){
					if(parseInt(property[0])>=0
						&&parseInt(property[1])>0
						&&parseInt(property[1])>=parseInt(property[0])){
						params.age_start = parseInt(property[0])
						params.age_end = parseInt(property[1])
					}						
				}else if(o=='sex'){
					if(property!==-1) {
						params[o] = property
					}
				}else if(o=='un_follow_days'){
					if(property!=-2){
						params[o] = property
					}
				}
				else if(o=='is_distribution'){
					if(property.length==1){
                    	if(property[0]==0){
							params.follow_eid = '0'
						}
                    	else if(property[0]==1){
                    		params.follow_eid = '[>,0]'                    		
                    	}
                    }
				}
				else if(o=='intention_level'){
					if(property.length>0){
						params.intention_level = `[In,${property.join(',')}]`;
                    }
				}
				else if(o=='is_reg'){
					params[o] = property
				}
				else if(o=='from_did'){
					if(property.length>0){
						params.from_did = `[In,${property.join(',')}]`;
                    }
				}
				else{
					if(property&&property!=-1){
						params[o] = property
					}	
				}
			}
			params.is_public = 0
			if(this.search_field_from_did.length > 0){
				params['from_did'] = '[IN,'+this.search_field_from_did.join(',')+']'
			}
		},
		followMulti() {
			this.$router.push({path: '/recruiting/followingmulti'})
		},
		assignMulti() {
			this.$Modal.open('recruiting/customer/assign.vue@modal',{
				on: {
					'on-success':() => {
						this.clearFollow()
					}
				}
			})
			.then(modal => {
				modal
				.show('批量分配责任人')
			})
		},
		addFollow(item) {
			const index = this.follow_customers.findIndex(f=>f.cu_id==item.cu_id)
			if(index < 0) {
				this.$store.commit('addFollowCustomer',{
					id:item.cu_id,
					name:item.name,
					first_tel:item.first_tel,
					photo_url:item.photo_url
				})
			}
		},
		removeFollow(cu_id) {
			const index = this.follow_customers.findIndex(f=>f.cu_id==cu_id)
			if(index > -1) {
				this.$store.commit('removeFollowCustomer',index)
			}
		},
		selectOne (selection,row) {
			this.addFollow(row)
		},
		cancelSelect (selection,row) {
			this.removeFollow(row.cu_id)
		},
		selectAll (selection) {
			selection.forEach(item => {
				this.addFollow(item)
			})
		},
		selectChange (selection) {
			if(selection.length == 0){
				this.data.forEach(item => {
					this.removeFollow(item.cu_id)
				})
			}
		},
		clearFollow () {
			this.$store.commit('clearFollowCustomer')
			this.init_data()
		},
		initOptionFieldsColumn(){
			let option_fields = this.$store.state.gvars.configs.customer_option_fields
			option_fields.forEach(f=>{
				if(f.enable == 1){
					this.$set(this.column_keys,f.name,{title:f.label,show:false,width:100})
				}
			})
			this.column_keys_ready = true
		},
		selectProjects (){
			this.$Modal.open('recruiting/select-projects.vue@modal',{
				on: {
					"on-success": (pj_ids) => {
						var cu_ids = [];
						let cu =this.follow_customers;
						for(var i in cu) {
							cu_ids.push(cu[i].cu_id);
						}
						let params = {cu_ids : cu_ids,pj_ids : pj_ids}
						this.$rest('customers/batch_pj_ids').put(params)
						.success(data=>{
							this.$Message.success('批量分配项目成功！')
							this.init_data()
						}).error(response=>{
							this.error(response.body.message||'批量分配项目失败~','error')
						})
					}
				}
			})
			.then(modal =>{
				modal.show('批量分配项目')
			})
		},
		share_shuffle (row){
			this.$Modal.open('recruiting/select-projects.vue@modal',{
				props:{
					props_pj_ids:row.pj_ids
				},
				on: {
					"on-success": (pj_ids) => {
						let params = {pj_ids : pj_ids}
						this.$rest('customers/'+row.cu_id+'/dopj_ids').post(params)
						.success(data=>{
							this.$Message.success('共享成功！')
							this.init_data()
						}).error(response=>{
							this.error(response.body.message||'共享失败~','error')
						})
					}
				}
			})
			.then(modal =>{
				modal.show('共享给其他项目')
			})
		},
		batSendSms(list){
			if(_.isUndefined(list) || !_.isArray(list))	{
				list = this.follow_customers
			}
			if(list.length == 0){
				return
			}
			this.$Modal.open('app/modal/sms-template-modal.vue',{
				props:{
					objectType:'customer',
					sendObject:list
				}
			})
			.then(modal=>{
				modal.show('发送短信')
			})
		},
		sendSms(row){
			this.batSendSms([row])
		}
	}
}
