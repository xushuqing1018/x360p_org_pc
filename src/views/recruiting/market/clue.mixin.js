import moment from 'moment'
import util,{_} from '@/libs/util'
	
export default{
	data () {
		return {
			type_market: '',
			is_reg: -1,
			is_cu_reg: -1,
			follow_type: 1,
			showCheckbox: true,
			showClue: false,
			uncheckout_nums:0,
			ids: [],
			selectedList: [],
			search_field: {
				bid: [],
				cu_assigned_bid: [],
				mc_id: 0,
				name: '',
				tel: '',
				id_card_no:'',
				age: [],
				from_did: 0,
				is_valid: -1,
				is_change: -1,
				is_visit: -1,
				is_deal: [0],
				is_reward: -1,
				assigned_eid: 0,
				cu_assigned_eid: 0,
				recommend_sid: 0,
				create_time: [],
				get_time:[],
				sex: -1,
				get_eid: 0,
				get_address_did: 0
			},
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
		}
	},
	watch: {
		'type_market': function (val) {
			this.init_data()
		},
		is_reg: function (val) {
			this.init_data()
		},
		is_cu_reg: function (val) {
			this.init_data()
		},
		follow_type: function (val) {
			this.init_data()
		}
	},
	methods: {
		perScopeChange(value) {
            this.type_market = value
        },
		//转为客户
		multipleTransfer () {
			let list = this.selectedList,
				confirm_list = [],
				params = []
				
			list.forEach(l=>{
				if(l.is_valid!=1){
					confirm_list.push(l.name)
				}
				params.push({
					is_valid: 1,
					mcl_id: l.mcl_id,
					is_change: 1
				})
			})
			
			if(confirm_list.length>0){
				let tip = util.sprintf('【%s】等%s人为非有效性名单，是否继续转化为客户？',confirm_list.join(','),confirm_list.length)
				this.confirm(tip).then(()=>{						
					this.$Modal.open('recruiting/market/multiple-transfer.vue@modal',{
						on: {
							"on-success": () => {
								this.init_data()
							}
						}
					})
					.then(modal =>{
						modal
							.set("params", params)
							.set('num', this.selectedList.length)
							.show('转客户')
					})
				})					
			}else{
				this.$Modal.open('recruiting/market/multiple-transfer.vue@modal',{
					on: {
						"on-success": () => {
							this.init_data()
						}
					}
				})
				.then(modal =>{
					modal
						.set("params", params)
						.set("ids", this.ids)
						.set('num', this.selectedList.length)
						.show('转客户')
				})
			}
			
		},
		transferInfo (row) {
			let tip = util.sprintf('确定将【%s】转化为客户吗？',row.name)
			
			this.confirm(tip).then(()=>{
				this.transferToCustomer([row.mcl_id])
			})
		},
		transferToCustomer(ids) {
			this.$rest('market_clues/change_to_customer').post({mcl_ids:ids})
			.success(data=>{
				this.$Message.success('转化成功！')
				this.init_data()
			}).error(response=>{
				this.error(response.body.message||'操作失败~')
			})
		},
		showClueList () {
			this.showClue = !this.showClue 
		},
		clearClue () {
			this.showClue = false
			this.$refs.tableExcel.selectAll(false)
		},
		validation () {
			this.showClue = false
			this.$refs.validation
			.set('list',this.selectedList)
			.show('批量确认有效性','add')
			
			this.$refs.validation.setValid(true)
		},
		assignSuccess () {
			this.ids = []
			this.selectedList = []
			this.init_data()
		},
		multipleDel () {
			let title = util.sprintf('确认删除这【%s】条名单吗？',this.ids.length)
			
			this.showClue = false
			if(this.ids.length){
				this.confirm(title).then(()=>{
					this.$rest('market_clues/delete_batch').post({mcl_ids:this.ids})
					.success(data=>{
						this.$Message.success('删除成功！')
						this.init_data()
					}).error(response=>{
						this.error(response.body.message||'删除失败~','error')
					})
				})
			}
		},
		assigned (list) {
			let ids = []
			list = _.isUndefined(list)?this.selectedList:list			
			
			if(list.length>0){
				list.forEach(l=>{
					ids.push(l[this.pk])
				})
			}
			
			this.showClue = false
						
			this.$refs.assigned
			.set('ids',ids)
			.set('list',list)
			.show('批量分配市场名单','add')
		},
		selectionChange (data) {
			this.ids = []
			this.selectedList = data
			if(data.length>0){
				data.forEach(d=>{
					this.ids.push(d[this.pk])
				})
			}
		},
		deal_data (data) {
			this.uncheckout_nums = data.uncheckout_nums
			let option_fields = this.$store.state.gvars.configs.mcl_option_fields
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
			data.list.forEach(item=>{
				if(this.ids.includes(item[this.pk])){
					item._checked = true;
				}
				fields.forEach(f=>{
					item[f] = get_option_fields_default_value(item.option_fields,f)
				})
			})
			
			return data.list
		},
		addInfo () {
			this.$refs.info.show('添加名单','add')
		},
		editInfo (row) {
			let title = util.sprintf('编辑名单【%s】',row.name)
						
			this.$refs.info
			.set('info',row)
			.show(title,'edit')
		},
		delInfo (row) {
			let title = util.sprintf('确定删除名单【%s】吗？',row.name)
			
			this.confirm(title).then(()=>{
				this.delete(row)
			})
		},
		resetSearch () {
			this.$r('ref_search').resetFields()
			this.search_field.age = []
			this.search_field.cu_assigned_bid = []
			this.search_field.bid = []
			this.init_data()
		},
		getBirthTimeByAge (age) {
			let result = [],
				start_date = age[1]+1,
				end_date = age[0],
				month = parseInt(moment(new Date()).format('MM'))
						
			result[0] = moment(new Date()).subtract(start_date,'years').format('YYYY-MM-DD')
			result[1] = moment(new Date()).subtract(end_date,'years').format('YYYY-MM-DD')
			
			return result
		},
		hook_get_param (params) {
			let search_obj = this.search_field,
				uid = this.$store.state.user.info.uid
						
			if(this.type_market == 'my' && this.eid$ > 0){
				if(this.follow_type == 0){
					params.assigned_eid = this.eid$
				}else{
					params.create_uid = uid						
				}				
			}else{	
				if(this.is_cu_reg==1){
					params.cu_assigned_eid = '[>,0]'
				}else if(this.is_cu_reg==0){
					params.cu_assigned_eid = 0
				}
				
				if(this.is_reg==1){
					params.assigned_eid = '[>,0]'
				}else if(this.is_reg==0){
					params.assigned_eid = 0
				}
			}
			
			params.with = 'employee,recommend_user,recommend_student'
			params.recommend_sid = 0
			if(this.og_id$ == 0) {
				params.get_scope = 0
			}
			
			for(let o in search_obj) {
				let property = search_obj[o]				
				if(o=='age'){
					if(property.length>0) {
						params.birth_time = util.sprintf('[Between,%s]',this.getBirthTimeByAge(property).join(','))
					}
				}
				else if(o == 'create_time'||o == 'get_time'){
					if(property != ',' && property.length > 0){
                        params[o] = util.sprintf('[Between,%s]',property.join(','))
                    } 
				}
				else if(o=='intention_level'){
					if(property.length>0){
						params.intention_level = `[In,${property.join(',')}]`;
                    }
				}
				else if (o == 'is_change'){
                    if(property != -1){
                    	if(property == 0){
							params.cu_id = '0'
						}
                    	else if(property == 1){
                    		params.cu_id = '[>,0]'                    		
                    	}
                    }
                }
				else if(o == 'bid' || o == 'cu_assigned_bid' || o == 'is_deal'){
					if(property.length > 0) {
						params[o] = util.sprintf('[In,%s]',property.join(','))
					}
				}
				else if(['is_cu_reg','is_reg','is_valid','is_visit','sex'].includes(o)){
					if(property != -1){
						params[o] = property
					}
				}
				else{
					if(property&&property!=-1){
						params[o] = property
					}	
				}
			}
		},
		initOptionFieldsColumn(){
			let option_fields = this.$store.state.gvars.configs.mcl_option_fields
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
						let params = {mcl_ids : this.ids,pj_ids : pj_ids}
						this.$rest('market_clues/batch_pj_ids').put(params)
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
						this.$rest('market_clues/'+row.mcl_id+'/dopj_ids').post(params)
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
				list = this.selectedList
			}
			if(list.length == 0){
				return
			}
			this.$Modal.open('app/modal/sms-template-modal.vue',{
				props:{
					objectType:'market_clue',
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
