import moment 				from 'moment'
import util,{_} 			from '@/libs/util'

export default{
	data () {
		return {
			column_keys:　{
				name: {
					title: '姓名',
					width: 150,
					show: true,
					fixed: 'left'
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
					width: 100
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
				birth_time: {
					title: '出生日期',
					show: false,
					width: 120
				},
				home_address: {
					title: '家庭住址',
					show: false,
					width: 120
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
				un_follow_days: {
					title: '未跟进天数',
					show: true,
					width: 110
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
				}
			},
			operation_keys: {
				signup: {
					title: '报名',
					type: 'android-person-add',
					per: 'customer.signup'
				},
				add: {
					title: '跟单',
					type: 'plus',
					per: 'customer.follow'
				},
				edit: {
					title: '编辑',
					type: 'edit',
					per: 'customer.edit'						
				},
				delete: {
					title: '删除',
					type: 'ios-trash',
					per: 'customer.delete'
				}
			},
			operation_func: {
				signup (params) {
					this.signup(params.row.customer)
				},
				add (params) {
					this.followAdd(params.row.customer)
				},
				edit (params) {						
					this.$r('ref_modal_recruiting')
					.set('info',params.row.customer)
					.edit(params.row.customer.cu_id)
				},
				delete (params) {						
					this.confirm('确认删除客户【'+params.row.customer.name+'】')
					.then(response=>[
						this.$rest('customers')
						.delete(params.row.customer.cu_id)
						.success(res => {
							this.$Message.success('删除成功')
							this.init_data()
						})
						.error(res => {
							this.$Message.error(res.body.message)
						})
					])
				}
			},
			column_render: {
				name (h,params) {
					let map = {0:{icon:'help',text:'未设置'}, 1:{icon:'male',text:'男'},2:{icon:'female',text:'女'}},
						classes = 'x-a-link' ,
						un_follow_days = params.row.customer.un_follow_days
						
					if(un_follow_days + this.before_remind_days > this.un_follow_days - 1){
						classes += ' text-red'
					} 
					else if(un_follow_days > this.follow_warning_days){
						classes += ' text-orange'
					}	 
					else{
						classes += ' text-info'
					}
					
					if(params.row.customer.sid > 0){
						classes = 'x-a-link text-info'
					}

					let nameElement = h('a',{
						attrs: {
							'class': classes,
							title: map[params.row.customer.sex].text,
							style: 'margin-right: 5px'
						},
						on: {
							click: ()=>{
								this.customerDetail(params.row.customer.cu_id)
					 		}
					 	}
					},[h('Icon',{
						props: {
							type: map[params.row.customer.sex].icon
						}
					}),' '+params.row.customer.name]);
					
					return h('span',[nameElement])
				},
				school_id_text (h,params) {
					return h('span',params.row.customer.school_id_text||'-')
				},
				age (h,params) {
					return h('span',util.age(params.row.customer.birth_time))
				},
				from_did (h,params) {
					return h('span',this.labelDicts(params.row.customer.from_did,'from'))
				},
				intention_level (h,params) {
					return h('Rate',{
						props:{
							value: params.row.customer.intention_level,
							disabled: true
						}
					})
				},
				signup_int_day (h,params) {
					return h('span',this.$filter('int_date')(params.row.customer.signup_int_day||0)||'-')
				},
				performance_eid (h,params) {
					return h('span',params.row.customer.user?params.row.customer.user.name:'-')
				},
				school_grade (h,params) {
					return h('span',this.labelDicts(params.row.customer.school_grade,'grade')||'-')
				},
				school_class (h,params) {
					return h('span',params.row.customer.school_class||'-')
				},
				follow_eid (h,params) {
					let result = this.mapGvarsText('employees','eid',params.row.customer.follow_eid,'ename')||'-'
					return h('span',result)
				},
				referer_sid (h,params) {
					let result = '-'
					if(params.row.customer.referer_sid>0&&!_.isEmpty(params.row.customer.referer_student)){
						result = params.row.customer.referer_student.student_name 
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
								let row = params.row.customer
								this.$r('ref_follow')
								.set('cu_id',row.cu_id)
								.set('customerInfo',row)
								.set('currentIndex',row._index)
								.set('tabs','follow_record')
								.show(`沟通记录【${row.name}】`)
							}
						}
					},params.row.customer.follow_times)
				},
				last_customer_follow_up (h,params) {
					let obj = params.row.customer.last_customer_follow_up,
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
								this.followAdd(params.row.customer)
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
					
					return h('div',{'class':'row'},[tool_tip,add_btn])
					
				},
				customer_status_did (h,params) {
					let result = this.labelDicts(params.row.customer.customer_status_did,'customer_status')||'-'
					return h('span',result)
				},
				first_tel (h,params) {
					let label = util.sprintf("%s(%s)",
									params.row.customer.first_tel,
									this.$filter('family_rel')(params.row.customer.first_family_rel))
					return h('rich-tel',{
						props: {
							row: params.row.customer,
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
					
					if(params.row.customer.second_tel==''){
						return h('span','-')
					}						
					return h('span',
						util.sprintf('%s(%s)',
						params.row.customer.second_tel,
						this.$filter('family_rel')(params.row.customer.second_family_rel))
						)
				},
				next_follow_time (h,params) {
					return h('span',params.row.customer.next_follow_time||'-')
				},
				assign_time (h,params) {
					let time = params.row.customer.assign_time
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
							content: params.row.customer.remark								
						}
					},[
						h('p',{
							'class': 'text-over-elips',
							style: {
								width: '150px'
							},
						},params.row.customer.remark)
					])
					return h('div',[tool_tip])
				},
				get_time (h,params) {
					let result = '',
						get_time = params.row.customer.get_time
					
					if(get_time && get_time.indexOf('1970') == -1){
						result = params.row.customer.get_time
					}
					
					return h('span',result)
				}
			}
			
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
			let title = util.sprintf('【%s】添加试听',row.name)
			this.$refs.arrange
			.set('cu_id',row.cu_id)
			.show(title,'add')
		},
		perScopeChange(value) {
            this.type_customer = value
        },
		deal_data(data){
			this.next_follow_time_nums = data.next_follow_time_nums;
			data.list.forEach(item=>{
				if(this.is_in_store(item.cu_id)){
					item._checked = true;
				}
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
			this.$router.push({path: `/recruiting/list/${id}/following`})
		},
		customerAdd () {
			this.$r('ref_modal_recruiting')
			.set('cu_id',0)
			.show('添加意向客户','add')
		},
		resetSearch () {
			this.search_field.follow_eid = 0
			this.search_field.second_eid = 0
			this.search_field.trial_time = []
			this.$r('ref_search').resetFields()
			this.init_data()

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
			
			for(let o in search_obj) {
				let property = search_obj[o]
				if(o=='trial_time'){
					if(property.length > 0 && property[0] != ''){
						params[o] = util.sprintf('%s',property.join(','))							
					}
				}
				else if(o=='create_time'||o=='next_follow_time'||o=='get_time'){
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
		}
	}
}
