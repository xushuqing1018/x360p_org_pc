import util from '@/libs/util'
import {_} from '@/libs/util'
import Vue from 'vue'
import moment from 'moment'

export default {
	data() {
		return {
			visible: false,
			cut_items: [],			// 扣款项
			tpl_data: [],			// 报名模板数据
			lids: [],				// 选课程
			cids: [],				// 选班级
			mt_ids: [],				// 选物品
			pi_ids: [],				// 选杂项
			is_contain_good: false,	// 是否包含物品
			defaultSalesman: [],	// 学员默认业绩归属人
			// options: {}
		}
	},
	methods: {
		getSalesman(sid,param) {
			this.defaultSalesman = []
			this.$rest('students').add_url_param(sid,'salesman')
			.get({
				with: param
			})
			.success(res => {
				if(res.eid.length>0) {
					let first = res.is_first_order
					res.eid.forEach(id => {
						let saleItem
						if(first) {
							saleItem = {eid:id,sale_role_did:this.default_roles.new}
						}else{
							saleItem = {eid:id,sale_role_did:this.default_roles.renew}
						}
						this.defaultSalesman.push(saleItem)
					})
					this.hook_default_salesman()
				}
			})
			.error(res => {
				this.$Message.error(res.body.message)
			})
		},
		hook_default_salesman() {

		},
		getSexIconType() {
			let map = {0:'help',1:'male',2:'female'}
			return map[this.student.sex]
		},
		setSignupAllowDate() {
			let config_signup = this.$store.state.gvars.configs.params.student_signup,
				allow = config_signup.allow_modify_date,
				days = config_signup.modify_date_days
			if(allow) {
				this.options = {
					disabledDate (date) {
						return date && date.valueOf() > Date.now() || date.valueOf() < Date.now() - 86400000*days
					}
				}
			}else{
				this.options = {
					disabledDate (date) {
						return date && moment(date).format('YYYYMMDD') !== moment().format('YYYYMMDD')
					}
				}
			}
		},
		/** 扣款项部分 **/
		handleTrigger () {
            this.visible = !this.visible;
        },
        dealCutItems(cut) {
			this.cut_items = []
			cut.forEach((item) => {
				this.cut_items.push({
					amount:'0.00',
					cutamount_did: item.did,
					title: item.title
				})
			})
		},
		filterCut() {
			let list = []
			this.cut_items.forEach((item) => {
				if(parseFloat(item.amount) != 0) {
					list.push(item)
				}
			})
			return list
		},
		resetCut() {
			if(this.visible) {
				this.visible = false
			}
			this.cut_items.forEach((item) => {
				if(item.amount != 0) {
					item.amount = '0.00'
				}
			})
		},
		/** 选择模板部分 **/
		deleteTpl(item) {
			this.confirm('确定要删除缴费模板【'+ item.name +'】吗？')
			.then(() => {
				this.$rest('input_templates')
                .delete(item.it_id)
                .success((response,rest)=>{
                	this.$Message.success('删除成功')
                    this.getTpl()
                })
                .error((response,rest)=>{
                    this.$Message.error(response.body.message)
                })
			})
		},
		selectTpl(item) {
			if(!this.enable_modify_saved_order&&this.order.oid) {
				this.$Message.error('不能修改已保存订单的内容')
				return false
			}
			let len = this.order.items.length
			if(len > 0) {
				this.order.items.splice(0,len)
			}
			item.template.data.forEach(tpl => {
				this.order.items.push(tpl)
			})
			// 获取模板保存的直减金额
			this.order.order_reduced_amount = util.int(item.template.reduced)
		},
		getTpl() {
			this.$rest('input_templates')
			.get({
				type:1
			})
			.success(response=>{
				this.tpl_data = response.list
			})
			.error(response=>{
				this.$Message.error(response.body.message)
			})
		},
		/** 报班报课程部分 **/
		// 添加物品
		addMaterial() {
			if(!this.enable_modify_saved_order&&this.order.oid) {
				this.$Message.error('不能修改已保存订单的内容')
				this.mt_ids.splice(0,this.mt_ids.length)
				return false
			}
			if(this.mt_ids.length > 0) {
				this.mt_ids.forEach(id => {
					let good = this.$store.getters.getMapObject(id,'materials')
					this.addLesson(good,'m')
				})
				this.mt_ids.splice(0,this.mt_ids.length)
			}
		},
		addFees(fees) {
			if(!this.enable_modify_saved_order&&this.order.oid) {
				this.$Message.error('不能修改已保存订单的内容')
				this.pi_ids.splice(0,this.pi_ids.length)
				return false
			}
			if(fees.length > 0) {
				fees.forEach(fee => {
					this.addLesson(fee,'fee')
				})
				this.pi_ids.splice(0,this.pi_ids.length)
			}
		},
		selectMaterial() {
			this.$r('ref_material').openModal()
		},
		selectFees() {
			this.$r('ref_fees').openModal()
		},
		// 添加绑定的物品（课程或班级）
		addBindMaterial(item) {

			let material = item.lesson_material||[]
			if(material.length > 0) {
				material.forEach(m => {
					this.addLesson(m,'m')
				})
			}
		},
		//添加班级
		addClasses (selected) {
			if(!this.enable_modify_saved_order&&this.order.oid) {
				this.$Message.error('不能修改已保存订单的内容')
				this.cids.splice(0,this.cids.length)
				return false
			}
			if(selected.length>0){
				let err = 0,
					errContent = ''
				selected.forEach(s=>{
					if(s.student_nums<s.plan_student_nums){
						let lesson = this.getClassLesson(s)
						Vue.set(lesson,'_class_name',s.class_name)
						Vue.set(lesson,'cid',s.cid)
						this.addLesson(lesson,'lesson')
						this.addBindMaterial(lesson)
					}else{
						err ++
						errContent += util.sprintf('【%s】、',s.class_name)						
					}					
				})
				this.cids.splice(0,this.cids.length)
				if(err>0){
					errContent = errContent.substring(0,errContent.length-1)+' 班级学员已满，请选择其他班级'
					this.$Notice.error({
						title: '提示',
						desc: errContent
					})
				}
			}
		},
		checkTSConflict() {
			let ts = { day1:[],day2:[],day3:[],day4:[],day5:[],day6:[],day7:[] },is_conflict = false
			this.order.items.forEach(item => {
				if(item.cid>0) {
					let classObj = this.$store.getters.getMapObject(item.cid,'class')
					classObj.schedules.forEach(s => {
						switch(s.week_day) {
							case 1:
								ts.day1.push(s.int_start_hour+s.int_end_hour)
								break;
							case 2:
								ts.day2.push(s.int_start_hour+s.int_end_hour)
								break;
							case 3:
								ts.day3.push(s.int_start_hour+s.int_end_hour)
								break;
							case 4:
								ts.day4.push(s.int_start_hour+s.int_end_hour)
								break;
							case 5:
								ts.day5.push(s.int_start_hour+s.int_end_hour)
								break;
							case 6:
								ts.day6.push(s.int_start_hour+s.int_end_hour)
								break;
							case 7:
								ts.day7.push(s.int_start_hour+s.int_end_hour)
								break;
						}
					})
				}
			})
			if(this.order.items.find(item=>item.cid>0)) {
				for(let key in ts) {
					let set = new Set(ts[key])
					if(ts[key].length>[...set].length) {
						is_conflict = true
						break;
					}
				}
			}
			return is_conflict
		},
		addLesson(obj,type){
			if(type == 'm') {

				let item = this.order.items.find(it=>it.gid == obj.mt_id)
				if(item){
					if(obj.pivot !== undefined) {
						this.addOrderItemNum(item,obj.pivot.default_num)
					}else{
						this.addOrderItemNum(item,1)
					}
				}else{
					this.addOrderItem(obj,type)
				}

			}else if(type == 'lesson') {
				let item = {}
				if(obj.cid) {
					item = this.order.items.find(it=>it.lid == obj.lid && it.cid == obj.cid)
				}else{
					item = this.order.items.find(it=>it.lid == obj.lid && it.cid == 0)
				}
				
				if(item){
					this.addOrderItemNum(item,obj.lesson_nums)
				}else{
					this.addOrderItem(obj,type)
				}
			}else if(type == 'lessonup') {
				let item = this.order.items.find(it=>it.from_lid > 0)
				if(item){
					this.$Message.error(util.sprintf('【%s】的课程升级已存在',this.$filter('lesson_name')(item.from_lid)))
				}else{
					this.addOrderItem(obj,type)
				}
			}else if(type == 'fee') {
				let item = this.order.items.find(it=>it.pi_id == obj.pi_id)
				if(item) {
					this.$Message.error('杂费请勿重复选择')
					return false
				}else{
					this.addOrderItem(obj,type)
				}
			}else if(type == 'order_item') {
				this.addOrderItem(obj,type)
			}
		},
		// 增加项目
		addOrderItem(lesson,type,nums){
			let item = this.create_order_item(lesson,type,nums)
			if(this.student.sid) {
				this.setItemConsumeType(item)
			}
			this.order.items.push(item)
		},
		// 如果项目存在则增加数量
		addOrderItemNum(item,qty){
			item.nums = util.add(item.nums,qty)
			this.$refs['ref_goods'].numsChange(item)
		},
		// 构建项目数据结构
		create_order_item(lesson,type,nums){
			let item = {
				id:0,						//订单商品id
				lid:0,						//课程id
				gid:0,						//物品id
				pi_id:0,					//杂费id
				item_name:'',				//条目名称
				name:'',					//商品名称
				gtype:0,					//商品类型
				nums:1.00,					//商品数量
				nums_unit:2,				//数量单位(0为物品的数量单位,1为课次,2为课时,3为月按时间)
				expire_time:'',				//过期时间
				_discount_rate:100,			//折扣率
				origin_price:0.00,			//原始单价
				price:0.00,					//折后单价
				origin_amount:0.00,			//原始金额
				discount_amount:0.00,		//折扣金额
				paid_amount:0.00,			//实付金额(subtotal - _share_own_amount)
				origin_lesson_times:0.00,	//原始课次数
				present_lesson_times:0.00,	//赠送课次数
				lesson_times:0.00,			//总课次数
				origin_lesson_hours:0.00,	//原始课时数
				present_lesson_hours:0.00,	//赠送课时数
				lesson_hours:0.00,			//总课时数
				subtotal:0.00,				//item小计,每一项应交金额=原始金额-分摊优惠金额-折扣金额
				reduced_amount:0.00,		//分摊的优惠金额
				cid:0,						//班级id
				consume_type:0,				//收费类型
				is_demo:0,					//是否体验课
				product_level_did:0,		//课程等级
				sdc_id: 0,					//学员储值卡
				from_lid: 0,				//课程升级来源lid
				from_sl_id: 0,				//课程升级来源sl_id
				_class_name: '',			//班级名称
				_is_term:0,					//是否按期收费
				_unit_lesson_hours:0.00,	//单次课扣多少课时
				_is_average:false,			//是否分摊优惠金额
				_share_own_amount:0.00, 	//分解的欠款金额
				_amount_by_discount:0.00, 	//折后金额
				_apply_debit_type: 0,		//储值卡优惠方案
				_debit_reduced: 0,			//储值卡对应的直减
				_debit_discount: 100,		//储值卡对应的折扣
				_debit_origin: 0,			//储值卡对应的直接定价
				_debit_current: 0,			//储值卡对应的直接定价
				_is_lock: false,			//当原单价为0时修改后可锁定
				_is_flex: 0,				//杂费弹性价格	
				_pr_id: 0,					//优惠方案id
				_define_promotion_rule: [],	//优惠方案
				_step_price_define:[],		//阶梯定价

				_data: {					//缓存原始数据
					origin_price: 0,
					origin_amount: 0,
					nums: 0,
					origin_expire_time: ''
				}
			}
			item.id				    	= this.id++
			if(type == 'm') {
				this.patch_order_item_material(item,lesson)	
			}else if(type == 'lesson' || type == 'lessonup'){
				this.patch_order_item_lesson(item,lesson,type,nums)
			}else if(type == 'fee') {
				this.patch_order_item_fee(item,lesson)
			}else if(type == 'order_item') {
				this.patch_order_item_order_item(item,lesson)
			}
			if(item.nums_unit == 3) {
				item.expire_time = moment().add(item.nums,'months').format('YYYY-MM-DD')
			}

			item._data.nums 			= item.nums
			item._data.origin_price 	= item.origin_price
			item._data.origin_amount 	= item.origin_amount
			item._data.origin_expire_time = item.expire_time

			if(item.origin_amount > 0) {
				item._is_lock = true
			}

			return item
		},
		patch_order_item_lesson(item,lesson,type,nums){
			if(lesson.cid > 0) {
				lesson = this.setPriceByDefine(lesson)
			}	
			item.lid 				= lesson.lid
			if(item.lid > 0){
				item.name 			= lesson.lesson_name
				item.is_demo 		= lesson.is_demo
			}else{
				item.name 			= lesson.name
			}
			item.item_name          = item.name
			
			item.lesson_type		= lesson.lesson_type
			item.nums 				= this.dealNums(lesson,nums)
			item.nums_unit 			= lesson.price_type
			item.origin_price 		= Number(lesson.unit_price)

			item.price       		= Number(lesson.unit_price)
			item._origin_price      = item.origin_price
			item._is_term     		= lesson.is_term
			item._unit_lesson_hours = lesson.unit_lesson_hours
			item.cid 				= lesson.cid || 0
			item._class_name 		= lesson._class_name || ''
			item.product_level_did  = lesson.product_level_did				

			item._amount_by_discount = util.float(lesson.sale_price) || util.mul(lesson.unit_price,item.nums)
			item.origin_amount 		= item._amount_by_discount

			if(type == 'lessonup') {
				item.from_lid 		= lesson.from_lid
				item.from_sl_id 	= lesson.from_sl_id
			}
			if(lesson.define_promotion_rule) {
				let ret = util.copy(lesson.define_promotion_rule)
				ret.push({
					pr_id: -1,
					promotion_type: -1,
					title: '不使用优惠'
				})
				ret.forEach(r => {
					let present = Number(r.present_lesson_hours || 0)
					if(r.promotion_type < 4 && present > 0) {
						r.title = r.title + ` (+${present})`
					}
				})
				item._define_promotion_rule = ret
			}
			if(lesson.step_price_define){
				item._step_price_define = lesson.step_price_define
			}

			if(lesson.expire_month) {
				item.expire_time = moment().add(lesson.expire_month,'months').format('YYYY-MM-DD')
			}
		},
		patch_order_item_material(item,lesson){
			item.gtype 				= 1
			item.gid 				= lesson.mt_id
			item.name          		= lesson.name
			item.item_name 			= lesson.name
			item.nums 				= 1
			item.nums_unit 			= 0
			item._unit 				= lesson.unit
			item.origin_price 		= Number(lesson.sale_price)
			item.price       		= item.origin_price

			if(lesson.pivot !== undefined) {
				item.nums = lesson.pivot.default_num
			}
			item.origin_amount      = item.nums * item.origin_price
			item._amount_by_discount = item.origin_amount
		},
		patch_order_item_fee(item,lesson){
			item.gtype 				= 3
			item.pi_id 				= lesson.pi_id
			item.name 				= lesson.name
			item.item_name 			= lesson.name
			item.nums 				= 1
			item.nums_unit 			= 0
			item.origin_price 		= Number(lesson.unit_price)
			item.price 				= item.origin_price
			item.origin_amount		= item.origin_price
			item._amount_by_discount = item.origin_amount
			item._is_flex			= lesson.is_flex_price
		},
		patch_order_item_order_item(item,oi){
			item.gtype = oi.gtype
			if(oi.gtype == 0){
				let lesson = null
				if(oi.lid > 0){
					lesson = this.getLesson(oi.lid)
				}
				item.lid 				= oi.lid
				item.name 				= oi.item_name
				item.is_demo 		    = oi.is_demo
				item.item_name          = oi.item_name
				item.consume_type       = 2
				
				item.nums 				= Number(oi.nums)
				item.nums_unit 			= oi.nums_unit
				item.origin_price 		= Number(oi.origin_price)

				item.price       		= Number(oi.price)
				item._origin_price      = item.origin_price
				
				item.cid 				= oi.cid

				if(item.cid > 0){
					item._class_name 		= oi.one_class.class_name
				}

				item._amount_by_discount = util.mul(item.price,item.nums)
				item.origin_amount 		= item._amount_by_discount
				
				if(lesson){
					item.lesson_type		= lesson.lesson_type
					item._is_term     		= lesson.is_term
					item._unit_lesson_hours = lesson.unit_lesson_hours
					item.product_level_did  = lesson.product_level_did				
		
					if(lesson.expire_month) {
						item.expire_time = moment().add(lesson.expire_month,'months').format('YYYY-MM-DD')
					}
				}

				if(oi.order_item_lha && oi.order_item_lha.length > 0){
					this.set_order_item_lha_patch(item,oi.order_item_lha[0])
				}
			}
		},
		set_order_item_lha_patch(item,lha){
			item.lha = {
				int_day: [],
				teach_eid: [],
				lid: 0,
				int_start_hour:'',
				int_end_hour:'',
				week_days: [],
				lesson_type: 2
			}
			let now_date = new Date()
			item.lha.int_day.push(moment(now_date).format('YYYY-MM-DD'))
			item.lha.int_day.push(moment(now_date).add(60,'days').format('YYYY-MM-DD'))
			item.lha.lesson_type = item.lesson_type
			let wts = lha.week_time_sections
			let arr_wts = wts.split(',');
			arr_wts.forEach(w=>{
				let arr = w.split(':')
				let wd  = util.int(arr[0])
				let arr_h = arr[1].split('-')
				if(item.lha.week_days.indexOf(wd) === -1){
					item.lha.week_days.push(wd)
				}
				if(item.lha.int_start_hour == ''){
					item.lha.int_start_hour = util.int_hour_to_hour_str(arr_h[0])
					item.lha.int_end_hour   = util.int_hour_to_hour_str(arr_h[1])
				}
			})
			item.lha.lid = item.lid 
			if(lha.arrange_detail && lha.arrange_detail.length > 0){
				lha.arrange_detail.forEach(ca=>{
					if(item.lha.teach_eid.indexOf(ca.teach_eid) === -1){
						item.lha.teach_eid.push(ca.teach_eid)
					}
				})
			}
		},
		setPriceByDefine(lesson) {
			if(lesson.lid > 0) {
				let define = Number(lesson.define_price)
				if(define > 0) {
					if(lesson.is_term == 1) {
						lesson.sale_price = define
						lesson.unit_price = Number(util.div(define,lesson.lesson_nums).toFixed(6))
					}else{
						lesson.unit_price = define
					}
				}
			}
			return lesson
		},
		dealNums(lesson,nums) {
			if(!_.isUndefined(nums)) {
				return nums
			}
			if(lesson.is_term == 1) {
				return Number(lesson.lesson_nums)
			}else{
				return 1
			}
		},
		// 创建收款账户数据结构
		create_account_item(account,type) {
			let item = {}

			item.aa_id  = account.aa_id
			item.name   = account.name
			item.is_public    = account.is_public
			item.pay_amount   = 0
			item.type   = account.type
			item.cp_id  = account.cp_id
			item.pay_status = true
			
			if(type == 'default') {
				item.mode = 0
			}else{
				item.mode = 1
			}
			return item
		},
		dealAccounts(accounts) {
			let bid = this.bid$
			let items = []
			this.order.payment = []
			this.order._dropdown_account = []
			accounts.forEach(item => {
				if(!_.isEmpty(item.bids) && item.bids.indexOf(bid) > -1 && item.is_front == 1) {
					if(item.type == 0 && item.is_default == 1 && !this.default_aa_empty) {
						this.order.payment.push(this.create_account_item(item,'default'))
					}else{
						this.order._dropdown_account.push(this.create_account_item(item,'others'))
					}
				}
				if(_.isEmpty(item.bids) && item.is_public == 1 && item.is_front == 1) {
					this.order._dropdown_account.push(this.create_account_item(item,'others'))
				}
			})
		},
		// 校验项目是否符合要求
        checkOrderItems() {
        	if(this.order.items.length == 0) {
        		this.$Message.error('请选择课程或物品')
        		return false
        	}

    		let decimal_good = this.order.items.find(item => item.nums < 0.01 && item.nums > 0)
    		let decimal_present_good = this.order.items.find(item => item.present_lesson_hours < 0.01 && item.present_lesson_hours > 0)
    		let is_none_good = this.order.items.find(item => item.nums === 0  && item.present_lesson_hours === 0)
    		if(decimal_good) {
    			this.$Message.error("'"+decimal_good.name+"' " + "的数量不能小于0.01")
    			return false
    		}
    		if(decimal_present_good) {
    			this.$Message.error("'"+decimal_present_good.name+"' " + "的赠送数量不能小于0.01")
    			return false
    		}
    		if(is_none_good) {
    			this.$Message.error("'"+is_none_good.name+"' " + "购买数量和赠送数量不能同时为0")
    			return false
    		}
    		let has_demo_lesson = 0
    		let has_standard_lesson = 0
    		let has_unset_consume_type = 0
    		this.order.items.forEach(item=>{
        		if(item.is_demo == 1){
        			has_demo_lesson++
        		}else{
        			if(item.gtype == 0){//如果是课程
        				has_standard_lesson++
        			}
        		} 
        		if(item.consume_type == 0){
        			has_unset_consume_type ++
        		}
        	})

        	if(has_demo_lesson > 0){
        		this.order.is_demo = 1
        	}
        	if(has_demo_lesson > 0 && has_standard_lesson > 0){
        		this.$Message.error('体验课只能单独购买')
        		return false
        	}

        	if(has_unset_consume_type){
        		this.$Message.error('请选择收费类型!')
        		return false
        	}
    		
			this.dealAccounts(this.accounts$)
			if(this.order._oid) {
				this.order.oid = this.order._oid
				this.$r('settleCenterModal').set('oid',this.order._oid)
				this.checkPaymentOnline(this.order._oid)
			}
			this.calculateAmount()
			if(this.order.oid > 0){
				this.order.pay_time = moment().format('YYYY-MM-DD')
			}else{
				this.order.pay_time = this.order.paid_time
			}
			this.$r('settleCenterModal').show('结算中心', 'settle')
        },
        getClassLessonName(cls){
        	return cls.class_name
        },
        getClassUnitPrice(cls){
        	let price = 0.00
        	if(cls.unit_price > 0){
        		price = cls.unit_price
        	}
        	if(price == 0){
        		let subject = this.getSubjectObj(cls.sj_id)
        		if(cls.sg_id > 0){
        			let sg_info = subject.subject_grade.find(item=>item.sg_id==cls.sg_id)
        			if(sg_info && sg_info.unit_price > 0){
        				price = sg_info.unit_price
        			}
        		}
        		if(price == 0){
        			if(subject.unit_price > 0){
        				price = subject.unit_price
        			}
        		}
        	}
        	if(price == 0){
        		let configs = this.getGlobalVar('configs')
        		price = configs.params.per_lesson_hour_price
        	}

        	return price
        },
        getClassLessonNums(cls){
        	let nums = 1
        	nums = cls.lesson_times * cls.consume_lesson_hour
        	if(nums <= 0){
        		nums = 1
        	}
        	return nums
        },
        getClassLesson(cls){
        	if(cls.lid){
				if(cls.lesson){
	        		return cls.lesson
				}else{
					return this.$store.state.gvars.lessons.find(item=>cls.lid==item.lid)||{}
				}
        	}
        	let lesson = {}
        	lesson.lid = 0
        	lesson.price_type = 2;		//默认课时
        	lesson.name = this.getClassLessonName(cls)
        	lesson.unit_price = this.getClassUnitPrice(cls)
        	lesson.is_term = 1
        	lesson.lesson_nums = this.getClassLessonNums(cls)
        	lesson.sale_price = util.mul(lesson.unit_price,lesson.lesson_nums)
        	return lesson
        },
        getLesson(lid) {
			return util.copy(this.$store.state.gvars.lessons.find(item => item.lid == lid))
		},
		// 检查为确认的订单是否有在线支付记录
		checkPaymentOnline(id) {
			this.$rest('orders').add_url_param(id,'payment_online')
			.get({
				status: 1,
				oph_id: 0
			})
			.success(res => {
				if(res.list.length>0) {
					this.setOnlineAccount(res.list[0])
				}
			})
			.error(res => {
				this.$Message.error(res.body.message)
			})
		},
		// 确认是否支付或保存订单
		confirmOrder(info) {
			if(this.order.is_submit == 0) {
				this.saveOrder(info)
			}else{
				this.chargeContinue(info)
			}
		},
		// 保存订单
		saveOrder(info) {
			let copy_order,params
			copy_order = util.copy(this.order)
			copy_order.payment = copy_order.payment.filter(item => item.pay_amount>0)
			copy_order.balance_paid_amount = 0
			copy_order.money_paid_amount = 0
			params = {
				order:copy_order,
				salesman:info.saleman
			}
			
			if(info.template_name!=='') {
				params.template_data = {
					name: info.template_name,
					template: {
						data:this.order.items,
						reduced:this.order.order_reduced_amount
					}
				}
			}

			if(this.student.sid>0) {
				params.student = {sid: this.student.sid}
			}else{
				params.student = this.student
			}

			this.$rest('orders').post(params)
			.success(res => {
				this.closeModal()
				if(this.order.is_submit == 0) {
					this.$Modal.confirm({
	                    title: '提示',
	                    content: '<p>订单已保存，如需查看请到"订单管理"页面查看</p>',
	                    onOk: () => {
	                        
	                    }
	                });
				}
                this.reset()
                if(info.template_name !== '') {
                	this.getTpl()
                }
			})
			.error(res => {
				this.error(res.body.message)
			})
		},
		// 确认待支付订单收费
		chargeContinue(info) {
			let copy_order,params
			copy_order = util.copy(this.order)
			copy_order.payment = copy_order.payment.filter(item => item.pay_amount>0)
			params = {
				order:copy_order,
				is_push: info.push_to_parent
			}
			if(info.template_name!=='') {
				params.template_data = {
					name: info.template_name,
					template: {
						data:this.order.items,
						reduced:this.order.order_reduced_amount
					}
				}
			}
			this.$rest('orders/do_submit')
			.post(params)
			.success(response=>{
				this.reset()
				this.closeModal()
				if(response.data.orb_id > 0) {
					this.showPrintModal(1,response.data.orb_id)
				}else{
					this.$Modal.confirm({
	                    title: '提示',
	                    content: '<p>报名成功，如需查看请到"订单管理"页面查看</p>',
	                })
				}

				if(info.template_name !== '') {
                	this.getTpl()
                }
			})
			.error(response=>{
				this.error(response.body.message)
			})
		},
		closeModal() {
			this.$r('settleCenterModal').closeModal()
		},
		setItemLha(item,obj) {
			let arrange_detail = item.order_item_lha.arrange_detail
			if(_.isEmpty(item.lha)) {
				let lha = {
					int_day: [],
					teach_eid: [],
					lid: 0,
					int_start_hour:'',
					int_end_hour:'',
					week_days: [],
					lesson_type: 2
				}
				lha.int_day.push(this.order.paid_time)
				if(item.expire_time) {
					lha.int_day.push(item.expire_time)
				}
				else{
					let end = moment(this.order.paid_time).add(60,'days').format('YYYY-MM-DD')
					lha.int_day.push(end)
				}
				lha.lid = item.lid
				lha.lesson_type = item.lesson_type
				this.$set(obj,'lha',lha)
			}
			let lha_obj = {}
			obj.lha.arrange_detail = arrange_detail
			this.$set(obj,'arrange_detail_length',arrange_detail.length)
			arrange_detail.forEach(d => {
				let k = this.$filter('int_hour')(d.int_start_hour)+'-'+this.$filter('int_hour')(d.int_end_hour)
				if(lha_obj[k]) {
					lha_obj[k].push(d.int_month)
				}
				else {
					lha_obj[k] = []
					lha_obj[k].push(d.int_month)
				}
			})
			this.$set(obj,'lha_obj',lha_obj)
		},
		// 继续支付重新构造order item
		createContinuePayItem(item) {
			let obj = {}
			if(item.reduced_amount > 0) {
				obj._is_average = true
			}else{
				obj._is_average = false
			}
			obj.item_name = item.item_name
			if(item.lid) {
				obj.item_name = this.$filter('lesson_name')(item.lid)
			}
			obj.name 	  = item.item_name
			obj._unit 	  = ''
			if(item.gtype == 0) {
				obj.cid = item.cid
				if(item.cid > 0 && _.isObject(item.one_class)) {
					obj._class_name = item.one_class.class_name
				}
			}else{
				if(item.material) {
					obj._unit = item.material.unit
				}
			}
			obj.expire_time = item.expire_time||''
			obj._discount_rate = util.div(item.price,item.origin_price).toFixed(2)*100
			obj.nums  = Number(item.nums)
			obj.oid   = item.oid
			obj.oi_id = item.oi_id
			obj.price = Number(item.price)
			obj.origin_price = Number(item.origin_price)
			obj.nums_unit = item.nums_unit
			obj.present_lesson_hours = Number(item.present_lesson_hours)
			obj.discount_amount = Number(item.discount_amount)
			obj.gtype = item.gtype
			obj.origin_amount = Number(item.origin_amount)
			obj.consume_type = item.consume_type
			obj.sdc_id = item.sdc_id
			obj.from_lid = item.from_lid
			obj.from_sl_id = item.from_sl_id
			obj.cid = item.cid
			obj.lid = item.lid

			if(obj.lid > 0){
				if(typeof item['lesson_type'] != 'undefined'){
					obj.lesson_type = item.lesson_type
				}else{
					let lesson = this.getLesson(item.lid)
					obj.lesson_type = item.lesson_type
				}
			}

			obj.id = this.id++

			if(this.enable_modify_saved_order) {
				if(item.lid) {
					let lesson = this.getLesson(item.lid)
					obj._is_term = lesson._is_term
					obj._define_promotion_rule = []
					obj.product_level_did  = lesson.product_level_did
					if(lesson.define_promotion_rule) {
						let ret = util.copy(lesson.define_promotion_rule)
						ret.push({
							pr_id: -1,
							promotion_type: -1,
							title: '不使用优惠'
						})
						ret.forEach(r => {
							let present = Number(r.present_lesson_hours || 0)
							if(r.promotion_type < 4 && present > 0) {
								r.title = r.title + ` (+${present})`
							}
						})
						item._define_promotion_rule = ret
					}
				}
				if(item.origin_amount > 0) {
					item._is_lock = true
				}
				if(item.gtype==3&&item.pay_item) {
					item._is_flex = item.pay_item.is_flex_price
				}
				
				obj._data = {}
				obj._data.nums 			= item.nums
				obj._data.origin_price 	= item.origin_price
				obj._data.origin_amount 	= item.origin_amount
				obj._data.origin_expire_time = item.expire_time
				obj._amount_by_discount = Number(util.mul(item.price,item.nums).toFixed(2))
			}
			if(!_.isEmpty(item.order_item_lha)) {
				this.setItemLha(item,obj)
			}

			return obj
		},
		// show打印确认框
		showPrintModal(type,orb_id) {
			let bt = this.print_bill_type
			this.$Modal.confirm({
                title: '提示',
                content: `<p>报名成功，是否打印${bt==1?'收据':'合同'}？</p>`,
                onOk: () => {
                    this.print(type,orb_id,bt)
                },
                onCancel: () => {
                    // todo
                }
            });
		}
	},
	computed: {
		lessonCondition(){
			return {
				lesson_type: [0,1,2]
			}
		},
		default_roles() {
			return this.$store.state.gvars.configs.params.default_sale_role_did
		},
		options_refund() {
			let config_refund = this.$store.state.gvars.configs.params.student_refund,
				allow = config_refund.allow_modify_date,
				days = config_refund.modify_date_days
			if(allow) {
				return {
					disabledDate (date) {
						return date && date.valueOf() > Date.now() || date.valueOf() < Date.now() - 86400000*days
					}
				}
			}else{
				return {
					disabledDate (date) {
						return date && moment(date).format('YYYYMMDD') !== moment().format('YYYYMMDD')
					}
				}
			}
		},
		options_signup() {
			let config_signup = this.$store.state.gvars.configs.params.student_signup,
				allow = config_signup.allow_modify_date,
				days = config_signup.modify_date_days
			if(allow) {
				return {
					disabledDate (date) {
						return date && date.valueOf() > Date.now() || date.valueOf() < Date.now() - 86400000*days
					}
				}
			}else{
				return {
					disabledDate (date) {
						return date && moment(date).format('YYYYMMDD') !== moment().format('YYYYMMDD')
					}
				}
			}
		},
		default_aa_empty() {
			return this.$store.state.gvars.configs.params.student_signup.default_aa_empty
		}
	}
}