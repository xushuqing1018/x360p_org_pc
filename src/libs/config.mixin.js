import {_} from './util'
export default {
	data () {
		return {
			cfg_name:'',
			cfg_id: 0,
			config: {					
				
			},
			action: 'edit',
			loading: true
		}
	},
	mounted () {
		this.init_config_data()
	},
	methods: {
		init_config_data () {
			this.loading = true
			this.$http.get('configs?cfg_name='+this.cfg_name)
			.then(response=>{
				if(_.isArray(response.body.data) && response.body.data.length === 0 ){
					this.action = 'add'
				}else{
					if(response.body.data.cfg_id == 0){
						this.action = 'add'
					}
					for(let o in response.body.data.cfg_value){
						this.$set(this.config,o,response.body.data.cfg_value[o])
					}
					this.cfg_id = response.body.data.cfg_id
				}
				this.initFinished()
				this.loading = false
			})
			.catch(response=>{
				this.$Message.error(response.message)
			})
		},
		initFinished () {
			
		},
		submitFinished () {

		},
		handleSubmit () {				
			let [method,uri] = (this.action==='add'?['post','configs']:['put','configs/'+this.cfg_id])
			
			let params = {
				cfg_name: this.cfg_name,
				cfg_value: this.config
			}
			
			this.loading = true
			this.$http[method](uri,params)
			.then(response=>{
				let gvar_name = this.cfg_name
				if(gvar_name == 'lesson'){
					gvar_name = 'lesson_config'
				}
				if(gvar_name == 'params') {
					gvar_name = 'configs'
				}
				if(gvar_name == 'org_pc_ui') {
					gvar_name = 'quick_navs'
				}
				this.$Message.success('保存成功!')
				if(_.isDefined(this.$store.state.gvars[gvar_name])) {
					this.$store.dispatch('updateGlobalVar',gvar_name)
				}
				this.submitFinished()
				this.init_config_data()
			})
			.catch(response=>{
				this.error(response.body.message)
			})
		},
		restoreDefault () {
			this.confirm('你确定恢复默认设置吗？')
			.then(() => {
				this.loading = true
				this.$rest('configs')
				.delete(this.cfg_id)
				.success(res => {
					this.$Message.success('恢复成功')
					let gvar_name = ''
					if(this.cfg_name == 'org_pc_ui') {
						gvar_name = 'quick_navs'
					}
					if(this.cfg_name == 'params') {
						gvar_name = 'configs'
					}
					
					if(gvar_name !== '') {
						this.$store.dispatch('updateGlobalVar',gvar_name)
					}
					if(this.cfgBid && this.cfgBid !== 0) {
						gvar_name = 'bconfigs'
					}

					this.init_config_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			})
		}
	}
}